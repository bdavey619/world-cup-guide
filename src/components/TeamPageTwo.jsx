import { useState } from 'react'
import PitchDiagram from './PitchDiagram'

const POS_GROUP = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
}

function groupSquad(squad = []) {
  const groups = { GK: [], DEF: [], MID: [], FWD: [] }
  squad.forEach(p => { if (groups[p.pos]) groups[p.pos].push(p) })
  return groups
}

export default function TeamPageTwo({ team }) {
  const {
    accentColor, name, nickname, meta, schedule,
    history, allTimeRecord, pitch, keyPlayers, tactics,
    squad, matches, pitchLabel,
  } = team

  const muted = 'var(--gray-500)'
  const serif = 'var(--font-serif)'

  const [selectedPitchName, setSelectedPitchName] = useState(null)
  const [squadOpen, setSquadOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

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
            { label: 'WIN THE CUP', value: meta.winPct >= 1 ? `${meta.winPct}%` : '<1%', colored: true },
            { label: 'ADVANCE', value: `${meta.advancePct}%`, colored: false },
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
            {/* Pitch label */}
            {pitchLabel && (
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                textAlign: 'center',
                marginBottom: 4,
                color: pitchLabel.startsWith('Confirmed') ? accentColor : 'var(--gray-400)',
                letterSpacing: '0.03em',
              }}>
                {pitchLabel.startsWith('Confirmed') ? '✓ ' : ''}{pitchLabel}
              </div>
            )}
            {!selectedPitchName && (
              <div style={{
                fontSize: 11,
                color: 'var(--gray-400)',
                textAlign: 'center',
                marginBottom: 6,
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
              }}>
                Tap a player to learn more
              </div>
            )}
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
                  {/* Teams + home/away */}
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

      {/* 4. SQUAD ROSTER */}
      {squad && squad.length > 0 && (
        <div style={{ borderTop: '0.5px solid #e0e0e0' }}>
          <button
            onClick={() => setSquadOpen(o => !o)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.55rem 1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 3, height: 12, background: accentColor }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-500)' }}>
                Full Squad · {squad.length} players
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{squadOpen ? '▲' : '▼'}</span>
          </button>
          {squadOpen && (
            <div style={{ padding: '0 1.5rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0 2rem' }}>
              {Object.entries(groupSquad(squad)).map(([pos, players]) =>
                players.length === 0 ? null : (
                  <div key={pos} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-400)', fontFamily: 'var(--font-sans)', marginBottom: 4 }}>
                      {POS_GROUP[pos]}
                    </div>
                    {players.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0', borderBottom: i < players.length - 1 ? '0.5px solid var(--gray-100)' : 'none' }}>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--gray-800)' }}>{p.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'var(--font-sans)' }}>{p.club}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. MATCH HISTORY */}
      {matches && matches.length > 0 && (
        <div style={{ borderTop: '0.5px solid #e0e0e0' }}>
          <button
            onClick={() => setHistoryOpen(o => !o)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.55rem 1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 3, height: 12, background: accentColor }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-500)' }}>
                Match Results · {matches.length} played
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{historyOpen ? '▲' : '▼'}</span>
          </button>
          {historyOpen && (
            <div style={{ padding: '0 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {matches.map((m, i) => {
                const [ourScore, theirScore] = (m.result || '').split('-').map(Number)
                const outcome = ourScore > theirScore ? 'W' : ourScore < theirScore ? 'L' : 'D'
                const outcomeColor = outcome === 'W' ? '#16a34a' : outcome === 'L' ? '#dc2626' : '#d97706'
                return (
                  <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ background: outcomeColor, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-sans)' }}>{outcome}</span>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--gray-900)' }}>
                          vs {m.opponent} · <span style={{ color: outcomeColor }}>{m.result}</span>
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'var(--font-sans)' }}>{m.date} · {m.formation}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-600)', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>XI: </span>
                      {m.starters.join(', ')}
                    </div>
                    {m.subs && m.subs.length > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', fontFamily: 'var(--font-sans)', marginTop: 3, lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>Subs: </span>
                        {m.subs.map((s, j) => `${s.on} for ${s.off} (${s.minute}')`).join(', ')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. FOOTER */}
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
