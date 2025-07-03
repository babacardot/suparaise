#!/usr/bin/env bun
import { writeCSV } from './utils/csv-utils'
import { ENUM_VALUES } from './utils/db-utils'
import path from 'path'

// Sample data generators for realistic but fake data
const VC_NAMES = [
  'Sequoia Capital',
  'Andreessen Horowitz',
  'Kleiner Perkins',
  'Accel Partners',
  'Benchmark Capital',
  'Greylock Partners',
  'First Round Capital',
  'Union Square Ventures',
  'Bessemer Venture Partners',
  'New Enterprise Associates',
  'General Catalyst',
  'Lightspeed Venture Partners',
  'Index Ventures',
  'Founders Fund',
  'GV (Google Ventures)',
  'Intel Capital',
  'Salesforce Ventures',
  'Insight Partners',
  'Tiger Global Management',
  'Coatue Management',
  'DST Global',
  'SoftBank Vision Fund',
  'Blackstone Growth',
  'TPG Growth',
  'KKR & Co',
  'Warburg Pincus',
  'General Atlantic',
  'Silver Lake Partners',
  'Vista Equity Partners',
  'Thoma Bravo',
  'Advent International',
]

const ANGEL_FIRST_NAMES = [
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Casey',
  'Riley',
  'Avery',
  'Quinn',
  'Cameron',
  'Blake',
  'Drew',
  'Sage',
  'River',
  'Skylar',
  'Rowan',
  'Emery',
  'Finley',
  'Hayden',
  'Kendall',
  'Logan',
  'Parker',
  'Reese',
  'Reagan',
  'Remy',
  'Sawyer',
  'Sloan',
  'Storm',
  'Tatum',
  'Winter',
  'Wren',
]

const ANGEL_LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
]

const ACCELERATOR_NAMES = [
  'Y Combinator',
  'Techstars',
  '500 Startups',
  'Plug and Play',
  'AngelPad',
  'Seedcamp',
  'Entrepreneurs Roundtable Accelerator',
  'MassChallenge',
  'SOSV',
  'Startupbootcamp',
  'Founder Institute',
  'Alchemist Accelerator',
  'HAX',
  'RGA Accelerator',
  'Barclays Accelerator',
]

// Use enum values from db-utils.ts to ensure perfect alignment
const TECH_INDUSTRIES = ENUM_VALUES.industry_type.slice(0, 12) // First 12 are tech industries
const EARLY_STAGES = ENUM_VALUES.investment_stage.slice(0, 5) // First 5 stages
const COMMON_REGIONS = ['North America', 'Europe', 'Asia', 'Global', 'EMEA'] // Common regions from enum
const COMMON_LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Boston, MA',
  'Seattle, WA',
  'London, UK',
  'Berlin, Germany',
  'Singapore',
]

// Utility functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomChoices<T>(array: T[], count: number = 2): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, array.length))
}

function randomBoolean(): boolean {
  return Math.random() > 0.5
}

function generateFakeEmail(firstName: string, lastName: string): string {
  const domains = [
    'gmail.com',
    'email.com',
    'example.com',
    'test.com',
    'demo.com',
  ]
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomChoice(domains)}`
}

function generateFakeUrl(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20)
  const tlds = ['.com', '.io', '.co', '.vc', '.capital']
  return `https://${cleanName}${randomChoice(tlds)}`
}

// Generate VC/Fund data using exact enum values
function generateTargetsData(count: number): Array<Record<string, string>> {
  const data: Array<Record<string, string>> = []
  const usedNames = new Set<string>()

  for (let i = 0; i < count; i++) {
    let name: string

    // First, try to use original names from the list
    if (i < VC_NAMES.length) {
      name = VC_NAMES[i]
    } else {
      // Generate unique variations
      const baseName = randomChoice(VC_NAMES)
      let suffix = Math.floor(i / VC_NAMES.length) + 1
      name = `${baseName} ${suffix}`

      // Ensure uniqueness
      while (usedNames.has(name)) {
        suffix++
        name = `${baseName} ${suffix}`
      }
    }

    usedNames.add(name)
    const website = generateFakeUrl(name)

    data.push({
      name,
      website,
      application_url: `${website}/apply`,
      application_email: randomBoolean()
        ? `apply@${website.replace('https://', '')}`
        : '',
      submission_type: randomChoice([...ENUM_VALUES.submission_type]),
      stage_focus: randomChoices(EARLY_STAGES, 2).join(','),
      industry_focus: randomChoices(TECH_INDUSTRIES, 3).join(','),
      region_focus: randomChoices(COMMON_REGIONS, 2).join(','),
      form_complexity: randomChoice([...ENUM_VALUES.form_complexity]),
      question_count_range: randomChoice([...ENUM_VALUES.question_count_range]),
      required_documents: randomChoices(
        [...ENUM_VALUES.required_document_type],
        2,
      ).join(','),
      notes: randomBoolean() ? 'Generated sample data for testing' : '',
    })
  }

  return data
}

