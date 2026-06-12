import { useState } from 'react'
import statsData from '../data/stats.json'

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '18px 12px 8px' }}>
      <div style={{ width: 3, height: 12, background: 'var(--gray-400)', borderRadius: 2, flexShrink: 0 }} />
      <span style={{
        fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-500)',
      }}>
        {children}
      </span>
    </div>
  )
}

function rankColor(rank) {
  if (rank === 1) return '#b8860b'
  if (rank === 2) return '#808080'
  if (rank === 3) return '#8B5A2B'
  return 'var(--gray-400)'
}

// Compact leaderboard: rank | flag name | value pill
function Leaderboard({ title, entries, valueLabel }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? entries : entries?.slice(0, 5)

  if (!entries?.length) return (
    <div style={{ background: 'white', borderRadius: 8, padding: '14px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', padding: '12px 0' }}>No data yet</div>
    </div>
  )

  // Compute display ranks (ties share a rank)
  let displayRank = 1
  const ranked = (visible ?? []).map((e, i) => {
    if (i > 0 && e.value < entries[i - 1].value) displayRank = i + 1
    return { ...e, rank: displayRank }
  })

  return (
    <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </div>
      </div>
      {ranked.map((p, i) => (
        <div key={`${p.name}-${i}`} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          borderBottom: '0.5px solid var(--gray-100)',
        }}>
          <div style={{ width: 20, flexShrink: 0, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, color: rankColor(p.rank) }}>
            {p.rank}
          </div>
          <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{p.flag}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--gray-500)' }}>
              {p.team}{p.position ? ` · ${p.position}` : ''}
            </div>
          </div>
          <div style={{
            minWidth: 28, padding: '2px 8px', borderRadius: 12, textAlign: 'center',
            background: p.rank === 1 ? 'var(--gray-900)' : 'var(--gray-100)',
            color: p.rank === 1 ? 'white' : 'var(--gray-700)',
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
          }}>
            {p.value}
          </div>
        </div>
      ))}
      {entries.length > 5 && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            display: 'block', width: '100%', padding: '9px 12px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
            color: 'var(--gray-500)', textAlign: 'center',
          }}
        >
          {expanded ? 'Show less ↑' : `Show top 10 ↓`}
        </button>
      )}
    </div>
  )
}

// Mini team leaderboard card (used in the grid)
function TeamCard({ title, teams, valueKey, format, emptyMsg }) {
  const sorted = [...(teams ?? [])].filter(t => (t[valueKey] ?? 0) > 0).sort((a, b) => b[valueKey] - a[valueKey])

  return (
    <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </div>
      </div>
      {sorted.length === 0 ? (
        <div style={{ padding: '14px 12px', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' }}>
          {emptyMsg ?? 'No data yet'}
        </div>
      ) : sorted.map((t, i) => {
        let displayRank = 1
        if (i > 0 && t[valueKey] < sorted[i - 1][valueKey]) displayRank = i + 1
        else if (i > 0) displayRank = sorted.findIndex(x => x[valueKey] === t[valueKey]) + 1

        return (
          <div key={t.name} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            borderBottom: i < sorted.length - 1 ? '0.5px solid var(--gray-100)' : 'none',
          }}>
            <div style={{ width: 20, flexShrink: 0, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, color: rankColor(displayRank) }}>
              {displayRank}
            </div>
            <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{t.flag}</span>
            <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.name}
            </div>
            <div style={{
              minWidth: 28, padding: '2px 8px', borderRadius: 12, textAlign: 'center',
              background: displayRank === 1 ? 'var(--gray-900)' : 'var(--gray-100)',
              color: displayRank === 1 ? 'white' : 'var(--gray-700)',
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
            }}>
              {format ? format(t[valueKey]) : t[valueKey]}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RecordCard({ label, matchLabel, detail, date }) {
  if (!matchLabel) return null
  return (
    <div style={{ background: 'white', borderRadius: 8, padding: '14px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.4 }}>
        {matchLabel}
      </div>
      {detail && (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--gray-500)', marginTop: 3 }}>
          {detail}
        </div>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--gray-400)', marginTop: 4 }}>{date}</div>
    </div>
  )
}

function formatUpdated(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
}

export default function Stats() {
  const { individual, teams, records } = statsData

  return (
    <div>
      {/* ── Individual Leaders ──────────────────────────────────── */}
      <SectionLabel>Individual Leaders</SectionLabel>
      <div style={{ padding: '0 10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        <Leaderboard title="⚽ Golden Boot — Top Scorers" entries={individual?.goals} valueLabel="Goals" />
        <Leaderboard title="🎯 Top Assists" entries={individual?.assists} valueLabel="Assists" />
      </div>

      {/* ── Team Stats ─────────────────────────────────────────── */}
      <SectionLabel>Team Stats</SectionLabel>
      <div style={{ padding: '0 10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        <TeamCard title="⚽ Goals Scored"    teams={teams} valueKey="gf" />
        <TeamCard title="🛡️ Clean Sheets"   teams={teams} valueKey="cleanSheets" emptyMsg="None yet" />
        <TeamCard title="🟨 Yellow Cards"   teams={teams} valueKey="yellowCards" />
        <TeamCard title="🟥 Red Cards"      teams={teams} valueKey="redCards" emptyMsg="None yet" />
        <TeamCard title="😬 Goals Conceded" teams={teams} valueKey="ga" />
        <TeamCard title="🏃 Possession %"   teams={teams} valueKey="possession" format={v => `${v}%`} />
      </div>

      {/* ── Match Records ──────────────────────────────────────── */}
      {(records?.highestScoring || records?.biggestDefeat) && (
        <>
          <SectionLabel>Match Records</SectionLabel>
          <div style={{ padding: '0 10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            <RecordCard
              label="🔥 Most Goals in a Game"
              matchLabel={records.highestScoring
                ? records.highestScoring.teams.map(t => t.team).join(', ')
                : null}
              detail={records.highestScoring
                ? `${records.highestScoring.goals} goals${records.highestScoring.teams.length > 1 ? ' (tied)' : ''}`
                : null}
              date={records.highestScoring?.teams[0]?.date}
            />
            <RecordCard
              label="📉 Biggest Defeat"
              matchLabel={records.biggestDefeat?.label}
              detail={`${records.biggestDefeat?.margin}-goal margin`}
              date={records.biggestDefeat?.date}
            />
          </div>
        </>
      )}

      {/* ── Last updated ───────────────────────────────────────── */}
      <div style={{ padding: '14px 12px 24px', fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--gray-400)', textAlign: 'right' }}>
        Updated {formatUpdated(statsData.updatedAt)}
      </div>
    </div>
  )
}
