import { useState } from 'react'
import statsData from '../data/stats.json'

const TABS = [
  { key: 'goals',          label: 'Golden Boot',      icon: '⚽', sublabel: 'Goals' },
  { key: 'assists',        label: 'Assists',           icon: '🎯', sublabel: 'Assists' },
  { key: 'shotsOnTarget',  label: 'Shots on Target',   icon: '🥅', sublabel: 'Shots' },
  { key: 'yellowCards',    label: 'Yellow Cards',      icon: '🟨', sublabel: 'Cards' },
  { key: 'redCards',       label: 'Red Cards',         icon: '🟥', sublabel: 'Cards' },
  { key: 'foulsCommitted', label: 'Fouls Committed',   icon: '🦵', sublabel: 'Fouls' },
]

function rankColor(i) {
  if (i === 0) return '#b8860b'
  if (i === 1) return '#808080'
  if (i === 2) return '#8B5A2B'
  return 'var(--gray-400)'
}

function formatUpdated(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZoneName: 'short',
  })
}

export default function Stats() {
  const [activeTab, setActiveTab] = useState('goals')

  const tab = TABS.find(t => t.key === activeTab)
  const entries = statsData.leaders[activeTab] ?? []

  // Group ties: players with same value get same rank display
  let displayRank = 1
  const ranked = entries.map((e, i) => {
    if (i > 0 && e.value < entries[i - 1].value) displayRank = i + 1
    return { ...e, rank: displayRank }
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 12px 8px' }}>
        <div style={{ width: 3, height: 12, background: 'var(--gray-400)', borderRadius: 2, flexShrink: 0 }} />
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--gray-500)',
        }}>
          Tournament Stats · 2026 FIFA World Cup
        </span>
      </div>

      <div style={{ padding: '0 10px 24px' }}>

        {/* Category tabs */}
        <div className="scroll-x" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 6, minWidth: 'max-content' }}>
            {TABS.map(t => {
              const isActive = t.key === activeTab
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: isActive ? 'none' : '1px solid var(--gray-200)',
                    background: isActive ? 'var(--gray-900)' : 'white',
                    color: isActive ? 'white' : 'var(--gray-600)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 10px 6px',
          gap: 8,
        }}>
          <div style={{ width: 28, flexShrink: 0 }} />
          <div style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
            Player
          </div>
          <div style={{ width: 80, flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)', textAlign: 'right' }}>
            {tab?.sublabel}
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{
          background: 'white',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        }}>
          {ranked.length === 0 ? (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--gray-400)',
            }}>
              No data yet — check back once matches begin.
            </div>
          ) : ranked.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 10px',
                borderBottom: i < ranked.length - 1 ? '0.5px solid var(--gray-100)' : 'none',
              }}
            >
              {/* Rank */}
              <div style={{
                width: 28,
                flexShrink: 0,
                textAlign: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 700,
                color: rankColor(p.rank - 1),
              }}>
                {p.rank}
              </div>

              {/* Flag + name + team */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{p.flag}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--gray-900)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {p.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 10,
                      color: 'var(--gray-500)',
                      whiteSpace: 'nowrap',
                    }}>
                      {p.team}{p.position ? ` · ${p.position}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Value */}
              <div style={{
                width: 80,
                flexShrink: 0,
                textAlign: 'right',
              }}>
                <span style={{
                  display: 'inline-block',
                  minWidth: 28,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: p.rank === 1 ? 'var(--gray-900)' : 'var(--gray-100)',
                  color: p.rank === 1 ? 'white' : 'var(--gray-700)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: 'center',
                }}>
                  {p.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Last updated */}
        <div style={{
          marginTop: 10,
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          color: 'var(--gray-400)',
          textAlign: 'right',
        }}>
          Updated {formatUpdated(statsData.updatedAt)}
        </div>
      </div>
    </div>
  )
}
