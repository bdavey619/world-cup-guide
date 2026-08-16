#!/usr/bin/env node
/**
 * update-bracket.js
 *
 * Fetches completed 2026 World Cup knockout results from ESPN's public
 * scoreboard API and updates src/data/bracketResults.json with scores,
 * winners, and propagated team IDs for upcoming rounds.
 *
 * No API key required. Uses only Node built-ins.
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ESPN's edge rejects bare token User-Agents with a 403; including a contact
// URL passes. Keep the contact URL if you change this string.
const USER_AGENT = 'world-cup-guide/1.0 (+https://github.com/bdavey619/bdavey619.github.io)'

const NAME_TO_SLUG = {
  'Algeria':                       'algeria',
  'Argentina':                     'argentina',
  'Australia':                     'australia',
  'Austria':                       'austria',
  'Belgium':                       'belgium',
  'Bosnia and Herzegovina':        'bosnia-herzegovina',
  'Bosnia & Herzegovina':          'bosnia-herzegovina',
  'Bosnia-Herzegovina':            'bosnia-herzegovina',
  'Brazil':                        'brazil',
  'Canada':                        'canada',
  'Cape Verde':                    'cape-verde',
  'Colombia':                      'colombia',
  'Croatia':                       'croatia',
  'DR Congo':                      'dr-congo',
  'Congo DR':                      'dr-congo',
  'Democratic Republic of Congo':  'dr-congo',
  'Ecuador':                       'ecuador',
  'Egypt':                         'egypt',
  'England':                       'england',
  'France':                        'france',
  'Germany':                       'germany',
  'Ghana':                         'ghana',
  'Ivory Coast':                   'ivory-coast',
  "Côte d'Ivoire":                 'ivory-coast',
  'Japan':                         'japan',
  'Mexico':                        'mexico',
  'Morocco':                       'morocco',
  'Netherlands':                   'netherlands',
  'Norway':                        'norway',
  'Paraguay':                      'paraguay',
  'Portugal':                      'portugal',
  'Senegal':                       'senegal',
  'South Africa':                  'south-africa',
  'Spain':                         'spain',
  'Sweden':                        'sweden',
  'Switzerland':                   'switzerland',
  'United States':                 'united-states',
  'USA':                           'united-states',
}

// Bracket tree: match winner goes to the specified slot in the next match.
// Must stay in sync with the slot labels in src/data/actualBracket.js — if the
// two disagree, a real fixture matches no seeded pair here and is skipped
// silently, and a later round lands in the wrong slot.
const WINNER_ADVANCES = {
  49: { next: 65, side: 'home' },
  52: { next: 65, side: 'away' },
  51: { next: 66, side: 'home' },
  54: { next: 66, side: 'away' },
  50: { next: 67, side: 'home' },
  53: { next: 67, side: 'away' },
  55: { next: 68, side: 'home' },
  56: { next: 68, side: 'away' },
  60: { next: 69, side: 'home' },
  59: { next: 69, side: 'away' },
  58: { next: 70, side: 'home' },
  57: { next: 70, side: 'away' },
  63: { next: 71, side: 'home' },
  62: { next: 71, side: 'away' },
  61: { next: 72, side: 'home' },
  64: { next: 72, side: 'away' },
  65: { next: 73, side: 'home' },
  66: { next: 73, side: 'away' },
  69: { next: 74, side: 'home' },
  70: { next: 74, side: 'away' },
  67: { next: 75, side: 'home' },
  68: { next: 75, side: 'away' },
  71: { next: 76, side: 'home' },
  72: { next: 76, side: 'away' },
  73: { next: 77, side: 'home' },
  74: { next: 77, side: 'away' },
  75: { next: 78, side: 'home' },
  76: { next: 78, side: 'away' },
  77: { next: 80, side: 'home' },
  78: { next: 80, side: 'away' },
}

// SF losers play each other in the 3rd place match
const LOSER_ADVANCES = {
  77: { next: 79, side: 'home' },
  78: { next: 79, side: 'away' },
}

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

// Build "homeSlug|awaySlug" → matchNum lookup from current bracketResults
function buildPairLookup(results) {
  const lookup = {}
  for (const [num, match] of Object.entries(results)) {
    if (match.homeId && match.awayId) {
      lookup[`${match.homeId}|${match.awayId}`] = parseInt(num)
    }
  }
  return lookup
}

function propagateId(results, fromMatch, winnerId) {
  const adv = WINNER_ADVANCES[fromMatch]
  if (!adv) return
  if (!results[adv.next]) results[adv.next] = {}
  const key = adv.side === 'home' ? 'homeId' : 'awayId'
  if (results[adv.next][key] !== winnerId) {
    results[adv.next][key] = winnerId
    console.log(`  → Seeded ${winnerId} as ${adv.next} ${adv.side}`)
  }
}

function propagateLoser(results, fromMatch, loserId) {
  const adv = LOSER_ADVANCES[fromMatch]
  if (!adv) return
  if (!results[adv.next]) results[adv.next] = {}
  const key = adv.side === 'home' ? 'homeId' : 'awayId'
  if (results[adv.next][key] !== loserId) {
    results[adv.next][key] = loserId
    console.log(`  → Seeded ${loserId} as 3rd-place match ${adv.next} ${adv.side}`)
  }
}

async function updateBracket() {
  const resultsPath = path.join(__dirname, '../src/data/bracketResults.json')
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))

  // Re-propagate all already-known winners to keep JSON consistent
  // (catches any manual edits that didn't propagate forward)
  for (const [num, match] of Object.entries(results)) {
    if (!match.winnerId) continue
    const n = parseInt(num)
    propagateId(results, n, match.winnerId)
    const loserId = match.homeId === match.winnerId ? match.awayId : match.homeId
    if (loserId) propagateLoser(results, n, loserId)
  }

  let pairLookup = buildPairLookup(results)

  // Bracket runs Jun 28 – Jul 19
  const dates = []
  for (let d = new Date('2026-06-28T12:00:00Z'); d <= new Date('2026-07-19T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''))
  }

  let updated = 0
  let fetchFailures = 0
  const seenEvents = new Set()

  for (const dateStr of dates) {
    let board
    try { board = await fetchJSON(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`) }
    catch { fetchFailures++; continue }

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
      if (!homeSlug || !awaySlug) continue

      // Try both orientations — ESPN home/away may not match bracketResults orientation
      const matchNum = pairLookup[`${homeSlug}|${awaySlug}`]
                    ?? pairLookup[`${awaySlug}|${homeSlug}`]
      if (!matchNum) continue

      const match = results[matchNum]
      if (!match) continue

      // Resolve scores relative to bracketResults orientation (not ESPN's home/away)
      const homeIsHome = match.homeId === homeSlug
      const homeGoals = parseInt((homeIsHome ? home : away).score ?? 0)
      const awayGoals = parseInt((homeIsHome ? away : home).score ?? 0)

      // ESPN sets competitor.winner = true for the advancing team,
      // which correctly handles penalties (FT score stays as-is, e.g. 1-1)
      const winnerComp = comp.competitors.find(c => c.winner)
      const winnerId = winnerComp
        ? NAME_TO_SLUG[winnerComp.team.displayName]
        : (homeGoals > awayGoals ? match.homeId : match.awayId)

      if (match.homeGoals === homeGoals && match.awayGoals === awayGoals && match.winnerId === winnerId) continue

      match.homeGoals = homeGoals
      match.awayGoals = awayGoals
      match.winnerId  = winnerId
      // Log in bracketResults orientation — goals above are resolved to it, and
      // ESPN's home/away may be reversed.
      console.log(`  ✓ Match ${matchNum}: ${match.homeId} ${homeGoals}–${awayGoals} ${match.awayId} → ${winnerId}`)

      propagateId(results, matchNum, winnerId)
      const loserId = homeSlug === winnerId ? awaySlug : homeSlug
      propagateLoser(results, matchNum, loserId)

      // Rebuild lookup since new IDs may now be known for future rounds
      pairLookup = buildPairLookup(results)
      updated++
    }
  }

  // Every date failing means the API is unreachable, not that there's no news.
  // Fail loudly so the workflow surfaces it instead of reporting "nothing new".
  if (fetchFailures === dates.length) {
    throw new Error(`All ${dates.length} scoreboard fetches failed — ESPN API unreachable.`)
  }

  if (updated > 0) {
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2) + '\n', 'utf8')
    console.log(`\nBracket: ${updated} match(es) updated.`)
  } else {
    console.log('\nBracket: nothing new.')
  }
}

updateBracket().catch(e => {
  console.error(e)
  process.exit(1)
})
