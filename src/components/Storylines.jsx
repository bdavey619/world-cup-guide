import { storylines } from '../data/teams'

export default function Storylines() {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: '#607080', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>EDITORIAL</div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>Key Storylines</h2>
        <p style={{ margin: '6px 0 0', color: '#607080', fontSize: '13px' }}>The narratives that will define the 2026 World Cup</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {storylines.map((s, i) => (
          <div key={i} style={{
            background: '#111827',
            borderRadius: '10px',
            border: '1px solid #1e2a3a',
            padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: '4px',
                background: s.tagColor + '22',
                color: s.tagColor,
                flexShrink: 0,
              }}>
                {s.tag}
              </span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{s.title}</h3>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#8898aa', lineHeight: 1.65 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
