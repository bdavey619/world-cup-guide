import { useIsMobile } from '../hooks/useIsMobile'
import { teamData } from '../data/teams'

const GROUP_COLORS = {
  A: '#e8b84b',
  B: '#4fc3f7',
  C: '#34d399',
  D: '#f87171',
  E: '#a78bfa',
  F: '#fb923c',
}

export default function Rankings() {
  const isMobile = useIsMobile()

  const rankedTeams = Object.entries(teamData)
    .sort((a, b) => a[1].fifaRanking - b[1].fifaRanking)

  const posColor = (i) => {
    if (i === 0) return '#e8b84b'
    if (i === 1) return '#c0c8d8'
    if (i === 2) return '#cd7f32'
    if (i < 8) return '#a0b0c0'
    return '#607080'
  }

  if (isMobile) {
    return (
      <div>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', color: '#607080', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>POWER RANKINGS</div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>All 24 Teams Ranked</h2>
          <p style={{ margin: '6px 0 0', color: '#607080', fontSize: '13px' }}>
            Ordered by FIFA world ranking · odds and key context for every team
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rankedTeams.map(([teamName, team], i) => {
            const groupColor = GROUP_COLORS[team.group]
            const keyPlayer = team.keyPlayers[0]?.name || ''

            return (
              <div key={teamName} style={{
                background: '#111827',
                borderRadius: '10px',
                border: '1px solid #1e2a3a',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '26px',
                    flexShrink: 0,
                    fontSize: '14px',
                    fontWeight: 800,
                    color: posColor(i),
                    textAlign: 'center',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{team.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {teamName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#607080' }}>FIFA #{team.fifaRanking}</div>
                  </div>
                  <div style={{
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: groupColor + '22',
                    color: groupColor,
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    flexShrink: 0,
                  }}>
                    GRP {team.group}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8b84b', flexShrink: 0, minWidth: '48px', textAlign: 'right' }}>
                    {team.odds}
                  </div>
                </div>

                <div style={{ marginTop: '9px', paddingTop: '9px', borderTop: '1px solid #1a2535', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '3px',
                    background: '#4fc3f722',
                    color: '#4fc3f7',
                    letterSpacing: '0.02em',
                    flexShrink: 0,
                    marginTop: '1px',
                    whiteSpace: 'nowrap',
                  }}>
                    {keyPlayer}
                  </span>
                  <div style={{ fontSize: '12px', color: '#607080', lineHeight: 1.45 }}>
                    {team.strength}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '11px', color: '#607080', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>POWER RANKINGS</div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>All 24 Teams Ranked</h2>
        <p style={{ margin: '6px 0 0', color: '#607080', fontSize: '13px' }}>
          Ordered by FIFA world ranking · odds, key player, and scouting note for every team in the tournament
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '38px 1fr 56px 68px 80px 160px 1fr',
        gap: '0 12px',
        padding: '4px 16px 8px',
      }}>
        {['#', 'TEAM', 'GROUP', 'FIFA RK', 'TO WIN', 'KEY PLAYER', 'STRENGTH'].map(h => (
          <div key={h} style={{ fontSize: '10px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>{h}</div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {rankedTeams.map(([teamName, team], i) => {
          const groupColor = GROUP_COLORS[team.group]
          const keyPlayer = team.keyPlayers[0]?.name || ''

          return (
            <div key={teamName} style={{
              display: 'grid',
              gridTemplateColumns: '38px 1fr 56px 68px 80px 160px 1fr',
              gap: '0 12px',
              alignItems: 'center',
              background: '#111827',
              borderRadius: '10px',
              border: '1px solid #1e2a3a',
              padding: '11px 16px',
            }}>
              {/* Position */}
              <div style={{
                fontSize: '15px',
                fontWeight: 800,
                color: posColor(i),
                textAlign: 'center',
              }}>
                {i + 1}
              </div>

              {/* Flag + Name + Manager */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ fontSize: '20px', flexShrink: 0, lineHeight: 1 }}>{team.flag}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {teamName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#607080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {team.manager}
                  </div>
                </div>
              </div>

              {/* Group badge */}
              <div style={{
                padding: '3px 0',
                borderRadius: '4px',
                background: groupColor + '22',
                color: groupColor,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textAlign: 'center',
              }}>
                {team.group}
              </div>

              {/* FIFA rank */}
              <div style={{ fontSize: '13px', color: '#a0b0c0', fontWeight: 600 }}>
                #{team.fifaRanking}
              </div>

              {/* Odds */}
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8b84b' }}>
                {team.odds}
              </div>

              {/* Key player */}
              <div style={{ fontSize: '12px', color: '#4fc3f7', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {keyPlayer}
              </div>

              {/* Strength */}
              <div style={{ fontSize: '12px', color: '#607080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {team.strength}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
