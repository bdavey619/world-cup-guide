import { useState, useEffect, useRef } from 'react'
import TeamPageOne from './components/TeamPageOne'
import TeamPageTwo from './components/TeamPageTwo'
import Overview from './components/Overview'
import Storylines from './components/Storylines'
import DreamTeam from './components/DreamTeam'
import Schedule from './components/Schedule'
import Bracket from './components/Bracket'
import Rankings from './components/Rankings'
import Groups from './components/Groups'
import './App.css'

const teamModules = import.meta.glob('./data/teams/*.json', { eager: true })
const teams = Object.values(teamModules)
  .map(m => m.default)
  .sort((a, b) => {
    if (a.meta.group < b.meta.group) return -1
    if (a.meta.group > b.meta.group) return 1
    return a.name.localeCompare(b.name)
  })

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function firstInGroup(group) {
  return teams.find(t => t.meta.group === group)
}

const PRIMARY_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'rankings', label: 'Rankings' },
]
const MORE_TABS = [
  { id: 'groups', label: 'Groups' },
  { id: 'guide', label: 'Guide' },
  { id: 'bracket', label: 'Bracket' },
  { id: 'storylines', label: 'Storylines' },
  { id: 'dreamteam', label: 'Dream Team' },
]

export default function App() {
  const [activeGroup, setActiveGroup] = useState('I')
  const [selectedTeamId, setSelectedTeamId] = useState('france')
  const [activeView, setActiveView] = useState('overview')
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)

  // Parse hash → { view, teamId, group }
  function parseHash() {
    const hash = window.location.hash.slice(1) // strip #
    if (!hash) return null
    const [view, teamId, group] = hash.split('/')
    return { view: view || 'schedule', teamId: teamId || 'france', group: group || 'I' }
  }

  // Build hash string from state
  function toHash(view, teamId, group) {
    if (view === 'guide') return `#guide/${teamId}/${group}`
    return `#${view}`
  }

  // Seed initial state from URL hash, then listen for back/forward
  useEffect(() => {
    const initial = parseHash()
    if (initial) {
      setActiveView(initial.view)
      setSelectedTeamId(initial.teamId)
      setActiveGroup(initial.group)
      window.history.replaceState({ ...initial }, '', toHash(initial.view, initial.teamId, initial.group))
    } else {
      window.history.replaceState({ view: 'schedule', teamId: 'france', group: 'I' }, '', '#schedule')
    }
    function onPop(e) {
      if (!e.state) return
      setActiveView(e.state.view)
      setSelectedTeamId(e.state.teamId)
      setActiveGroup(e.state.group)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (!moreOpen) return
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreOpen])

  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? teams[0]
  const groupTeams = teams.filter(t => t.meta.group === activeGroup)

  // All view transitions go through here so the browser back button works
  function navigate(view, opts = {}) {
    const teamId = opts.teamId ?? selectedTeamId
    const group  = opts.group  ?? activeGroup
    window.history.pushState({ view, teamId, group }, '', toHash(view, teamId, group))
    setActiveView(view)
    if (opts.teamId !== undefined) setSelectedTeamId(opts.teamId)
    if (opts.group  !== undefined) setActiveGroup(opts.group)
  }

  function selectGroup(g) {
    const first = firstInGroup(g)
    navigate('guide', { group: g, teamId: first ? first.id : selectedTeamId })
  }

  function selectTeam(team) {
    navigate('guide', { teamId: team.id, group: team.meta.group })
  }

  return (
    <div style={{ fontFamily: 'var(--font-serif)' }}>
      {/* ── TOP NAV ──────────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--gray-200)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 'var(--content-max)',
          margin: '0 auto',
          padding: '7px var(--content-pad)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <button
            onClick={() => setEntered(false)}
            className="nav-wordmark"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--gray-900)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            2026 WC
          </button>
          {/* All tabs — primary always visible; more tabs inline on desktop, dropdown on mobile */}
          <div style={{ display: 'flex', gap: 4, flex: 1, alignItems: 'center' }}>
            {PRIMARY_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                style={{
                  background: activeView === id ? 'var(--gray-900)' : 'transparent',
                  color: activeView === id ? 'white' : 'var(--gray-500)',
                  border: 'none',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: activeView === id ? 600 : 400,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}

            {/* Separator between primary and secondary tabs */}
            <div className="nav-more-desktop" style={{
              width: 1,
              height: 16,
              background: 'var(--gray-200)',
              flexShrink: 0,
              margin: '0 4px',
            }} />

            {/* More tabs inline on desktop */}
            {MORE_TABS.map(({ id, label }) => (
              <button
                key={id}
                className="nav-more-desktop"
                onClick={() => navigate(id)}
                style={{
                  background: activeView === id ? 'var(--gray-900)' : 'transparent',
                  color: activeView === id ? 'white' : 'var(--gray-500)',
                  border: 'none',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: activeView === id ? 600 : 400,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}

            {/* ··· overflow menu — mobile only */}
            <div ref={moreRef} className="nav-more-mobile" style={{ position: 'relative', marginLeft: 'auto' }}>
              <button
                onClick={() => setMoreOpen(o => !o)}
                style={{
                  background: MORE_TABS.some(t => t.id === activeView) ? 'var(--gray-900)' : 'transparent',
                  color: MORE_TABS.some(t => t.id === activeView) ? 'white' : 'var(--gray-500)',
                  border: 'none',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 13,
                  lineHeight: 1,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  transition: 'all 0.15s',
                }}
              >
                ···
              </button>
              {moreOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  background: 'white',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  zIndex: 200,
                  minWidth: 140,
                  overflow: 'hidden',
                }}>
                  {MORE_TABS.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => { navigate(id); setMoreOpen(false) }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        background: activeView === id ? 'var(--gray-100)' : 'white',
                        color: activeView === id ? 'var(--gray-900)' : 'var(--gray-700)',
                        border: 'none',
                        padding: '10px 14px',
                        fontSize: 13,
                        fontWeight: activeView === id ? 600 : 400,
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                        borderBottom: id !== 'dreamteam' ? '1px solid var(--gray-100)' : 'none',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── GROUP PILLS ──────────────────────────────────── */}
      {activeView === 'guide' && (
        <div style={{
          background: 'var(--gray-100)',
          borderBottom: '1px solid var(--gray-200)',
          padding: '6px 0',
        }}>
          <div className="scroll-x" style={{
            maxWidth: 'var(--content-max)',
            margin: '0 auto',
            display: 'flex',
            gap: 4,
            padding: '0 var(--content-pad)',
          }}>
            {GROUPS.map(g => {
              const isActive = g === activeGroup
              return (
                <button
                  key={g}
                  onClick={() => selectGroup(g)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: isActive ? 'none' : '1px solid #d0d0d0',
                    background: isActive ? selectedTeam.accentColor : 'white',
                    color: isActive ? 'white' : 'var(--gray-700)',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  {g}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TEAM CARDS ROW ───────────────────────────────── */}
      {activeView === 'guide' && (
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e0e0e0',
        }}>
          <div className="team-cards-row" style={{
            maxWidth: 'var(--content-max)',
            margin: '0 auto',
            padding: '6px var(--content-pad)',
            display: 'flex',
            gap: 8,
          }}>
            {groupTeams.map(t => {
              const isSelected = t.id === selectedTeamId
              return (
                <div
                  className="team-card"
                  key={t.id}
                  onClick={() => navigate('guide', { teamId: t.id, group: activeGroup })}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--gray-50)' : 'white',
                    borderLeft: isSelected
                      ? `3px solid ${t.accentColor}`
                      : '3px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--gray-100)'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = 'white'
                  }}
                >
                  <div style={{ fontSize: 18 }}>{t.flagEmoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-900)', marginTop: 4 }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>
                    #{t.meta.fifaRanking}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                    {t.meta.winPct >= 1 ? `${t.meta.winPct}% to win` : '<1% to win'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── PAGE CONTENT ─────────────────────────────────── */}
      {activeView === 'schedule' ? (
        <div style={{ background: 'var(--gray-100)', minHeight: 'calc(100vh - 100px)' }}>
          <Schedule teams={teams} onSelectTeam={selectTeam} />
        </div>
      ) : (
      <div className="guide-content-wrap" style={{
        maxWidth: 'var(--content-max)',
        margin: '0 auto',
        padding: '24px var(--content-pad)',
        background: 'var(--surface)',
        minHeight: 'calc(100vh - 200px)',
      }}>
        {activeView === 'guide' ? (
          <div className="guide-cards" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <TeamPageOne team={selectedTeam} onViewStorylines={() => navigate('storylines')} />
            </div>
            <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <TeamPageTwo team={selectedTeam} />
            </div>
          </div>
        ) : activeView === 'overview' ? (
          <Overview teams={teams} onNavigate={setActiveView} />
        ) : activeView === 'groups' ? (
          <Groups teams={teams} groups={GROUPS} onSelectTeam={selectTeam} />
        ) : activeView === 'rankings' ? (
          <Rankings teams={teams} onSelectTeam={selectTeam} />
        ) : activeView === 'bracket' ? (
          <Bracket teams={teams} />
        ) : activeView === 'storylines' ? (
          <Storylines />
        ) : (
          <DreamTeam />
        )}
      </div>
      )}
    </div>
  )
}
