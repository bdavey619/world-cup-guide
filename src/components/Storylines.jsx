import { useState } from 'react'
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

const pillBase = {
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '3px 8px',
  borderRadius: 12,
}

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

function Chevron({ open }) {
  return (
    <span style={{
      fontSize: 14,
      color: 'var(--gray-400)',
      display: 'inline-block',
      lineHeight: 1,
      transition: 'transform 0.18s ease',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      userSelect: 'none',
    }}>
      ▾
    </span>
  )
}

function TypePill({ type }) {
  return (
    <span style={{
      ...pillBase,
      background: 'var(--surface)',
      color: 'var(--gray-700)',
    }}>
      {type}
    </span>
  )
}

function TeamPill({ tag, accentColor }) {
  return (
    <span style={{
      ...pillBase,
      background: hexToRgba(accentColor, 0.12),
      color: accentColor,
    }}>
      {tag}
    </span>
  )
}

function StorylineRow({ s, isOpen, onToggle, isHovered, onMouseEnter, onMouseLeave }) {
  const rankStr = String(s.rank).padStart(2, '0')

  return (
    <div
      style={{
        background: isHovered && !isOpen ? 'var(--gray-50)' : 'white',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--gray-200)',
        display: 'flex',
        cursor: 'pointer',
      }}
      onClick={onToggle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Accent bar */}
      <div style={{ width: 4, flexShrink: 0, background: s.accentColor }} />

      {isOpen ? (
        /* ── EXPANDED ── */
        <div style={{ padding: '16px 20px 20px 24px', flex: 1 }}>
          {/* Top row: pills + chevron */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <TypePill type={s.type} />
              {s.teams.map(tag => (
                <TeamPill key={tag} tag={tag} accentColor={s.accentColor} />
              ))}
            </div>
            <Chevron open={true} />
          </div>

          {/* Rank + headline */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'inherit' }}>
              {rankStr}
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

          {/* Subheadline */}
          <div style={{
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            fontStyle: 'italic',
            color: 'var(--gray-500)',
            lineHeight: 1.65,
            marginTop: 6,
          }}>
            {s.subheadline}
          </div>

          {/* Narrative */}
          <div style={{ marginTop: 12 }}>
            {s.narrative.split('\n\n').map((para, pi) => (
              <p key={pi} style={{
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.75,
                color: 'var(--gray-500)',
                margin: pi === 0 ? 0 : '8px 0 0',
              }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      ) : (
        /* ── COLLAPSED ── */
        <div style={{
          padding: '12px 14px 12px 18px',
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Rank + headline */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{
                fontSize: 11,
                fontFamily: 'var(--font-sans)',
                color: s.accentColor,
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {rankStr}
              </span>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 17,
                fontWeight: 500,
                color: 'var(--gray-900)',
                lineHeight: 1.2,
              }}>
                {s.headline}
              </span>
            </div>

            {/* Glance one-liner */}
            <div style={{
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              color: 'var(--gray-500)',
              marginTop: 4,
              lineHeight: 1.4,
            }}>
              {s.glance}
            </div>

            {/* Pills */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
              <TypePill type={s.type} />
              {s.teams.map(tag => (
                <TeamPill key={tag} tag={tag} accentColor={s.accentColor} />
              ))}
            </div>
          </div>

          {/* Chevron */}
          <div style={{ flexShrink: 0, paddingTop: 3 }}>
            <Chevron open={false} />
          </div>
        </div>
      )}
    </div>
  )
}


export default function Storylines() {
  const [expanded, setExpanded] = useState(new Set())
  const [hovering, setHovering] = useState(null)

  const isOpen = id => expanded.has(id)

  const toggle = id => setExpanded(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const allExpanded = expanded.size === storylines.length
  const toggleAll = (e) => {
    e.stopPropagation()
    setExpanded(allExpanded ? new Set() : new Set(storylines.map(s => s.id)))
  }

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
        <p style={{ fontSize: 13, fontFamily: 'var(--font-sans)', color: 'var(--gray-500)', margin: '0 0 12px' }}>
          Eleven narratives to scan now and follow deeper throughout the tournament.
        </p>
        <button
          onClick={toggleAll}
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--gray-500)',
            background: 'var(--surface)',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 12px',
            borderRadius: 12,
          }}
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Tiered expandable storyline list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {grouped.map((group, gi) => (
          <div key={group.key}>
            <TierHeader label={group.label} description={group.description} first={gi === 0} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {group.stories.map(s => (
                <StorylineRow
                  key={s.id}
                  s={s}
                  isOpen={isOpen(s.id)}
                  onToggle={() => toggle(s.id)}
                  isHovered={hovering === s.id && !isOpen(s.id)}
                  onMouseEnter={() => setHovering(s.id)}
                  onMouseLeave={() => setHovering(null)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
