import { storylines } from '../data/storylines.js'

export default function TeamPageOne({ team, onViewStorylines }) {
  const {
    accentColor, name, nickname, meta, narrative,
    keyPlayers, tactics, watchFor, allTimeRecord,
  } = team

  const muted = 'var(--gray-500)'
  const serif = 'var(--font-serif)'

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  // Derive a readable dark tone from accent for text-on-tint use
  function darkenForText(hex) {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 60)
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 60)
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 60)
    return `rgb(${r},${g},${b})`
  }

  const SectionLabel = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
      <div style={{ width: 3, height: 12, background: accentColor, flexShrink: 0 }} />
      <span style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: muted,
        fontFamily: 'var(--font-sans)',
      }}>
        {label}
      </span>
    </div>
  )

  return (
    <div style={{
      fontFamily: serif,
      background: '#fff',
      color: 'var(--gray-900)',
      overflow: 'hidden',
      border: '1px solid var(--gray-200)',
      borderTop: 'none',
    }}>

      {/* 1. TOP BORDER */}
      <div style={{
        height: 4,
        background: accentColor,
        borderRadius: '2px 2px 0 0',
      }} />

      {/* 2. HEADER */}
      <div className="team-section-header" style={{
        background: '#fff',
        padding: '1.1rem 1.5rem 0.9rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '0.5px solid var(--gray-200)',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        {/* Left */}
        <div>
          <div className="team-page-label" style={{
            fontSize: 10,
            color: muted,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            marginBottom: 3,
          }}>
            2026 FIFA WORLD CUP · WATCH GUIDE
          </div>
          <div style={{
            fontFamily: serif,
            fontSize: 44,
            fontWeight: 500,
            color: 'var(--gray-900)',
            lineHeight: 1,
          }} className="team-name-xl">
            {name}
          </div>
          <div style={{
            fontSize: 13,
            fontStyle: 'italic',
            color: muted,
            marginTop: 4,
          }}>
            {nickname}
          </div>
        </div>

        {/* Right — three stat blocks */}
        <div className="team-stats-row" style={{ display: 'flex', flexDirection: 'row', gap: 20, paddingTop: 6 }}>
          {[
            { label: 'FIFA RANKING', value: `#${meta.fifaRanking}` },
            { label: 'LAST WC RESULT', value: meta.lastWCResult },
            { label: 'MANAGER', value: meta.manager },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 10,
                color: muted,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
                marginBottom: 3,
              }}>
                {label}
              </div>
              <div className="team-stats-value" style={{
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1,
                fontFamily: serif,
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ESSENCE PANEL */}
      <div className="essence-panel" style={{
        background: hexToRgba(accentColor, 0.08),
        borderLeft: `3px solid ${accentColor}`,
        padding: '0.9rem 1.5rem',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 1.8,
        color: darkenForText(accentColor),
      }}>
        {narrative.essence}
      </div>

      {/* 4. MAIN BODY */}
      <div className="team-body-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(0, 240px)',
        border: '0.5px solid var(--gray-200)',
        borderTop: 'none',
        borderBottom: 'none',
      }}>

        {/* LEFT COLUMN */}
        <div className="team-left-col" style={{ borderRight: '0.5px solid var(--gray-200)' }}>

          {/* KEY PLAYERS */}
          <div className="team-section" style={{ padding: '1.1rem 1.4rem 1rem', borderBottom: '0.5px solid var(--gray-200)' }}>
            <SectionLabel label="Key Players" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 7,
            }}>
              {keyPlayers.map((p) => (
                <div
                  key={p.name}
                  style={{
                    background: 'var(--gray-50)',
                    borderRadius: 6,
                    padding: '9px 11px',
                  }}
                >
                  {/* Header row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 3,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, fontFamily: serif }}>
                      {p.name}
                    </span>
                    {p.badge && (
                      <span style={{
                        background: accentColor,
                        color: '#fff',
                        fontSize: 9,
                        padding: '1px 6px',
                        borderRadius: 3,
                        fontFamily: 'var(--font-sans)',
                        fontStyle: 'normal',
                        whiteSpace: 'nowrap',
                        marginLeft: 4,
                        flexShrink: 0,
                      }}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: muted,
                    marginBottom: 5,
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'normal',
                  }}>
                    {p.club} · {p.position}
                  </div>
                  <div style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: muted,
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'normal',
                  }}>
                    {p.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="team-right-col" style={{ display: 'flex', flexDirection: 'column' }}>

          {/* FOOTBALL IDENTITY */}
          <div className="team-section" style={{ flex: 1, padding: '1.1rem 1.2rem', borderBottom: '0.5px solid var(--gray-200)' }}>
            <SectionLabel label="Football Identity" />
            <div className="team-prose" style={{
              fontSize: 12,
              lineHeight: 1.75,
              color: muted,
              fontFamily: 'var(--font-sans)',
              fontStyle: 'normal',
            }}>
              {narrative.footballIdentity}
            </div>
          </div>

          {/* THE MOMENT */}
          <div className="team-section" style={{ flex: 1, padding: '1.1rem 1.2rem', borderBottom: '0.5px solid var(--gray-200)' }}>
            <SectionLabel label="The Moment" />
            <div className="team-prose" style={{
              fontSize: 12,
              lineHeight: 1.75,
              color: muted,
              fontFamily: 'var(--font-sans)',
              fontStyle: 'normal',
            }}>
              {narrative.theMoment}
            </div>
          </div>

          {/* WATCH FOR */}
          <div className="team-section" style={{ flex: 1, padding: '1.1rem 1.2rem' }}>
            <SectionLabel label="Watch For" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {watchFor.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6 }}>
                  <span style={{
                    color: accentColor,
                    fontSize: 11,
                    fontWeight: 500,
                    minWidth: 16,
                    flexShrink: 0,
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'normal',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontSize: 12,
                    lineHeight: 1.65,
                    color: muted,
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'normal',
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. STORYLINE CALLOUT */}
      {(() => {
        const teamStorylines = storylines.filter(s => s.teams.includes(name))
        if (!teamStorylines.length) return null
        return (
          <div style={{ borderTop: '0.5px solid var(--gray-200)' }}>
            {teamStorylines.map(s => (
              <div
                key={s.id}
                onClick={onViewStorylines}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 1.5rem',
                  cursor: 'pointer',
                  background: 'var(--gray-50)',
                  borderLeft: `3px solid ${s.accentColor}`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-50)'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: s.accentColor,
                    marginBottom: 2,
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'normal',
                  }}>
                    Featured Storyline · {s.type}
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--gray-900)',
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'normal',
                  }}>
                    {s.headline}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--gray-500)',
                    marginTop: 1,
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'normal',
                  }}>
                    {s.subheadline}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-sans)', fontStyle: 'normal' }}>→</div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* 6. ALL-TIME RECORD STRIP */}
      <div style={{
        borderTop: '0.5px solid var(--gray-200)',
        padding: '0.7rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div className="record-strip-label" style={{
          fontSize: 10,
          color: muted,
          fontFamily: 'var(--font-sans)',
          fontStyle: 'normal',
        }}>
          All-time WC record
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[
            { label: 'played', value: allTimeRecord.played },
            { label: 'won', value: allTimeRecord.won },
            { label: 'drawn', value: allTimeRecord.drawn },
            { label: 'lost', value: allTimeRecord.lost },
            { label: 'scored', value: allTimeRecord.scored },
            { label: 'conceded', value: allTimeRecord.conceded },
          ].map(({ label, value }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div className="record-divider" style={{
                  width: '0.5px',
                  height: 24,
                  background: 'var(--gray-200)',
                  margin: '0 14px',
                }} />
              )}
              <div style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontStyle: 'normal' }}>
                <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 9, color: muted, marginTop: 2, letterSpacing: '0.04em' }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. FOOTER */}
      <div style={{
        borderTop: '0.5px solid var(--gray-200)',
        padding: '6px 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        color: 'var(--gray-400)',
        fontFamily: 'var(--font-sans)',
        fontStyle: 'normal',
      }}>
        <span>World Cup Watch Guide · 2026 · p.1</span>
        <span>US · Canada · Mexico</span>
      </div>
    </div>
  )
}
