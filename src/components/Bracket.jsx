import { useState } from 'react'
import { actualR32, actualR16, actualQF, actualSF, actualFinal, actual3rdPlace } from '../data/actualBracket'

// Predicted bracket — frozen at tournament start (Jun 11, 2026)
// Winners predicted by highest Polymarket tournament win %

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// R32 matchup structure — "3rd-N" slots are filled from the sorted best-3rd pool
const R32_SLOTS = [
  ['1st-A', '2nd-B'],
  ['1st-C', '2nd-D'],
  ['1st-E', '2nd-F'],
  ['1st-G', '2nd-H'],
  ['1st-B', '2nd-A'],
  ['1st-D', '2nd-C'],
  ['1st-F', '2nd-E'],
  ['1st-H', '2nd-G'],
  ['1st-I', '2nd-J'],
  ['1st-K', '2nd-L'],
  ['3rd-0', '3rd-1'],
  ['3rd-2', '3rd-3'],
  ['1st-J', '2nd-K'],
  ['1st-L', '2nd-I'],
  ['3rd-4', '3rd-5'],
  ['3rd-6', '3rd-7'],
]

function buildStandings(teams) {
  const s = {}
  GROUPS.forEach(g => {
    s[g] = teams
      .filter(t => t.meta.group === g)
      .sort((a, b) =>
        b.meta.advancePct - a.meta.advancePct ||
        b.meta.winPct - a.meta.winPct
      )
  })
  return s
}

function resolveR32(standings) {
  const best3rd = GROUPS
    .map(g => standings[g]?.[2])
    .filter(Boolean)
    .sort((a, b) =>
      b.meta.advancePct - a.meta.advancePct ||
      b.meta.winPct - a.meta.winPct
    )
    .slice(0, 8)

  return R32_SLOTS.map(([a, b]) => [resolve(a, standings, best3rd), resolve(b, standings, best3rd)])
}

function resolve(slot, standings, best3rd) {
  const m1 = slot.match(/^1st-([A-L])$/)
  if (m1) return standings[m1[1]]?.[0] ?? null

  const m2 = slot.match(/^2nd-([A-L])$/)
  if (m2) return standings[m2[1]]?.[1] ?? null

  const m3 = slot.match(/^3rd-(\d+)$/)
  if (m3) return best3rd[parseInt(m3[1])] ?? null

  return null
}

// Predict winner by winPct; tiebreak by advancePct
function projectedWinner(a, b) {
  if (!a) return b
  if (!b) return a
  if (a.meta.winPct !== b.meta.winPct) return a.meta.winPct > b.meta.winPct ? a : b
  return a.meta.advancePct >= b.meta.advancePct ? a : b
}

// ─── Layout constants ──────────────────────────────────────────
const CARD_H  = 50
const ROW_GAP = 10
const UNIT    = CARD_H + ROW_GAP
const TOTAL_H = 16 * UNIT

function cardTop(N, i) {
  const span = TOTAL_H / N
  return i * span + (span - CARD_H) / 2
}

// ─── Sub-components ────────────────────────────────────────────

// rightLabel: string to show on the right (overrides winPct when provided)
// _isPlaceholder: team is a slot-label placeholder (TBD style)
function TeamRow({ team, isWinner, showGroup, rightLabel }) {
  const accent = team?.accentColor ?? 'transparent'
  const isPlaceholder = team?._isPlaceholder

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '5px 8px',
      borderLeft: `3px solid ${isWinner && team && !isPlaceholder ? accent : 'transparent'}`,
      background: isWinner && team && !isPlaceholder ? '#fafafa' : 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', flex: 1, minWidth: 0 }}>
        {showGroup && team && !isPlaceholder && (
          <span style={{
            fontSize: 8,
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            color: 'white',
            background: 'var(--gray-500)',
            borderRadius: 3,
            padding: '1px 3px',
            flexShrink: 0,
            lineHeight: 1.4,
          }}>
            {team.meta.group}
          </span>
        )}
        <span style={{ fontSize: 12, flexShrink: 0 }}>{!isPlaceholder ? (team?.flagEmoji ?? '') : ''}</span>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-sans)',
          fontWeight: isWinner && team && !isPlaceholder ? 600 : 400,
          color: isPlaceholder
            ? 'var(--gray-400)'
            : team ? 'var(--gray-900)' : 'var(--gray-300)',
          fontStyle: isPlaceholder ? 'italic' : 'normal',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {team?.name ?? 'TBD'}
        </span>
      </div>
      {team && !isPlaceholder && (
        <span style={{
          fontSize: 9,
          fontFamily: 'var(--font-sans)',
          color: isWinner ? accent : 'var(--gray-400)',
          fontWeight: isWinner ? 600 : 400,
          flexShrink: 0,
          marginLeft: 4,
        }}>
          {rightLabel !== undefined
            ? rightLabel
            : (team.meta.winPct >= 1 ? `${team.meta.winPct}%` : '<1%')}
        </span>
      )}
    </div>
  )
}

