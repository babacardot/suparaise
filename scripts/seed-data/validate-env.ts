#!/usr/bin/env bun
import { testConnection } from './utils/db-utils'

// Environment validation script for Suparaise seed data tools
async function validateEnvironment() {
  console.log('🔍 Validating environment for Suparaise seed data scripts')
  console.log('='.repeat(60))

  const errors: string[] = []
  const warnings: string[] = []

  // Check required environment variables
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  console.log('\n📋 Checking environment variables...')

  for (const [varName, value] of Object.entries(requiredVars)) {
    if (!value) {
      errors.push(`❌ Missing: ${varName}`)
    } else {
      console.log(`✅ Found: ${varName}`)
    }
  }

  // Test database connection if we have the required vars
  if (
    requiredVars.NEXT_PUBLIC_SUPABASE_URL &&
    requiredVars.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.log('\n🔌 Testing database connection...')
    try {
      const connectionOk = await testConnection()
      if (connectionOk) {
        console.log('✅ Database connection successful')
      } else {
        errors.push('❌ Database connection failed')
      }
    } catch (error) {
      errors.push(
        `❌ Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  // Display results
  console.log('\n' + '='.repeat(60))
  console.log('📊 Validation Results:')

  if (errors.length === 0) {
    console.log('🎉 All checks passed! You can run the seeding scripts.')
    console.log('\nAvailable commands:')
    console.log('  bun run seed:bulk        # Generate bulk sample data')
    console.log('  bun run seed:templates   # Generate CSV templates')
    console.log('  bun run seed:import      # Import CSV data')
    return true
  } else {
    console.log('🚨 Issues found:')
    errors.forEach((error) => console.log(`  ${error}`))

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      warnings.forEach((warning) => console.log(`  ${warning}`))
    }

    console.log('\n🔧 To fix these issues:')
    console.log('1. Create a .env.local file in your project root')
    console.log('2. Add the following variables:')
    console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
    console.log('3. Get these values from your Supabase dashboard:')
    console.log('   - Project URL: Settings > API')
    console.log('   - Service Role Key: Settings > API (keep this secret!)')
    return false
  }
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    printHelp()
    return null
  }

  return {}
}

function printHelp() {
  console.log(`
Environment Validation Tool for Suparaise

This script validates that your environment is properly configured
for running the seed data scripts.

Usage: bun run validate-env.ts [options]

Options:
  --help       Show this help message

What this script checks:
  ✓ Required environment variables are present
  ✓ Database connection works
  ✓ Supabase client can authenticate

Required environment variables:
  NEXT_PUBLIC_SUPABASE_URL     - Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY    - Your Supabase service role key

Example:
  bun run validate-env.ts
`)
}

// Main execution
async function main() {
  const options = parseArguments()

  if (!options) {
    process.exit(1)
  }

  try {
    const success = await validateEnvironment()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error(
      '❌ Validation failed:',
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }
}

// Run the script
main()
