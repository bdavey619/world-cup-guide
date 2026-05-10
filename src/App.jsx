import { useState } from 'react'
import { useIsMobile } from './hooks/useIsMobile'
import Overview from './components/Overview'
import Storylines from './components/Storylines'
import DreamTeam from './components/DreamTeam'
import TeamPageOne from './components/TeamPageOne'
import TeamPageTwo from './components/TeamPageTwo'
import { groups, teamData } from './data/teams'

const VIEWS = { OVERVIEW: 'overview', STORYLINES: 'storylines', DREAMTEAM: 'dreamteam', TEAM1: 'team1', TEAM2: 'team2' }

export default function App() {
  const isMobile = useIsMobile()
  const [view, setView] = useState(VIEWS.OVERVIEW)
  const [selectedGroup, setSelectedGroup] = useState('A')
  const [selectedTeam, setSelectedTeam] = useState('France')

  const groupLetters = Object.keys(groups)
  const currentGroupTeams = groups[selectedGroup]?.teams || []
  const isTeamView = view === VIEWS.TEAM1 || view === VIEWS.TEAM2

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0e1a', minHeight: '100vh', color: '#fff' }}>

      {/* Nav bar */}
      <div style={{
        display: 'flex',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: isMobile ? '8px' : '0',
        justifyContent: isMobile ? 'center' : 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        background: '#070b14',
        borderBottom: '1px solid #1e2a3a',
      }}>
        <div style={{
          fontSize: isMobile ? '14px' : '18px',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          2026 WORLD CUP GUIDE
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'OVERVIEW', v: VIEWS.OVERVIEW },
            { label: 'DREAM TEAM', v: VIEWS.DREAMTEAM },
            { label: 'STORYLINES', v: VIEWS.STORYLINES },
            { label: 'TEAM GUIDE', v: VIEWS.TEAM1 },
          ].map(({ label, v }) => {
            const active = view === v || (v === VIEWS.TEAM1 && view === VIEWS.TEAM2)
            return (
              <button key={label} onClick={() => setView(v)} style={{
                fontSize: isMobile ? '11px' : '13px',
                padding: isMobile ? '5px 10px' : '7px 16px',
                border: 'none',
                borderRadius: '4px',
                background: active ? '#e8b84b' : '#1e2a3a',
                color: active ? '#070b14' : '#a0b0c0',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Group pills row */}
      <div style={{
        display: 'flex',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        justifyContent: isMobile ? 'center' : 'flex-start',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: '#0c1220',
      }}>
        <span style={{ color: '#607080', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>GROUP</span>
        {groupLetters.map(g => (
          <button key={g} onClick={() => { setSelectedGroup(g); if (isTeamView) setView(VIEWS.TEAM1) }} style={{
            width: isMobile ? '28px' : '34px',
            height: isMobile ? '28px' : '34px',
            fontSize: isMobile ? '11px' : '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: selectedGroup === g ? '#e8b84b' : '#1e2a3a',
            color: selectedGroup === g ? '#070b14' : '#a0b0c0',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            flexShrink: 0,
          }}>
            {g}
          </button>
        ))}
      </div>

      {/* Team cards row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '10px',
        padding: '10px 20px',
        background: '#0c1220',
        borderBottom: '2px solid #1a2535',
      }}>
        {currentGroupTeams.map(teamName => {
          const team = teamData[teamName]
          if (!team) return null
          const active = isTeamView && selectedTeam === teamName
          return (
            <div key={teamName} onClick={() => { setSelectedTeam(teamName); setView(VIEWS.TEAM1) }} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 8px',
              borderRadius: '8px',
              background: active ? '#1a2740' : '#111827',
              border: `1px solid ${active ? '#e8b84b' : '#1e2a3a'}`,
              cursor: 'pointer',
              gap: '3px',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ fontSize: '22px', lineHeight: 1 }}>{team.flag}</div>
              <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>{teamName}</div>
              <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#607080' }}>#{team.fifaRanking} FIFA</div>
              <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#e8b84b', fontWeight: 600 }}>{team.odds}</div>
            </div>
          )
        })}
      </div>

      {/* Page content */}
      <div style={{ padding: isMobile ? '12px 8px' : '20px 20px', background: '#0a0e1a', minHeight: 'calc(100vh - 200px)' }}>
        {view === VIEWS.OVERVIEW && <Overview />}
        {view === VIEWS.STORYLINES && <Storylines />}
        {view === VIEWS.DREAMTEAM && <DreamTeam />}
        {view === VIEWS.TEAM1 && (
          <TeamPageOne
            team={teamData[selectedTeam]}
            teamName={selectedTeam}
            onSwitchPage={() => setView(VIEWS.TEAM2)}
          />
        )}
        {view === VIEWS.TEAM2 && (
          <TeamPageTwo
            team={teamData[selectedTeam]}
            teamName={selectedTeam}
            onSwitchPage={() => setView(VIEWS.TEAM1)}
          />
        )}
      </div>
    </div>
  )
}
