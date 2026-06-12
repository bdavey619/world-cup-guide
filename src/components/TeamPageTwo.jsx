import { useState } from 'react'
import PitchDiagram from './PitchDiagram'

export default function TeamPageTwo({ team }) {
  const {
    accentColor, name, nickname, meta, schedule,
    history, allTimeRecord, pitch, keyPlayers, tactics,
  } = team

  const muted = 'var(--gray-500)'
  const serif = 'var(--font-serif)'

  const [selectedPitchName, setSelectedPitchName] = useState(null)

  // Find the keyPlayer profile that matches a pitch player name
  function findKeyPlayer(pitchName) {
    if (!keyPlayers || !pitchName) return null
    const needle = pitchName.toLowerCase()
    return keyPlayers.find(kp => {
      const haystack = kp.name.toLowerCase()
      // exact match, substring either direction, or last-name match
      if (haystack === needle || haystack.includes(needle) || needle.includes(haystack)) return true
      const lastName = haystack.split(' ').pop()
      return needle.includes(lastName) || lastName.includes(needle)
    }) || null
  }

  function handlePlayerClick(pitchName) {
    setSelectedPitchName(prev => prev === pitchName ? null : pitchName)
  }

  const selectedPlayer = findKeyPlayer(selectedPitchName)

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

  function resultBadge(row) {
    const base = {
      display: 'inline-block',
      padding: '1px 7px',
      borderRadius: 3,
      fontSize: 10,
      fontWeight: 600,
      lineHeight: '16px',
      fontFamily: 'var(--font-sans)',
    }
    switch (row.tier) {
      case 'winner':
        return <span style={{ ...base, background: accentColor, color: '#fff' }}>{row.result}</span>
      case 'final':
        return <span style={{ ...base, background: 'var(--gray-200)', color: 'var(--gray-700)' }}>{row.result}</span>
      case 'deep':
        return <span style={{ fontSize: 11, color: 'var(--gray-700)', fontFamily: 'var(--font-sans)' }}>{row.result}</span>
      case 'early':
        return <span style={{ fontSize: 11, color: muted, fontFamily: 'var(--font-sans)' }}>{row.result}</span>
      case 'dnq':
        return <span style={{ fontSize: 11, color: 'var(--gray-400)', fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>DNQ</span>
      default:
        return <span style={{ fontSize: 11, fontFamily: 'var(--font-sans)' }}>{row.result}</span>
    }
  }

  return (
    <div style={{
      fontFamily: serif,
      background: '#fff',
      color: 'var(--gray-900)',
      overflow: 'hidden',
      border: '1px solid #e0e0e0',
      borderTop: 'none',
      marginTop: 16,
    }}>

      {/* 1. TOP BORDER */}
      <div style={{
        height: 4,
        background: accentColor,
        borderRadius: '2px 2px 0 0',
      }} />

      {/* 2. HEADER */}
      <div className="team-header-p2" style={{
        background: '#fff',
        padding: '0.75rem 1.5rem 0.65rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '0.5px solid #e0e0e0',
      }}>
        {/* Left — label + name + nickname on same line */}
        <div>
          <div style={{
            fontSize: 10,
            color: muted,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            marginBottom: 2,
          }}>
            2026 FIFA WORLD CUP · WATCH GUIDE · P.2
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{
              fontFamily: serif,
              fontSize: 22,
              fontWeight: 500,
              lineHeight: 1,
              color: 'var(--gray-900)',
            }}>
              {name}
            </span>
            <span style={{
              fontSize: 15,
              fontStyle: 'italic',
              color: muted,
            }}>
              {nickname}
            </span>
          </div>
        </div>

        {/* Right — four stat pills with dividers */}
        <div className="team-header-p2-stats" style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: 'var(--font-sans)' }}>
          {[
            { label: 'FIFA RANKING', value: `#${meta.fifaRanking}`, colored: false },
            { label: 'ODDS TO WIN', value: meta.oddsToWin, colored: true },
            { label: 'IMPLIED PROB.', value: meta.impliedProbability, colored: false },
            { label: 'GROUP', value: meta.group, colored: false },
          ].map(({ label, value, colored }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{
                  width: '0.5px',
                  height: 30,
                  background: 'var(--gray-200)',
                  margin: '0 10px',
                }} />
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 9,
                  color: muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 1,
                }}>
                  {label}
                </div>
                <div className="team-stats-value" style={{
                  fontSize: 22,
                  fontWeight: 500,
                  lineHeight: 1,
                  color: colored ? accentColor : 'var(--gray-900)',
                }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MAIN BODY */}
      <div className="team-body-grid-p2" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 228px',
        minHeight: 400,
      }}>

        {/* LEFT — How They Play + Pitch */}
        <div className="team-left-col-p2" style={{
          borderRight: '0.5px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* HOW THEY PLAY */}
          <div style={{ padding: '0.9rem 1.2rem 0.8rem', borderBottom: '0.5px solid var(--gray-100)' }}>
            <SectionLabel label="How They Play" />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{
                background: accentColor,
                color: '#fff',
                fontSize: 11,
                fontWeight: 500,
                padding: '3px 10px',
                borderRadius: 4,
                fontFamily: 'var(--font-sans)',
              }}>
                {meta.formation}
              </span>
              {tactics && tactics.styleTags && tactics.styleTags.map((tag) => (
                <span key={tag} style={{
                  background: 'var(--surface)',
                  color: 'var(--gray-500)',
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 4,
                  fontFamily: 'var(--font-sans)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
            {tactics && (
              <>
                <div style={{
                  fontSize: 12,
                  lineHeight: 1.65,
                  color: 'var(--gray-700)',
                  fontFamily: 'var(--font-sans)',
                  marginBottom: 8,
                }}>
                  {tactics.tacticalNote}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ background: 'var(--green-bg)', borderRadius: 4, padding: '6px 8px' }}>
                    <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-text)', marginBottom: 2, fontFamily: 'var(--font-sans)' }}>Strength</div>
                    <div style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--green-body)', fontFamily: 'var(--font-sans)' }}>{tactics.strength}</div>
                  </div>
                  <div style={{ background: 'var(--red-bg)', borderRadius: 4, padding: '6px 8px' }}>
                    <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--red-text)', marginBottom: 2, fontFamily: 'var(--font-sans)' }}>Vulnerability</div>
                    <div style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--red-body)', fontFamily: 'var(--font-sans)' }}>{tactics.vulnerability}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* PITCH DIAGRAM */}
          <div style={{ padding: '0.8rem 1.2rem 0 1.5rem', flex: 1 }}>
            <PitchDiagram
              players={pitch.players}
              accentColor={accentColor}
              onPlayerClick={handlePlayerClick}
              selectedName={selectedPitchName}
            />
          </div>

          {/* SELECTED PLAYER CARD */}
          {selectedPlayer ? (
            <div style={{
              margin: '0 1.2rem 1rem 1.5rem',
              background: 'var(--gray-50)',
              borderRadius: 8,
              borderLeft: `3px solid ${accentColor}`,
              padding: '10px 12px',
              position: 'relative',
            }}>
              {/* Dismiss */}
              <button
                onClick={() => setSelectedPitchName(null)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 10,
                  background: 'none',
                  border: 'none',
                  fontSize: 14,
                  color: 'var(--gray-400)',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 0,
                }}
              >×</button>
              {/* Name + meta */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3, paddingRight: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 500, fontFamily: serif, color: 'var(--gray-900)' }}>
                  {selectedPlayer.name}
                </span>
                {selectedPlayer.badge && (
                  <span style={{ background: accentColor, color: '#fff', fontSize: 8, padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    {selectedPlayer.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: muted, marginBottom: 6, fontFamily: 'var(--font-sans)' }}>
                {selectedPlayer.club} · {selectedPlayer.position}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--gray-700)', fontFamily: 'var(--font-sans)' }}>
                {selectedPlayer.role || selectedPlayer.note}
              </div>
              {selectedPlayer.stat && (
                <div style={{ marginTop: 7, display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: accentColor, fontFamily: 'var(--font-sans)' }}>
                    {selectedPlayer.stat}
                  </span>
                  {selectedPlayer.statLabel && (
                    <span style={{ fontSize: 10, color: muted, fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {selectedPlayer.statLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '0.8rem' }} />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* SCHEDULE */}
          <div style={{ padding: '1rem 1.1rem 0.9rem', borderBottom: '0.5px solid #e0e0e0' }}>
            <SectionLabel label={`Group ${meta.group} Schedule`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {schedule.map((match, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--gray-50)',
                    borderRadius: 6,
                    padding: '8px 10px',
                  }}
                >
                  {/* Date + city row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 3,
                  }}>
                    <span style={{
                      fontSize: 9,
                      color: muted,
                      fontWeight: 700,
                      fontFamily: 'var(--font-sans)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {match.date} · {match.time}
                    </span>
                    <span style={{
                      fontSize: 9,
                      color: muted,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {match.city}
                    </span>
                  </div>
                  {/* Teams + result */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: serif,
                    }}>
                      {name} vs {match.opponent}
                    </span>
                    {match.score ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        marginLeft: 6,
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: 'var(--font-sans)',
                          color: match.result === 'W' ? '#1a7a3a' : match.result === 'L' ? '#c0392b' : 'var(--gray-600)',
                        }}>
                          {match.score}
                        </span>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          fontFamily: 'var(--font-sans)',
                          padding: '1px 4px',
                          borderRadius: 3,
                          background: match.result === 'W' ? '#1a7a3a' : match.result === 'L' ? '#c0392b' : 'var(--gray-400)',
                          color: '#fff',
                        }}>
                          {match.result}
                        </span>
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 600,
                        fontFamily: 'var(--font-sans)',
                        color: match.isAway ? muted : accentColor,
                        marginLeft: 6,
                        whiteSpace: 'nowrap',
                      }}>
                        {match.isAway ? 'Away' : 'Home'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORY */}
          <div style={{ flex: 1, padding: '1rem 1.1rem 0.9rem' }}>
            <SectionLabel label="Tournament History" />

            {/* Table rows */}
            <div>
              {history.map((row, i) => (
                <div
                  key={row.year}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '34px 1fr auto',
                    alignItems: 'center',
                    padding: '3.5px 0',
                    borderBottom: i < history.length - 1 ? '0.5px solid #e8e8e8' : 'none',
                  }}
                >
                  <span style={{ fontSize: 10, color: muted, fontFamily: 'var(--font-sans)' }}>
                    {row.year}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>
                    {row.host}
                  </span>
                  <span>{resultBadge(row)}</span>
                </div>
              ))}
            </div>

            {/* Summary tiles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 5,
              marginTop: 10,
            }}>
              {[
                { label: 'appearances', value: allTimeRecord.appearances },
                { label: 'titles', value: allTimeRecord.titles },
                { label: 'finals', value: allTimeRecord.finals },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: 'var(--gray-50)',
                    borderRadius: 6,
                    padding: '5px 4px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 9, color: muted, marginTop: 3, letterSpacing: '0.03em' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER */}
      <div style={{
        borderTop: '0.5px solid #e0e0e0',
        padding: '6px 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        color: 'var(--gray-400)',
        fontFamily: 'var(--font-sans)',
        fontStyle: 'normal',
      }}>
        <span>World Cup Watch Guide · 2026 · p.2</span>
        <span>Odds: DraftKings · Jun 8, 2026</span>
      </div>
    </div>
  )
}
