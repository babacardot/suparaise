#!/usr/bin/env bun
import {
  parseFile,
  transformToTargetData,
  transformToAngelData,
  transformToAcceleratorData,
  validateRequiredFields,
  TargetRecord,
  AngelRecord,
  AcceleratorRecord,
} from './utils/csv-utils'
import { insertBatch, testConnection } from './utils/db-utils'

// Type definitions for our data
type TableName = 'targets' | 'angels' | 'accelerators'
type TransformedRecord = TargetRecord | AngelRecord | AcceleratorRecord

interface ImportOptions {
  table: TableName
  file: string
  batchSize?: number
  dryRun?: boolean
}

// Required fields for each table - using proper typed field names
const REQUIRED_FIELDS: Record<TableName, string[]> = {
  targets: ['name', 'application_url'],
  angels: ['first_name', 'last_name'],
  accelerators: ['name'],
}

// Transform CSV/Excel data based on table type with proper typing
function transformData(
  table: TableName,
  rows: Record<string, string>[],
): TransformedRecord[] {
  switch (table) {
    case 'targets':
      return transformToTargetData(rows)
    case 'angels':
      return transformToAngelData(rows)
    case 'accelerators':
      return transformToAcceleratorData(rows)
    default:
      throw new Error(`Unknown table: ${table}`)
  }
}

// Main import function
async function importData(options: ImportOptions) {
  const fileExtension = options.file.split('.').pop()?.toLowerCase()
  const fileType =
    fileExtension === 'xlsx' || fileExtension === 'xls' ? 'Excel' : 'CSV'

  console.log(`🚀 Starting ${fileType} import for ${options.table} table`)
  console.log(`📁 File: ${options.file}`)
  console.log(`📊 Batch size: ${options.batchSize || 1000}`)
  console.log(`🔄 Mode: ${options.dryRun ? 'Dry run' : 'Live import'}`)
  console.log('─'.repeat(50))

  // Test database connection first
  console.log('🔌 Testing database connection...')
  const connectionOk = await testConnection()
  if (!connectionOk) {
    console.error(
      '❌ Database connection failed. Please check your environment variables.',
    )
    return
  }

  // Parse file (CSV or Excel)
  console.log(`📖 Parsing ${fileType} file...`)
  const fileData = parseFile(options.file)

  if (fileData.errors.length > 0) {
    console.error(`❌ ${fileType} parsing errors:`)
    fileData.errors.forEach((error) => console.error(`  ${error}`))
    return
  }

  console.log(`✅ Parsed ${fileData.rows.length} rows`)

  // Transform data based on table type
  console.log('🔄 Transforming data...')
  const transformedData = transformData(options.table, fileData.rows)

  // Validate required fields using the typed interfaces
  console.log('✅ Validating required fields...')
  const validationErrors = validateRequiredFields(
    transformedData as unknown as Record<string, unknown>[],
    REQUIRED_FIELDS[options.table],
  )

  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:')
    validationErrors.forEach((error) =>
      console.error(`  Row ${error.index}: ${error.error}`),
    )
    console.error(
      `\n❌ Found ${validationErrors.length} validation errors. Please fix your data before importing.`,
    )
    return
  }

  console.log(`✅ All ${transformedData.length} records passed validation`)

  // Dry run mode - just show what would be imported
  if (options.dryRun) {
    console.log('\n🔍 DRY RUN - No data will be imported')
    console.log(
      `Would import ${transformedData.length} records to ${options.table} table`,
    )
    console.log('\nFirst 3 records preview:')
    transformedData.slice(0, 3).forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`)
      Object.entries(record).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          console.log(
            `  ${key}: ${Array.isArray(value) ? value.join(', ') : value}`,
          )
        }
      })
    })
    return
  }

  // Perform the actual import - convert to Record<string, unknown>[] for Supabase
  console.log('\n💾 Starting database import...')

  const databaseRecords = transformedData.map(
    (record) => record as unknown as Record<string, unknown>,
  )
  const result = await insertBatch(
    options.table,
    databaseRecords,
    options.batchSize || 1000,
  )

  // Report results
  console.log('\n📊 Import Results:')
  console.log(`✅ Successfully imported: ${result.success} records`)
  console.log(`❌ Failed imports: ${result.errors.length}`)

  if (result.errors.length > 0) {
    console.log('\n❌ Error details:')
    result.errors.forEach((error) => console.error(`  ${error}`))
  }

  console.log('\n🎉 Import completed!')
}

// Parse command line arguments
function parseArguments(): ImportOptions | null {
  const args = process.argv.slice(2)
  const options: Partial<ImportOptions> = {}

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--table':
        options.table = args[++i] as TableName
        break
      case '--file':
        options.file = args[++i]
        break
      case '--batch-size':
        options.batchSize = parseInt(args[++i])
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
        printHelp()
        return null
      default:
        console.error(`❌ Unknown argument: ${args[i]}`)
        printHelp()
        return null
    }
  }

  // Validate required arguments
  if (!options.table || !options.file) {
    console.error('❌ Missing required arguments')
    printHelp()
    return null
  }

  if (!['targets', 'angels', 'accelerators'].includes(options.table)) {
    console.error(`❌ Invalid table name: ${options.table}`)
    console.error('Valid tables: targets, angels, accelerators')
    return null
  }

  return options as ImportOptions
}

function printHelp() {
  console.log(`
Data Import Tool for Suparaise

Usage: bun run csv-import.ts --table <table_name> --file <file_path> [options]

Required Arguments:
  --table <name>        Table to import to (targets, angels, accelerators)
  --file <path>         Path to data file (supports .csv, .xlsx, .xls)

Optional Arguments:
  --batch-size <num>    Number of records per batch (default: 1000)
  --dry-run            Preview import without making changes
  --help               Show this help message

Examples:
  bun run csv-import.ts --table targets --file data/vcs.xlsx
  bun run csv-import.ts --table angels --file data/angels.csv --batch-size 500 --dry-run
  bun run csv-import.ts --table accelerators --file data/accelerators.xlsx

File Format Support:
  ✅ Excel files (.xlsx, .xls) - Recommended for macOS
  ✅ CSV files (.csv) - Traditional format
  
  Use the template generator to create properly formatted files:
  bun run generate-templates.ts --format excel

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

Column Requirements:
  All column names must match the database table column names exactly.
  See the database schema in supabase/migrations/01_db.sql for reference.

  Required columns by table:
  - targets: name, application_url
  - angels: first_name, last_name  
  - accelerators: name
`)
}

// Main execution
async function main() {
  const options = parseArguments()

  if (!options) {
    process.exit(1)
  }

  try {
    await importData(options)
  } catch (error) {
    console.error(
      '❌ Import failed:',
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }
}

main()
