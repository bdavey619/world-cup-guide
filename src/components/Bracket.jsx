import { useState } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { bracketRounds, thirdPlace } from '../data/bracket'
import { projectedRounds, projectedThirdPlace } from '../data/bracketProjected'

function TeamSlot({ slot, isWinner, isLoser, isTop, isProjected }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      padding: '7px 10px',
      background: isWinner ? '#162416' : '#111827',
      borderBottom: isTop ? '1px solid #1a2535' : 'none',
      minHeight: '34px',
    }}>
      {slot.flag && <span style={{ fontSize: '13px', flexShrink: 0 }}>{slot.flag}</span>}
      <span style={{
        fontSize: '11.5px',
        fontWeight: isWinner ? 700 : slot.name ? 500 : 400,
        color: isWinner ? '#fff' : slot.name ? '#c0ccd8' : '#3a4a5a',
        fontStyle: slot.name ? 'normal' : 'italic',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {slot.name || slot.label}
      </span>
      {slot.score !== null ? (
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: isWinner ? '#e8b84b' : '#607080',
          flexShrink: 0,
          minWidth: '14px',
          textAlign: 'right',
        }}>
          {slot.score}
        </span>
      ) : isWinner && isProjected ? (
        <span style={{
          fontSize: '8px',
          fontWeight: 700,
          color: '#e8b84b99',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          PROJ
        </span>
      ) : null}
    </div>
  )
}

