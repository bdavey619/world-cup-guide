import { useIsMobile } from '../hooks/useIsMobile'

function Pitch({ players }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', display: 'block', background: '#1a3a20' }}>
      {/* Pitch markings */}
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="#2d5c36" strokeWidth="0.6" />
      <line x1="2" y1="50" x2="98" y2="50" stroke="#2d5c36" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
      <rect x="22" y="2" width="56" height="14" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
      <rect x="22" y="84" width="56" height="14" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
      <rect x="34" y="2" width="32" height="7" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
      <rect x="34" y="91" width="32" height="7" fill="none" stroke="#2d5c36" strokeWidth="0.4" />

      {/* Players */}
      {players.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="#e8b84b" opacity="0.9" />
          <text x={p.x} y={p.y + 0.8} textAnchor="middle" dominantBaseline="middle" fontSize="2.8" fontWeight="700" fill="#070b14">
            {p.pos === 'GK' ? 'GK' : p.name.split(' ').pop().substring(0, 5)}
          </text>
          <text x={p.x} y={p.y + 7.5} textAnchor="middle" dominantBaseline="middle" fontSize="2.6" fill="#c0d0e0" fontWeight="500">
            {p.pos}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function TeamPageTwo({ team, teamName, onSwitchPage }) {
  const isMobile = useIsMobile()

  if (!team) return <div style={{ color: '#607080', padding: '40px', textAlign: 'center' }}>Select a team to view their guide.</div>

  return (
    <div>
      {/* Page toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={onSwitchPage} style={{ fontSize: '12px', padding: '5px 14px', border: 'none', borderRadius: '4px', background: '#1e2a3a', color: '#a0b0c0', fontWeight: 700, cursor: 'pointer' }}>
          PAGE 1 · OVERVIEW
        </button>
        <button style={{ fontSize: '12px', padding: '5px 14px', border: 'none', borderRadius: '4px', background: '#e8b84b', color: '#070b14', fontWeight: 700, cursor: 'pointer' }}>
          PAGE 2 · TACTICS
        </button>
      </div>

      {/* Header with team name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '36px', lineHeight: 1 }}>{team.flag}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: '#fff' }}>{teamName}</h2>
          <div style={{ fontSize: '12px', color: '#607080' }}>Tactical breakdown · {team.formation}</div>
        </div>
      </div>

      {/* Stat pills row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'FIFA RANKING', value: `#${team.fifaRanking}` },
          { label: 'ODDS', value: team.odds },
          { label: 'GROUP', value: team.group },
          ...(!isMobile ? [{ label: 'IMPLIED PROB.', value: team.impliedProb }] : []),
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#111827',
            border: '1px solid #1e2a3a',
            borderRadius: '8px',
            padding: '8px 14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: '#fff' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main body: pitch + right panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 280px',
        gap: '16px',
        alignItems: 'start',
      }}>

        {/* Pitch */}
        <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2a3a' }}>
            <div style={{ fontSize: '11px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>
              STARTING XI · {team.formation}
            </div>
          </div>
          <div style={{ padding: '10px' }}>
            <Pitch players={team.startingXI} />
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Schedule */}
          <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2a3a' }}>
              <div style={{ fontSize: '11px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>GROUP SCHEDULE</div>
            </div>
            <div>
              {team.schedule.map((match, i) => (
                <div key={i} style={{
                  padding: '11px 14px',
                  borderBottom: i < team.schedule.length - 1 ? '1px solid #1a2535' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 700, color: '#fff' }}>
                      vs {match.opponent}
                    </div>
                    <div style={{ fontSize: '11px', color: '#e8b84b', fontWeight: 600, flexShrink: 0 }}>{match.date}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#607080', marginTop: '2px' }}>{match.stage}</div>
                  <div style={{ fontSize: '10px', color: '#4fc3f7', marginTop: '2px' }}>{match.venue}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key players summary */}
          <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2a3a' }}>
              <div style={{ fontSize: '11px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>ONES TO WATCH</div>
            </div>
            <div>
              {team.keyPlayers.map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 14px',
                  borderBottom: i < team.keyPlayers.length - 1 ? '1px solid #1a2535' : 'none',
                }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 5px',
                    borderRadius: '3px', background: '#e8b84b22', color: '#e8b84b',
                    flexShrink: 0, letterSpacing: '0.04em',
                  }}>
                    {p.position}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '10px', color: '#607080' }}>{p.club}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