// actualData: { winnerId, homeGoals, awayGoals } — if provided, uses actual result
// matches: [a, b] or [a, b, actualData]
function MatchCard({ a, b, width, showGroup, actualData }) {
  let w, aLabel, bLabel
  if (actualData) {
    const { winnerId, homeGoals, awayGoals } = actualData
    w = winnerId ? (winnerId === a?.id ? a : winnerId === b?.id ? b : null) : null
    aLabel = homeGoals !== null ? String(homeGoals) : null
    bLabel = awayGoals !== null ? String(awayGoals) : null
  } else {
    w = projectedWinner(a, b)
    aLabel = undefined
    bLabel = undefined
  }

  return (
    <div style={{
      width,
      background: 'white',
      borderRadius: 5,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.09)',
      flexShrink: 0,
    }}>
      <TeamRow team={a} isWinner={!!a && w === a} showGroup={showGroup} rightLabel={aLabel ?? undefined} />
      <div style={{ height: 1, background: 'var(--gray-100)' }} />
      <TeamRow team={b} isWinner={!!b && w === b} showGroup={showGroup} rightLabel={bLabel ?? undefined} />
    </div>
  )
}

// matches: [[a, b], ...] or [[a, b, actualData], ...]
function RoundCol({ label, dates, matches, width, showGroup }) {
  const N = matches.length
  return (
    <div style={{ flexShrink: 0, width }}>
      <div style={{
        textAlign: 'center',
        padding: '10px 4px 8px',
        borderBottom: '1px solid var(--gray-100)',
        marginBottom: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2, fontFamily: 'var(--font-sans)' }}>{dates}</div>
      </div>
      <div style={{ position: 'relative', height: TOTAL_H }}>
        {matches.map(([a, b, actualData], i) => (
          <div key={i} style={{
            position: 'absolute',
            top: cardTop(N, i),
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MatchCard a={a} b={b} width={width - 4} showGroup={showGroup} actualData={actualData} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div style={{
      flexShrink: 0,
      width: 20,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ height: 57 }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1, height: '100%', background: 'var(--gray-100)' }} />
      </div>
    </div>
  )
}

// ─── Toggle button ─────────────────────────────────────────────
function ViewToggle({ view, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--gray-100)',
      borderRadius: 20,
      padding: 3,
      gap: 2,
    }}>
      {[
        { id: 'actual',    label: 'Actual' },
        { id: 'projected', label: 'Projected' },
      ].map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            background: view === id ? 'white' : 'transparent',
            border: 'none',
            borderRadius: 16,
            padding: '4px 14px',
            fontSize: 12,
            fontWeight: view === id ? 600 : 400,
            color: view === id ? 'var(--gray-900)' : 'var(--gray-500)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            boxShadow: view === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────
export default function Bracket({ teams = [] }) {
  const [view, setView] = useState('actual')

  if (!teams.length) return null

  const teamById = Object.fromEntries(teams.map(t => [t.id, t]))

  // Returns team object or a placeholder with the slot label
  function lookup(id, slotLabel) {
    if (id) return teamById[id] ?? null
    return { id: null, name: slotLabel, flagEmoji: '', accentColor: 'transparent', meta: { group: '', winPct: 0, advancePct: 0 }, _isPlaceholder: true }
  }

  // ── Projected view data ─────────────────────────────────────
  const standings = buildStandings(teams)
  const r32Proj = resolveR32(standings)

  const r16Proj = Array.from({ length: 8 }, (_, i) => [
    projectedWinner(r32Proj[i * 2][0],     r32Proj[i * 2][1]),
    projectedWinner(r32Proj[i * 2 + 1][0], r32Proj[i * 2 + 1][1]),
  ])

  const qfProj = Array.from({ length: 4 }, (_, i) => [
    projectedWinner(r16Proj[i * 2][0],     r16Proj[i * 2][1]),
    projectedWinner(r16Proj[i * 2 + 1][0], r16Proj[i * 2 + 1][1]),
  ])

  const sfProj = Array.from({ length: 2 }, (_, i) => [
    projectedWinner(qfProj[i * 2][0],     qfProj[i * 2][1]),
    projectedWinner(qfProj[i * 2 + 1][0], qfProj[i * 2 + 1][1]),
  ])

  const finalProj = [[
    projectedWinner(sfProj[0][0], sfProj[0][1]),
    projectedWinner(sfProj[1][0], sfProj[1][1]),
  ]]

  const champion = projectedWinner(finalProj[0][0], finalProj[0][1])

  // ── Actual view data ────────────────────────────────────────
  const r32Act  = actualR32.map(m  => [lookup(m.homeId, m.slotA), lookup(m.awayId, m.slotB), m])
  const r16Act  = actualR16.map(m  => [lookup(m.homeId, m.slotA), lookup(m.awayId, m.slotB), m])
  const qfAct   = actualQF.map(m   => [lookup(m.homeId, m.slotA), lookup(m.awayId, m.slotB), m])
  const sfAct   = actualSF.map(m   => [lookup(m.homeId, m.slotA), lookup(m.awayId, m.slotB), m])
  const finalAct = actualFinal.map(m => [lookup(m.homeId, m.slotA), lookup(m.awayId, m.slotB), m])

  const isProjected = view === 'projected'
  const r32    = isProjected ? r32Proj    : r32Act
  const r16    = isProjected ? r16Proj    : r16Act
  const qf     = isProjected ? qfProj     : qfAct
  const sf     = isProjected ? sfProj     : sfAct
  const final_ = isProjected ? finalProj  : finalAct

  // Actual result counts
  const allActualMatches = [...actualR32, ...actualR16, ...actualQF, ...actualSF, ...actualFinal, actual3rdPlace]
  const playedCount = allActualMatches.filter(m => m.winnerId).length
  const totalCount  = allActualMatches.length

  return (
    <div>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 3, height: 12, background: 'var(--gray-400)', borderRadius: 2 }} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--gray-500)',
            }}>
              {isProjected
                ? 'Predicted Bracket · Polymarket odds · Jun 11, 2026'
                : `Actual Results · ${playedCount} / ${totalCount} matches played`}
            </span>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        {isProjected && champion && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'white',
            border: `1.5px solid ${champion.accentColor}`,
            borderRadius: 20,
            padding: '4px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          }}>
            <span style={{ fontSize: 15 }}>{champion.flagEmoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--gray-900)' }}>
              {champion.name} · {champion.meta.winPct}% to win
            </span>
            <span>🏆</span>
          </div>
        )}
      </div>

      {/* Format / legend note */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {isProjected ? (
          <>
            {[
              { label: '24 teams', note: 'Top 2 from each of 12 groups' },
              { label: '+ 8 teams', note: 'Best 8 third-place finishers' },
              { label: '= 32 teams', note: 'Enter Round of 32 · Jun 28' },
            ].map(({ label, note }) => (
              <div key={label}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>{label}</div>
                <div style={{ fontSize: 10, color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>{note}</div>
              </div>
            ))}
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>
                Highlighted = predicted to advance · % = win tournament
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>
                Tournament underway
              </div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>
                Group stage: Jun 11 – Jun 27 · Knockout stage starts Jun 28
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>
                Highlighted = match winner · italic slots = awaiting group stage
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bracket scroll container */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>
        <div className="scroll-x" style={{ padding: '0 8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <RoundCol label="Round of 32"    dates="Jun 28–Jul 3" matches={r32}    width={152} showGroup={isProjected} />
            <Divider />
            <RoundCol label="Round of 16"    dates="Jul 4–7"    matches={r16}    width={148} />
            <Divider />
            <RoundCol label="Quarter-finals" dates="Jul 9–11"   matches={qf}     width={148} />
            <Divider />
            <RoundCol label="Semi-finals"    dates="Jul 14–15"  matches={sf}     width={148} />
            <Divider />
            <RoundCol label="Final"          dates="Jul 19"     matches={final_} width={148} />
          </div>
        </div>
      </div>

      {/* Third place */}
      <div style={{
        marginTop: 12,
        background: 'white',
        borderRadius: 8,
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>
          3rd Place Match · Jul 18 · Hard Rock Stadium
        </div>
        {isProjected ? (
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3, fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>
            {sf[0] && sf[1]
              ? `${sf[0][0]?.flagEmoji ?? ''} ${sf[0][0]?.name ?? '?'} vs ${sf[1][0]?.flagEmoji ?? ''} ${sf[1][0]?.name ?? '?'} — predicted SF losers`
              : 'Semi-final losers · TBD'}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3, fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>
            {actual3rdPlace.homeId || actual3rdPlace.awayId
              ? `${teamById[actual3rdPlace.homeId]?.flagEmoji ?? ''} ${teamById[actual3rdPlace.homeId]?.name ?? actual3rdPlace.slotA} vs ${teamById[actual3rdPlace.awayId]?.flagEmoji ?? ''} ${teamById[actual3rdPlace.awayId]?.name ?? actual3rdPlace.slotB}`
              : 'Semi-final losers · TBD'}
          </div>
        )}
      </div>
    </div>
  )
}
