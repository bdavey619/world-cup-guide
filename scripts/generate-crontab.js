#!/usr/bin/env node
/**
 * generate-crontab.js
 *
 * Reads all 48 team JSON schedules and outputs crontab entries that run
 * update-lineup.js 1 hour before each World Cup kickoff.
 *
 * Usage:
 *   node scripts/generate-crontab.js           # preview output
 *   node scripts/generate-crontab.js | crontab -   # install directly
 *
 * Kickoff times in the JSON are in Eastern Time (EDT = UTC-4 in summer).
 * Set UTC_OFFSET in .env to match your machine's timezone offset.
 * Examples: EDT=-4, CDT=-5, MDT=-6, PDT=-7
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

loadEnv()

const REPO_PATH  = process.env.REPO_PATH  || path.join(__dirname, '..')
const UTC_OFFSET = parseInt(process.env.UTC_OFFSET || '-4', 10)
const ET_OFFSET  = -4  // EDT (summer) — all World Cup group games June–July

const TEAMS_DIR  = path.join(REPO_PATH, 'src', 'data', 'teams')

const MONTH_MAP = {
  Jan:1, Feb:2, Mar:3, Apr:4, May:5,  Jun:6,
  Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12,
}

function parseDate(str) {
  const [mon, day] = str.split(' ')
  return { month: MONTH_MAP[mon], day: parseInt(day) }
}

function parseKickoffET(str) {
  if (!str) return null
  const s = str.replace(/\s*ET$/, '').trim()
  if (s.toLowerCase() === 'midnight') return { hour: 0, minute: 0 }
  if (s.toLowerCase() === 'noon')     return { hour: 12, minute: 0 }
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
  if (!m) return null
  let h = parseInt(m[1])
  const min = parseInt(m[2] || '0')
  const ap  = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return { hour: h, minute: min }
}

// Convert ET hour/day to local machine time, then subtract 1h for pre-match run
function toCronTime(etHour, etMinute, etDay, etMonth) {
  // ET → UTC
  let utcH = etHour - ET_OFFSET
  let utcD = etDay
  if (utcH >= 24) { utcH -= 24; utcD++ }
  if (utcH < 0)   { utcH += 24; utcD-- }

  // UTC → local
  let locH = utcH + UTC_OFFSET
  let locD = utcD
  if (locH >= 24) { locH -= 24; locD++ }
  if (locH < 0)   { locH += 24; locD-- }

  // 1 hour before kickoff
  let cronH = locH - 1
  let cronD = locD
  if (cronH < 0) { cronH += 24; cronD-- }

  return { hour: cronH, minute: etMinute, day: cronD, month: etMonth }
}

// Collect unique kickoff slots across all team schedules
const slots = new Map()

fs.readdirSync(TEAMS_DIR)
  .filter(f => f.endsWith('.json'))
  .forEach(f => {
    const team = JSON.parse(fs.readFileSync(path.join(TEAMS_DIR, f), 'utf8'))
    ;(team.schedule || []).forEach(match => {
      const ko = parseKickoffET(match.time)
      if (!ko) return
      const d  = parseDate(match.date)
      const ct = toCronTime(ko.hour, ko.minute, d.day, d.month)
      const key = `${ct.month}-${ct.day}-${ct.hour}-${ct.minute}`
      if (!slots.has(key)) slots.set(key, { ...ct, labels: new Set() })
      slots.get(key).labels.add(`${match.date} ${match.time}: ${team.name} vs ${match.opponent}`)
    })
  })

const sorted = [...slots.values()].sort((a, b) =>
  a.month !== b.month ? a.month - b.month :
  a.day   !== b.day   ? a.day   - b.day   :
  a.hour  !== b.hour  ? a.hour  - b.hour  :
  a.minute - b.minute
)

const scriptPath = path.join(REPO_PATH, 'scripts', 'update-lineup.js')
const logPath    = path.join(REPO_PATH, 'lineup-updates.log')

const tzNote = UTC_OFFSET === -4 ? 'EDT' :
               UTC_OFFSET === -5 ? 'CDT' :
               UTC_OFFSET === -7 ? 'PDT' : `UTC${UTC_OFFSET}`

console.log('# ─────────────────────────────────────────────────────────────────')
console.log('# World Cup 2026 — Confirmed XI auto-updater crontab')
console.log(`# Generated: ${new Date().toISOString()}`)
console.log(`# Machine timezone: ${tzNote} (UTC${UTC_OFFSET >= 0 ? '+' : ''}${UTC_OFFSET})`)
console.log('# Runs 1 hour before each kickoff → fetches lineup → pushes to GitHub')
console.log('#')
console.log('# Install:  node scripts/generate-crontab.js | crontab -')
console.log('# View:     crontab -l')
console.log('# Logs:     tail -f', logPath)
console.log('# ─────────────────────────────────────────────────────────────────')
console.log()

let lastDate = ''
sorted.forEach(slot => {
  const { hour, minute, day, month, labels } = slot
  const dateKey = `${month}-${day}`

  if (dateKey !== lastDate) {
    const d = new Date(Date.UTC(2026, month - 1, day))
    const label = d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
    })
    if (lastDate) console.log()
    console.log(`# ── ${label}`)
    lastDate = dateKey
  }

  ;[...labels].forEach(l => console.log(`# ${l}`))
  console.log(`${minute} ${hour} ${day} ${month} * node ${scriptPath} >> ${logPath} 2>&1`)
})

console.log()
console.log('# ─────────────────────────────────────────────────────────────────')

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
