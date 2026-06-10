const SECTIONS = [
  {
    id: 'storylines',
    label: 'Storylines',
    eyebrow: 'Start Here',
    desc: 'Eleven ranked narratives — from Messi and Ronaldo\'s final act to the 48-team chaos factor. Know what to watch before kick-off.',
    cta: 'Read the storylines →',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    eyebrow: 'Plan Your Tournament',
    desc: 'Every group stage match, day by day. Find your team, track their path, and never miss a big match.',
    cta: 'See the schedule →',
  },
  {
    id: 'guide',
    label: 'Team Guide',
    eyebrow: 'Know the Field',
    desc: 'All 48 teams profiled — how they play, who to watch, their odds, and their history at the World Cup.',
    cta: 'Explore the teams →',
  },
  {
    id: 'groups',
    label: 'Groups & Bracket',
    eyebrow: 'See the Paths',
    desc: 'All 12 groups with standings, plus the full knockout bracket and how teams advance from group to final.',
    cta: 'View the groups →',
  },
  {
    id: 'dreamteam',
    label: 'Dream Team',
    eyebrow: 'Pick Your XI',
    desc: 'Build your ultimate World Cup starting eleven. Who makes your squad?',
    cta: 'Build your team →',
  },
]

export default function Overview({ onNavigate }) {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '8px 0 28px' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 32,
          fontWeight: 500,
          color: 'var(--gray-900)',
          margin: '0 0 10px',
          lineHeight: 1.15,
        }}>
          2026 World Cup Guide
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--gray-500)',
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          A viewer's guide to the teams, stories, schedule, and moments that will shape the tournament.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SECTIONS.map(section => (
          <div
            key={section.id}
            onClick={() => onNavigate(section.id)}
            style={{
              background: 'white',
              borderRadius: 8,
              padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
          >
            <div style={{
              fontSize: 9,
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              color: 'var(--gray-400)',
              fontWeight: 700,
              marginBottom: 4,
            }}>
              {section.eyebrow}
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--gray-900)',
              marginBottom: 6,
            }}>
              {section.label}
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--gray-500)',
              lineHeight: 1.55,
              marginBottom: 10,
            }}>
              {section.desc}
            </div>
            <div style={{
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              color: 'var(--gray-500)',
              fontWeight: 500,
            }}>
              {section.cta}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
