#!/usr/bin/env bun
import { generateCSVTemplate } from './utils/csv-utils'
import path from 'path'

// Main function to generate all templates
function generateAllTemplates() {
  const outputDir = path.join(__dirname, 'templates')

  console.log('🚀 Generating CSV templates for Suparaise data seeding')
  console.log(`📁 Output directory: ${outputDir}`)
  console.log('─'.repeat(50))

  // Generate templates for all table types
  const tables = ['targets', 'angels', 'accelerators']

  tables.forEach((table) => {
    console.log(`📝 Generating template for ${table}...`)
    generateCSVTemplate(table, outputDir)
  })

  console.log('\n✅ All templates generated successfully!')
  console.log('\nNext steps:')
  console.log('1. Open the template files in Excel or Google Sheets')
  console.log('2. Fill in your data following the column format')
  console.log('3. Export as CSV and use csv-import.ts to load the data')
  console.log('\nTemplate files created:')
  tables.forEach((table) => {
    console.log(`  📄 ${path.join(outputDir, `${table}-template.csv`)}`)
  })
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    printHelp()
    return null
  }

  // If specific table is requested
  if (args.includes('--table')) {
    const tableIndex = args.indexOf('--table') + 1
    const table = args[tableIndex]

    if (!table || !['targets', 'angels', 'accelerators'].includes(table)) {
      console.error(
        '❌ Invalid table name. Valid options: targets, angels, accelerators',
      )
      return null
    }

    return { table }
  }

  return { all: true }
}

function printHelp() {
  console.log(`
CSV Template Generator for Suparaise

Usage: bun run generate-templates.ts [options]

Options:
  --table <name>    Generate template for specific table (targets, angels, accelerators)
  --help           Show this help message

Examples:
  bun run generate-templates.ts                    # Generate all templates
  bun run generate-templates.ts --table targets    # Generate only targets template

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
      console.log(`📝 Generating template for ${options.table}...`)
      generateCSVTemplate(options.table, outputDir)
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
