#!/usr/bin/env bun
import { ENUM_VALUES } from './utils/db-utils'
import path from 'path'
import fs from 'fs'
import ExcelJS from 'exceljs'

// Helper function to write data to an Excel file
async function writeExcel(
  data: Array<Record<string, string | number | boolean | null>>,
  filePath: string,
): Promise<void> {
  if (data.length === 0) {
    console.log('No data to write.')
    return
  }

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet 1')

  // Define columns from the keys of the first object
  worksheet.columns = Object.keys(data[0]).map((key) => ({
    header: key,
    key: key,
    width: 20, // Default width
  }))

  // Add rows
  worksheet.addRows(data)

  // Write file
  await workbook.xlsx.writeFile(filePath)
}

// Default configuration
const DEFAULT_TABLES: ('targets' | 'angels' | 'accelerators')[] = [
  'targets',
  'angels',
  'accelerators',
]
const DEFAULT_COUNTS: Record<string, number> = {
  targets: 500,
  angels: 100,
  accelerators: 100,
}

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

const SAMPLE_TAGS = [
  'Top Tier',
  'Founder-Friendly',
  'Ex-Founder',
  'Niche Focus',
  'Deep Tech',
  'SaaS',
  'AI',
  'Emerging Manager',
  'Rolling Fund',
  'Impact Investing',
  'Network Access',
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

  // Define visibility level distribution for 500 targets: 150 FREE, 250 PRO, 100 MAX
  const getVisibilityLevel = (index: number): string => {
    if (index < 150) return 'FREE'
    if (index < 400) return 'PRO' // 150 + 250 = 400
    return 'MAX'
  }

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
      tags: randomChoices(SAMPLE_TAGS, 3).join(','),
      notes: randomBoolean() ? 'Generated sample data for testing' : '',
      visibility_level: getVisibilityLevel(i),
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
      tags: randomChoices(SAMPLE_TAGS, 2).join(','),
      notable_investments: `BigCorp ${i + 1},TechStart ${i + 2}`,
      is_active: 'true',
      notes: 'Generated sample data for testing',
      visibility_level: i < 30 ? 'FREE' : i < 70 ? 'PRO' : 'MAX', // 30 FREE, 40 PRO, 30 MAX for 100 angels
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
      tags: randomChoices(SAMPLE_TAGS, 3).join(','),
      notes: 'Generated sample data for testing',
      visibility_level: i < 30 ? 'FREE' : i < 70 ? 'PRO' : 'MAX', // 30 FREE, 40 PRO, 30 MAX for 100 accelerators
    })
  }

  return data
}

// Main bulk seed function
async function bulkSeed() {
  const args = parseArguments()
  if (!args) {
    printHelp()
    process.exit(1)
  }

  const { tables, counts, format } = args

  console.log(`🚀 Starting bulk data generation...`)
  console.log(`📊 Format: ${format.toUpperCase()}`)
  console.log(`📁 Output directory: src/lib/scripts/seed-data/data/`)
  console.log('─'.repeat(50))

  const dataDir = path.join(__dirname, 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  for (const table of tables) {
    const count = counts[table] || DEFAULT_COUNTS[table] || 100
    console.log(`\n🔄 Generating ${count} ${table} records...`)

    let data: Array<Record<string, string>>
    switch (table) {
      case 'targets':
        data = generateTargetsData(count)
        break
      case 'angels':
        data = generateAngelsData(count)
        break
      case 'accelerators':
        data = generateAcceleratorsData(count)
        break
      default:
        console.error(`❌ Unknown table: ${table}`)
        continue
    }

    const fileExtension = format === 'excel' ? 'xlsx' : 'csv'
    const fileName = `${table}-bulk.${fileExtension}`
    const filePath = path.join(dataDir, fileName)

    if (format === 'excel') {
      await writeExcel(data, filePath)
    } else {
      // Basic CSV writer as a fallback
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map((row) =>
        Object.values(row)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(','),
      )
      fs.writeFileSync(filePath, [headers, ...rows].join('\n'))
    }

    console.log(`✅ Generated ${data.length} ${table} records to ${filePath}`)
  }

  console.log('\n🎉 Bulk data generation completed!')
  console.log(
    '\nNext steps:\n' +
      '1. Review the generated files in src/lib/scripts/seed-data/data/\n' +
      '2. Edit any data as needed\n' +
      `3. Import using: bun run seed:import --table <table_name> --file <path_to_file>`,
  )
}

function parseArguments() {
  const args = process.argv.slice(2)
  const result: {
    tables: string[]
    counts: Record<string, number>
    format: 'csv' | 'excel'
  } = {
    tables: [],
    counts: {},
    format: 'csv', // Default to CSV
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--tables':
        result.tables = args[++i]?.split(',') || []
        break
      case '--count':
        const countArg = args[++i]
        if (countArg?.includes(':')) {
          // Format: table:count
          const [table, count] = countArg.split(':')
          result.counts[table] = parseInt(count)
        } else {
          // Apply to all tables
          const count = parseInt(countArg)
          DEFAULT_TABLES.forEach((table: string) => {
            result.counts[table] = count
          })
        }
        break
      case '--format':
        const formatArg = args[++i]?.toLowerCase()
        if (formatArg === 'excel' || formatArg === 'xlsx') {
          result.format = 'excel'
        } else if (formatArg === 'csv') {
          result.format = 'csv'
        } else {
          console.error(`❌ Invalid format: ${formatArg}. Use 'csv' or 'excel'`)
          return null
        }
        break
      case '--help':
        return null
      default:
        console.error(`❌ Unknown argument: ${args[i]}`)
        return null
    }
  }

  // Default to all tables if none specified
  if (result.tables.length === 0) {
    result.tables = DEFAULT_TABLES
  }

  // Validate table names
  for (const table of result.tables) {
    if (!DEFAULT_TABLES.includes(table as 'targets' | 'angels' | 'accelerators')) {
      console.error(`❌ Invalid table: ${table}`)
      console.error(`Valid tables: ${DEFAULT_TABLES.join(', ')}`)
      return null
    }
  }

  return result
}

function printHelp() {
  console.log(`
Bulk Seed Data Generator for Suparaise

Usage: bun run bulk-seed.ts [options]

Options:
  --tables <list>       Comma-separated tables to generate (default: all)
                        Options: targets,angels,accelerators
  
  --count <number>      Number of records per table (default varies by table)
  --count <table:num>   Specific count for a table (e.g., targets:1000)
  
  --format <format>     Output format: csv or excel (default: csv)
                        Use 'excel' for .xlsx files that open easily in macOS
  
  --help               Show this help message

Examples:
  bun run bulk-seed.ts                                    # Generate all tables in CSV
  bun run bulk-seed.ts --format excel                     # Generate all tables in Excel
  bun run bulk-seed.ts --tables targets --count 1000      # 1000 targets in CSV
  bun run bulk-seed.ts --tables targets --format excel    # Targets in Excel
  bun run bulk-seed.ts --count targets:500,angels:200     # Mixed counts in CSV

Generated files will be saved to: src/lib/scripts/seed-data/data/

Default counts:
  - Targets: ${DEFAULT_COUNTS.targets} records
  - Angels: ${DEFAULT_COUNTS.angels} records  
  - Accelerators: ${DEFAULT_COUNTS.accelerators} records
`)
}

// Run the script
bulkSeed()
