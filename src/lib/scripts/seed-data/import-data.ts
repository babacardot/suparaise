#!/usr/bin/env bun
import { parseExcel } from './utils/sheet-utils'
import { upsertBatch, testConnection } from './utils/db-utils'
import {
  TargetRecord,
  AngelRecord,
  AcceleratorRecord,
} from './utils/sheet-utils'

// Type definitions for our data
type TableName = 'targets' | 'angels' | 'accelerators'
type TransformedRecord = TargetRecord | AngelRecord | AcceleratorRecord

interface ImportOptions {
  table: TableName
  file: string
  batchSize?: number
  dryRun?: boolean
  conflictColumn: string
}

// Main import function
async function importData(options: ImportOptions) {
  console.log(`🚀 Starting Excel import for ${options.table} table`)
  console.log(`📁 File: ${options.file}`)
  console.log(`📊 Batch size: ${options.batchSize || 500}`)
  console.log(`🔀 Conflict column: ${options.conflictColumn}`)
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

  // Parse and validate Excel file
  console.log(`📖 Parsing and validating Excel file...`)
  const { data, errors } = await parseExcel<TransformedRecord>(
    options.file,
    options.table,
  )

  if (errors.length > 0) {
    console.error(`❌ Validation errors found in the Excel file:`)
    errors.forEach((e) =>
      console.error(`  - Row ${e.row}, Field "${e.field}": ${e.message}`),
    )
    console.error(
      `\n❌ Found ${errors.length} validation errors. Please fix your data before importing.`,
    )
    return
  }

  if (data.length === 0) {
    console.log('✅ No data to import.')
    return
  }

  console.log(`✅ Parsed and validated ${data.length} rows successfully.`)

  // Dry run mode - just show what would be imported
  if (options.dryRun) {
    console.log('\n🔍 DRY RUN - No data will be imported')
    console.log(
      `Would upsert ${data.length} records to the ${options.table} table.`,
    )
    console.log('\nFirst 3 records preview:')
    data.slice(0, 3).forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`)
      console.log(record)
    })
    return
  }

  // Perform the actual import
  console.log('\n💾 Starting database import...')
  const result = await upsertBatch(
    options.table,
    data as Record<string, unknown>[],
    options.conflictColumn,
    options.batchSize || 500,
  )

  // Report results
  console.log('\n📊 Import Results:')
  console.log(`✅ Successfully upserted: ${result.success} records`)
  console.log(`❌ Failed imports: ${result.errors.length}`)

  if (result.errors.length > 0) {
    console.log('\n❌ Error details:')
    result.errors.forEach((error) => console.error(`  - ${error}`))
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
      case '--conflict-column':
        options.conflictColumn = args[++i]
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

  // Set default conflict columns based on table
  if (options.table && !options.conflictColumn) {
    const defaultConflictColumns: Record<TableName, string> = {
      targets: 'name',
      accelerators: 'name',
      angels: 'email',
    }
    options.conflictColumn = defaultConflictColumns[options.table]
  }

  // Validate required arguments
  if (!options.table || !options.file || !options.conflictColumn) {
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

Usage: bun run import-data.ts --table <table_name> --file <file_path> [options]

Required Arguments:
  --table <name>        Table to import to (targets, angels, accelerators)
  --file <path>         Path to the Excel data file (.xlsx, .xls)

Optional Arguments:
  --conflict-column <col> Column to use for conflict resolution on upsert.
                          Defaults: 'name' for targets/accelerators, 'email' for angels.
  --batch-size <num>    Number of records per batch (default: 500)
  --dry-run             Preview import without making changes
  --help                Show this help message

Examples:
  bun run import-data.ts --table targets --file ./data/targets-template.xlsx
  bun run import-data.ts --table angels --file ./data/angels-template.xlsx --dry-run
  bun run import-data.ts --table accelerators --file ./data/accelerators-template.xlsx

Use the template generator to create properly formatted Excel files:
  bun run generate-templates.ts

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
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
      '\n❌ An unexpected error occurred during the import process:',
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }
}

// Run the script
main()
