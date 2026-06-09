// Predicted bracket — frozen at tournament start (Jun 11, 2026)
// Winners predicted by highest Polymarket tournament win probability

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// Official 2026 FIFA World Cup R32 bracket draw
// Each entry is [homeLabel, awayLabel]
const R32_LABELS = [
  ['1st · Group A', '2nd · Group B'],
  ['1st · Group C', '2nd · Group D'],
  ['1st · Group E', '2nd · Group F'],
  ['1st · Group G', '2nd · Group H'],
  ['1st · Group B', '2nd · Group A'],
  ['1st · Group D', '2nd · Group C'],
  ['1st · Group F', '2nd · Group E'],
  ['1st · Group H', '2nd · Group G'],
  ['1st · Group I', '2nd · Group J'],
  ['1st · Group K', '2nd · Group L'],
  ['Best 3rd · A/B/C/D', 'Best 3rd · E/F/G/H'],
  ['Best 3rd · I/J/K/L', 'Best 3rd · A/B/C'],
  ['1st · Group J', '2nd · Group K'],
  ['1st · Group L', '2nd · Group I'],
  ['Best 3rd · D/E/F', 'Best 3rd · G/H/I'],
  ['Best 3rd · J/K/L', '2nd · Group L'],
]

function buildStandings(teams) {
  const standings = {}
  GROUPS.forEach(g => {
    standings[g] = teams
      .filter(t => t.meta.group === g)
      .sort((a, b) => b.meta.advancePct - a.meta.advancePct)
  })
  return standings
}

function resolveTeam(label, standings) {
  const m1 = label.match(/1st · Group ([A-L])/)
  if (m1) return standings[m1[1]]?.[0] ?? null

  const m2 = label.match(/2nd · Group ([A-L])/)
  if (m2) return standings[m2[1]]?.[1] ?? null

  const m3 = label.match(/Best 3rd · ([A-L/]+)/)
  if (m3) {
    const groups = m3[1].split('/')
    return groups
      .map(g => standings[g]?.[2])
      .filter(Boolean)
      .sort((a, b) => b.meta.advancePct - a.meta.advancePct)[0] ?? null
  }

  return null
}

// Pick predicted winner by winPct; tiebreak by advancePct
function predict(a, b) {
  if (!a) return b
  if (!b) return a
  if (a.meta.winPct !== b.meta.winPct) return a.meta.winPct > b.meta.winPct ? a : b
  return a.meta.advancePct >= b.meta.advancePct ? a : b
}

function winPctLabel(t) {
  if (!t) return ''
  return t.meta.winPct >= 1 ? `${t.meta.winPct}%` : '<1%'
}

function TeamRow({ team, isWinner }) {
  const accent = team?.accentColor ?? 'var(--gray-200)'
  const name = team?.name ?? 'TBD'
  const flag = team?.flagEmoji ?? ''

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '5px 8px',
      borderLeft: isWinner ? `3px solid ${accent}` : '3px solid transparent',
      background: isWinner ? 'var(--gray-50)' : 'white',
      gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>{flag}</span>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-sans)',
          fontWeight: isWinner ? 600 : 400,
          color: team ? 'var(--gray-900)' : 'var(--gray-400)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 90,
        }}>
          {name}
        </span>
      </div>
      {team && (
        <span style={{
          fontSize: 9,
          fontFamily: 'var(--font-sans)',
          color: isWinner ? accent : 'var(--gray-400)',
          fontWeight: isWinner ? 600 : 400,
          flexShrink: 0,
        }}>
          {winPctLabel(team)}
        </span>
      )}
    </div>
  )
}

function MatchCard({ teamA, teamB, width = 148 }) {
  const winner = predict(teamA, teamB)
  return (
    <div style={{
      background: 'white',
      borderRadius: 6,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      width,
      flexShrink: 0,
    }}>
      <TeamRow team={teamA} isWinner={teamA && winner === teamA} />
      <div style={{ height: 1, background: 'var(--gray-100)' }} />
      <TeamRow team={teamB} isWinner={teamB && winner === teamB} />
    </div>
  )
}

function RoundCol({ label, dates, matches, colWidth = 148 }) {
  return (
    <div style={{ flexShrink: 0, width: colWidth }}>
      <div style={{
        textAlign: 'center',
        padding: '8px 4px',
        borderBottom: '1px solid var(--gray-100)',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2, fontFamily: 'var(--font-sans)' }}>{dates}</div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        gap: 8,
        minHeight: matches.length === 16 ? 'auto' : 520,
      }}>
        {matches.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: matches.length < 16 ? 1 : 'none' }}>
            <MatchCard teamA={m[0]} teamB={m[1]} width={colWidth} />
          </div>
        ))}
      </div>
    </div>
  )
}