// Generate Angel data using exact enum values
function generateAngelsData(count: number): Array<Record<string, string>> {
  const data: Array<Record<string, string>> = []
  const usedNames = new Set<string>()

  for (let i = 0; i < count; i++) {
    let firstName: string
    let lastName: string
    let fullName: string

    // Generate unique name combinations
    do {
      firstName = randomChoice(ANGEL_FIRST_NAMES)
      lastName = randomChoice(ANGEL_LAST_NAMES)
      fullName = `${firstName} ${lastName}`
    } while (usedNames.has(fullName))

    usedNames.add(fullName)
    const email = generateFakeEmail(firstName, lastName)

    data.push({
      first_name: firstName,
      last_name: lastName,
      email,
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      twitter: randomBoolean()
        ? `https://twitter.com/${firstName.toLowerCase()}_${lastName.toLowerCase()}`
        : '',
      personal_website: randomBoolean()
        ? generateFakeUrl(`${firstName}${lastName}`)
        : '',
      location: randomChoice(COMMON_LOCATIONS),
      bio: `Experienced investor and former founder with expertise in ${randomChoice(TECH_INDUSTRIES)}`,
      check_size: randomChoice(ENUM_VALUES.check_size_range.slice(0, 5)), // Focus on smaller check sizes
      stage_focus: randomChoices(EARLY_STAGES, 2).join(','),
      industry_focus: randomChoices(TECH_INDUSTRIES, 2).join(','),
      region_focus: randomChoices(COMMON_REGIONS, 1).join(','),
      investment_approach: randomChoice([...ENUM_VALUES.investment_approach]),
      previous_exits: `ExampleCorp ${i + 1},StartupCo ${i + 2}`,
      domain_expertise: randomChoices(
        ['Product', 'Engineering', 'Marketing', 'Sales', 'Operations'],
        2,
      ).join(','),
      response_time: randomChoice(ENUM_VALUES.response_time.slice(0, 4)), // Exclude '2+ months'
      submission_type: 'email',
      application_url: '',
      application_email: email,
      form_complexity: 'simple',
      required_documents: 'pitch_deck',
      notable_investments: `BigCorp ${i + 1},TechStart ${i + 2}`,
      is_active: 'true',
      notes: 'Generated sample data for testing',
    })
  }

  return data
}

// Generate Accelerator data using exact enum values
function generateAcceleratorsData(
  count: number,
): Array<Record<string, string>> {
  const data: Array<Record<string, string>> = []
  const usedNames = new Set<string>()

  for (let i = 0; i < count; i++) {
    let name: string

    // First, try to use original names from the list
    if (i < ACCELERATOR_NAMES.length) {
      name = ACCELERATOR_NAMES[i]
    } else {
      // Generate unique variations
      const baseName = randomChoice(ACCELERATOR_NAMES)
      let suffix = Math.floor(i / ACCELERATOR_NAMES.length) + 1
      name = `${baseName} ${suffix}`

      // Ensure uniqueness
      while (usedNames.has(name)) {
        suffix++
        name = `${baseName} ${suffix}`
      }
    }

    usedNames.add(name)
    const website = generateFakeUrl(name)

    data.push({
      name,
      website,
      application_url: `${website}/apply`,
      application_email: `apply@${website.replace('https://', '')}`,
      submission_type: 'form',
      program_type: randomChoice([...ENUM_VALUES.program_type]),
      program_duration: randomChoice(ENUM_VALUES.program_duration.slice(0, 3)), // 3,6,12 months only
      location: randomChoice(COMMON_LOCATIONS),
      is_remote_friendly: randomBoolean().toString(),
      batch_size: randomChoice(ENUM_VALUES.batch_size.slice(0, 3)), // Smaller batch sizes
      batches_per_year: randomChoice(['1', '2', '3', '4']),
      next_application_deadline: '2024-12-31',
      stage_focus: randomChoices(EARLY_STAGES.slice(0, 3), 2).join(','), // Focus on Pre-seed, Seed, Series A
      industry_focus: randomChoices(TECH_INDUSTRIES, 3).join(','),
      region_focus: randomChoices(COMMON_REGIONS, 1).join(','),
      equity_taken: randomChoice(ENUM_VALUES.equity_range.slice(0, 4)), // Exclude '10%+' and 'variable'
      funding_provided: randomChoice(ENUM_VALUES.funding_range.slice(0, 4)), // Smaller funding amounts
      acceptance_rate: randomChoice(ENUM_VALUES.acceptance_rate.slice(0, 3)), // Lower acceptance rates
      form_complexity: randomChoice([...ENUM_VALUES.form_complexity]),
      required_documents: randomChoices(
        [...ENUM_VALUES.required_document_type],
        2,
      ).join(','),
      program_fee: randomBoolean()
        ? '0'
        : Math.floor(Math.random() * 10000).toString(),
      is_active: 'true',
      notes: 'Generated sample data for testing',
    })
  }

  return data
}

