// Predicted bracket — frozen at tournament start (Jun 11, 2026)
// Winners predicted by highest Polymarket tournament win %

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// R32 matchup structure — "3rd-N" slots are filled from the sorted best-3rd pool
const R32_SLOTS = [
  ['1st-A', '2nd-B'],
  ['1st-C', '2nd-D'],
  ['1st-E', '2nd-F'],
  ['1st-G', '2nd-H'],
  ['1st-B', '2nd-A'],
  ['1st-D', '2nd-C'],
  ['1st-F', '2nd-E'],
  ['1st-H', '2nd-G'],
  ['1st-I', '2nd-J'],
  ['1st-K', '2nd-L'],
  ['3rd-0', '3rd-1'],
  ['3rd-2', '3rd-3'],
  ['1st-J', '2nd-K'],
  ['1st-L', '2nd-I'],
  ['3rd-4', '3rd-5'],
  ['3rd-6', '3rd-7'],
]

function buildStandings(teams) {
  const s = {}
  GROUPS.forEach(g => {
    s[g] = teams
      .filter(t => t.meta.group === g)
      // Primary: advancePct, tiebreak: winPct — ensures stable, deterministic order
      .sort((a, b) =>
        b.meta.advancePct - a.meta.advancePct ||
        b.meta.winPct - a.meta.winPct
      )
  })
  return s
}

function resolveR32(standings) {
  // Best 8 third-place teams sorted by advancePct (then winPct)
  const best3rd = GROUPS
    .map(g => standings[g]?.[2])
    .filter(Boolean)
    .sort((a, b) =>
      b.meta.advancePct - a.meta.advancePct ||
      b.meta.winPct - a.meta.winPct
    )
    .slice(0, 8)

  return R32_SLOTS.map(([a, b]) => [resolve(a, standings, best3rd), resolve(b, standings, best3rd)])
}

function resolve(slot, standings, best3rd) {
  const m1 = slot.match(/^1st-([A-L])$/)
  if (m1) return standings[m1[1]]?.[0] ?? null

  const m2 = slot.match(/^2nd-([A-L])$/)
  if (m2) return standings[m2[1]]?.[1] ?? null

  const m3 = slot.match(/^3rd-(\d+)$/)
  if (m3) return best3rd[parseInt(m3[1])] ?? null

  return null
}

// Predict winner by winPct; tiebreak by advancePct
function winner(a, b) {
  if (!a) return b
  if (!b) return a
  if (a.meta.winPct !== b.meta.winPct) return a.meta.winPct > b.meta.winPct ? a : b
  return a.meta.advancePct >= b.meta.advancePct ? a : b
}

// ─── Layout constants ──────────────────────────────────────────
const CARD_H  = 50   // px — two rows + divider
const ROW_GAP = 10   // gap between R32 cards
const UNIT    = CARD_H + ROW_GAP   // 60px per R32 slot
const TOTAL_H = 16 * UNIT          // 960px total bracket height

// Vertical center of match i in a round with N matches
function cardTop(N, i) {
  const span = TOTAL_H / N
  return i * span + (span - CARD_H) / 2
}

// ─── Sub-components ────────────────────────────────────────────
function TeamRow({ team, isWinner, showGroup }) {
  const accent = team?.accentColor ?? 'transparent'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '5px 8px',
      borderLeft: `3px solid ${isWinner && team ? accent : 'transparent'}`,
      background: isWinner && team ? '#fafafa' : 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, flexShrink: 0 }}>{team?.flagEmoji ?? ''}</span>
        {showGroup && team && (
          <span style={{
            fontSize: 8,
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            color: 'white',
            background: 'var(--gray-500)',
            borderRadius: 3,
            padding: '1px 3px',
            flexShrink: 0,
            lineHeight: 1.4,
          }}>
            {team.meta.group}
          </span>
        )}
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-sans)',
          fontWeight: isWinner && team ? 600 : 400,
          color: team ? 'var(--gray-900)' : 'var(--gray-300)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {team?.name ?? 'TBD'}
        </span>
      </div>
      {team && (
        <span style={{
          fontSize: 9,
          fontFamily: 'var(--font-sans)',
          color: isWinner ? accent : 'var(--gray-400)',
          fontWeight: isWinner ? 600 : 400,
          flexShrink: 0,
          marginLeft: 4,
        }}>
          {team.meta.winPct >= 1 ? `${team.meta.winPct}%` : '<1%'}
        </span>
      )}
    </div>
  )
}