const COL_GAP = 16

function Connector() {
  return (
    <div style={{ width: COL_GAP, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 1, height: '80%', background: 'var(--gray-200)' }} />
    </div>
  )
}

export default function Bracket({ teams = [] }) {
  if (!teams.length) return null

  const standings = buildStandings(teams)

  // R32 — resolve labels to teams
  const r32 = R32_LABELS.map(([a, b]) => [
    resolveTeam(a, standings),
    resolveTeam(b, standings),
  ])

  // R16 — winners of consecutive pairs of R32 matches
  const r16 = Array.from({ length: 8 }, (_, i) => [
    predict(r32[i * 2][0], r32[i * 2][1]),
    predict(r32[i * 2 + 1][0], r32[i * 2 + 1][1]),
  ])

  // QF — winners of consecutive pairs of R16 matches
  const qf = Array.from({ length: 4 }, (_, i) => [
    predict(r16[i * 2][0], r16[i * 2][1]),
    predict(r16[i * 2 + 1][0], r16[i * 2 + 1][1]),
  ])

  // SF
  const sf = Array.from({ length: 2 }, (_, i) => [
    predict(qf[i * 2][0], qf[i * 2][1]),
    predict(qf[i * 2 + 1][0], qf[i * 2 + 1][1]),
  ])

  // Final
  const finalMatch = [[
    predict(sf[0][0], sf[0][1]),
    predict(sf[1][0], sf[1][1]),
  ]]

  const champion = predict(finalMatch[0][0], finalMatch[0][1])

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 3, height: 12, background: 'var(--gray-400)', borderRadius: 2 }} />
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--gray-500)',
          }}>
            Predicted Bracket · Based on Polymarket odds · Jun 11, 2026
          </span>
        </div>
        {champion && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'white',
            border: `1.5px solid ${champion.accentColor}`,
            borderRadius: 20,
            padding: '3px 10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          }}>
            <span style={{ fontSize: 14 }}>{champion.flagEmoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--gray-900)' }}>
              {champion.name} · {winPctLabel(champion)} to win
            </span>
            <span style={{ fontSize: 12 }}>🏆</span>
          </div>
        )}
      </div>

      {/* Format explainer */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        {[
          { label: '24 teams', note: 'Top 2 from each of 12 groups' },
          { label: '+ 8 teams', note: 'Best 8 third-place finishers' },
          { label: '= 32 teams', note: 'Enter the Round of 32 · Jul 1' },
        ].map(({ label, note }) => (
          <div key={label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>{note}</div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>
            Highlighted team = predicted to advance · % = win tournament
          </div>
        </div>
      </div>

      {/* Bracket */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>
        <div className="scroll-x" style={{ padding: '0 12px 16px' }}>
          <div style={{ display: 'flex', gap: 0, paddingTop: 0, alignItems: 'flex-start' }}>

            <RoundCol label="Round of 32" dates="Jul 1–4" matches={r32} colWidth={155} />
            <Connector />
            <RoundCol label="Round of 16" dates="Jul 7–10" matches={r16} colWidth={148} />
            <Connector />
            <RoundCol label="Quarter-finals" dates="Jul 14–15" matches={qf} colWidth={148} />
            <Connector />
            <RoundCol label="Semi-finals" dates="Jul 18–19" matches={sf} colWidth={148} />
            <Connector />
            <RoundCol label="Final" dates="Jul 23" matches={finalMatch} colWidth={148} />

          </div>
        </div>
      </div>

      {/* Third place */}
      <div style={{
        marginTop: 14,
        background: 'white',
        borderRadius: 8,
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>
            3rd Place Match · Jul 22 · MetLife Stadium
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3, fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>
            {sf[0] && sf[1]
              ? `${sf[0][0]?.flagEmoji ?? ''} ${sf[0][0]?.name ?? 'TBD'} vs ${sf[1][0]?.flagEmoji ?? ''} ${sf[1][0]?.name ?? 'TBD'} — SF losers advance to 3rd place match`
              : 'SF losers · TBD'}
          </div>
        </div>
      </div>
    </div>
  )
}
