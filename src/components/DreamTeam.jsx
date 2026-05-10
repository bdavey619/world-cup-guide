import { useIsMobile } from '../hooks/useIsMobile'
import { dreamTeam } from '../data/teams'

const POSITIONS = ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CM', 'CM', 'LW', 'RW', 'ST']

export default function DreamTeam() {
  const isMobile = useIsMobile()

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: '#607080', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>OUR PICKS</div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>Tournament Dream Team</h2>
        <p style={{ margin: '6px 0 0', color: '#607080', fontSize: '13px' }}>The 11 players we'd pick for the ultimate 2026 squad</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '12px',
      }}>
        {dreamTeam.map((player, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: '#111827',
            borderRadius: '10px',
            border: '1px solid #1e2a3a',
            padding: '14px 16px',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#1a2535',
              border: '2px solid #e8b84b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }}>
              {player.flag}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: '#e8b84b22',
                  color: '#e8b84b',
                  letterSpacing: '0.06em',
                  flexShrink: 0,
                }}>
                  {player.pos}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {player.name}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#607080' }}>
                {player.country} &nbsp;·&nbsp; {player.club}
              </div>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 800,
              color: player.rating >= 93 ? '#e8b84b' : player.rating >= 90 ? '#4fc3f7' : '#a0b0c0',
              flexShrink: 0,
              minWidth: '28px',
              textAlign: 'right',
            }}>
              {player.rating}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
