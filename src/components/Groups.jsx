export default function Groups({ teams, groups, onSelectTeam }) {
  function groupTeams(g) {
    return teams
      .filter(t => t.meta.group === g)
      .sort((a, b) => {
        const ptsDiff = (b.standings?.pts ?? 0) - (a.standings?.pts ?? 0)
        if (ptsDiff !== 0) return ptsDiff
        return a.meta.fifaRanking - b.meta.fifaRanking
      })
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '10px 12px 8px',
      }}>
        <div style={{ width: 3, height: 12, background: 'var(--gray-400)', borderRadius: 2, flexShrink: 0 }} />
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--gray-500)',
        }}>
          Group Stage · 48 teams · 12 groups · Jun 11 – Jul 19
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
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
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            }}>
              <div style={{
                background: 'var(--gray-900)',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'white',
                }}>
                  Group {g}
                </span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                }}>Pts</span>
              </div>
              {gTeams.map((t, i) => {
                const s = t.standings ?? { pts: 0 }
                const isLeader = i === 0 && s.pts > 0
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTeam(t)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderBottom: i < gTeams.length - 1 ? '0.5px solid var(--gray-100)' : 'none',
                      cursor: 'pointer',
                      background: isLeader ? 'var(--gray-50)' : 'white',
                    }}
                  >
                    <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>{t.flagEmoji}</span>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      fontWeight: i < 2 ? 600 : 400,
                      color: 'var(--gray-900)',
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minWidth: 0,
                    }}>
                      {t.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: s.pts > 0 ? 'var(--gray-900)' : 'var(--gray-400)',
                      flexShrink: 0,
                      width: 20,
                      textAlign: 'center',
                    }}>{s.pts}</span>
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
