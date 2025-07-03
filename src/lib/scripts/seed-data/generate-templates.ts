#!/usr/bin/env bun
import { generateCSVTemplate, generateExcelTemplate } from './utils/csv-utils'
import path from 'path'

// Main function to generate all templates
function generateAllTemplates(format: 'csv' | 'excel' = 'csv') {
  const outputDir = path.join(__dirname, 'templates')

  console.log(
    `🚀 Generating ${format.toUpperCase()} templates for Suparaise data seeding`,
  )
  console.log(`📁 Output directory: ${outputDir}`)
  console.log('─'.repeat(50))

  // Generate templates for all table types
  const tables = ['targets', 'angels', 'accelerators']

  tables.forEach((table) => {
    console.log(`📝 Generating ${format} template for ${table}...`)
    if (format === 'excel') {
      generateExcelTemplate(table, outputDir)
    } else {
      generateCSVTemplate(table, outputDir)
    }
  })

  console.log('\n✅ All templates generated successfully!')
  console.log('\nNext steps:')
  if (format === 'excel') {
    console.log('1. Open the Excel template files and fill in your data')
    console.log('2. Save as .xlsx or export as CSV')
    console.log('3. Use csv-import.ts to load the data into Supabase')
  } else {
    console.log('1. Open the template files in Excel or Google Sheets')
    console.log('2. Fill in your data following the column format')
    console.log('3. Export as CSV and use csv-import.ts to load the data')
  }
  console.log('\nTemplate files created:')
  tables.forEach((table) => {
    const extension = format === 'excel' ? 'xlsx' : 'csv'
    console.log(
      `  📄 ${path.join(outputDir, `${table}-template.${extension}`)}`,
    )
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
    table?: string
    all?: boolean
    format: 'csv' | 'excel'
  } = {
    format: 'csv', // Default to CSV
  }

  // Check for format argument
  const formatIndex = args.indexOf('--format')
  if (formatIndex !== -1 && args[formatIndex + 1]) {
    const formatArg = args[formatIndex + 1].toLowerCase()
    if (formatArg === 'excel' || formatArg === 'xlsx') {
      result.format = 'excel'
    } else if (formatArg === 'csv') {
      result.format = 'csv'
    } else {
      console.error(`❌ Invalid format: ${formatArg}. Use 'csv' or 'excel'`)
      return null
    }
  }

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

    result.table = table
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
  --table <name>     Generate template for specific table (targets, angels, accelerators)
  --format <format>  Output format: csv or excel (default: csv)
  --help            Show this help message

Examples:
  bun run generate-templates.ts                           # Generate all CSV templates
  bun run generate-templates.ts --format excel            # Generate all Excel templates
  bun run generate-templates.ts --table targets           # Generate only targets CSV template
  bun run generate-templates.ts --table targets --format excel  # Generate targets Excel template

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
      generateAllTemplates(options.format)
    } else if (options.table) {
      const outputDir = path.join(__dirname, 'templates')
      console.log(
        `📝 Generating ${options.format} template for ${options.table}...`,
      )
      if (options.format === 'excel') {
        generateExcelTemplate(options.table, outputDir)
      } else {
        generateCSVTemplate(options.table, outputDir)
      }
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
