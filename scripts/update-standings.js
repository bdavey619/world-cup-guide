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

// ESPN's edge rejects bare token User-Agents with a 403; including a contact
// URL passes. Keep the contact URL if you change this string.
const USER_AGENT = 'world-cup-guide/1.0 (+https://github.com/bdavey619/bdavey619.github.io)'

// Scan the whole tournament, not a window relative to today — a rolling window
// silently drops matches off the back as time passes.
// End is one day past the final: ESPN buckets events by UTC date, so a
// midnight-ET kickoff lands under the following day.
const TOURNAMENT_START = '2026-06-11'
const TOURNAMENT_END   = '2026-07-20'

function tournamentDates() {
  // Cap at tomorrow so mid-tournament runs don't fetch dates that haven't happened.
  const tomorrow = new Date(Date.now() + 86400000)
  const end = new Date(`${TOURNAMENT_END}T12:00:00Z`)
  const last = end < tomorrow ? end : tomorrow

  const dates = []
  for (let d = new Date(`${TOURNAMENT_START}T12:00:00Z`); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''))
  }
  return dates
}

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

function fetchJSONOnce(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}\n${data.slice(0, 200)}`)) }
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
    espnData = await fetchJSON(url)
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

  const dates = tournamentDates()

  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  let scoresUpdated = 0
  const seenEvents = new Set()

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

      const homeSlug = NAME_TO_SLUG[home.team.displayName]
      const awaySlug = NAME_TO_SLUG[away.team.displayName]
      const homeScore = parseInt(home.score ?? 0)
      const awayScore = parseInt(away.score ?? 0)

      // ESPN returns events under their UTC date. For midnight-ET games
      // (e.g. 04:00 UTC June 14 = 00:00 ET June 13) our schedule uses the
      // US broadcast date (June 13) while ESPN returns the event under June 14.
      // Build both the query-date label and the previous-day label so either matches.
      const matchDateLabel = `${MONTH_ABBR[parseInt(dateStr.slice(4,6))-1]} ${parseInt(dateStr.slice(6,8))}`
      const prevMs = new Date(`${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}T12:00:00Z`).getTime() - 86400000
      const prevDay = new Date(prevMs)
      const prevDateLabel = `${MONTH_ABBR[prevDay.getUTCMonth()]} ${prevDay.getUTCDate()}`

      for (const [slug, isHome] of [[homeSlug, true], [awaySlug, false]]) {
        if (!slug) continue
        const team = loadTeam(slug)
        const myScore    = isHome ? homeScore : awayScore
        const theirScore = isHome ? awayScore : homeScore
        const oppName    = isHome ? away.team.displayName : home.team.displayName
        const result     = myScore > theirScore ? 'W' : myScore < theirScore ? 'L' : 'D'
        const scoreStr   = `${myScore}–${theirScore}`

        const matchIdx = (team.schedule ?? []).findIndex(m => {
          const sameDate = m.date === matchDateLabel || m.date === prevDateLabel
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
