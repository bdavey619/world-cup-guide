import { useMemo } from 'react'

function posColor(i) {
  if (i === 0) return '#b8860b'
  if (i === 1) return '#808080'
  if (i === 2) return '#8B5A2B'
  if (i < 8)  return 'var(--gray-700)'
  return 'var(--gray-400)'
}

export default function Rankings({ teams, onSelectTeam }) {
  const ranked = useMemo(
    () => [...teams].sort((a, b) => a.meta.fifaRanking - b.meta.fifaRanking),
    [teams]
  )

  return (
    <div>
      {/* Section label */}
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
          Power Rankings · All 48 Teams · By FIFA World Ranking
        </span>
      </div>

      <div style={{ padding: '0 10px 24px' }}>
        {/* Column headers */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 10px 6px',
          gap: 8,
        }}>
          <div style={{ width: 28, flexShrink: 0 }} />
          <div style={{ width: 20, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
            Team
          </div>
          <div className="rankings-group-col" style={{ width: 28, flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)', textAlign: 'center' }}>
            Grp
          </div>
          <div style={{ width: 38, flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)', textAlign: 'right' }}>
            FIFA
          </div>
          <div style={{ width: 54, flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)', textAlign: 'right' }}>
            To Win
          </div>
          <div className="rankings-player-col" style={{ width: 110, flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
            Key Player
          </div>
        </div>

        {/* Team list */}
        <div style={{
          background: 'white',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        }}>
          {ranked.map((t, i) => {
            const keyPlayer = t.keyPlayers?.[0]?.name ?? ''
            const strength  = t.tactics?.strength ?? ''
            const lastWC    = t.meta?.lastWCResult ?? ''

            return (
              <div
                key={t.id}
                className="rankings-row"
                onClick={() => onSelectTeam?.(t)}
                style={{ borderBottom: i < ranked.length - 1 ? '0.5px solid var(--gray-100)' : 'none' }}
              >
                {/* Main row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                  {/* Position */}
                  <div style={{
                    width: 28,
                    flexShrink: 0,
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: posColor(i),
                  }}>
                    {i + 1}
                  </div>

                  {/* Flag */}
                  <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, width: 20 }}>
                    {t.flagEmoji}
                  </span>

                  {/* Name + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: t.accentColor ?? 'var(--gray-900)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {t.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 10,
                      color: 'var(--gray-500)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {t.meta.manager}{lastWC ? ` · ${lastWC}` : ''}
                    </div>
                  </div>

                  {/* Group badge */}
                  <div className="rankings-group-col" style={{
                    width: 28,
                    flexShrink: 0,
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '2px 4px',
                    borderRadius: 3,
                    background: 'var(--gray-900)',
                    color: 'white',
                  }}>
                    {t.meta.group}
                  </div>

                  {/* FIFA rank */}
                  <div style={{
                    width: 38,
                    flexShrink: 0,
                    textAlign: 'right',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    color: 'var(--gray-500)',
                  }}>
                    #{t.meta.fifaRanking}
                  </div>

                  {/* Odds */}
                  <div style={{
                    width: 54,
                    flexShrink: 0,
                    textAlign: 'right',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--gray-700)',
                  }}>
                    {t.meta.oddsToWin}
                  </div>

                  {/* Key player */}
                  <div className="rankings-player-col" style={{
                    width: 110,
                    flexShrink: 0,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--gray-700)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {keyPlayer}
                  </div>
                </div>

                {/* Strength line */}
                {strength && (
                  <div style={{
                    padding: '0 10px 7px',
                    paddingLeft: 10 + 28 + 20 + 8 + 8,
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      color: 'var(--gray-500)',
                      lineHeight: 1.45,
                    }}>
                      {strength}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
