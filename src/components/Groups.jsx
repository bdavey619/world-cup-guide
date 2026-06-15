import { useState, useEffect } from 'react'

export default function Groups({ teams, groups, onSelectTeam }) {
  const [expanded, setExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function groupTeams(g) {
    return teams
      .filter(t => t.meta.group === g)
      .sort((a, b) => {
        const ptsDiff = (b.standings?.pts ?? 0) - (a.standings?.pts ?? 0)
        if (ptsDiff !== 0) return ptsDiff
        const gdA = (a.standings?.gf ?? 0) - (a.standings?.ga ?? 0)
        const gdB = (b.standings?.gf ?? 0) - (b.standings?.ga ?? 0)
        if (gdB !== gdA) return gdB - gdA
        const gfDiff = (b.standings?.gf ?? 0) - (a.standings?.gf ?? 0)
        if (gfDiff !== 0) return gfDiff
        return a.meta.fifaRanking - b.meta.fifaRanking
      })
  }

  const colW = 22

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px 8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 3, height: 12, background: 'var(--gray-400)', borderRadius: 2, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--gray-500)',
          }}>
            Group Stage · 48 teams · 12 groups · Jun 11 – Jul 19
          </span>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: expanded ? 'var(--gray-900)' : 'var(--gray-400)',
            background: expanded ? 'var(--gray-100)' : 'transparent',
            border: '1px solid var(--gray-200)',
            borderRadius: 4,
            padding: '3px 8px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          {expanded ? 'Simple' : 'Full table'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: (expanded && isMobile) ? '1fr' : '1fr 1fr',
        gap: 6,
        padding: '0 10px 24px',
      }}>
        {groups.map(g => {
          const gTeams = groupTeams(g)
          return (
            <div key={g} style={{
              background: 'white',
              borderRadius: 6,
              overflow: 'hidden',
              border: '1px solid var(--gray-200)',
            }}>
              {/* Group header */}
              <div style={{
                background: 'var(--gray-900)',
                padding: '5px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'white',
                }}>
                  Group {g}
                </span>
                {expanded ? (
                  <div style={{ display: 'flex', gap: 0 }}>
                    {['W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'].map(col => (
                      <span key={col} style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: col === 'PTS' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                        textTransform: 'uppercase',
                        width: col === 'PTS' ? 26 : colW,
                        textAlign: 'center',
                      }}>{col}</span>
                    ))}
                  </div>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.45)',
                    textTransform: 'uppercase',
                  }}>Pts</span>
                )}
              </div>

              {/* Rows */}
              {gTeams.map((t, i) => {
                const s = t.standings ?? { pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
                const gd = (s.gf ?? 0) - (s.ga ?? 0)
                const gdStr = gd > 0 ? `+${gd}` : `${gd}`
                const isAdvancing = i < 2
                const hasPlayed = (s.w + s.d + s.l) > 0

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTeam(t)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 8px',
                      borderBottom: i < gTeams.length - 1 ? '0.5px solid var(--gray-100)' : 'none',
                      cursor: 'pointer',
                      background: 'white',
                      borderLeft: isAdvancing && hasPlayed ? '2px solid var(--gray-300)' : '2px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-md)', lineHeight: 1, flexShrink: 0 }}>{t.flagEmoji}</span>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: isAdvancing ? 600 : 400,
                      color: 'var(--gray-900)',
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minWidth: 0,
                    }}>
                      {t.name}
                    </span>

                    {expanded ? (
                      <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
                        {[
                          { val: s.w ?? 0, key: 'w' },
                          { val: s.d ?? 0, key: 'd' },
                          { val: s.l ?? 0, key: 'l' },
                          { val: s.gf ?? 0, key: 'gf' },
                          { val: s.ga ?? 0, key: 'ga' },
                          { val: hasPlayed ? gdStr : '—', key: 'gd' },
                          { val: s.pts ?? 0, key: 'pts', bold: true },
                        ].map(({ val, key, bold }) => (
                          <span key={key} style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 11,
                            fontWeight: bold ? 600 : 400,
                            color: bold
                              ? (s.pts > 0 ? 'var(--gray-900)' : 'var(--gray-400)')
                              : 'var(--gray-500)',
                            width: key === 'pts' ? 26 : colW,
                            textAlign: 'center',
                          }}>
                            {val}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: s.pts > 0 ? 'var(--gray-900)' : 'var(--gray-400)',
                        flexShrink: 0,
                        width: 20,
                        textAlign: 'center',
                      }}>{s.pts}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
