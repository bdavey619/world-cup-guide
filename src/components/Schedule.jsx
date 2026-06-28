import { useState, useEffect, useRef } from 'react'
import { actualR32, actualR16, actualQF, actualSF, actualFinal, actual3rdPlace } from '../data/actualBracket'

const DATE_ORDER = [
  'Jun 11','Jun 12','Jun 13','Jun 14','Jun 15','Jun 16','Jun 17',
  'Jun 18','Jun 19','Jun 20','Jun 21','Jun 22','Jun 23','Jun 24',
  'Jun 25','Jun 26','Jun 27',
  // Knockout rounds
  'Jul 1','Jul 2','Jul 3','Jul 4',         // R32
  'Jul 7','Jul 8','Jul 9','Jul 10',        // R16
  'Jul 14','Jul 15',                        // QF
  'Jul 18','Jul 19',                        // SF
  'Jul 22','Jul 23',                        // 3rd + Final
]

const DAY_NAMES = {
  'Jun 11': 'Thursday',  'Jun 12': 'Friday',    'Jun 13': 'Saturday',
  'Jun 14': 'Sunday',    'Jun 15': 'Monday',    'Jun 16': 'Tuesday',
  'Jun 17': 'Wednesday', 'Jun 18': 'Thursday',  'Jun 19': 'Friday',
  'Jun 20': 'Saturday',  'Jun 21': 'Sunday',    'Jun 22': 'Monday',
  'Jun 23': 'Tuesday',   'Jun 24': 'Wednesday', 'Jun 25': 'Thursday',
  'Jun 26': 'Friday',    'Jun 27': 'Saturday',
  'Jul 1':  'Wednesday', 'Jul 2':  'Thursday',  'Jul 3':  'Friday',
  'Jul 4':  'Saturday',  'Jul 7':  'Tuesday',   'Jul 8':  'Wednesday',
  'Jul 9':  'Thursday',  'Jul 10': 'Friday',    'Jul 14': 'Tuesday',
  'Jul 15': 'Wednesday', 'Jul 18': 'Saturday',  'Jul 19': 'Sunday',
  'Jul 22': 'Wednesday', 'Jul 23': 'Thursday',
}

const ROUND_LABEL = {
  'Jul 1': 'Round of 32',  'Jul 2':  'Round of 32', 'Jul 3':  'Round of 32', 'Jul 4':  'Round of 32',
  'Jul 7': 'Round of 16',  'Jul 8':  'Round of 16', 'Jul 9':  'Round of 16', 'Jul 10': 'Round of 16',
  'Jul 14': 'Quarter-finals', 'Jul 15': 'Quarter-finals',
  'Jul 18': 'Semi-finals',    'Jul 19': 'Semi-finals',
  'Jul 22': '3rd Place',      'Jul 23': 'Final',
}

// "Jun 11" → comparable number for today-detection
const DATE_TO_NUM = {}
DATE_ORDER.forEach((d, i) => { DATE_TO_NUM[d] = i })

function getTodayKey() {
  const now = new Date()
  const month = now.toLocaleString('en-US', { month: 'short' })
  const day = now.getDate()
  return `${month} ${day}` // e.g. "Jun 13"
}

// Parse "Jun 13" / "Jul 4" → comparable YYYYMMDD integer
function parseDateKey(key) {
  const [mon, day] = key.split(' ')
  const months = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 }
  return 20260000 + (months[mon] ?? 0) * 100 + parseInt(day)
}

function timeToSort(t) {
  const clean = t.replace(' ET', '').replace(' ', '')
  const isPM = clean.includes('PM')
  const isAM = clean.includes('AM')
  const num = parseInt(clean)
  if (clean === 'MidnightET' || clean === 'Midnight') return 2400
  let h = num
  if (isPM && h !== 12) h += 12
  if (isAM && h === 12) h = 0
  return h * 100
}

// Returns { teamId → rank (1-4) } for every team, sorted by pts → gd → gf
function buildGroupRanks(teams) {
  const groups = {}
  teams.forEach(t => {
    if (!groups[t.meta.group]) groups[t.meta.group] = []
    groups[t.meta.group].push(t)
  })
  const ranks = {}
  Object.values(groups).forEach(grp => {
    const sorted = [...grp].sort((a, b) => {
      const pd = (b.standings?.pts || 0) - (a.standings?.pts || 0)
      if (pd) return pd
      const gdd = (b.standings?.gd || 0) - (a.standings?.gd || 0)
      if (gdd) return gdd
      return (b.standings?.gf || 0) - (a.standings?.gf || 0)
    })
    sorted.forEach((t, i) => { ranks[t.id] = i + 1 })
  })
  return ranks
}

const ORDINAL = ['', '1st', '2nd', '3rd', '4th']