function MatchCard({ match, width = 190, showVenue = true, highlight = false, isProjected = false }) {
  return (
    <div style={{
      background: '#111827',
      border: `1px solid ${highlight ? '#e8b84b66' : '#1e2a3a'}`,
      borderRadius: '8px',
      overflow: 'hidden',
      width,
      flexShrink: 0,
    }}>
      <div style={{
        padding: '3px 10px',
        background: highlight ? '#1a1500' : '#0c1220',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ fontSize: '9px', color: highlight ? '#e8b84b' : '#607080', fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          MATCH {match.matchNum}
        </span>
        <span style={{ fontSize: '9px', color: '#3a4a5a', fontWeight: 600, whiteSpace: 'nowrap' }}>{match.date}</span>
      </div>
      <TeamSlot slot={match.home} isWinner={match.winner === 'home'} isLoser={match.winner === 'away'} isTop isProjected={isProjected} />
      <TeamSlot slot={match.away} isWinner={match.winner === 'away'} isLoser={match.winner === 'home'} isTop={false} isProjected={isProjected} />
      {showVenue && match.venue && (
        <div style={{ padding: '3px 10px', background: '#0c1220', fontSize: '9px', color: '#2a3a4a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {match.venue}
        </div>
      )}
    </div>
  )
}

function DesktopBracket({ rounds, thirdPlaceMatch, isProjected }) {
  const MATCH_H = 88
  const GAP = 20

  const colW = 200
  const connW = 32

  const unit = MATCH_H + GAP

  const colMatches = [8, 4, 2, 1]
  const slotHeights = colMatches.map((_, i) => unit * Math.pow(2, i))

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: `${(colW + connW) * 4 + colW}px` }}>

        {rounds.map((round, roundIdx) => {
          const slotH = slotHeights[roundIdx]
          const isLast = roundIdx === rounds.length - 1

          return (
            <div key={round.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
              {/* Match column */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: colW,
              }}>
                {/* Round label */}
                <div style={{
                  padding: '6px 0',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: '#607080',
                  textAlign: 'center',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '1px',
                }}>
                  <span>{round.label}</span>
                  <span style={{ color: '#2a3a4a', fontWeight: 400, letterSpacing: 0 }}>{round.dates}</span>
                </div>

                {/* Matches */}
                {round.matches.map((match) => (
                  <div key={match.id} style={{
                    height: slotH,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '4px',
                    paddingRight: isLast ? '4px' : 0,
                  }}>
                    <MatchCard
                      match={match}
                      width={colW - 8}
                      showVenue={roundIdx >= 2}
                      highlight={round.id === 'final'}
                      isProjected={isProjected}
                    />
                  </div>
                ))}
              </div>

              {/* Connector column (not after last round) */}
              {!isLast && (
                <div style={{
                  width: connW,
                  display: 'flex',
                  flexDirection: 'column',
                  paddingTop: '28px',
                }}>
                  {Array.from({ length: round.matches.length / 2 }).map((_, pairIdx) => {
                    const topOff = slotH / 2
                    const spanH = slotH * 2
                    return (
                      <div key={pairIdx} style={{
                        height: spanH,
                        position: 'relative',
                        flexShrink: 0,
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: topOff - 1,
                          left: 0,
                          width: connW / 2,
                          height: spanH / 2 - topOff + 2,
                          borderRight: '1px solid #1e2a3a',
                          borderBottom: '1px solid #1e2a3a',
                          borderBottomRightRadius: '4px',
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: spanH / 2,
                          left: 0,
                          width: connW / 2,
                          height: topOff - 1,
                          borderRight: '1px solid #1e2a3a',
                          borderTop: '1px solid #1e2a3a',
                          borderTopRightRadius: '4px',
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: spanH / 2 - 1,
                          left: connW / 2,
                          width: connW / 2,
                          borderTop: '1px solid #1e2a3a',
                        }} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Third place */}
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '4px' }}>
        <div style={{ fontSize: '9px', color: '#3a4a5a', fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>3RD PLACE · {thirdPlaceMatch.date}</div>
        <MatchCard match={thirdPlaceMatch} width={200} showVenue isProjected={isProjected} />
      </div>
    </div>
  )
}

function MobileBracket({ rounds, thirdPlaceMatch, isProjected }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {rounds.map(round => (
        <div key={round.id}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#a0b0c0' }}>{round.label}</div>
            <div style={{ fontSize: '10px', color: '#3a4a5a' }}>{round.dates}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {round.matches.map(match => (
              <MatchCard key={match.id} match={match} width='100%' showVenue isProjected={isProjected} />
            ))}
          </div>
        </div>
      ))}

      {/* Third place */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#607080', marginBottom: '10px' }}>
          3RD PLACE · {thirdPlaceMatch.date}
        </div>
        <MatchCard match={thirdPlaceMatch} width='100%' showVenue isProjected={isProjected} />
      </div>
    </div>
  )
}

export default function Bracket() {
  const isMobile = useIsMobile()
  const [view, setView] = useState('projected')

  const rounds = view === 'actual' ? bracketRounds : projectedRounds
  const thirdPlaceMatch = view === 'actual' ? thirdPlace : projectedThirdPlace
  const isProjected = view === 'projected'

  const total = rounds.reduce((acc, r) => acc + r.matches.length, 0) + 1
  const played = rounds.reduce((acc, r) => acc + r.matches.filter(m => m.winner).length, 0) +
    (thirdPlaceMatch.winner ? 1 : 0)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#607080', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>KNOCKOUT STAGE</div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>Tournament Bracket</h2>
          <p style={{ margin: '4px 0 0', color: '#607080', fontSize: '13px' }}>Round of 16 through the Final · MetLife Stadium, NJ</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          {/* Toggle */}
          <div style={{
            display: 'flex',
            background: '#0c1220',
            border: '1px solid #1e2a3a',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
          }}>
            {[
              { id: 'actual', label: 'ACTUAL' },
              { id: 'projected', label: 'PROJECTED' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{
                  background: view === id ? '#1e2a3a' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  color: view === id ? '#e8b84b' : '#607080',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Stat card */}
          <div style={{
            background: '#111827',
            border: '1px solid #1e2a3a',
            borderRadius: '8px',
            padding: '10px 16px',
            textAlign: 'center',
            flexShrink: 0,
          }}>
            {isProjected ? (
              <>
                <div style={{ fontSize: '10px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '3px' }}>SOURCE</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e8b84b' }}>Polymarket</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '10px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '3px' }}>MATCHES PLAYED</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{played}<span style={{ fontSize: '13px', color: '#607080', fontWeight: 400 }}> / {total}</span></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { color: '#e8b84b', label: isProjected ? 'Projected winner' : 'Winner / Score' },
          { color: '#162416', label: 'Advanced', bg: true },
          { color: '#3a4a5a', label: 'TBD slot' },
        ].map(({ color, label, bg }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '2px',
              background: bg ? color : 'transparent',
              border: bg ? 'none' : `2px solid ${color}`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '11px', color: '#607080' }}>{label}</span>
          </div>
        ))}
        {isProjected && (
          <span style={{ fontSize: '11px', color: '#3a4a5a', marginLeft: 'auto' }}>
            Based on pre-tournament Polymarket odds
          </span>
        )}
      </div>

      {isMobile
        ? <MobileBracket rounds={rounds} thirdPlaceMatch={thirdPlaceMatch} isProjected={isProjected} />
        : <DesktopBracket rounds={rounds} thirdPlaceMatch={thirdPlaceMatch} isProjected={isProjected} />
      }
    </div>
  )
}
