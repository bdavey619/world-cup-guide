#!/usr/bin/env node
/**
 * populate-squads.js
 *
 * One-time script: fetches 26-man squad rosters from ESPN for all 48 World Cup
 * teams and writes them into each team's JSON file (skips teams that already
 * have a squad array with 10+ players).
 *
 * Usage:
 *   node scripts/populate-squads.js             # populate missing squads
 *   node scripts/populate-squads.js --force      # overwrite all squads
 *   node scripts/populate-squads.js --dry-run    # preview without writing
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEAMS_DIR  = path.join(__dirname, '../src/data/teams')
const DRY_RUN    = process.argv.includes('--dry-run')
const FORCE      = process.argv.includes('--force')

const POS_MAP = { G: 'GK', D: 'DEF', M: 'MID', F: 'FWD' }

// ESPN team name → local JSON slug (same as update-lineup.js)
const ESPN_NAME_OVERRIDES = {
  'korea republic':           'south-korea',
  'republic of korea':        'south-korea',
  'usa':                      'united-states',
  'united states':            'united-states',
  "côte d'ivoire":            'ivory-coast',
  "cote d'ivoire":            'ivory-coast',
  'curaçao':                  'curacao',
  'curacao':                  'curacao',
  'bosnia and herzegovina':   'bosnia-herzegovina',
  'bosnia & herzegovina':     'bosnia-herzegovina',
  'türkiye':                  'turkiye',
  'czech republic':           'czechia',
  'dr congo':                 'dr-congo',
  'congo dr':                 'dr-congo',
  'democratic republic of congo': 'dr-congo',
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(new Error(`Bad JSON from ${url}: ${body.slice(0, 80)}`)) }
      })
    }).on('error', reject)
  })
}

function slugFromName(espnName) {
  const key = espnName.toLowerCase().trim()
  if (ESPN_NAME_OVERRIDES[key]) return ESPN_NAME_OVERRIDES[key]
  return key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function main() {
  console.log(`\n🌍 Squad populator${DRY_RUN ? ' [DRY RUN]' : ''}${FORCE ? ' [FORCE]' : ''}\n`)

  // Load all ESPN teams for this tournament
  const teamsData = await fetchJSON('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams')
  const espnTeams = teamsData.sports?.[0]?.leagues?.[0]?.teams?.map(t => t.team) ?? []
  console.log(`Found ${espnTeams.length} ESPN teams\n`)

  let updated = 0, skipped = 0, failed = 0

  for (const espnTeam of espnTeams) {
    const espnName = espnTeam.displayName
    const slug = slugFromName(espnName)
    const filePath = path.join(TEAMS_DIR, `${slug}.json`)

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  No file for "${espnName}" (tried ${slug}.json)`)
      failed++
      continue
    }

    const team = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    if (!FORCE && team.squad && team.squad.length >= 10) {
      console.log(`  — ${team.name}: already has ${team.squad.length} players`)
      skipped++
      continue
    }

    // Fetch roster
    let roster
    try {
      const data = await fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${espnTeam.id}/roster`)
      roster = data.athletes ?? []
    } catch (e) {
      console.log(`  ❌ ${team.name}: fetch failed — ${e.message}`)
      failed++
      continue
    }

    if (!roster.length) {
      console.log(`  ⏳ ${team.name}: empty roster`)
      skipped++
      continue
    }

    const squad = roster.map(p => ({
      name:   p.displayName,
      pos:    POS_MAP[p.position?.abbreviation] || 'MID',
      club:   p.team?.displayName || p.club?.displayName || '',
      jersey: p.jersey ?? null,
    }))

    // Sort: GK → DEF → MID → FWD
    const ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 }
    squad.sort((a, b) => (ORDER[a.pos] ?? 9) - (ORDER[b.pos] ?? 9))

    console.log(`  ✓ ${team.name}: ${squad.length} players`)

    if (!DRY_RUN) {
      team.squad = squad
      fs.writeFileSync(filePath, JSON.stringify(team, null, 2) + '\n')
      updated++
    }

    // Small delay to be polite to ESPN's API
    await new Promise(r => setTimeout(r, 150))
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped, ${failed} failed.`)
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
