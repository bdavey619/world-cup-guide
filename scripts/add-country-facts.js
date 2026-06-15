import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const countryFacts = {
  'algeria':           { population: '46.2M', location: 'North Africa' },
  'argentina':         { population: '45.8M', location: 'South America' },
  'australia':         { population: '26.5M', location: 'Oceania' },
  'austria':           { population: '9.1M',  location: 'Central Europe' },
  'belgium':           { population: '11.7M', location: 'Western Europe' },
  'bosnia-herzegovina':{ population: '3.2M',  location: 'Southeast Europe' },
  'brazil':            { population: '215M',  location: 'South America' },
  'canada':            { population: '40.1M', location: 'North America' },
  'cape-verde':        { population: '0.6M',  location: 'West Africa' },
  'colombia':          { population: '52.2M', location: 'South America' },
  'croatia':           { population: '3.9M',  location: 'Southeast Europe' },
  'curacao':           { population: '0.16M', location: 'Caribbean' },
  'czechia':           { population: '10.9M', location: 'Central Europe' },
  'dr-congo':          { population: '102M',  location: 'Central Africa' },
  'ecuador':           { population: '18.0M', location: 'South America' },
  'egypt':             { population: '104M',  location: 'North Africa' },
  'england':           { population: '56.5M', location: 'Western Europe' },
  'france':            { population: '68.4M', location: 'Western Europe' },
  'germany':           { population: '84.4M', location: 'Central Europe' },
  'ghana':             { population: '33.5M', location: 'West Africa' },
  'haiti':             { population: '11.7M', location: 'Caribbean' },
  'iran':              { population: '87.9M', location: 'Middle East' },
  'iraq':              { population: '43.5M', location: 'Middle East' },
  'ivory-coast':       { population: '27.5M', location: 'West Africa' },
  'japan':             { population: '125M',  location: 'East Asia' },
  'jordan':            { population: '10.2M', location: 'Middle East' },
  'mexico':            { population: '129M',  location: 'North America' },
  'morocco':           { population: '37.1M', location: 'North Africa' },
  'netherlands':       { population: '17.9M', location: 'Western Europe' },
  'new-zealand':       { population: '5.1M',  location: 'Oceania' },
  'norway':            { population: '5.5M',  location: 'Northern Europe' },
  'panama':            { population: '4.4M',  location: 'Central America' },
  'paraguay':          { population: '7.4M',  location: 'South America' },
  'portugal':          { population: '10.3M', location: 'Southern Europe' },
  'qatar':             { population: '2.9M',  location: 'Middle East' },
  'saudi-arabia':      { population: '35.9M', location: 'Middle East' },
  'scotland':          { population: '5.5M',  location: 'Western Europe' },
  'senegal':           { population: '17.8M', location: 'West Africa' },
  'south-africa':      { population: '60.1M', location: 'Southern Africa' },
  'south-korea':       { population: '51.7M', location: 'East Asia' },
  'spain':             { population: '47.4M', location: 'Southern Europe' },
  'sweden':            { population: '10.5M', location: 'Northern Europe' },
  'switzerland':       { population: '8.7M',  location: 'Central Europe' },
  'tunisia':           { population: '12.0M', location: 'North Africa' },
  'turkiye':           { population: '85.3M', location: 'Southeast Europe' },
  'united-states':     { population: '336M',  location: 'North America' },
  'uruguay':           { population: '3.5M',  location: 'South America' },
  'uzbekistan':        { population: '35.7M', location: 'Central Asia' },
}

const teamsDir = join(__dirname, '../src/data/teams')

for (const [id, facts] of Object.entries(countryFacts)) {
  const filePath = join(teamsDir, `${id}.json`)
  const team = JSON.parse(readFileSync(filePath, 'utf8'))
  team.population = facts.population
  team.location = facts.location
  writeFileSync(filePath, JSON.stringify(team, null, 2))
  console.log(`Updated ${id}`)
}

console.log('Done!')
