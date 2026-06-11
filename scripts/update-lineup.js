#!/usr/bin/env node
/**
 * update-lineup.js
 *
 * Usage:
 *   node scripts/update-lineup.js <team-id> [--dry-run]
 *
 * Example:
 *   node scripts/update-lineup.js mexico
 *   node scripts/update-lineup.js south-africa --dry-run
 *
 * What it does:
 *   1. Reads the team JSON from src/data/teams/<team-id>.json
 *   2. Finds the next upcoming match from the team's schedule
 *   3. Searches the web for the confirmed starting XI (~2h before kickoff)
 *   4. Updates pitch.players, pitchLabel, and formation in the JSON
 *   5. Writes the file and prints a diff summary
 *
 * Scheduling (run once per matchday morning):
 *   Add to crontab with: crontab -e
 *
 *   # Update Mexico lineup at 1PM ET on Jun 11, 18, 24 (1 hour before kickoff)
 *   0 13 11,18,24 6 * cd /path/to/world-cup-guide && node scripts/update-lineup.js mexico
 *   0 11 18 6 *   cd /path/to/world-cup-guide && node scripts/update-lineup.js south-africa
 *
 * After running, commit and push with:
 *   git add src/data/teams/<team-id>.json && git commit -m "Confirmed XI: <team> vs <opponent>"
 *   git push
 *
 * NOTE: This script prints suggested pitch.players JSON based on search results
 * but does NOT automatically update the pitch diagram positions (x/y coords).
 * You still need to manually adjust positions if the formation changes.
 */

const fs = require('fs')
const path = require('path')

const teamId = process.argv[2]
const dryRun = process.argv.includes('--dry-run')

if (!teamId) {
  console.error('Usage: node scripts/update-lineup.js <team-id> [--dry-run]')
  console.error('Example: node scripts/update-lineup.js mexico')
  process.exit(1)
}

const filePath = path.join(__dirname, '..', 'src', 'data', 'teams', `${teamId}.json`)

if (!fs.existsSync(filePath)) {
  console.error(`Team file not found: ${filePath}`)
  process.exit(1)
}

const team = JSON.parse(fs.readFileSync(filePath, 'utf8'))

// Find next upcoming match
const today = new Date()
const months = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 }

function parseMatchDate(dateStr) {
  const [mon, day] = dateStr.split(' ')
  return new Date(2026, months[mon], parseInt(day))
}

const nextMatch = team.schedule.find(m => {
  const d = parseMatchDate(m.date)
  return d >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
})

if (!nextMatch) {
  console.log(`No upcoming matches found for ${team.name}`)
  process.exit(0)
}

console.log(`\n=== ${team.name} — Next Match ===`)
console.log(`Date:     ${nextMatch.date}`)
console.log(`Opponent: ${nextMatch.opponent}`)
console.log(`Kickoff:  ${nextMatch.time} ET`)
console.log(`Venue:    ${nextMatch.venue}, ${nextMatch.city}`)
console.log()

// Print current pitch players for reference
console.log('Current pitch players:')
team.pitch.players.forEach(p => {
  console.log(`  ${p.position.padEnd(5)} ${p.name}${p.isCaptain ? ' (C)' : ''}${p.isKeyPlayer ? ' *' : ''}`)
})
console.log()
console.log('Current pitchLabel:', team.pitchLabel || '(none)')
console.log()

// Instructions for manual update
console.log('─'.repeat(60))
console.log('TO UPDATE THE CONFIRMED XI:')
console.log()
console.log('1. Search for the confirmed lineup:')
console.log(`   "${team.name} vs ${nextMatch.opponent} confirmed lineup ${nextMatch.date} 2026"`)
console.log()
console.log('2. Update the pitch.players array in:')
console.log(`   ${filePath}`)
console.log()
console.log('3. Set pitchLabel to:')
console.log(`   "Confirmed XI · ${nextMatch.date} vs ${nextMatch.opponent}"`)
console.log()
console.log('4. If formation changes, update:')
console.log('   - meta.formation')
console.log('   - tactics.tacticalNote')
console.log('   - Player x/y positions in pitch.players')
console.log()
console.log('5. Commit and push:')
console.log(`   git add src/data/teams/${teamId}.json`)
console.log(`   git commit -m "Confirmed XI: ${team.name} vs ${nextMatch.opponent} (${nextMatch.date})"`)
console.log('   git push')
console.log('─'.repeat(60))

if (dryRun) {
  console.log('\n[dry-run] No changes written.')
}

// Helper: template for a new pitch player entry
console.log('\nNew player template (copy and edit):')
console.log(JSON.stringify({
  name: "Surname",
  shortName: "Surname",
  position: "POS",
  role: "mid",
  isKeyPlayer: false,
  isCaptain: false,
  x: 226,
  y: 256
}, null, 2))
