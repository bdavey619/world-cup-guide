#!/usr/bin/env node
/**
 * update-standings.js
 *
 * Fetches live 2026 World Cup group standings from ESPN's public API and
 * updates the standings field in each team's JSON file.  Run manually or
 * via the GitHub Actions cron workflow (update-standings.yml).
 *
 * No API key required.  Uses only Node built-ins (https, fs, path).
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── ESPN team name → our JSON slug ───────────────────────────────────────────
const NAME_TO_SLUG = {
  'Algeria':                  'algeria',
  'Argentina':                'argentina',
  'Australia':                'australia',
  'Austria':                  'austria',
  'Belgium':                  'belgium',
  'Bosnia and Herzegovina':   'bosnia-herzegovina',
  'Bosnia & Herzegovina':     'bosnia-herzegovina',
  'Bosnia-Herzegovina':       'bosnia-herzegovina',
  'Brazil':                   'brazil',
  'Canada':                   'canada',
  'Cape Verde':               'cape-verde',
  'Colombia':                 'colombia',
  'Croatia':                  'croatia',
  'Curaçao':                  'curacao',
  'Curacao':                  'curacao',
  'Czech Republic':           'czechia',
  'Czechia':                  'czechia',
  'DR Congo':                 'dr-congo',
  'Congo DR':                 'dr-congo',
  'Democratic Republic of Congo': 'dr-congo',
  'Ecuador':                  'ecuador',
  'Egypt':                    'egypt',
  'England':                  'england',
  'France':                   'france',
  'Germany':                  'germany',
  'Ghana':                    'ghana',
  'Haiti':                    'haiti',
  'Iran':                     'iran',
  'Iraq':                     'iraq',
  'Ivory Coast':              'ivory-coast',
  "Côte d'Ivoire":            'ivory-coast',
  'Japan':                    'japan',
  'Jordan':                   'jordan',
  'Mexico':                   'mexico',
  'Morocco':                  'morocco',
  'Netherlands':              'netherlands',
  'New Zealand':              'new-zealand',
  'Norway':                   'norway',
  'Panama':                   'panama',
  'Paraguay':                 'paraguay',
  'Portugal':                 'portugal',
  'Qatar':                    'qatar',
  'Saudi Arabia':             'saudi-arabia',
  'Scotland':                 'scotland',
  'Senegal':                  'senegal',
  'South Africa':             'south-africa',
  'South Korea':              'south-korea',
  'Korea Republic':           'south-korea',
  'Spain':                    'spain',
  'Sweden':                   'sweden',
  'Switzerland':              'switzerland',
  'Tunisia':                  'tunisia',
  'Turkey':                   'turkiye',
  'Türkiye':                  'turkiye',
  'United States':            'united-states',
  'USA':                      'united-states',
  'Uruguay':                  'uruguay',
  'Uzbekistan':               'uzbekistan',
}

const TEAMS_DIR = path.join(__dirname, '../src/data/teams')

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'world-cup-guide/1.0' } }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}\n${data.slice(0, 200)}`)) }
      })
    }).on('error', reject)
  })
}

function loadTeam(slug) {
  const file = path.join(TEAMS_DIR, `${slug}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function saveTeam(slug, data) {
  const file = path.join(TEAMS_DIR, `${slug}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

async function updateStandings() {
  console.log('Fetching standings from ESPN…')

  // ESPN public standings endpoint for the 2026 World Cup
  const url = 'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=2026'
  let espnData
  try {
    espnData = await fetch(url)
  } catch (e) {
    console.error('ESPN fetch failed:', e.message)
    process.exit(1)
  }

  const groups = espnData?.children ?? []
  if (!groups.length) {
    console.warn('No groups found in ESPN response — tournament may not have started yet.')
    console.log('Response keys:', Object.keys(espnData ?? {}))
    process.exit(0)
  }

  let updated = 0
  let unchanged = 0
  let unmatched = []

  for (const group of groups) {
    const entries = group?.standings?.entries ?? []
    for (const entry of entries) {
      const espnName = entry?.team?.displayName ?? entry?.team?.name ?? ''
      const slug = NAME_TO_SLUG[espnName]

      if (!slug) {
        unmatched.push(espnName)
        continue
      }

      // Parse stats array into { w, d, l, pts, gf, ga, gd }
      const stats = {}
      for (const s of (entry.stats ?? [])) {
        stats[s.name] = s.value
      }

      const newStandings = {
        w:   stats.wins        ?? stats.W   ?? 0,
        d:   stats.ties        ?? stats.D   ?? 0,
        l:   stats.losses      ?? stats.L   ?? 0,
        pts: stats.points      ?? stats.PTS ?? 0,
        gf:  stats.pointsFor   ?? stats.GF  ?? 0,
        ga:  stats.pointsAgainst ?? stats.GA ?? 0,
        gd:  stats.pointDifferential ?? stats.GD ?? 0,
      }

      const team = loadTeam(slug)
      const old  = team.standings ?? {}

      const changed =
        old.w   !== newStandings.w  ||
        old.d   !== newStandings.d  ||
        old.l   !== newStandings.l  ||
        old.pts !== newStandings.pts

      if (changed) {
        team.standings = newStandings
        saveTeam(slug, team)
        console.log(`  ✓ ${team.name}: ${old.pts ?? 0}pts → ${newStandings.pts}pts (${newStandings.w}W ${newStandings.d}D ${newStandings.l}L)`)
        updated++
      } else {
        unchanged++
      }
    }
  }

  console.log(`\nStandings: ${updated} updated, ${unchanged} unchanged.`)
  if (unmatched.length) {
    console.warn(`Unmatched ESPN names (add to NAME_TO_SLUG if needed): ${[...new Set(unmatched)].join(', ')}`)
  }

  // ── Match scores ────────────────────────────────────────────────────────────
  console.log('\nFetching completed match scores…')

  // Look back 14 days and forward 1 day to catch any recently finished matches
  const today = new Date()
  const dates = []
  for (let offset = -14; offset <= 1; offset++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() + offset)
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''))
  }

  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  let scoresUpdated = 0
  const seenEvents = new Set()

  for (const dateStr of dates) {
    let board
    try { board = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`) }
    catch { continue }

    if (board.events?.length) console.log(`  [${dateStr}] ${board.events.length} event(s)`)

    for (const event of (board.events ?? [])) {
      if (seenEvents.has(event.id)) continue
      seenEvents.add(event.id)

      const comp = event.competitions?.[0]
      const statusState = comp?.status?.type?.state
      const completed   = comp?.status?.type?.completed
      const home = comp?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName ?? '?'
      const away = comp?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName ?? '?'
      console.log(`    ${home} vs ${away} | state=${statusState} completed=${completed}`)

      if (!comp?.status?.type?.completed) continue

      const home = comp.competitors.find(c => c.homeAway === 'home')
      const away = comp.competitors.find(c => c.homeAway === 'away')
      if (!home || !away) continue

      const homeSlug = NAME_TO_SLUG[home.team.displayName]
      const awaySlug = NAME_TO_SLUG[away.team.displayName]
      const homeScore = parseInt(home.score ?? 0)
      const awayScore = parseInt(away.score ?? 0)

      const matchDateLabel = `${MONTH_ABBR[parseInt(dateStr.slice(4,6))-1]} ${parseInt(dateStr.slice(6,8))}`

      for (const [slug, isHome] of [[homeSlug, true], [awaySlug, false]]) {
        if (!slug) continue
        const team = loadTeam(slug)
        const myScore    = isHome ? homeScore : awayScore
        const theirScore = isHome ? awayScore : homeScore
        const oppName    = isHome ? away.team.displayName : home.team.displayName
        const result     = myScore > theirScore ? 'W' : myScore < theirScore ? 'L' : 'D'
        const scoreStr   = `${myScore}–${theirScore}`

        const matchIdx = (team.schedule ?? []).findIndex(m => {
          const sameDate = m.date === matchDateLabel
          const sameOpp  = m.opponent?.toLowerCase() === oppName.toLowerCase() ||
                           NAME_TO_SLUG[m.opponent] === (isHome ? awaySlug : homeSlug)
          return sameDate && sameOpp
        })

        if (matchIdx === -1) continue
        const existing = team.schedule[matchIdx]
        if (existing.score === scoreStr && existing.result === result) continue

        team.schedule[matchIdx] = { ...existing, score: scoreStr, result }
        saveTeam(slug, team)
        console.log(`  ✓ ${team.name} vs ${oppName}: ${scoreStr} (${result})`)
        scoresUpdated++
      }
    }
  }

  console.log(`Scores: ${scoresUpdated} updated.`)
  // Exit code 0 always — let the workflow decide whether to commit based on git status
}

updateStandings().catch(e => {
  console.error(e)
  process.exit(1)
})
