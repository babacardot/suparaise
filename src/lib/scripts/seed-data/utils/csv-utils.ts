import fs from 'fs'
import path from 'path'

export interface ParsedCSVData {
  headers: string[]
  rows: Record<string, string>[]
  errors: string[]
}

// Parse CSV file and return structured data
export function parseCSV(filePath: string): ParsedCSVData {
  const errors: string[] = []

  if (!fs.existsSync(filePath)) {
    errors.push(`File not found: ${filePath}`)
    return { headers: [], rows: [], errors }
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const lines = fileContent.split('\n').filter((line) => line.trim())

    if (lines.length === 0) {
      errors.push('File is empty')
      return { headers: [], rows: [], errors }
    }

    // Parse headers
    const headers = parseCSVLine(lines[0])

    // Parse data rows
    const rows: Record<string, string>[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])

      if (values.length !== headers.length) {
        errors.push(
          `Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`,
        )
        continue
      }

      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || ''
      })
      rows.push(row)
    }

    return { headers, rows, errors }
  } catch (error) {
    errors.push(
      `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    return { headers: [], rows: [], errors }
  }
}

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

// Database record types - matching 01_db.sql schema exactly
export interface TargetRecord {
  name: string
  website: string | null
  application_url: string
  application_email: string | null
  submission_type: 'form' | 'email' | 'other'
  stage_focus:
    | (
        | 'Pre-seed'
        | 'Seed'
        | 'Series A'
        | 'Series B'
        | 'Series C'
        | 'Growth'
        | 'All'
      )[]
    | null
  industry_focus: string[] | null // Using string[] as industry_type has many values
  region_focus: string[] | null // Using string[] as region_type has many values
  form_complexity: 'simple' | 'standard' | 'comprehensive' | null
  question_count_range: '1-5' | '6-10' | '11-20' | '21+' | null
  required_documents:
    | (
        | 'pitch_deck'
        | 'video'
        | 'financial_projections'
        | 'business_plan'
        | 'traction_data'
      )[]
    | null
  notes: string | null
}

export interface AngelRecord {
  first_name: string
  last_name: string
  email: string | null
  linkedin: string | null
  twitter: string | null
  personal_website: string | null
  location: string | null
  bio: string | null
  check_size:
    | '1K-10K'
    | '10K-25K'
    | '25K-50K'
    | '50K-100K'
    | '100K-250K'
    | '250K-500K'
    | '500K-1M'
    | '1M+'
    | null
  stage_focus:
    | (
        | 'Pre-seed'
        | 'Seed'
        | 'Series A'
        | 'Series B'
        | 'Series C'
        | 'Growth'
        | 'All'
      )[]
    | null
  industry_focus: string[] | null
  region_focus: string[] | null
  investment_approach:
    | 'hands-on'
    | 'passive'
    | 'advisory'
    | 'network-focused'
    | null
  previous_exits: string[] | null
  domain_expertise: string[] | null
  response_time:
    | '1-3 days'
    | '1 week'
    | '2 weeks'
    | '1 month'
    | '2+ months'
    | null
  submission_type: 'form' | 'email' | 'other'
  application_url: string | null
  application_email: string | null
  form_complexity: 'simple' | 'standard' | 'comprehensive' | null
  required_documents:
    | (
        | 'pitch_deck'
        | 'video'
        | 'financial_projections'
        | 'business_plan'
        | 'traction_data'
      )[]
    | null
  notable_investments: string[] | null
  is_active: boolean
  notes: string | null
}

export interface AcceleratorRecord {
  name: string
  website: string | null
  application_url: string | null
  application_email: string | null
  submission_type: 'form' | 'email' | 'other'
  program_type: 'in-person' | 'remote' | 'hybrid' | null
  program_duration:
    | '3 months'
    | '6 months'
    | '12 months'
    | 'ongoing'
    | 'variable'
    | null
  location: string | null
  is_remote_friendly: boolean
  batch_size: '1-10' | '11-20' | '21-50' | '51-100' | '100+' | null
  batches_per_year: number | null
  next_application_deadline: string | null // DATE field, will be string in CSV
  stage_focus:
    | (
        | 'Pre-seed'
        | 'Seed'
        | 'Series A'
        | 'Series B'
        | 'Series C'
        | 'Growth'
        | 'All'
      )[]
    | null
  industry_focus: string[] | null
  region_focus: string[] | null
  equity_taken: '0%' | '1-3%' | '4-6%' | '7-10%' | '10%+' | 'variable' | null
  funding_provided:
    | '0-25K'
    | '25K-50K'
    | '50K-100K'
    | '100K-250K'
    | '250K-500K'
    | '500K+'
    | null
  acceptance_rate: '<1%' | '1-5%' | '6-10%' | '11-20%' | '20%+' | null
  form_complexity: 'simple' | 'standard' | 'comprehensive' | null
  required_documents:
    | (
        | 'pitch_deck'
        | 'video'
        | 'financial_projections'
        | 'business_plan'
        | 'traction_data'
      )[]
    | null
  program_fee: number | null
  is_active: boolean
  notes: string | null
}

// Transform CSV data to database format using typed interfaces
export function transformToTargetData(
  rows: Record<string, string>[],
): TargetRecord[] {
  return rows.map((row) => ({
    name: row.name || '',
    website: row.website || null,
    application_url: row.application_url || '',
    application_email: row.application_email || null,
    submission_type:
      (row.submission_type as TargetRecord['submission_type']) || 'form',
    stage_focus: parseArrayField(
      row.stage_focus,
    ) as TargetRecord['stage_focus'],
    industry_focus: parseArrayField(row.industry_focus),
    region_focus: parseArrayField(row.region_focus),
    form_complexity:
      (row.form_complexity as TargetRecord['form_complexity']) || null,
    question_count_range:
      (row.question_count_range as TargetRecord['question_count_range']) ||
      null,
    required_documents: parseArrayField(
      row.required_documents,
    ) as TargetRecord['required_documents'],
    notes: row.notes || null,
  }))
}

export function transformToAngelData(
  rows: Record<string, string>[],
): AngelRecord[] {
  return rows.map((row) => ({
    first_name: row.first_name || '',
    last_name: row.last_name || '',
    email: row.email || null,
    linkedin: row.linkedin || null,
    twitter: row.twitter || null,
    personal_website: row.personal_website || null,
    location: row.location || null,
    bio: row.bio || null,
    check_size: (row.check_size as AngelRecord['check_size']) || null,
    stage_focus: parseArrayField(row.stage_focus) as AngelRecord['stage_focus'],
    industry_focus: parseArrayField(row.industry_focus),
    region_focus: parseArrayField(row.region_focus),
    investment_approach:
      (row.investment_approach as AngelRecord['investment_approach']) || null,
    previous_exits: parseArrayField(row.previous_exits),
    domain_expertise: parseArrayField(row.domain_expertise),
    response_time: (row.response_time as AngelRecord['response_time']) || null,
    submission_type:
      (row.submission_type as AngelRecord['submission_type']) || 'email',
    application_url: row.application_url || null,
    application_email: row.application_email || null,
    form_complexity:
      (row.form_complexity as AngelRecord['form_complexity']) || null,
    required_documents: parseArrayField(
      row.required_documents,
    ) as AngelRecord['required_documents'],
    notable_investments: parseArrayField(row.notable_investments),
    is_active: row.is_active === 'false' ? false : true,
    notes: row.notes || null,
  }))
}

export function transformToAcceleratorData(
  rows: Record<string, string>[],
): AcceleratorRecord[] {
  return rows.map((row) => ({
    name: row.name || '',
    website: row.website || null,
    application_url: row.application_url || null,
    application_email: row.application_email || null,
    submission_type:
      (row.submission_type as AcceleratorRecord['submission_type']) || 'form',
    program_type:
      (row.program_type as AcceleratorRecord['program_type']) || null,
    program_duration:
      (row.program_duration as AcceleratorRecord['program_duration']) || null,
    location: row.location || null,
    is_remote_friendly: row.is_remote_friendly === 'true',
    batch_size: (row.batch_size as AcceleratorRecord['batch_size']) || null,
    batches_per_year: row.batches_per_year
      ? parseInt(row.batches_per_year)
      : null,
    next_application_deadline: row.next_application_deadline || null,
    stage_focus: parseArrayField(
      row.stage_focus,
    ) as AcceleratorRecord['stage_focus'],
    industry_focus: parseArrayField(row.industry_focus),
    region_focus: parseArrayField(row.region_focus),
    equity_taken:
      (row.equity_taken as AcceleratorRecord['equity_taken']) || null,
    funding_provided:
      (row.funding_provided as AcceleratorRecord['funding_provided']) || null,
    acceptance_rate:
      (row.acceptance_rate as AcceleratorRecord['acceptance_rate']) || null,
    form_complexity:
      (row.form_complexity as AcceleratorRecord['form_complexity']) || null,
    required_documents: parseArrayField(
      row.required_documents,
    ) as AcceleratorRecord['required_documents'],
    program_fee: row.program_fee ? parseFloat(row.program_fee) : null,
    is_active: row.is_active === 'false' ? false : true,
    notes: row.notes || null,
  }))
}

// Parse comma-separated fields into arrays
function parseArrayField(field: string): string[] | null {
  if (!field || field.trim() === '') return null
  return field
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

// Validate required fields using the typed interfaces
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T[],
  requiredFields: (keyof T)[],
): Array<{ index: number; field: string; error: string }> {
  const errors: Array<{ index: number; field: string; error: string }> = []

  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      const fieldValue = row[field]
      if (
        !fieldValue ||
        (typeof fieldValue === 'string' && fieldValue.trim() === '')
      ) {
        errors.push({
          index: index + 1,
          field: String(field),
          error: `Required field '${String(field)}' is missing or empty`,
        })
      }
    })
  })

  return errors
}

// Generate CSV template files with exact database column names
export function generateCSVTemplate(
  tableName: string,
  outputDir: string,
): void {
  const templates = {
    targets: `name,website,application_url,application_email,submission_type,stage_focus,industry_focus,region_focus,form_complexity,question_count_range,required_documents,notes
"Example VC Fund","https://example-vc.com","https://example-vc.com/apply","apply@example-vc.com","form","Pre-seed,Seed","B2B SaaS,Fintech","North America,Europe","standard","11-20","pitch_deck,video","Focus on early-stage tech companies"`,

    angels: `first_name,last_name,email,linkedin,twitter,personal_website,location,bio,check_size,stage_focus,industry_focus,region_focus,investment_approach,previous_exits,domain_expertise,response_time,submission_type,application_url,application_email,form_complexity,required_documents,notable_investments,is_active,notes
"John","Doe","john@example.com","https://linkedin.com/in/johndoe","https://twitter.com/johndoe","https://johndoe.com","San Francisco, CA","Former founder with 2 exits","25K-50K","Pre-seed,Seed","B2B SaaS,AI/ML","North America","hands-on","Company A,Company B","Product,Marketing","1 week","email",,,"simple","pitch_deck","Unicorn Corp,Great Startup","true","Prefers warm intros"`,

    accelerators: `name,website,application_url,application_email,submission_type,program_type,program_duration,location,is_remote_friendly,batch_size,batches_per_year,next_application_deadline,stage_focus,industry_focus,region_focus,equity_taken,funding_provided,acceptance_rate,form_complexity,required_documents,program_fee,is_active,notes
"Example Accelerator","https://example-accelerator.com","https://example-accelerator.com/apply","apply@example-accelerator.com","form","hybrid","3 months","San Francisco, CA","true","11-20","2","2024-12-31","Pre-seed,Seed","B2B SaaS,AI/ML","Global","4-6%","50K-100K","1-5%","standard","pitch_deck,video","0","true","Rolling applications accepted"`,
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const template = templates[tableName as keyof typeof templates]
  if (template) {
    const filePath = path.join(outputDir, `${tableName}-template.csv`)
    fs.writeFileSync(filePath, template)
    console.log(`✅ Template created: ${filePath}`)
  } else {
    console.error(`❌ Unknown table name: ${tableName}`)
  }
}

// Write data to CSV file
export function writeCSV(
  data: Array<Record<string, unknown>>,
  filePath: string,
): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          if (Array.isArray(value)) return `"${value.join(',')}"`
          if (typeof value === 'string' && value.includes(','))
            return `"${value}"`
          return value.toString()
        })
        .join(','),
    ),
  ].join('\n')

  fs.writeFileSync(filePath, csvContent)
  console.log(`✅ CSV written: ${filePath}`)
}

// Validation functions using the typed interfaces
export function validateTargetRecord(record: TargetRecord): string[] {
  const errors: string[] = []

  if (!record.name?.trim()) errors.push('name is required')
  if (!record.application_url?.trim())
    errors.push('application_url is required')

  return errors
}

export function validateAngelRecord(record: AngelRecord): string[] {
  const errors: string[] = []

  if (!record.first_name?.trim()) errors.push('first_name is required')
  if (!record.last_name?.trim()) errors.push('last_name is required')

  return errors
}

export function validateAcceleratorRecord(record: AcceleratorRecord): string[] {
  const errors: string[] = []

  if (!record.name?.trim()) errors.push('name is required')

  return errors
}