// Compute a short stakes label for upcoming matches (null = nothing to show)
function getStakes(home, away, allTeams) {
  const homePlayed = (home.schedule || []).filter(s => s.score).length
  const awayPlayed = (away.schedule || []).filter(s => s.score).length
  const matchday   = Math.max(homePlayed, awayPlayed) + 1
  if (matchday < 2) return null

  const hp = home.standings?.pts || 0
  const ap = away.standings?.pts || 0

  if (matchday === 2) {
    if (hp === 3 && ap === 3) return { label: 'Winner goes top of the group', urgent: false }
    if (hp === 0 && ap === 0) return { label: 'Both sides need their first points', urgent: false }
    return null
  }

  // Matchday 3
  const groupTeams = allTeams.filter(t => t.meta.group === home.meta.group)
  const others     = groupTeams.filter(t => t.id !== home.id && t.id !== away.id)
  const otherPts   = others.map(t => t.standings?.pts || 0)
  const topOther   = Math.max(...otherPts, 0)

  const homeThrough = hp >= 6
  const awayThrough = ap >= 6
  if (homeThrough && awayThrough) return { label: 'Both already through — playing for 1st place', urgent: false }

  const homeElim = (hp + 3) < topOther
  const awayElim = (ap + 3) < topOther
  if (homeElim && awayElim) return { label: 'Both sides already eliminated', urgent: false }
  if (homeElim || awayElim) return { label: 'One side already eliminated — winner advances', urgent: false }

  if (hp === 0 && ap === 0) return { label: 'Loser eliminated · Winner still alive', urgent: true }
  if (hp <= 1 && ap <= 1)   return { label: 'Winner advances · Loser likely out', urgent: true }
  return { label: 'Winner advances', urgent: false }
}

function buildKnockoutMatches(teams) {
  const byId = {}
  teams.forEach(t => { byId[t.id] = t })

  const allRounds = [
    ...actualR32.map(m => ({ ...m, round: 'R32' })),
    ...actualR16.map(m => ({ ...m, round: 'R16' })),
    ...actualQF.map(m => ({ ...m, round: 'QF' })),
    ...actualSF.map(m => ({ ...m, round: 'SF' })),
    ...actualFinal.map(m => ({ ...m, round: 'Final' })),
    { ...actual3rdPlace, round: '3rd' },
  ]

  return allRounds.map(m => {
    const home = m.homeId ? byId[m.homeId] : null
    const away = m.awayId ? byId[m.awayId] : null
    const score = (m.homeGoals != null && m.awayGoals != null)
      ? `${m.homeGoals}–${m.awayGoals}` : null

    return {
      date: m.date,
      time: null,
      timeSort: m.matchNum,
      group: null,
      round: m.round,
      home: home ?? { id: m.slotA, name: m.slotA, flagEmoji: '🏳️', _placeholder: true },
      away: away ?? { id: m.slotB, name: m.slotB, flagEmoji: '🏳️', _placeholder: true },
      venue: null,
      city: null,
      score,
      homeRank: null,
      awayRank: null,
      stakes: null,
      winnerId: m.winnerId,
      matchNum: m.matchNum,
      isKnockout: true,
    }
  })
}

function buildMatches(teams) {
  const seen  = new Set()
  const ranks = buildGroupRanks(teams)
  const matches = []
  for (const team of teams) {
    for (const s of team.schedule) {
      const opponentTeam = teams.find(t => t.name === s.opponent)
      if (!opponentTeam) continue
      const homeTeam = s.isAway ? opponentTeam : team
      const awayTeam = s.isAway ? team : opponentTeam
      const key = [s.date, s.time, homeTeam.id, awayTeam.id].join('|')
      if (seen.has(key)) continue
      seen.add(key)
      const homeEntry = homeTeam.schedule.find(e => e.opponent === awayTeam.name)
      const score     = homeEntry?.score || null
      matches.push({
        date:      s.date,
        time:      s.time,
        timeSort:  timeToSort(s.time),
        group:     team.meta.group,
        home:      homeTeam,
        away:      awayTeam,
        venue:     s.venue,
        city:      s.city,
        score,
        homeRank:  ranks[homeTeam.id],
        awayRank:  ranks[awayTeam.id],
        stakes:    score ? null : getStakes(homeTeam, awayTeam, teams),
      })
    }
  }
  const knockoutMatches = buildKnockoutMatches(teams)
  return [...matches, ...knockoutMatches].sort((a, b) => {
    const di = DATE_ORDER.indexOf(a.date) - DATE_ORDER.indexOf(b.date)
    return di !== 0 ? di : a.timeSort - b.timeSort
  })
}

function groupByDate(matches) {
  const map = {}
  for (const m of matches) {
    if (!map[m.date]) map[m.date] = []
    map[m.date].push(m)
  }
  return map
}

