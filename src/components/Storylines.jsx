import { storylines } from '../data/storylines.js'

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const TIERS = [
  { key: 'S', label: 'S — Tier', description: 'Tournament-defining' },
  { key: 'A', label: 'A — Tier', description: 'Elite narratives' },
  { key: 'B', label: 'B — Tier', description: 'Essential supporting stories' },
]

function TierHeader({ label, description, first }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
      marginTop: first ? 0 : 24,
    }}>
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--font-sans)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--gray-500)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--gray-200)' }} />
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--font-sans)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--gray-400)',
        whiteSpace: 'nowrap',
      }}>
        {description}
      </span>
    </div>
  )
}

function StorylineCard({ s }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
      }}
    >
      <div style={{ width: 4, flexShrink: 0, background: s.accentColor }} />
      <div style={{ padding: '20px 20px 20px 24px', flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'var(--surface)',
            color: 'var(--gray-700)',
            padding: '3px 8px',
            borderRadius: 12,
          }}>
            {s.type}
          </span>
          {s.teams.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: hexToRgba(s.accentColor, 0.12),
                color: s.accentColor,
                padding: '3px 8px',
                borderRadius: 12,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'inherit' }}>
            {String(s.rank).padStart(2, '0')}
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--gray-900)',
            lineHeight: 1.2,
            marginTop: 2,
          }}>
            {s.headline}
          </div>
        </div>

        <div style={{
          fontSize: 13,
          fontStyle: 'italic',
          color: 'var(--gray-700)',
          marginTop: 4,
        }}>
          {s.subheadline}
        </div>

        <div style={{ marginTop: 10 }}>
          {s.narrative.split('\n\n').map((para, pi) => (
            <p key={pi} style={{
              fontSize: 13,
              lineHeight: 1.75,
              color: 'var(--gray-700)',
              margin: pi === 0 ? 0 : '8px 0 0',
            }}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function StorylinesAtAGlance() {
  const sTier = storylines.filter(s => s.tier === 'S')
  const abTier = storylines.filter(s => s.tier === 'A' || s.tier === 'B')

  return (
    <div style={{
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      marginBottom: 24,
    }}>
      {/* Section label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 20px 0 20px',
      }}>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-sans)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--gray-500)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          At a Glance
        </span>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--gray-200)' }} />
      </div>

      <div style={{ padding: '12px 20px 20px 20px' }}>
        {/* Intro */}
        <p style={{
          fontSize: 13,
          fontStyle: 'italic',
          color: 'var(--gray-500)',
          margin: '0 0 4px',
          lineHeight: 1.5,
        }}>
          Start here if you only have a minute.
        </p>

        {/* S-tier featured rows */}
        {sTier.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '10px 0',
              borderTop: '0.5px solid var(--gray-100)',
              marginTop: i === 0 ? 8 : 0,
            }}
          >
            <span style={{
              fontSize: 11,
              fontFamily: 'var(--font-sans)',
              color: s.accentColor,
              fontWeight: 600,
              minWidth: 20,
              paddingTop: 2,
              flexShrink: 0,
            }}>
              {String(s.rank).padStart(2, '0')}
            </span>
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--gray-900)',
                lineHeight: 1.3,
              }}>
                {s.headline}
              </div>
              <div style={{
                fontSize: 12,
                color: 'var(--gray-500)',
                marginTop: 2,
                lineHeight: 1.4,
              }}>
                {s.glance}
              </div>
            </div>
          </div>
        ))}

        {/* Also Watch */}
        <div style={{
          borderTop: '0.5px solid var(--gray-200)',
          marginTop: 12,
          paddingTop: 12,
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: '4px 0',
          }}>
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--gray-400)',
              marginRight: 8,
              flexShrink: 0,
            }}>
              Also watch
            </span>
            {abTier.map((s, i) => (
              <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {i > 0 && (
                  <span style={{
                    color: 'var(--gray-300)',
                    margin: '0 6px',
                    fontSize: 11,
                    lineHeight: 1,
                  }}>·</span>
                )}
                <span style={{
                  fontSize: 12,
                  color: 'var(--gray-700)',
                  lineHeight: 1.5,
                }}>
                  {s.headline}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClosingFooter() {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ height: '0.5px', background: 'var(--gray-200)' }} />
      <div style={{
        padding: '28px 16px',
        textAlign: 'center',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--gray-700)',
          margin: '0 0 10px',
        }}>
          One more thing.
        </p>
        <p style={{
          fontSize: 13,
          fontStyle: 'italic',
          color: 'var(--gray-500)',
          lineHeight: 1.7,
          margin: '0 0 8px',
        }}>
          Every World Cup arrives with stories everyone expects and leaves with one nobody saw coming.
        </p>
        <p style={{
          fontSize: 13,
          fontStyle: 'italic',
          color: 'var(--gray-500)',
          lineHeight: 1.7,
          margin: 0,
        }}>
          Use these as a guide to what to notice — not a prediction of what matters.
        </p>
      </div>
    </div>
  )
}

export default function Storylines() {
  const grouped = TIERS.map(t => ({
    ...t,
    stories: storylines.filter(s => s.tier === t.key),
  }))

  return (
    <div>
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 32,
          fontWeight: 500,
          color: 'var(--gray-900)',
          margin: '0 0 6px',
        }}>
          The Stories to Follow
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>
          Eleven narratives that will define the 2026 World Cup
        </p>
      </div>

      {/* At a Glance summary */}
      <StorylinesAtAGlance />

      {/* Tiered longform cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {grouped.map((group, gi) => (
          <div key={group.key}>
            <TierHeader label={group.label} description={group.description} first={gi === 0} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {group.stories.map(s => (
                <StorylineCard key={s.id} s={s} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Closing editorial footer */}
      <ClosingFooter />
    </div>
  )
}
