import { useIsMobile } from '../hooks/useIsMobile'

export default function TeamPageOne({ team, teamName, onSwitchPage }) {
  const isMobile = useIsMobile()

  if (!team) return <div style={{ color: '#607080', padding: '40px', textAlign: 'center' }}>Select a team to view their guide.</div>

  return (
    <div>
      {/* Page toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button style={{ fontSize: '12px', padding: '5px 14px', border: 'none', borderRadius: '4px', background: '#e8b84b', color: '#070b14', fontWeight: 700, cursor: 'pointer' }}>
          PAGE 1 · OVERVIEW
        </button>
        <button onClick={onSwitchPage} style={{ fontSize: '12px', padding: '5px 14px', border: 'none', borderRadius: '4px', background: '#1e2a3a', color: '#a0b0c0', fontWeight: 700, cursor: 'pointer' }}>
          PAGE 2 · TACTICS
        </button>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '48px', lineHeight: 1 }}>{team.flag}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: 800, color: '#fff' }}>{teamName}</h2>
          <div style={{ fontSize: '13px', color: '#607080', marginTop: '2px' }}>
            Group {team.group} · Formation: {team.formation}
          </div>
        </div>
      </div>

      {/* Stat blocks */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'FIFA RANKING', value: `#${team.fifaRanking}` },
          { label: 'LAST WC', value: team.lastWC },
          ...(!isMobile ? [{ label: 'MANAGER', value: team.manager }] : []),
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#111827',
            border: '1px solid #1e2a3a',
            borderRadius: '8px',
            padding: '10px 16px',
            minWidth: '100px',
          }}>
            <div style={{ fontSize: '10px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: isMobile ? '15px' : '20px', fontWeight: 800, color: '#fff' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main two-column body */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 268px',
        gap: '16px',
        alignItems: 'start',
      }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Key Players 2×2 */}
          <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2a3a' }}>
              <div style={{ fontSize: '11px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>KEY PLAYERS</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a2535' }}>
              {team.keyPlayers.map((p, i) => (
                <div key={i} style={{ background: '#111827', padding: isMobile ? '7px 9px' : '10px 12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#607080' }}>
                    <span style={{ color: '#e8b84b', fontWeight: 600 }}>{p.position}</span>
                    &nbsp;·&nbsp;{p.club}
                    &nbsp;·&nbsp;Age {p.age}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strength + Vulnerability */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '12px',
          }}>
            <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '8px' }}>💪 STRENGTH</div>
              <p style={{ margin: 0, fontSize: '13px', color: '#8898aa', lineHeight: 1.6 }}>{team.strength}</p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '10px', color: '#f87171', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '8px' }}>⚠ VULNERABILITY</div>
              <p style={{ margin: 0, fontSize: '13px', color: '#8898aa', lineHeight: 1.6 }}>{team.vulnerability}</p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* All-time WC record */}
          <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2a3a' }}>
              {!isMobile && (
                <div style={{ fontSize: '11px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>ALL-TIME WC RECORD</div>
              )}
              {isMobile && (
                <div style={{ fontSize: '11px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>WC RECORD</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 8px' }}>
              {[
                { label: 'APP', value: team.allTimeRecord.wcs },
                { label: 'W', value: team.allTimeRecord.won },
                { label: 'D', value: team.allTimeRecord.drawn },
                { label: 'L', value: team.allTimeRecord.lost },
                { label: 'GF', value: team.allTimeRecord.goals },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: isMobile ? '13px' : '16px', fontWeight: 800, color: '#fff' }}>{value}</div>
                  <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#607080', fontWeight: 700, letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2a3a' }}>
              <div style={{ fontSize: '11px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>GROUP SCHEDULE</div>
            </div>
            <div>
              {team.schedule.map((match, i) => (
                <div key={i} style={{
                  padding: '10px 14px',
                  borderBottom: i < team.schedule.length - 1 ? '1px solid #1a2535' : 'none',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                    vs {match.opponent}
                  </div>
                  <div style={{ fontSize: '11px', color: '#607080' }}>
                    {match.date} · {match.stage}
                  </div>
                  <div style={{ fontSize: '10px', color: '#4fc3f7', marginTop: '2px' }}>{match.venue}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
