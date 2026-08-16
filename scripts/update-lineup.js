#!/usr/bin/env node
/**
 * update-lineup.js
 *
 * Fetches confirmed starting XIs from ESPN's public API (no key required)
 * and updates team JSON files 1 hour before kickoff.
 *
 * Usage:
 *   node scripts/update-lineup.js                    # today's matches
 *   node scripts/update-lineup.js --dry-run          # preview without writing
 *   node scripts/update-lineup.js --date 2026-06-18  # specific date
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

loadEnv()

const REPO_PATH = process.env.REPO_PATH || path.join(__dirname, '..')
const DRY_RUN   = process.argv.includes('--dry-run')
const DATE_ARG  = (() => { const i = process.argv.indexOf('--date'); return i !== -1 ? process.argv[i+1] : null })()
const TEAMS_DIR = path.join(REPO_PATH, 'src', 'data', 'teams')

// ESPN league slug for FIFA World Cup
const ESPN_LEAGUE = 'fifa.world'

// ─── Pitch layout ────────────────────────────────────────────────────────────

const X_BY_COUNT = {
  1: [226],
  2: [163, 289],
  3: [104, 226, 348],
  4: [63,  161, 293, 389],
  5: [32,  127, 226, 325, 420],
}

const Y_SLOTS = {
  2: [56, 385],
  3: [56, 240, 385],
  4: [56, 148, 256, 375],
  5: [56, 130, 215, 310, 385],
  6: [56, 115, 185, 255, 325, 390],
}

function distributeX(n) {
  if (X_BY_COUNT[n]) return X_BY_COUNT[n]
  return Array.from({ length: n }, (_, i) =>
    n === 1 ? 226 : Math.round(32 + (i / (n - 1)) * 388)
  )
}

// ─── ESPN position → pitch tier + left/right order ───────────────────────────
//
// Tier 0: GK
// Tier 1: Defenders  (CB, LB, RB, LWB, RWB …)
// Tier 2: Hold. mids (CDM, DM — only present if formation has 4+ parts)
// Tier 3: Central / wide mids (CM, LM, RM …)
// Tier 4: Att. mids  (CAM, LAM, RAM — only if formation has 5 parts)
// Tier 5: Forwards   (ST, LW, RW, CF …)

// ESPN uses codes like: G, LB, RB, CD-L, CD-R, CD, DM, CM-L, CM-R, CM,
// LM, RM, AM-L, AM-R, AM, CF-L, CF-R, CF, F, LW, RW
// CD-L/CM-L etc. are from the goalkeeper's perspective (L = viewer's right),
// while LB/RB follow attacking direction (L = viewer's left).
const POSITION_TIERS = {
  // GK
  'G':    { tier: 0, order: 3 },
  // Defenders: LB/RB=attacking perspective, CD-X=goalkeeper perspective (reversed)
  'LWB':  { tier: 1, order: 0 }, 'LB':   { tier: 1, order: 1 },
  'CD-R': { tier: 1, order: 2 }, 'CD':   { tier: 1, order: 3 }, 'CD-L': { tier: 1, order: 4 },
  'RB':   { tier: 1, order: 5 }, 'RWB':  { tier: 1, order: 6 },
  // Holding mids
  'DM-L': { tier: 2, order: 1 }, 'DM': { tier: 2, order: 2 }, 'DM-R': { tier: 2, order: 3 },
  'CDM':  { tier: 2, order: 2 },
  // Central / wide mids (CM-L/CM-R also goalkeeper perspective)
  'LM':   { tier: 3, order: 0 }, 'CM-R': { tier: 3, order: 1 }, 'CM': { tier: 3, order: 2 },
  'CM-L': { tier: 3, order: 3 }, 'RM':   { tier: 3, order: 4 },
  // Attacking mids
  'AM-L': { tier: 4, order: 1 }, 'AM': { tier: 4, order: 2 }, 'AM-R': { tier: 4, order: 3 },
  // Forwards (CF-L/CF-R goalkeeper perspective)
  'LW':   { tier: 5, order: 0 }, 'CF-R': { tier: 5, order: 1 },
  'CF':   { tier: 5, order: 2 }, 'F':    { tier: 5, order: 2 },
  'CF-L': { tier: 5, order: 3 }, 'RW':   { tier: 5, order: 4 },
  // ESPN sometimes uses LF/RF for wide forwards (e.g. in 4-3-3)
  'LF':   { tier: 5, order: 0 }, 'RF':   { tier: 5, order: 4 },
  // Generic fallbacks ESPN sometimes returns instead of specific codes
  'GK':   { tier: 0, order: 3 },
  'D':    { tier: 1, order: 3 },
  'M':    { tier: 3, order: 2 },
  'MF':   { tier: 3, order: 2 },
  'FW':   { tier: 5, order: 2 },
}

const ROLE_BY_TIER = { 0:'gk', 1:'def', 2:'mid', 3:'mid', 4:'mid', 5:'att' }

function classifyPosition(posAbbr) {
  if (!posAbbr) return { tier: 3, order: 2 }
  return POSITION_TIERS[posAbbr] || POSITION_TIERS[posAbbr.toUpperCase()] || { tier: 3, order: 2 }
}

// ESPN team name → our local JSON id. Handles common mismatches.
const ESPN_NAME_OVERRIDES = {
  'korea republic':     'south-korea',
  'republic of korea':  'south-korea',
  'usa':                'united-states',
  'united states':      'united-states',
  'côte d\'ivoire':     'ivory-coast',
  'cote d\'ivoire':     'ivory-coast',
  'bosnia and herzegovina': 'bosnia-herzegovina',
  'türkiye':            'turkiye',
  'turkiye':            'turkiye',
}

// ─── Build pitch.players from ESPN roster entries ────────────────────────────

function buildPitchPlayers(starters, formation, existingTeam) {
  const normalize = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const keyLastNames = (existingTeam.keyPlayers || []).map(kp =>
    normalize(kp.name.split(' ').pop())
  )

  // Assign tier + left-right order to each player
  // ESPN stores position on the roster entry itself AND on the athlete
  const classified = starters.map((p, i) => {
    const posAbbr = p.position?.abbreviation || p.athlete?.position?.abbreviation || ''
    const { tier, order } = classifyPosition(posAbbr)
    return { ...p, posAbbr, tier, order, _idx: i }
  })

  // Group by tier
  const byTier = {}
  classified.forEach(p => {
    if (!byTier[p.tier]) byTier[p.tier] = []
    byTier[p.tier].push(p)
  })

  // When ESPN returns generic codes (G/D/M/F), all mid+att players collapse into
  // one tier. Use the formation string to split them into proper rows.
  if (formation) {
    const fRows = formation.split('-').map(Number) // e.g. [4,2,3,1]
    const outfieldTierKeys = [1, 2, 3, 4, 5].filter(t => byTier[t]?.length)
    if (outfieldTierKeys.length < fRows.length) {
      // Flatten all outfield players in roster order, then re-slice by formation
      const outfield = []
      outfieldTierKeys.forEach(t => {
        outfield.push(...byTier[t].sort((a, b) => a._idx - b._idx))
        delete byTier[t]
      })
      fRows.forEach((count, i) => {
        byTier[i + 1] = outfield.splice(0, count)
      })
    }
  }

  // Collapse empty tiers to get actual rows
  const activeTiers = Object.keys(byTier).map(Number).sort((a, b) => a - b)
  const totalRows   = activeTiers.length
  const ySlots      = Y_SLOTS[totalRows] || Y_SLOTS[4]

  const players = []
  activeTiers.forEach((tier, rowIdx) => {
    const rowPlayers = byTier[tier].sort((a, b) => a.order - b.order)
    const xs = distributeX(rowPlayers.length)

    rowPlayers.forEach((p, colIdx) => {
      const lastName = p.athlete?.lastName || p.athlete?.displayName?.split(' ').pop() || 'Unknown'
      const posAbbr  = p.posAbbr || 'MID'

      players.push({
        name:        lastName,
        shortName:   lastName,
        position:    posAbbr,
        role:        ROLE_BY_TIER[tier] || 'mid',
        isKeyPlayer: keyLastNames.includes(normalize(lastName)),
        isCaptain:   p.captain === true,
        jersey:      p.jersey ?? p.athlete?.jersey ?? null,
        x:           xs[colIdx],
        y:           ySlots[rowIdx],
      })
    })
  })

  return players
}

// ─── Team name matching ───────────────────────────────────────────────────────

function buildTeamIndex() {
  const index = {}
  fs.readdirSync(TEAMS_DIR).filter(f => f.endsWith('.json')).forEach(f => {
    const data = JSON.parse(fs.readFileSync(path.join(TEAMS_DIR, f), 'utf8'))
    const id = f.replace('.json', '')
    index[data.name.toLowerCase()] = id
    index[id.replace(/-/g, ' ')] = id
  })
  return index
}

function findTeamId(espnName, teamIndex) {
  const key = espnName.toLowerCase().trim()
  if (ESPN_NAME_OVERRIDES[key]) return ESPN_NAME_OVERRIDES[key]
  if (teamIndex[key]) return teamIndex[key]
  for (const [k, id] of Object.entries(teamIndex)) {
    if (key.includes(k) || k.includes(key)) return id
  }
  return null
}

function formatMatchDate(dateStr) {
  // dateStr is a YYYY-MM-DD sports date from the ESPN scoreboard query (already in US local date),
  // so parse it as UTC noon to avoid any timezone-shift edge cases.
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

// ─── HTTP fetch ───────────────────────────────────────────────────────────────

// ESPN's edge rejects both bare token and browser-spoofing User-Agents with a
// 403; including a contact URL passes. Keep the contact URL if you change this.
const USER_AGENT = 'world-cup-guide/1.0 (+https://github.com/bdavey619/bdavey619.github.io)'

function fetchJSONOnce(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(new Error(`Bad JSON from ${url}: ${body.slice(0, 120)}`)) }
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`Timeout (${timeoutMs}ms): ${url}`)))
  })
}

async function fetchJSON(url, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try { return await fetchJSONOnce(url) }
    catch (err) {
      if (i === retries) throw err
      const delay = Math.pow(2, i + 1) * 1000
      console.warn(`  Retry ${i + 1}/${retries} in ${delay / 1000}s: ${err.message.slice(0, 80)}`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const now     = new Date()
  const today   = DATE_ARG || now.toISOString().split('T')[0]

  // ESPN uses US/local date for event grouping. Late-night US games (e.g. 9PM ET = 1AM UTC)
  // are listed under the previous UTC day. When running 00:00–05:59 UTC, also check yesterday.
  const datesToCheck = [today]
  if (!DATE_ARG && now.getUTCHours() < 6) {
    const yesterday = new Date(now - 86400000).toISOString().split('T')[0]
    datesToCheck.unshift(yesterday)
  }

  console.log(`\n🌍 World Cup Lineup Updater — ${datesToCheck.join(', ')}${DRY_RUN ? ' [DRY RUN]' : ''}`)

  const teamIndex = buildTeamIndex()
  const base      = `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_LEAGUE}`

  // 1. Collect events across all dates to check
  const events = []
  for (const date of datesToCheck) {
    const espnDate = date.replace(/-/g, '')
    const board = await fetchJSON(`${base}/scoreboard?dates=${espnDate}`)
    if (board.events?.length) {
      console.log(`Found ${board.events.length} event(s) for ${date}`)
      events.push(...board.events.map(e => ({ ...e, _queryDate: date })))
    } else {
      console.log(`No events found for ${date}`)
    }
  }

  if (!events.length) {
    console.log('Note: if the World Cup league slug changed, update ESPN_LEAGUE in the script.')
    return
  }

  console.log(`Processing ${events.length} total event(s)\n`)

  let anyUpdate = false

  for (const event of events) {
    const eventId   = event.id
    const homeTeam  = event.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName || ''
    const awayTeam  = event.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName || ''
    const matchDate = formatMatchDate(event._queryDate) // US sports date ESPN listed the game under

    console.log(`▶ ${homeTeam} vs ${awayTeam}`)

    // 2. Get match summary (contains rosters/lineups)
    const summary = await fetchJSON(`${base}/summary?event=${eventId}`)
    const rosters = summary.rosters || []

    if (!rosters.length) {
      console.log('  ⏳ Lineup not yet available\n')
      continue
    }

    for (const roster of rosters) {
      const espnName  = roster.team?.displayName || ''
      const formation = roster.formation || ''
      // ESPN stores players in roster.roster (not roster.entries)
      const starters  = (roster.roster || []).filter(e => e.starter === true)

      if (!starters.length) {
        console.log(`  ⏳ ${espnName}: no starters listed yet`)
        continue
      }

      const opponent = espnName === homeTeam ? awayTeam : homeTeam
      const teamId   = findTeamId(espnName, teamIndex)

      if (!teamId) {
        console.log(`  ⚠️  No local JSON match for ESPN team "${espnName}"`)
        continue
      }

      const filePath = path.join(TEAMS_DIR, `${teamId}.json`)
      const team     = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      console.log(`  ✓ ${espnName} — ${formation || 'formation TBD'}`)
      console.log(`    ${starters.map(p => p.athlete?.lastName || p.athlete?.displayName?.split(' ').pop()).join(', ')}`)

      if (!DRY_RUN) {
        team.pitch.players  = buildPitchPlayers(starters, formation, team)
        team.meta.formation = formation || team.meta.formation
        team.pitchLabel     = `Confirmed XI · ${matchDate} vs ${opponent}`

        // Accumulate match starters — keyed by eventId so reruns are idempotent
        if (!team.matches) team.matches = []
        const starterNames = starters.map(p =>
          p.athlete?.lastName || p.athlete?.displayName?.split(' ').pop() || ''
        ).filter(Boolean)
        const existing = team.matches.find(m => m.eventId === eventId)
        if (existing) {
          existing.starters = starterNames
        } else {
          team.matches.push({ eventId, opponent, date: matchDate, starters: starterNames })
        }

        fs.writeFileSync(filePath, JSON.stringify(team, null, 2) + '\n')
        anyUpdate = true
      }
    }
    console.log()
  }

  if (anyUpdate && !process.env.CI) {
    try {
      execSync('git add src/data/teams/', { cwd: REPO_PATH, stdio: 'pipe' })
      execSync(`git commit -m "Auto: confirmed XIs for ${today}"`, { cwd: REPO_PATH, stdio: 'pipe' })
      execSync('git push', { cwd: REPO_PATH, stdio: 'inherit' })
      console.log('✅ Pushed to GitHub')
    } catch (e) {
      const msg = e.stderr?.toString() || e.message
      if (msg.includes('nothing to commit')) {
        console.log('ℹ️  Already up to date')
      } else {
        console.error('❌ Git error:', msg)
      }
    }
  } else if (anyUpdate) {
    console.log('✅ Files updated (CI will commit)')
  } else if (DRY_RUN) {
    console.log('[dry-run] No files written.')
  }
}

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const t = line.trim()
    if (!t || t.startsWith('#')) return
    const eq = t.indexOf('=')
    if (eq === -1) return
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim()
    if (k && !process.env[k]) process.env[k] = v
  })
}

main().catch(err => {
  console.error('❌ Fatal:', err.message)
  process.exit(1)
})