function MatchCard({ a, b, width, showGroup }) {
  const w = winner(a, b)
  return (
    <div style={{
      width,
      background: 'white',
      borderRadius: 5,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.09)',
      flexShrink: 0,
    }}>
      <TeamRow team={a} isWinner={!!a && w === a} showGroup={showGroup} />
      <div style={{ height: 1, background: 'var(--gray-100)' }} />
      <TeamRow team={b} isWinner={!!b && w === b} showGroup={showGroup} />
    </div>
  )
}

// A round column using absolute positioning for bracket alignment
function RoundCol({ label, dates, matches, width, showGroup }) {
  const N = matches.length
  return (
    <div style={{ flexShrink: 0, width }}>
      {/* Column header */}
      <div style={{
        textAlign: 'center',
        padding: '10px 4px 8px',
        borderBottom: '1px solid var(--gray-100)',
        marginBottom: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2, fontFamily: 'var(--font-sans)' }}>{dates}</div>
      </div>
      {/* Bracket slots — absolutely positioned */}
      <div style={{ position: 'relative', height: TOTAL_H }}>
        {matches.map(([a, b], i) => (
          <div key={i} style={{
            position: 'absolute',
            top: cardTop(N, i),
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MatchCard a={a} b={b} width={width - 4} showGroup={showGroup} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div style={{
      flexShrink: 0,
      width: 20,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* spacer for header */}
      <div style={{ height: 57 }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1, height: '100%', background: 'var(--gray-100)' }} />
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────
export default function Bracket({ teams = [] }) {
  if (!teams.length) return null

  const standings = buildStandings(teams)
  const r32 = resolveR32(standings)

  const r16 = Array.from({ length: 8 }, (_, i) => [
    winner(r32[i * 2][0],     r32[i * 2][1]),
    winner(r32[i * 2 + 1][0], r32[i * 2 + 1][1]),
  ])

  const qf = Array.from({ length: 4 }, (_, i) => [
    winner(r16[i * 2][0],     r16[i * 2][1]),
    winner(r16[i * 2 + 1][0], r16[i * 2 + 1][1]),
  ])

  const sf = Array.from({ length: 2 }, (_, i) => [
    winner(qf[i * 2][0],     qf[i * 2][1]),
    winner(qf[i * 2 + 1][0], qf[i * 2 + 1][1]),
  ])

  const final = [[
    winner(sf[0][0], sf[0][1]),
    winner(sf[1][0], sf[1][1]),
  ]]

  const champion = winner(final[0][0], final[0][1])

  return (
    <div>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
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
            Predicted Bracket · Polymarket odds · Jun 11, 2026
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
            padding: '4px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          }}>
            <span style={{ fontSize: 15 }}>{champion.flagEmoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--gray-900)' }}>
              {champion.name} · {champion.meta.winPct}% to win
            </span>
            <span>🏆</span>
          </div>
        )}
      </div>

      {/* Format note */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {[
          { label: '24 teams', note: 'Top 2 from each of 12 groups' },
          { label: '+ 8 teams', note: 'Best 8 third-place finishers' },
          { label: '= 32 teams', note: 'Enter Round of 32 · Jul 1' },
        ].map(({ label, note }) => (
          <div key={label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>{label}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>{note}</div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>
            Highlighted = predicted to advance · % = win tournament
          </div>
        </div>
      </div>

      {/* Bracket scroll container */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>
        <div className="scroll-x" style={{ padding: '0 8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <RoundCol label="Round of 32"    dates="Jul 1–4"    matches={r32}   width={152} showGroup />
            <Divider />
            <RoundCol label="Round of 16"    dates="Jul 7–10"   matches={r16}   width={148} />
            <Divider />
            <RoundCol label="Quarter-finals" dates="Jul 14–15"  matches={qf}    width={148} />
            <Divider />
            <RoundCol label="Semi-finals"    dates="Jul 18–19"  matches={sf}    width={148} />
            <Divider />
            <RoundCol label="Final"          dates="Jul 23"     matches={final} width={148} />
          </div>
        </div>
      </div>

      {/* Third place */}
      <div style={{
        marginTop: 12,
        background: 'white',
        borderRadius: 8,
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'var(--font-sans)' }}>
          3rd Place Match · Jul 22 · MetLife Stadium
        </div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3, fontFamily: 'var(--font-sans)', fontStyle: 'italic' }}>
          {sf[0] && sf[1]
            ? `${sf[0][0]?.flagEmoji ?? ''} ${sf[0][0]?.name ?? '?'} vs ${sf[1][0]?.flagEmoji ?? ''} ${sf[1][0]?.name ?? '?'} — predicted SF losers`
            : 'Semi-final losers · TBD'}
        </div>
      </div>
    </div>
  )
}
