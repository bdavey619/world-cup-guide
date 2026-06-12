#!/usr/bin/env node
/**
 * update-stats.js
 *
 * Fetches 2026 World Cup individual statistical leaders from ESPN's public API
 * and writes src/data/stats.json.  Run manually or via GitHub Actions cron.
 *
 * Categories: goals, assists, shotsOnTarget, yellowCards, redCards, foulsCommitted
 * No API key required.
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEAMS_DIR  = path.join(__dirname, '../src/data/teams')
const OUTPUT     = path.join(__dirname, '../src/data/stats.json')

const LEADERS_URL = 'https://sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/seasons/2026/types/1/leaders'
const TOP_N = 15

// ── Fetch helpers ─────────────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { 'User-Agent': 'world-cup-guide/1.0' } }
    https.get(url, opts, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${e.message}`)) }
      })
    }).on('error', reject)
  })
}

function toHttps(url) {
  return url.replace(/^http:\/\//, 'https://')
}

async function fetchAll(urls, concurrency = 8) {
  const results = new Array(urls.length)
  let i = 0
  async function worker() {
    while (i < urls.length) {
      const idx = i++
      try { results[idx] = await fetchJSON(urls[idx]) }
      catch { results[idx] = null }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

// ── Build country → flagEmoji map from local team JSON files ──────────────────

function buildFlagMap() {
  const map = {}
  for (const file of fs.readdirSync(TEAMS_DIR)) {
    if (!file.endsWith('.json')) continue
    const team = JSON.parse(fs.readFileSync(path.join(TEAMS_DIR, file), 'utf8'))
    if (team.flagEmoji) {
      // Index by name variants
      map[team.name] = team.flagEmoji
      if (team.id) map[team.id] = team.flagEmoji
    }
  }
  return map
}

// Citizenship strings ESPN returns → our team name (for flag lookup)
const CITIZENSHIP_TO_NAME = {
  'Algeria': 'Algeria',
  'Argentina': 'Argentina',
  'Australia': 'Australia',
  'Austria': 'Austria',
  'Belgium': 'Belgium',
  'Bosnia and Herzegovina': 'Bosnia-Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia-Herzegovina',
  'Brazil': 'Brazil',
  'Canada': 'Canada',
  'Cape Verde': 'Cape Verde',
  'Colombia': 'Colombia',
  'Croatia': 'Croatia',
  'Curaçao': 'Curaçao',
  'Curacao': 'Curaçao',
  'Czech Republic': 'Czechia',
  'Czechia': 'Czechia',
  'DR Congo': 'DR Congo',
  'Congo DR': 'DR Congo',
  'Democratic Republic of Congo': 'DR Congo',
  'Ecuador': 'Ecuador',
  'Egypt': 'Egypt',
  'England': 'England',
  'France': 'France',
  'Germany': 'Germany',
  'Ghana': 'Ghana',
  'Haiti': 'Haiti',
  'Iran': 'Iran',
  'Iraq': 'Iraq',
  'Ivory Coast': 'Ivory Coast',
  "Côte d'Ivoire": 'Ivory Coast',
  'Japan': 'Japan',
  'Jordan': 'Jordan',
  'Mexico': 'Mexico',
  'Morocco': 'Morocco',
  'Netherlands': 'Netherlands',
  'New Zealand': 'New Zealand',
  'Norway': 'Norway',
  'Panama': 'Panama',
  'Paraguay': 'Paraguay',
  'Portugal': 'Portugal',
  'Qatar': 'Qatar',
  'Saudi Arabia': 'Saudi Arabia',
  'Scotland': 'Scotland',
  'Senegal': 'Senegal',
  'South Africa': 'South Africa',
  'South Korea': 'South Korea',
  'Korea Republic': 'South Korea',
  'Spain': 'Spain',
  'Sweden': 'Sweden',
  'Switzerland': 'Switzerland',
  'Tunisia': 'Tunisia',
  'Turkey': 'Türkiye',
  'Türkiye': 'Türkiye',
  'United States': 'United States',
  'USA': 'United States',
  'Uruguay': 'Uruguay',
  'Uzbekistan': 'Uzbekistan',
}

// ── Main ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'goals',          label: 'Goals',           espnKey: 'goals' },
  { key: 'assists',        label: 'Assists',          espnKey: 'assists' },
  { key: 'shotsOnTarget',  label: 'Shots on Target',  espnKey: 'shotsOnTarget' },
  { key: 'yellowCards',    label: 'Yellow Cards',     espnKey: 'yellowCards' },
  { key: 'redCards',       label: 'Red Cards',        espnKey: 'redCards' },
  { key: 'foulsCommitted', label: 'Fouls Committed',  espnKey: 'foulsCommitted' },
]

async function main() {
  const flagMap = buildFlagMap()

  console.log('Fetching leaders from ESPN…')
  const data = await fetchJSON(LEADERS_URL)

  // ESPN returns an array of category objects; find each by name
  const categoryMap = {}
  for (const cat of (data.categories ?? [])) {
    categoryMap[cat.name] = cat
  }

  // Collect unique athlete ref URLs across all categories
  const athleteRefs = new Map() // url → null (filled later)
  const rawLeaders = {}

  for (const { key, espnKey } of CATEGORIES) {
    const cat = categoryMap[espnKey]
    if (!cat) { console.warn(`  ⚠ Category "${espnKey}" not found`); rawLeaders[key] = []; continue }
    const entries = (cat.leaders ?? []).slice(0, TOP_N)
    rawLeaders[key] = entries
    for (const e of entries) {
      const ref = e.athlete?.$ref ? toHttps(e.athlete.$ref) : null
      if (ref) athleteRefs.set(ref, null)
    }
  }

  // Batch-fetch all unique athletes
  const urls = [...athleteRefs.keys()]
  console.log(`Fetching ${urls.length} athlete profiles…`)
  const responses = await fetchAll(urls)
  urls.forEach((url, i) => athleteRefs.set(url, responses[i]))

  // Build output
  const leaders = {}
  for (const { key } of CATEGORIES) {
    leaders[key] = []
    for (const entry of rawLeaders[key]) {
      const ref = entry.athlete?.$ref ? toHttps(entry.athlete.$ref) : null
      const athleteData = athleteRefs.get(ref)
      if (!athleteData) continue

      const name        = athleteData.displayName ?? athleteData.fullName ?? 'Unknown'
      const citizenship = athleteData.citizenship ?? ''
      const teamName    = CITIZENSHIP_TO_NAME[citizenship] ?? citizenship
      const flag        = flagMap[teamName] ?? '🏳️'
      const position    = athleteData.position?.abbreviation ?? ''

      leaders[key].push({
        name,
        team: teamName,
        flag,
        position,
        value: entry.value ?? 0,
      })
    }
    console.log(`  ${key}: ${leaders[key].length} entries`)
  }

  const output = {
    updatedAt: new Date().toISOString(),
    leaders,
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8')
  console.log(`\nWrote ${OUTPUT}`)
}

main().catch(e => { console.error(e); process.exit(1) })
