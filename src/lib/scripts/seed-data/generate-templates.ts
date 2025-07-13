#!/usr/bin/env bun
import { generateExcelTemplate } from './utils/sheet-utils'
import path from 'path'

type TableName = 'targets' | 'angels' | 'accelerators'

// Main function to generate all templates
function generateAllTemplates() {
  const outputDir = path.join(__dirname, 'templates')

  console.log('🚀 Generating Excel templates for Suparaise data seeding')
  console.log(`📁 Output directory: ${outputDir}`)
  console.log('─'.repeat(50))

  // Generate templates for all table types
  const tables: TableName[] = ['targets', 'angels', 'accelerators']

  tables.forEach((table) => {
    console.log(`📝 Generating Excel template for ${table}...`)
    generateExcelTemplate(table, outputDir)
  })

  console.log('\n✅ All templates generated successfully!')
  console.log('\nNext steps:')
  console.log('1. Open the Excel template files and fill in your data')
  console.log(
    '2. Use the `bun run seed` command to load the data into Supabase',
  )

  console.log('\nTemplate files created:')
  tables.forEach((table) => {
    console.log(`  📄 ${path.join(outputDir, `${table}-template.xlsx`)}`)
  })
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    printHelp()
    return null
  }

  const result: {
    table?: TableName
    all?: boolean
  } = {}

  // If specific table is requested
  const tableIndex = args.indexOf('--table')
  if (tableIndex !== -1 && args[tableIndex + 1]) {
    const table = args[tableIndex + 1]

    if (!table || !['targets', 'angels', 'accelerators'].includes(table)) {
      console.error(
        '❌ Invalid table name. Valid options: targets, angels, accelerators',
      )
      return null
    }

    result.table = table as TableName
  } else {
    result.all = true
  }

  return result
}

function printHelp() {
  console.log(`
Template Generator for Suparaise

Usage: bun run generate-templates.ts [options]

Options:
  --table <name>     Generate Excel template for a specific table (targets, angels, accelerators).
                     If not provided, all templates will be generated.
  --help             Show this help message

Examples:
  bun run generate-templates.ts                # Generate all Excel templates
  bun run generate-templates.ts --table targets  # Generate only the targets Excel template

Generated templates will be placed in the templates/ directory.
`)
}

// Main execution
function main() {
  const options = parseArguments()

  if (!options) {
    process.exit(1)
  }

  try {
    if (options.all) {
      generateAllTemplates()
    } else if (options.table) {
      const outputDir = path.join(__dirname, 'templates')
      console.log(`📝 Generating Excel template for ${options.table}...`)
      generateExcelTemplate(options.table, outputDir)
      console.log('✅ Template generated successfully!')
    }
  } catch (error) {
    console.error(
      '❌ Template generation failed:',
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }
}

// Run the script
main()
