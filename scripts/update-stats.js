#!/usr/bin/env node
/**
 * update-stats.js
 *
 * Fetches 2026 World Cup stats from ESPN's public API and writes src/data/stats.json.
 *
 * Individual: goals (Golden Boot), assists
 * Team:       goals scored, goals conceded, clean sheets, yellow cards, red cards, possession%
 * Records:    highest-scoring match, biggest single defeat
 *
 * No API key required.
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEAMS_DIR  = path.join(__dirname, '../src/data/teams')
const OUTPUT     = path.join(__dirname, '../src/data/stats.json')

const LEADERS_URL   = 'https://sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/seasons/2026/types/1/leaders'
const STANDINGS_URL = 'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=2026'
const MONTH_ABBR    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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

async function fetchAll(urls, concurrency = 10) {
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

// ── Local team data ───────────────────────────────────────────────────────────

function buildTeamMaps() {
  const flagMap = {}   // teamName → flagEmoji
  const slugMap = {}   // teamName → slug

  for (const file of fs.readdirSync(TEAMS_DIR)) {
    if (!file.endsWith('.json')) continue
    const team = JSON.parse(fs.readFileSync(path.join(TEAMS_DIR, file), 'utf8'))
    if (team.flagEmoji) {
      flagMap[team.name] = team.flagEmoji
      slugMap[team.name] = team.id
    }
  }
  return { flagMap, slugMap }
}

// ESPN name / citizenship → our canonical team name
const ESPN_TO_NAME = {
  'Algeria': 'Algeria', 'Argentina': 'Argentina', 'Australia': 'Australia',
  'Austria': 'Austria', 'Belgium': 'Belgium',
  'Bosnia and Herzegovina': 'Bosnia-Herzegovina', 'Bosnia & Herzegovina': 'Bosnia-Herzegovina',
  'Brazil': 'Brazil', 'Canada': 'Canada', 'Cape Verde': 'Cape Verde',
  'Colombia': 'Colombia', 'Croatia': 'Croatia',
  'Curaçao': 'Curaçao', 'Curacao': 'Curaçao',
  'Czech Republic': 'Czechia', 'Czechia': 'Czechia',
  'DR Congo': 'DR Congo', 'Congo DR': 'DR Congo',
  'Democratic Republic of Congo': 'DR Congo',
  'Ecuador': 'Ecuador', 'Egypt': 'Egypt', 'England': 'England',
  'France': 'France', 'Germany': 'Germany', 'Deutschland': 'Germany', 'Ghana': 'Ghana', 'Haiti': 'Haiti',
  'Iran': 'Iran', 'Iraq': 'Iraq',
  'Ivory Coast': 'Ivory Coast', "Côte d'Ivoire": 'Ivory Coast',
  'Japan': 'Japan', 'Jordan': 'Jordan', 'Mexico': 'Mexico', 'Morocco': 'Morocco',
  'Netherlands': 'Netherlands', 'New Zealand': 'New Zealand', 'Norway': 'Norway',
  'Panama': 'Panama', 'Paraguay': 'Paraguay', 'Portugal': 'Portugal',
  'Qatar': 'Qatar', 'Saudi Arabia': 'Saudi Arabia', 'Scotland': 'Scotland',
  'Senegal': 'Senegal', 'South Africa': 'South Africa',
  'South Korea': 'South Korea', 'Korea Republic': 'South Korea',
  'Spain': 'Spain', 'Sweden': 'Sweden', 'Switzerland': 'Switzerland',
  'Tunisia': 'Tunisia', 'Turkey': 'Türkiye', 'Türkiye': 'Türkiye',
  'United States': 'United States', 'USA': 'United States',
  'Uruguay': 'Uruguay', 'Uzbekistan': 'Uzbekistan',
}

// ── Individual leaders ────────────────────────────────────────────────────────

async function fetchIndividualLeaders(flagMap) {
  console.log('Fetching individual leaders…')
  const data = await fetchJSON(LEADERS_URL)

  const catMap = {}
  for (const cat of (data.categories ?? [])) catMap[cat.name] = cat

  const WANT = [
    { key: 'goals',   espnKey: 'goals' },
    { key: 'assists', espnKey: 'assists' },
  ]
  const athleteRefs = new Map()
  const rawLeaders = {}

  for (const { key, espnKey } of WANT) {
    const cat = catMap[espnKey]
    if (!cat) { rawLeaders[key] = []; continue }
    const entries = cat.leaders ?? []
    rawLeaders[key] = entries
    for (const e of entries) {
      const ref = e.athlete?.$ref ? toHttps(e.athlete.$ref) : null
      if (ref) athleteRefs.set(ref, null)
    }
  }

  const urls = [...athleteRefs.keys()]
  console.log(`  Fetching ${urls.length} athlete profiles…`)
  const responses = await fetchAll(urls)
  urls.forEach((url, i) => athleteRefs.set(url, responses[i]))

  const individual = {}
  for (const { key } of WANT) {
    individual[key] = []
    for (const entry of rawLeaders[key]) {
      const ref = entry.athlete?.$ref ? toHttps(entry.athlete.$ref) : null
      const athlete = athleteRefs.get(ref)
      if (!athlete) { console.warn(`  [${key}] MISSING athlete profile: ${ref}`); continue }
      const citizenship = athlete.citizenship ?? ''
      const teamName = ESPN_TO_NAME[citizenship] ?? citizenship
      console.log(`  [${key}] ${athlete.displayName} | citizenship:"${citizenship}" | mapped:"${teamName}" | value:${entry.value}`)
      individual[key].push({
        name:     athlete.displayName ?? athlete.fullName ?? 'Unknown',
        team:     teamName,
        flag:     flagMap[teamName] ?? '🏳️',
        position: athlete.position?.abbreviation ?? '',
        value:    entry.value ?? 0,
      })
    }
    console.log(`  ${key}: ${individual[key].length} entries`)
  }
  return individual
}

// ── Team stats ────────────────────────────────────────────────────────────────

async function fetchTeamStats(flagMap) {
  console.log('Fetching standings for team IDs…')
  const standings = await fetchJSON(STANDINGS_URL)

  // Build espnId → { name, gp } from standings, collect IDs of teams that have played
  const teamMeta = {}  // espnId → { name, flag, gp }
  for (const group of (standings.children ?? [])) {
    for (const entry of (group.standings?.entries ?? [])) {
      const id   = entry.team?.id
      const name = ESPN_TO_NAME[entry.team?.displayName] ?? entry.team?.displayName ?? ''
      if (!id || !name) continue

      const stats = {}
      for (const s of (entry.stats ?? [])) stats[s.name] = s.value
      const gp = (stats.wins ?? 0) + (stats.ties ?? 0) + (stats.losses ?? 0)
      // Use standings goals — more reliably updated than the per-team stats endpoint
      const gf = stats.pointsFor      ?? stats.GF ?? 0
      const ga = stats.pointsAgainst  ?? stats.GA ?? 0

      teamMeta[id] = { name, flag: flagMap[name] ?? '🏳️', gp, gf, ga }
    }
  }

  const playedIds = Object.entries(teamMeta).filter(([, m]) => m.gp > 0).map(([id]) => id)
  if (!playedIds.length) {
    console.log('  No teams have played yet.')
    return []
  }

  console.log(`  Fetching team stats for ${playedIds.length} teams…`)
  const statsUrls = playedIds.map(id =>
    `https://sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/seasons/2026/types/1/teams/${id}/statistics`
  )
  const responses = await fetchAll(statsUrls)

  const teams = []
  for (let i = 0; i < playedIds.length; i++) {
    const id   = playedIds[i]
    const meta = teamMeta[id]
    const data = responses[i]
    if (!data) continue

    // Flatten ESPN stats array into a map
    const s = {}
    for (const cat of (data.splits?.categories ?? [])) {
      for (const stat of (cat.stats ?? [])) s[stat.name] = stat.value
    }

    teams.push({
      name:        meta.name,
      flag:        meta.flag,
      gp:          meta.gp,
      gf:          meta.gf,
      ga:          meta.ga,
      cleanSheets: s.cleanSheet       ?? 0,
      possession:  s.possessionPct    != null ? parseFloat(s.possessionPct.toFixed(1)) : null,
      yellowCards: s.yellowCards      ?? 0,
      redCards:    s.redCards         ?? 0,
    })
  }

  console.log(`  Team stats: ${teams.length} teams`)
  return teams
}

// ── Match records ─────────────────────────────────────────────────────────────

async function fetchMatchRecords() {
  console.log('Scanning completed matches for records…')

  const today = new Date()
  const dates = []
  for (let offset = -14; offset <= 1; offset++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() + offset)
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''))
  }

  const seenEvents = new Set()
  let highestScoring = null  // { goals, teams: [{ team, label, date }] }
  let biggestDefeat  = null  // { label, margin }

  for (const dateStr of dates) {
    let board
    try { board = await fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`) }
    catch { continue }

    for (const event of (board.events ?? [])) {
      if (seenEvents.has(event.id)) continue
      seenEvents.add(event.id)

      const comp = event.competitions?.[0]
      if (!comp?.status?.type?.completed) continue

      const home = comp.competitors.find(c => c.homeAway === 'home')
      const away = comp.competitors.find(c => c.homeAway === 'away')
      if (!home || !away) continue

      const hScore = parseInt(home.score ?? 0)
      const aScore = parseInt(away.score ?? 0)
      const total  = hScore + aScore
      const margin = Math.abs(hScore - aScore)

      const matchDate = new Date(event.date)
      const matchDateET = new Date(matchDate.getTime() - 4 * 60 * 60 * 1000)
      const dateLabel = `${MONTH_ABBR[matchDateET.getUTCMonth()]} ${matchDateET.getUTCDate()}`

      const homeName = ESPN_TO_NAME[home.team.displayName] ?? home.team.displayName
      const awayName = ESPN_TO_NAME[away.team.displayName] ?? away.team.displayName
      const label = `${homeName} ${hScore}–${aScore} ${awayName}`

      // Track highest single-team goal tally (not combined); keep all tied entries
      for (const [teamName, teamGoals] of [[homeName, hScore], [awayName, aScore]]) {
        if (teamGoals === 0) continue
        if (!highestScoring || teamGoals > highestScoring.goals) {
          highestScoring = { goals: teamGoals, teams: [{ team: teamName, label, date: dateLabel }] }
        } else if (teamGoals === highestScoring.goals) {
          highestScoring.teams.push({ team: teamName, label, date: dateLabel })
        }
      }

      if (margin > 0 && (!biggestDefeat || margin > biggestDefeat.margin)) {
        const loser  = hScore < aScore ? homeName : awayName
        const winner = hScore > aScore ? homeName : awayName
        biggestDefeat = { label, loser, winner, margin, date: dateLabel }
      }
    }
  }

  return { highestScoring, biggestDefeat }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { flagMap } = buildTeamMaps()

  const [individual, teams, records] = await Promise.all([
    fetchIndividualLeaders(flagMap),
    fetchTeamStats(flagMap),
    fetchMatchRecords(),
  ])

  const output = { updatedAt: new Date().toISOString(), individual, teams, records }
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8')
  console.log(`\nWrote ${OUTPUT}`)
}

main().catch(e => { console.error(e); process.exit(1) })