export default function Schedule({ teams, onSelectTeam }) {
  const allMatches = buildMatches(teams)
  const [activeGroup, setActiveGroup] = useState('ALL')
  const [showTodayBtn, setShowTodayBtn] = useState(false)
  const dateRefs = useRef({})
  const todayTargetRef = useRef(null)
  const todayKey = getTodayKey()

  const filtered = activeGroup === 'ALL'
    ? allMatches
    : activeGroup === 'KO'
      ? allMatches.filter(m => m.isKnockout)
      : allMatches.filter(m => m.group === activeGroup)

  const byDate = groupByDate(filtered)
  const dates = DATE_ORDER.filter(d => byDate[d])

  // Scroll to the first upcoming (today or future) date on mount / group change
  useEffect(() => {
    const todayNum = parseDateKey(todayKey)
    const target = dates.find(d => parseDateKey(d) >= todayNum) ?? dates[dates.length - 1]
    todayTargetRef.current = target
    if (target && dateRefs.current[target]) {
      setTimeout(() => {
        dateRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }, [activeGroup])

  // Show "Today" button when today's section scrolls out of view
  useEffect(() => {
    const target = todayTargetRef.current
    const el = target && dateRefs.current[target]
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowTodayBtn(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [activeGroup, dates.length])

  function scrollToToday() {
    const target = todayTargetRef.current
    if (target && dateRefs.current[target]) {
      dateRefs.current[target].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setShowTodayBtn(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Group filter — horizontal scroll, no wrap */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--gray-200)',
      }}>
        <div
          className="scroll-x"
          style={{
            maxWidth: 680,
            margin: '0 auto',
            display: 'flex',
            gap: 5,
            padding: '8px 16px',
            alignItems: 'center',
          }}
        >
          {['ALL', 'KO', 'A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              style={{
                padding: (g === 'ALL' || g === 'KO') ? '5px 12px' : '5px 9px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: activeGroup === g ? 600 : 400,
                cursor: 'pointer',
                border: 'none',
                background: activeGroup === g ? 'var(--gray-900)' : 'var(--gray-100)',
                color: activeGroup === g ? 'white' : 'var(--gray-500)',
                fontFamily: 'var(--font-sans)',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {g === 'ALL' ? 'All' : g === 'KO' ? 'Knockouts' : `Group ${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* "All times ET" note */}
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '10px 16px 0',
        fontSize: 11,
        color: 'var(--gray-400)',
        fontFamily: 'var(--font-sans)',
      }}>
        All kick-off times Eastern (ET)
      </div>

      {/* Match list */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '10px 16px 48px' }}>
        {dates.map(date => {
          const todayNum = parseDateKey(todayKey)
          const dateNum = parseDateKey(date)
          const isToday = date === todayKey
          const isFuture = dateNum > todayNum
          const isPast = dateNum < todayNum

          return (
            <div
              key={date}
              ref={el => { dateRefs.current[date] = el }}
              style={{ marginBottom: 28, scrollMarginTop: 60 }}
            >
              {/* Date header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: `1px solid ${isToday ? 'var(--gray-900)' : 'var(--gray-200)'}`,
              }}>
                <span style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: isPast ? 'var(--gray-400)' : 'var(--gray-900)',
                }}>
                  {date}
                </span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  {DAY_NAMES[date]}
                </span>
                {ROUND_LABEL[date] && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    background: '#1a3a8a',
                    color: 'white',
                    padding: '2px 7px',
                    borderRadius: 10,
                    fontFamily: 'var(--font-sans)',
                    textTransform: 'uppercase',
                  }}>
                    {ROUND_LABEL[date]}
                  </span>
                )}
                {isToday && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    background: 'var(--gray-900)',
                    color: 'white',
                    padding: '2px 7px',
                    borderRadius: 10,
                    fontFamily: 'var(--font-sans)',
                    textTransform: 'uppercase',
                  }}>
                    Today
                  </span>
                )}
                <span style={{
                  fontSize: 12,
                  color: 'var(--gray-400)',
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {byDate[date].length} match{byDate[date].length !== 1 ? 'es' : ''}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {byDate[date].map((m, i) => (
                  <MatchCard key={i} match={m} onSelectTeam={onSelectTeam} isPast={isPast} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating "Today" button — appears when today's section is off-screen */}
      {showTodayBtn && (
        <div style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
        }}>
          <button
            onClick={scrollToToday}
            style={{
              background: 'var(--gray-900)',
              color: 'white',
              border: 'none',
              borderRadius: 24,
              padding: '11px 22px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            Jump to Today ↓
          </button>
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, onSelectTeam }) {
  const { time, group, round, home, away, city, score, homeRank, awayRank, stakes, winnerId, isKnockout, matchNum } = match
  const [hg, ag] = score ? score.split('–').map(Number) : [null, null]
  const homeWins = winnerId ? winnerId === home.id : (hg !== null && hg > ag)
  const awayWins = winnerId ? winnerId === away.id : (ag !== null && ag > hg)
  return (
    <div className="match-card" style={{
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      borderLeft: stakes?.urgent ? '3px solid #e8431a' : 'none',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '52px 1fr 52px',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
      }}>
        {/* Time + group/round badge */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: score ? 'var(--gray-400)' : 'var(--gray-900)',
            fontFamily: 'var(--font-sans)',
          }}>
            {score ? 'FT' : (isKnockout ? `#${matchNum}` : time?.replace(' ET', ''))}
          </div>
          <div className="grp-badge" style={{
            fontSize: 10,
            color: 'var(--gray-500)',
            background: 'var(--gray-100)',
            borderRadius: 3,
            padding: '1px 5px',
            marginTop: 3,
            display: 'inline-block',
            fontFamily: 'var(--font-sans)',
          }}>
            {isKnockout ? round : `Grp ${group}`}
          </div>
        </div>

        {/* Teams */}
        <div className="match-teams" style={{ display: 'flex', alignItems: 'center' }}>
          <TeamChip team={home} rank={score ? null : homeRank} align="right" goals={hg} isWinner={homeWins} onSelectTeam={onSelectTeam} />
          <div className="match-vs" style={{
            padding: '0 8px',
            flexShrink: 0,
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
          }}>
            {score ? (
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '0.02em' }}>
                {score}
              </span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)' }}>vs</span>
            )}
          </div>
          <TeamChip team={away} rank={score ? null : awayRank} align="left" goals={ag} isWinner={awayWins} onSelectTeam={onSelectTeam} />
        </div>

        {/* City */}
        <div className="match-city" style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 10,
            color: 'var(--gray-400)',
            lineHeight: 1.3,
            fontFamily: 'var(--font-sans)',
          }}>
            {city?.split(',')[0]}
          </div>
        </div>
      </div>

      {/* Stakes label — only for upcoming matches with meaningful context */}
      {stakes && (
        <div style={{
          padding: '5px 14px 7px',
          borderTop: '1px solid var(--gray-100)',
          fontSize: 10,
          fontFamily: 'var(--font-sans)',
          color: stakes.urgent ? '#e8431a' : 'var(--gray-400)',
          fontWeight: stakes.urgent ? 600 : 400,
          letterSpacing: '0.02em',
        }}>
          {stakes.label}
        </div>
      )}
    </div>
  )
}

function TeamChip({ team, rank, align, goals, isWinner, onSelectTeam }) {
  const [hovered, setHovered] = useState(false)
  const isRight = align === 'right'
  const isPlaceholder = team?._placeholder
  const pts = team.standings?.pts ?? 0
  const played = (team.schedule || []).filter(s => s.score).length

  if (isPlaceholder) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexDirection: isRight ? 'row-reverse' : 'row',
        padding: '4px 6px',
        minWidth: 0,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, opacity: 0.3 }}>🏳️</span>
        <span style={{
          fontSize: 12,
          fontWeight: 400,
          color: 'var(--gray-400)',
          fontStyle: 'italic',
          fontFamily: 'var(--font-sans)',
        }}>
          {team.name}
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={() => onSelectTeam(team)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="View team guide"
      className="team-chip"
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexDirection: isRight ? 'row-reverse' : 'row',
        background: hovered ? 'var(--gray-100)' : 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 6px',
        fontFamily: 'var(--font-sans)',
        textAlign: isRight ? 'right' : 'left',
        borderRadius: 5,
        minWidth: 0,
        transition: 'background 0.12s',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{team.flagEmoji}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <span style={{
          display: 'block',
          fontSize: 13,
          fontWeight: isWinner ? 700 : 600,
          color: 'var(--gray-900)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {team.name}
        </span>
        {rank && played > 0 && (
          <span style={{
            display: 'block',
            fontSize: 10,
            color: 'var(--gray-400)',
            fontWeight: 400,
            marginTop: 1,
          }}>
            {ORDINAL[rank]} · {pts}pt{pts !== 1 ? 's' : ''}
          </span>
        )}
        {hovered && (
          <span style={{
            display: 'block',
            fontSize: 10,
            color: team.accentColor,
            fontWeight: 500,
            letterSpacing: '0.04em',
            marginTop: rank && played > 0 ? 0 : 1,
          }}>
            View guide →
          </span>
        )}
      </div>
      {goals !== null && (
        <span className="chip-score" style={{
          fontSize: 16,
          fontWeight: isWinner ? 700 : 400,
          color: isWinner ? '#1a7a3a' : 'var(--gray-400)',
          flexShrink: 0,
          minWidth: 18,
          textAlign: 'center',
        }}>
          {goals}
        </span>
      )}
    </button>
  )
}
