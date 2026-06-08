import { useState } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { editorials } from '../data/editorials'

function Pitch({ players }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', display: 'block', background: '#1a3a20' }}>
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="#2d5c36" strokeWidth="0.6" />
      <line x1="2" y1="50" x2="98" y2="50" stroke="#2d5c36" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
      <rect x="22" y="2" width="56" height="14" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
      <rect x="22" y="84" width="56" height="14" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
      <rect x="34" y="2" width="32" height="7" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
      <rect x="34" y="91" width="32" height="7" fill="none" stroke="#2d5c36" strokeWidth="0.4" />
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

function SectionLabel({ children, color = '#607080' }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color, marginBottom: '8px' }}>
      {children}
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '10px', overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ children }) {
  return (
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2a3a' }}>
      <div style={{ fontSize: '11px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em' }}>{children}</div>
    </div>
  )
}

export default function TeamPage({ team, teamName }) {
  const isMobile = useIsMobile()
  const [tab, setTab] = useState('overview')
  const ed = editorials[teamName] || {}

  if (!team) {
    return <div style={{ color: '#607080', padding: '40px', textAlign: 'center' }}>Select a team to view their guide.</div>
  }

  return (
    <div>
      {/* ── Shared header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: isMobile ? '40px' : '52px', lineHeight: 1 }}>{team.flag}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '28px', fontWeight: 800, color: '#fff' }}>{teamName}</h2>
          <div style={{ fontSize: '13px', color: '#607080', marginTop: '3px' }}>
            Group {team.group} &nbsp;·&nbsp; {team.formation} &nbsp;·&nbsp; {team.manager}
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'FIFA', value: `#${team.fifaRanking}` },
          { label: 'ODDS', value: team.odds },
          { label: 'LAST WC', value: team.lastWC },
          ...(!isMobile ? [{ label: 'WIN PROB', value: team.impliedProb }] : []),
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '8px', padding: isMobile ? '8px 12px' : '10px 16px' }}>
            <div style={{ fontSize: '9px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e2a3a', marginBottom: '20px', gap: '2px' }}>
        {[
          { id: 'overview', label: 'OVERVIEW' },
          { id: 'tactics', label: 'TACTICS' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '9px 20px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            border: 'none',
            background: 'transparent',
            color: tab === id ? '#e8b84b' : '#607080',
            borderBottom: tab === id ? '2px solid #e8b84b' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: '-1px',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Essence */}
          {ed.essence && (
            <div style={{ borderLeft: '3px solid #e8b84b', paddingLeft: '16px' }}>
              <p style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', color: '#c0ccd8', lineHeight: 1.7, fontStyle: 'italic' }}>
                {ed.essence}
              </p>
            </div>
          )}

          {/* Two-column layout on desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 268px', gap: '16px', alignItems: 'start' }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Football Identity */}
              {ed.footballIdentity && (
                <Card>
                  <div style={{ padding: '14px 16px' }}>
                    <SectionLabel color="#4fc3f7">FOOTBALL IDENTITY</SectionLabel>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8898aa', lineHeight: 1.65 }}>{ed.footballIdentity}</p>
                  </div>
                </Card>
              )}

              {/* The Moment */}
              {ed.theMoment && (
                <Card>
                  <div style={{ padding: '14px 16px' }}>
                    <SectionLabel color="#a78bfa">THE MOMENT</SectionLabel>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8898aa', lineHeight: 1.65 }}>{ed.theMoment}</p>
                  </div>
                </Card>
              )}

              {/* Key Players */}
              <Card>
                <CardHeader>KEY PLAYERS</CardHeader>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a2535' }}>
                  {team.keyPlayers.map((p, i) => {
                    const note = ed.playerNotes?.[p.name]
                    return (
                      <div key={i} style={{ background: '#111827', padding: isMobile ? '9px 10px' : '12px 14px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#607080', marginBottom: note ? '6px' : 0 }}>
                          <span style={{ color: '#e8b84b', fontWeight: 600 }}>{p.position}</span>
                          &nbsp;·&nbsp;{p.club}&nbsp;·&nbsp;{p.age}
                        </div>
                        {note && <p style={{ margin: 0, fontSize: '11px', color: '#7888a0', lineHeight: 1.5 }}>{note}</p>}
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Strength + Vulnerability */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <Card style={{ overflow: 'visible' }}>
                  <div style={{ padding: '14px' }}>
                    <SectionLabel color="#34d399">💪 STRENGTH</SectionLabel>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8898aa', lineHeight: 1.6 }}>{team.strength}</p>
                  </div>
                </Card>
                <Card style={{ overflow: 'visible' }}>
                  <div style={{ padding: '14px' }}>
                    <SectionLabel color="#f87171">⚠ VULNERABILITY</SectionLabel>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8898aa', lineHeight: 1.6 }}>{team.vulnerability}</p>
                  </div>
                </Card>
              </div>

              {/* Watch For */}
              {ed.watchFor?.length > 0 && (
                <Card>
                  <CardHeader>3 THINGS TO WATCH</CardHeader>
                  <div style={{ padding: '4px 0' }}>
                    {ed.watchFor.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 14px', borderBottom: i < ed.watchFor.length - 1 ? '1px solid #1a2535' : 'none' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#e8b84b', flexShrink: 0, lineHeight: 1.5 }}>{i + 1}</div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#8898aa', lineHeight: 1.6 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* All-time record */}
              <Card>
                <CardHeader>{isMobile ? 'WC RECORD' : 'ALL-TIME WC RECORD'}</CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 8px' }}>
                  {[
                    { label: 'APP', value: team.allTimeRecord.wcs },
                    { label: 'W', value: team.allTimeRecord.won },
                    { label: 'D', value: team.allTimeRecord.drawn },
                    { label: 'L', value: team.allTimeRecord.lost },
                    { label: 'GF', value: team.allTimeRecord.goals },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: isMobile ? '13px' : '16px', fontWeight: 800, color: '#fff' }}>{value}</div>
                      <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#607080', fontWeight: 700, letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader>GROUP SCHEDULE</CardHeader>
                <div>
                  {team.schedule.map((match, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderBottom: i < team.schedule.length - 1 ? '1px solid #1a2535' : 'none' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>vs {match.opponent}</div>
                      <div style={{ fontSize: '11px', color: '#607080' }}>{match.date} · {match.stage}</div>
                      <div style={{ fontSize: '10px', color: '#4fc3f7', marginTop: '2px' }}>{match.venue}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── TACTICS TAB ── */}
      {tab === 'tactics' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: '16px', alignItems: 'start' }}>

          {/* Pitch */}
          <Card>
            <CardHeader>STARTING XI · {team.formation}</CardHeader>
            <div style={{ padding: '10px' }}>
              <Pitch players={team.startingXI} />
            </div>
          </Card>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Schedule */}
            <Card>
              <CardHeader>GROUP SCHEDULE</CardHeader>
              <div>
                {team.schedule.map((match, i) => (
                  <div key={i} style={{ padding: '11px 14px', borderBottom: i < team.schedule.length - 1 ? '1px solid #1a2535' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 700, color: '#fff' }}>vs {match.opponent}</div>
                      <div style={{ fontSize: '11px', color: '#e8b84b', fontWeight: 600, flexShrink: 0 }}>{match.date}</div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4fc3f7', marginTop: '2px' }}>{match.venue}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Ones to watch */}
            <Card>
              <CardHeader>ONES TO WATCH</CardHeader>
              <div>
                {team.keyPlayers.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderBottom: i < team.keyPlayers.length - 1 ? '1px solid #1a2535' : 'none' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 5px', borderRadius: '3px', background: '#e8b84b22', color: '#e8b84b', flexShrink: 0 }}>
                      {p.position}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '10px', color: '#607080' }}>{p.club}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stat pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'FIFA', value: `#${team.fifaRanking}` },
                { label: 'ODDS', value: team.odds },
                { label: 'GROUP', value: team.group },
                ...(!isMobile ? [{ label: 'WIN PROB', value: team.impliedProb }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#111827', border: '1px solid #1e2a3a', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#607080', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: '#fff' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
