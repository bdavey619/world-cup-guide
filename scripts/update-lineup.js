#!/usr/bin/env node
/**
 * update-lineup.js
 *
 * Runs automatically via cron ~1 hour before each World Cup kickoff.
 * Fetches the confirmed starting XI from api-football.com, updates
 * the team JSON files, and pushes to GitHub.
 *
 * Usage:
 *   node scripts/update-lineup.js             # update today's matches
 *   node scripts/update-lineup.js --dry-run   # print changes without writing
 *   node scripts/update-lineup.js --date 2026-06-18
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Config ────────────────────────────────────────────────────────────────

loadEnv()

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const WC_LEAGUE_ID = process.env.WC_LEAGUE_ID || '1'
const WC_SEASON    = process.env.WC_SEASON    || '2026'
const REPO_PATH    = process.env.REPO_PATH    || path.join(__dirname, '..')
const DRY_RUN      = process.argv.includes('--dry-run')
const DATE_ARG     = (() => { const i = process.argv.indexOf('--date'); return i !== -1 ? process.argv[i+1] : null })()

if (!RAPIDAPI_KEY) {
  console.error('❌ RAPIDAPI_KEY not set. Copy .env.example to .env and fill in your key.')
  process.exit(1)
}

const TEAMS_DIR = path.join(REPO_PATH, 'src', 'data', 'teams')

// ─── Pitch layout constants ─────────────────────────────────────────────────

const X_BY_COUNT = {
  1: [226],
  2: [163, 289],
  3: [104, 226, 348],
  4: [63,  161, 293, 389],
  5: [32,  127, 226, 325, 420],
}

// Y slots by total row count (row 0 = GK at top, last row = attackers)
const Y_SLOTS = {
  2: [56, 385],
  3: [56, 240, 385],
  4: [56, 148, 256, 375],
  5: [56, 130, 215, 310, 385],
  6: [56, 115, 185, 255, 325, 390],
}

const POS_ROLE = { G: 'gk', D: 'def', M: 'mid', F: 'att' }

function getPositionLabel(pos, colIdx, totalInRow) {
  if (pos === 'G') return 'GK'
  const DEF = { 3:['LCB','CB','RCB'], 4:['LB','LCB','RCB','RB'], 5:['LWB','LCB','CB','RCB','RWB'] }
  const MID  = { 1:['DM'], 2:['LCM','RCM'], 3:['LCM','CM','RCM'], 4:['LM','LCM','RCM','RM'], 5:['LM','LCM','CM','RCM','RM'] }
  const FWD  = { 1:['ST'], 2:['ST','ST'], 3:['LW','ST','RW'], 4:['LW','SS','SS','RW'] }
  if (pos === 'D') return (DEF[totalInRow] || [])[colIdx] || 'DEF'
  if (pos === 'M') return (MID[totalInRow] || [])[colIdx] || 'MID'
  if (pos === 'F') return (FWD[totalInRow] || [])[colIdx] || 'FWD'
  return pos
}

function distributeX(n) {
  if (X_BY_COUNT[n]) return X_BY_COUNT[n]
  return Array.from({ length: n }, (_, i) => Math.round(32 + (i / (n - 1)) * 388))
}

// ─── Build pitch.players from api-football lineup ───────────────────────────

function buildPitchPlayers(startXI, formation, existingTeam) {
  const keyLastNames = (existingTeam.keyPlayers || []).map(kp =>
    kp.name.split(' ').pop().toLowerCase()
  )

  const byRow = {}
  startXI.forEach(p => {
    const [row] = (p.grid || '1:1').split(':').map(Number)
    if (!byRow[row]) byRow[row] = []
    byRow[row].push(p)
  })

  const rows = Object.keys(byRow).map(Number).sort((a, b) => a - b)
  const ySlots = Y_SLOTS[rows.length] || Y_SLOTS[4]

  const players = []
  rows.forEach((rowNum, rowIdx) => {
    const rowPlayers = byRow[rowNum].sort((a, b) => {
      const ca = parseInt((a.grid || '1:1').split(':')[1])
      const cb = parseInt((b.grid || '1:1').split(':')[1])
      return ca - cb
    })
    const n = rowPlayers.length
    const xs = distributeX(n)

    rowPlayers.forEach((p, colIdx) => {
      const lastName = p.name.split(' ').pop()
      players.push({
        name:        lastName,
        shortName:   lastName,
        position:    getPositionLabel(p.pos, colIdx, n),
        role:        POS_ROLE[p.pos] || 'mid',
        isKeyPlayer: keyLastNames.includes(lastName.toLowerCase()),
        isCaptain:   p.captain === true,
        x:           xs[colIdx],
        y:           ySlots[rowIdx],
      })
    })
  })

  return players
}

// ─── Match API team name to local JSON file ID ───────────────────────────────

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

function findTeamId(apiName, teamIndex) {
  const key = apiName.toLowerCase()
  if (teamIndex[key]) return teamIndex[key]
  for (const [k, id] of Object.entries(teamIndex)) {
    if (key.includes(k) || k.includes(key)) return id
  }
  return null
}

function formatMatchDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

// ─── HTTP client for api-football.com ───────────────────────────────────────

function apiFetch(endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api-football-v1.p.rapidapi.com',
      path:     `/v3${endpoint}`,
      method:   'GET',
      headers:  {
        'x-rapidapi-key':  RAPIDAPI_KEY,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      },
    }, res => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(new Error('Bad JSON from API: ' + body.slice(0, 200))) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const today = DATE_ARG || new Date().toISOString().split('T')[0]
  console.log(`\n🌍 World Cup Lineup Updater — ${today}${DRY_RUN ? ' [DRY RUN]' : ''}`)

  const teamIndex = buildTeamIndex()

  const resp = await apiFetch(`/fixtures?date=${today}&league=${WC_LEAGUE_ID}&season=${WC_SEASON}`)

  if (!resp.response?.length) {
    console.log(`No fixtures found for ${today} (league=${WC_LEAGUE_ID}, season=${WC_SEASON})`)
    console.log('Tip: verify WC_LEAGUE_ID in .env — try running with --date on a known match day')
    return
  }

  console.log(`Found ${resp.response.length} fixture(s)\n`)

  let anyUpdate = false

  for (const fixture of resp.response) {
    const { id: fixtureId, date: kickoff } = fixture.fixture
    const homeName = fixture.teams.home.name
    const awayName = fixture.teams.away.name

    console.log(`▶ ${homeName} vs ${awayName}`)

    const lineupResp = await apiFetch(`/fixtures/lineups?fixture=${fixtureId}`)

    if (!lineupResp.response?.length) {
      console.log('  ⏳ Lineups not yet released — will retry at next cron tick\n')
      continue
    }

    for (const teamLineup of lineupResp.response) {
      const apiTeamName = teamLineup.team.name
      const formation   = teamLineup.formation
      const startXI     = teamLineup.startXI.map(s => s.player)
      const opponent    = apiTeamName === homeName ? awayName : homeName

      const teamId = findTeamId(apiTeamName, teamIndex)
      if (!teamId) {
        console.log(`  ⚠️  No local JSON match for API team name "${apiTeamName}"`)
        continue
      }

      const filePath = path.join(TEAMS_DIR, `${teamId}.json`)
      const team     = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      console.log(`  ✓ ${apiTeamName} — ${formation}`)
      console.log(`    ${startXI.map(p => p.name.split(' ').pop()).join(', ')}`)

      if (!DRY_RUN) {
        team.pitch.players  = buildPitchPlayers(startXI, formation, team)
        team.meta.formation = formation
        team.pitchLabel     = `Confirmed XI · ${formatMatchDate(kickoff)} vs ${opponent}`
        fs.writeFileSync(filePath, JSON.stringify(team, null, 2) + '\n')
        anyUpdate = true
      }
    }
    console.log()
  }

  if (anyUpdate) {
    try {
      execSync('git add src/data/teams/', { cwd: REPO_PATH, stdio: 'pipe' })
      execSync(`git commit -m "Auto: confirmed XIs for ${today}"`, { cwd: REPO_PATH, stdio: 'pipe' })
      execSync('git push', { cwd: REPO_PATH, stdio: 'inherit' })
      console.log('✅ Pushed to GitHub')
    } catch (e) {
      if (e.stderr?.toString().includes('nothing to commit')) {
        console.log('ℹ️  Already up to date')
      } else {
        console.error('❌ Git error:', e.message)
      }
    }
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
