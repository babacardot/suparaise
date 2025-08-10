import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
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

// Upsert batch function with conflict handling
export async function upsertBatch(
  tableName: 'targets' | 'angels' | 'accelerators',
  data: Record<string, unknown>[],
  conflictColumn: string,
  batchSize: number = 500, // Smaller batch size for upserts
): Promise<{ success: number; errors: string[] }> {
  const client = createDbClient()
  let successCount = 0
  const errors: string[] = []

  console.log(
    `Starting batch upsert for ${tableName} with ${data.length} records on conflict column "${conflictColumn}"`,
  )

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(data.length / batchSize)

    console.log(
      `Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`,
    )

    try {
      const { error, data } = await client
        .from(tableName)
        .upsert(batch, { onConflict: conflictColumn, defaultToNull: false })
        .select()

      if (error) {
        const errorMsg = `Batch ${batchNumber} failed: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      } else {
        const recordCount = data?.length || 0
        successCount += recordCount
        console.log(
          `✅ Batch ${batchNumber}/${totalBatches} upserted successfully (${recordCount} records)`,
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

// Build ENUM values from local SQL schema to stay perfectly in sync with recent changes
// Falls back to generated types if local schema cannot be read
const parseEnumsFromSql = (sqlContent: string): Record<string, string[]> => {
  const enumMap: Record<string, string[]> = {}
  const enumRegex = /CREATE TYPE (\w+) AS ENUM \(([\s\S]+?)\);/g
  let match: RegExpExecArray | null
  while ((match = enumRegex.exec(sqlContent)) !== null) {
    const typeName = match[1]
    const valuesText = match[2]
    const values = valuesText
      .split(',')
      .map((v) => v.trim().replace(/^'|'$/g, '')) // Remove surrounding quotes
      .filter(Boolean)
    enumMap[typeName] = values
  }
  return enumMap
}

const buildEnumValues = (): Record<string, readonly string[]> => {
  try {
    const schemaPath = path.join(process.cwd(), 'supabase', 'migrations', '01_db.sql')
    const sql = fs.readFileSync(schemaPath, 'utf-8')
    const parsed = parseEnumsFromSql(sql)
    // Freeze arrays to mimic readonly behavior and avoid accidental mutation
    const frozen: Record<string, readonly string[]> = {}
    for (const [k, v] of Object.entries(parsed)) frozen[k] = Object.freeze(v)
    return frozen
  } catch {
    // Fallback to generated constants (may be out of date if types not regenerated)
    return (Constants?.public?.Enums as unknown as Record<string, readonly string[]>) || {}
  }
}

export const ENUM_VALUES = buildEnumValues()

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
