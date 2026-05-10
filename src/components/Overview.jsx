import { useIsMobile } from '../hooks/useIsMobile'
import { groups, teamData } from '../data/teams'

export default function Overview() {
  const isMobile = useIsMobile()
  const isTablet = !isMobile && typeof window !== 'undefined' && window.innerWidth < 900

  const gridCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr'

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: '#607080', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>TOURNAMENT OVERVIEW</div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>2026 FIFA World Cup</h2>
        <p style={{ margin: '6px 0 0', color: '#607080', fontSize: '13px' }}>
          USA · Canada · Mexico &nbsp;·&nbsp; June – July 2026 &nbsp;·&nbsp; 48 Teams · 16 Venues
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: '16px',
      }}>
        {Object.entries(groups).map(([letter, group]) => (
          <div key={letter} style={{
            background: '#111827',
            borderRadius: '10px',
            border: '1px solid #1e2a3a',
            overflow: 'hidden',
          }}>
            <div style={{
              background: '#1a2535',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                background: '#e8b84b',
                color: '#070b14',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {letter}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#a0b0c0', letterSpacing: '0.06em' }}>
                GROUP {letter}
              </div>
            </div>

            <div>
              {group.teams.map((teamName, i) => {
                const team = teamData[teamName]
                if (!team) return null
                return (
                  <div key={teamName} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 14px',
                    borderBottom: i < group.teams.length - 1 ? '1px solid #1a2535' : 'none',
                  }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{team.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {teamName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#607080' }}>#{team.fifaRanking} FIFA</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#e8b84b', fontWeight: 600, flexShrink: 0 }}>{team.odds}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
