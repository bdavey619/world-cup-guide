import { storylines } from '../data/storylines.js'

function getTodayTeams(teams) {
  try {
    const now = new Date()
    const month = now.toLocaleString('en-US', { month: 'short' })
    const day = now.getDate()
    const todayKey = `${month} ${day}`
    const todayTeams = new Set()
    for (const team of teams) {
      if (!team.schedule) continue
      for (const s of team.schedule) {
        if (s.date === todayKey) {
          todayTeams.add(team.name)
          if (s.opponent) todayTeams.add(s.opponent)
        }
      }
    }
    return todayTeams
  } catch {
    return new Set()
  }
}

function getFeaturedStoryline(teams) {
  const todayTeams = getTodayTeams(teams)
  if (todayTeams.size > 0) {
    const match = storylines
      .filter(s => s.teams.some(t => todayTeams.has(t)))
      .sort((a, b) => a.rank - b.rank)[0]
    if (match) return match
  }
  return storylines[new Date().getDate() % storylines.length]
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const pillBase = {
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '3px 8px',
  borderRadius: 12,
}

const SECTIONS = [
  {
    id: 'storylines',
    label: 'Storylines',
    eyebrow: 'Start Here',
    desc: 'Eleven ranked narratives — from Messi and Ronaldo\'s final act to the 48-team chaos factor. Know what to watch before kick-off.',
    cta: 'Read the storylines →',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    eyebrow: 'Plan Your Tournament',
    desc: 'Every group stage match, day by day. Find your team, track their path, and never miss a big match.',
    cta: 'See the schedule →',
  },
  {
    id: 'guide',
    label: 'Team Guide',
    eyebrow: 'Know the Field',
    desc: 'All 48 teams profiled — how they play, who to watch, their odds, and their history at the World Cup.',
    cta: 'Explore the teams →',
  },
  {
    id: 'bracket',
    label: 'Groups & Bracket',
    eyebrow: 'See the Paths',
    desc: 'The full tournament structure: all 12 groups, the knockout bracket, and how teams advance from group to final.',
    cta: 'View the bracket →',
  },
  {
    id: 'dreamteam',
    label: 'Dream Team',
    eyebrow: 'Pick Your XI',
    desc: 'Build your ultimate World Cup starting eleven. Who makes your squad?',
    cta: 'Build your team →',
  },
]

export default function Overview({ teams, onSelectTeam, onNavigate }) {
  const featured = getFeaturedStoryline(teams ?? [])

  return (
    <div>
      {/* Page header */}
      <div style={{ textAlign: 'center', padding: '8px 0 28px' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 32,
          fontWeight: 500,
          color: 'var(--gray-900)',
          margin: '0 0 10px',
          lineHeight: 1.15,
        }}>
          2026 World Cup Guide
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--gray-500)',
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          A viewer's guide to the teams, stories, schedule, and moments that will shape the tournament.
        </p>
      </div>

      {/* Rotating featured storyline */}
      {featured && (
        <div
          onClick={() => onNavigate('storylines')}
          style={{
            background: 'white',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
            marginBottom: 28,
            cursor: 'pointer',
            borderLeft: `4px solid ${featured.accentColor}`,
          }}
        >
          <div style={{ padding: '16px 20px' }}>
            <div style={{
              fontSize: 9,
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--gray-400)',
              fontWeight: 700,
              marginBottom: 8,
            }}>
              Storyline to Watch
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    color: featured.accentColor,
                  }}>
                    {String(featured.rank).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gray-400)',
                  }}>
                    {featured.tier}-Tier
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  fontWeight: 500,
                  color: 'var(--gray-900)',
                  lineHeight: 1.2,
                  marginBottom: 6,
                }}>
                  {featured.headline}
                </div>
                <div style={{
                  fontSize: 13,
                  color: 'var(--gray-500)',
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}>
                  {featured.glance}
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    ...pillBase,
                    background: 'var(--surface)',
                    color: 'var(--gray-700)',
                  }}>
                    {featured.type}
                  </span>
                  {featured.teams.map(tag => (
                    <span key={tag} style={{
                      ...pillBase,
                      background: hexToRgba(featured.accentColor, 0.12),
                      color: featured.accentColor,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{
              marginTop: 14,
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              color: 'var(--gray-500)',
              fontWeight: 500,
            }}>
              Explore Storylines →
            </div>
          </div>
        </div>
      )}

      {/* Section cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SECTIONS.map(section => (
          <div
            key={section.id}
            onClick={() => onNavigate(section.id)}
            style={{
              background: 'white',
              borderRadius: 8,
              padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
          >
            <div style={{
              fontSize: 9,
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              color: 'var(--gray-400)',
              fontWeight: 700,
              marginBottom: 4,
            }}>
              {section.eyebrow}
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--gray-900)',
              marginBottom: 6,
            }}>
              {section.label}
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--gray-500)',
              lineHeight: 1.55,
              marginBottom: 10,
            }}>
              {section.desc}
            </div>
            <div style={{
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              color: 'var(--gray-500)',
              fontWeight: 500,
            }}>
              {section.cta}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
