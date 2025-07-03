import { createClient } from '@supabase/supabase-js'
import { Constants } from '@/lib/types/database'

// Simple database client setup
export const createDbClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    )
  }

  // Use untyped client to avoid complex type issues
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Simple batch insert function that works reliably
export async function insertBatch(
  tableName: 'targets' | 'angels' | 'accelerators',
  data: Record<string, unknown>[],
  batchSize: number = 1000,
): Promise<{ success: number; errors: string[] }> {
  const client = createDbClient()
  let successCount = 0
  const errors: string[] = []

  console.log(
    `Starting batch insert for ${tableName} with ${data.length} records`,
  )

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(data.length / batchSize)

    console.log(
      `Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`,
    )

    try {
      const { error } = await client.from(tableName).insert(batch)

      if (error) {
        const errorMsg = `Batch ${batchNumber} failed: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      } else {
        successCount += batch.length
        console.log(
          `✅ Batch ${batchNumber}/${totalBatches} inserted successfully (${batch.length} records)`,
        )
      }
    } catch (err) {
      const errorMsg = `Batch ${batchNumber} failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error(`❌ ${errorMsg}`)
    }
  }

  return { success: successCount, errors }
}

// Use enum values directly from the generated database types (now always in sync!)
export const ENUM_VALUES = Constants.public.Enums

export function validateEnumValue(
  enumType: keyof typeof ENUM_VALUES,
  value: string,
): boolean {
  return ENUM_VALUES[enumType].includes(value as never)
}

export function validateEnumArray(
  enumType: keyof typeof ENUM_VALUES,
  values: string[],
): string[] {
  return values.filter((value) => !validateEnumValue(enumType, value))
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = createDbClient()
    const { error } = await client.from('targets').select('id').limit(1)

    if (error) {
      console.error('Database connection test failed:', error.message)
      return false
    }

    console.log('✅ Database connection successful')
    return true
  } catch (err) {
    console.error(
      'Database connection test failed:',
      err instanceof Error ? err.message : 'Unknown error',
    )
    return false
  }
}