// Main bulk seeding function
async function bulkSeed() {
  console.log('🚀 Starting bulk seed data generation for Suparaise')
  console.log(
    'This will generate sample data for initial testing and development',
  )
  console.log('📊 Using enum values from database schema for perfect alignment')
  console.log('─'.repeat(60))

  const dataDir = path.join(__dirname, 'data')

  // Create data directory if it doesn't exist
  try {
    const fs = await import('fs')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  } catch (error) {
    console.error('Failed to create data directory:', error)
    return
  }

  // Generate targets (VCs)
  console.log('📈 Generating 1000 VC/Fund targets...')
  const targetsData = generateTargetsData(1000)
  const targetsFile = path.join(dataDir, 'targets-bulk.csv')
  writeCSV(targetsData, targetsFile)
  console.log(
    `✅ Generated ${targetsData.length} targets and saved to ${targetsFile}`,
  )

  // Generate angels
  console.log('👼 Generating 100 angel investors...')
  const angelsData = generateAngelsData(100)
  const angelsFile = path.join(dataDir, 'angels-bulk.csv')
  writeCSV(angelsData, angelsFile)
  console.log(
    `✅ Generated ${angelsData.length} angels and saved to ${angelsFile}`,
  )

  // Generate accelerators
  console.log('🚀 Generating 100 accelerators...')
  const acceleratorsData = generateAcceleratorsData(100)
  const acceleratorsFile = path.join(dataDir, 'accelerators-bulk.csv')
  writeCSV(acceleratorsData, acceleratorsFile)
  console.log(
    `✅ Generated ${acceleratorsData.length} accelerators and saved to ${acceleratorsFile}`,
  )

  console.log('\n🎉 Bulk seed data generation completed!')
  console.log('\nNext steps:')
  console.log('1. Review the generated CSV files in the data/ directory')
  console.log('2. Import the data using:')
  console.log(
    '   bun run scripts/seed-data/csv-import.ts --table targets --file scripts/seed-data/data/targets-bulk.csv',
  )
  console.log(
    '   bun run scripts/seed-data/csv-import.ts --table angels --file scripts/seed-data/data/angels-bulk.csv',
  )
  console.log(
    '   bun run scripts/seed-data/csv-import.ts --table accelerators --file scripts/seed-data/data/accelerators-bulk.csv',
  )
  console.log(
    '\n⚠️  Note: This is sample data for testing. Replace with real data for production use.',
  )
  console.log(
    '\n✅ All generated data uses exact enum values from the database schema',
  )
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    printHelp()
    return null
  }

  if (args.includes('--confirm')) {
    return { confirmed: true }
  }

  return { needsConfirmation: true }
}

function printHelp() {
  console.log(`
Bulk Seed Data Generator for Suparaise

This script generates sample data for initial testing:
- 1000 VC/Fund targets
- 100 Angel investors  
- 100 Accelerators

Usage: bun run bulk-seed.ts [options]

Options:
  --confirm    Skip confirmation prompt and generate data
  --help       Show this help message

Example:
  bun run bulk-seed.ts --confirm

Note: This generates FAKE data for testing purposes only.
`)
}

// Main execution
async function main() {
  const options = parseArguments()

  if (!options) {
    process.exit(1)
  }

  if (options.needsConfirmation) {
    console.log(
      '⚠️  This will generate 1200 sample records (1000 VCs, 100 angels, 100 accelerators)',
    )
    console.log('⚠️  This is FAKE data for testing purposes only')
    console.log('\nProceed? Add --confirm to skip this prompt')
    process.exit(0)
  }

  try {
    await bulkSeed()
  } catch (error) {
    console.error(
      '❌ Bulk seed generation failed:',
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }
}

// Run the script
main()
