import 'dotenv/config'
import { getStartupDataForUser } from '../lib/api/supabase/api.startup'
import { getTargets } from '../lib/api/supabase/api.targets'
import { runFormFillingAgent } from './runner'

function getUserIdFromArgs(): string | null {
  const arg = process.argv.find((arg) => arg.startsWith('--userId='))
  if (!arg) return null
  return arg.split('=')[1]
}

async function main() {
  console.log('🚀 Starting Suparaise agent...')

  const userId = getUserIdFromArgs()
  if (!userId) {
    console.error('❌ Error: Missing user ID.')
    console.log('   Please provide a user ID with the --userId flag.')
    console.log('   Example: bun run agent:run --userId=<your-uuid>')
    process.exit(1)
  }

  const startupData = await getStartupDataForUser(userId)
  if (!startupData) {
    console.log(`Could not fetch startup data for user ${userId}. Exiting.`)
    return
  }

  const targets = await getTargets()
  if (!targets || targets.length === 0) {
    console.log('No VC targets found in the database. Exiting.')
    return
  }

  // For now, let's just run the agent for the first target in our list.
  const target = targets[0]

  console.log(`\n🎯 Targeting: ${target.name}`)
  console.log(`📝 Using data for startup: ${startupData.name}`)

  try {
    const finalResult = await runFormFillingAgent(
      startupData,
      target.application_url,
    )
    console.log('\n--- FINAL RESULT ---')
    console.log(finalResult)
    console.log('--------------------')
  } catch {
    console.error(`\n\nFailed to complete agent run for ${target.name}.`)
  }

  console.log('\n👋 Suparaise agent run finished.')
}

main().catch((error) => {
  console.error('\nAn unexpected error occurred in the main process:', error)
  process.exit(1)
})
