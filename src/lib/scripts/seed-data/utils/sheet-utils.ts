import fs from 'fs'
import path from 'path'
import ExcelJS from 'exceljs'
import { z } from 'zod'

// =================================================================
// ENUM AND SCHEMA DEFINITIONS
// =================================================================

/**
 * Parses a PostgreSQL ENUM definition from a SQL string.
 * @param sqlContent The content of the SQL file.
 * @returns A map where keys are ENUM type names and values are arrays of strings.
 */
const parseEnumsFromSql = (sqlContent: string): Map<string, string[]> => {
  const enumMap = new Map<string, string[]>()
  const enumRegex = /CREATE TYPE (\w+) AS ENUM \(([\s\S]+?)\);/g

  let match
  while ((match = enumRegex.exec(sqlContent)) !== null) {
    const typeName = match[1]
    const values = match[2].split(',').map((v) => v.trim().replace(/'/g, ''))
    enumMap.set(typeName, values)
  }
  return enumMap
}

// Read the DB schema and parse ENUMs
const schemaPath = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '01_db.sql',
)
const schemaSql = fs.readFileSync(schemaPath, 'utf-8')
const ENUMS = parseEnumsFromSql(schemaSql)

// Helper to create a Zod enum from our parsed ENUMs
const getZodEnum = <T extends string>(typeName: T) => {
  const values = ENUMS.get(typeName)
  if (!values) {
    throw new Error(`Enum type "${typeName}" not found in schema.`)
  }
  // Zod enums require at least one value.
  if (values.length === 0) {
    return z.string() as z.ZodString
  }
  return z.enum(values as [string, ...string[]])
}

// Validation Schemas using Zod
const StringArray = z
  .string()
  .transform((val) => val.split(',').map((s) => s.trim()))
  .nullable()

const TargetSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().nullable(),
  application_url: z.string().url(),
  application_email: z.string().email().nullable(),
  submission_type: getZodEnum('submission_type').nullable(),
  stage_focus: StringArray,
  industry_focus: StringArray,
  region_focus: StringArray,
  form_complexity: getZodEnum('form_complexity').nullable(),
  question_count_range: getZodEnum('question_count_range').nullable(),
  required_documents: StringArray,
  tags: StringArray,
  notes: z.string().nullable(),
  visibility_level: getZodEnum('permission_level').default('FREE'),
})

const AngelSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().nullable(),
  linkedin: z.string().url().nullable(),
  twitter: z.string().url().nullable(),
  personal_website: z.string().url().nullable(),
  location: z.string().nullable(),
  bio: z.string().nullable(),
  check_size: getZodEnum('check_size_range').nullable(),
  stage_focus: StringArray,
  industry_focus: StringArray,
  region_focus: StringArray,
  investment_approach: getZodEnum('investment_approach').nullable(),
  previous_exits: StringArray,
  domain_expertise: StringArray,
  response_time: getZodEnum('response_time').nullable(),
  submission_type: getZodEnum('submission_type').default('email'),
  application_url: z.string().url().nullable(),
  application_email: z.string().email().nullable(),
  form_complexity: getZodEnum('form_complexity').nullable(),
  required_documents: StringArray,
  tags: StringArray,
  notable_investments: StringArray,
  is_active: z.boolean().default(true),
  notes: z.string().nullable(),
  visibility_level: getZodEnum('permission_level').default('FREE'),
})

const AcceleratorSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().nullable(),
  application_url: z.string().url().nullable(),
  application_email: z.string().email().nullable(),
  submission_type: getZodEnum('submission_type').default('form'),
  program_type: getZodEnum('program_type').nullable(),
  program_duration: getZodEnum('program_duration').nullable(),
  location: z.string().nullable(),
  is_remote_friendly: z.boolean().default(false),
  batch_size: getZodEnum('batch_size').nullable(),
  batches_per_year: z.number().int().nullable(),
  next_application_deadline: z.date().nullable(),
  stage_focus: StringArray,
  industry_focus: StringArray,
  region_focus: StringArray,
  equity_taken: getZodEnum('equity_range').nullable(),
  funding_provided: getZodEnum('funding_range').nullable(),
  acceptance_rate: getZodEnum('acceptance_rate').nullable(),
  form_complexity: getZodEnum('form_complexity').nullable(),
  required_documents: StringArray,
  program_fee: z.number().nullable(),
  is_active: z.boolean().default(true),
  tags: StringArray,
  notes: z.string().nullable(),
  visibility_level: getZodEnum('permission_level').default('FREE'),
})

// Exporting record types from schemas
export type TargetRecord = z.infer<typeof TargetSchema>
export type AngelRecord = z.infer<typeof AngelSchema>
export type AcceleratorRecord = z.infer<typeof AcceleratorSchema>

const targetArrayKeys = new Set([
  'stage_focus',
  'industry_focus',
  'region_focus',
  'required_documents',
  'tags',
])
const angelArrayKeys = new Set([
  'stage_focus',
  'industry_focus',
  'region_focus',
  'previous_exits',
  'domain_expertise',
  'required_documents',
  'tags',
  'notable_investments',
])
const acceleratorArrayKeys = new Set([
  'stage_focus',
  'industry_focus',
  'region_focus',
  'required_documents',
  'tags',
])

const ARRAY_KEYS_MAP = {
  targets: targetArrayKeys,
  angels: angelArrayKeys,
  accelerators: acceleratorArrayKeys,
}

const TABLE_CONFIGS = {
  targets: {
    schema: TargetSchema,
    headers: [
      { header: 'name', key: 'name', type: null },
      { header: 'website', key: 'website', type: null },
      { header: 'application_url', key: 'application_url', type: null },
      { header: 'application_email', key: 'application_email', type: null },
      {
        header: 'submission_type',
        key: 'submission_type',
        type: 'submission_type',
      },
      { header: 'stage_focus', key: 'stage_focus', type: 'investment_stage' },
      {
        header: 'industry_focus',
        key: 'industry_focus',
        type: 'industry_type',
      },
      { header: 'region_focus', key: 'region_focus', type: 'region_type' },
      {
        header: 'form_complexity',
        key: 'form_complexity',
        type: 'form_complexity',
      },
      {
        header: 'question_count_range',
        key: 'question_count_range',
        type: 'question_count_range',
      },
      {
        header: 'required_documents',
        key: 'required_documents',
        type: 'required_document_type',
      },
      { header: 'tags', key: 'tags', type: null }, // Free text
      { header: 'notes', key: 'notes', type: null },
      {
        header: 'visibility_level',
        key: 'visibility_level',
        type: 'permission_level',
      },
    ],
  },
  angels: {
    schema: AngelSchema,
    headers: [
      { header: 'first_name', key: 'first_name', type: null },
      { header: 'last_name', key: 'last_name', type: null },
      { header: 'email', key: 'email', type: null },
      { header: 'linkedin', key: 'linkedin', type: null },
      { header: 'twitter', key: 'twitter', type: null },
      { header: 'personal_website', key: 'personal_website', type: null },
      { header: 'location', key: 'location', type: null },
      { header: 'bio', key: 'bio', type: null },
      { header: 'check_size', key: 'check_size', type: 'check_size_range' },
      { header: 'stage_focus', key: 'stage_focus', type: 'investment_stage' },
      {
        header: 'industry_focus',
        key: 'industry_focus',
        type: 'industry_type',
      },
      { header: 'region_focus', key: 'region_focus', type: 'region_type' },
      {
        header: 'investment_approach',
        key: 'investment_approach',
        type: 'investment_approach',
      },
      { header: 'previous_exits', key: 'previous_exits', type: null },
      { header: 'domain_expertise', key: 'domain_expertise', type: null },
      { header: 'response_time', key: 'response_time', type: 'response_time' },
      {
        header: 'submission_type',
        key: 'submission_type',
        type: 'submission_type',
      },
      { header: 'application_url', key: 'application_url', type: null },
      { header: 'application_email', key: 'application_email', type: null },
      {
        header: 'form_complexity',
        key: 'form_complexity',
        type: 'form_complexity',
      },
      {
        header: 'required_documents',
        key: 'required_documents',
        type: 'required_document_type',
      },
      { header: 'tags', key: 'tags', type: null },
      { header: 'notable_investments', key: 'notable_investments', type: null },
      { header: 'is_active', key: 'is_active', type: null },
      { header: 'notes', key: 'notes', type: null },
      {
        header: 'visibility_level',
        key: 'visibility_level',
        type: 'permission_level',
      },
    ],
  },
  accelerators: {
    schema: AcceleratorSchema,
    headers: [
      { header: 'name', key: 'name', type: null },
      { header: 'website', key: 'website', type: null },
      { header: 'application_url', key: 'application_url', type: null },
      { header: 'application_email', key: 'application_email', type: null },
      {
        header: 'submission_type',
        key: 'submission_type',
        type: 'submission_type',
      },
      { header: 'program_type', key: 'program_type', type: 'program_type' },
      {
        header: 'program_duration',
        key: 'program_duration',
        type: 'program_duration',
      },
      { header: 'location', key: 'location', type: null },
      { header: 'is_remote_friendly', key: 'is_remote_friendly', type: null },
      { header: 'batch_size', key: 'batch_size', type: 'batch_size' },
      { header: 'batches_per_year', key: 'batches_per_year', type: null },
      {
        header: 'next_application_deadline',
        key: 'next_application_deadline',
        type: null,
      },
      { header: 'stage_focus', key: 'stage_focus', type: 'investment_stage' },
      {
        header: 'industry_focus',
        key: 'industry_focus',
        type: 'industry_type',
      },
      { header: 'region_focus', key: 'region_focus', type: 'region_type' },
      { header: 'equity_taken', key: 'equity_taken', type: 'equity_range' },
      {
        header: 'funding_provided',
        key: 'funding_provided',
        type: 'funding_range',
      },
      {
        header: 'acceptance_rate',
        key: 'acceptance_rate',
        type: 'acceptance_rate',
      },
      {
        header: 'form_complexity',
        key: 'form_complexity',
        type: 'form_complexity',
      },
      {
        header: 'required_documents',
        key: 'required_documents',
        type: 'required_document_type',
      },
      { header: 'program_fee', key: 'program_fee', type: null },
      { header: 'is_active', key: 'is_active', type: null },
      { header: 'tags', key: 'tags', type: null },
      { header: 'notes', key: 'notes', type: null },
      {
        header: 'visibility_level',
        key: 'visibility_level',
        type: 'permission_level',
      },
    ],
  },
}

// =================================================================
// EXCEL TEMPLATE GENERATION
// =================================================================

/**
 * Generates an Excel template with data validation for ENUM types.
 * @param tableName The name of the table (e.g., 'targets').
 * @param outputDir The directory to save the template in.
 */
export async function generateExcelTemplate(
  tableName: keyof typeof TABLE_CONFIGS,
  outputDir: string,
): Promise<void> {
  const config = TABLE_CONFIGS[tableName]
  if (!config) {
    throw new Error(`Invalid table name: ${tableName}`)
  }

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(`${tableName} template`)
  const validationSheet = workbook.addWorksheet('ValidationData')
  validationSheet.state = 'hidden'
  const arrayKeys = ARRAY_KEYS_MAP[tableName]

  // Add headers
  worksheet.columns = config.headers.map((h) => ({
    header: h.header,
    key: h.key,
    width: 25,
  }))
  worksheet.getRow(1).font = { bold: true }

  // Add data validation for ENUM columns
  config.headers.forEach((col, colIndex) => {
    if (col.type) {
      const enumValues = ENUMS.get(col.type)
      if (enumValues && enumValues.length > 0) {
        const isArray = arrayKeys.has(col.key)

        // Write enum values to a column in the hidden validation sheet
        const validationColumn = colIndex + 1
        enumValues.forEach((value, rowIndex) => {
          validationSheet.getCell(rowIndex + 1, validationColumn).value = value
        })

        // Create a formula that references the cells in the hidden sheet
        const range = `${validationSheet.name}!$${validationSheet.getColumn(validationColumn).letter}$1:$${validationSheet.getColumn(validationColumn).letter}$${enumValues.length}`

        // Apply validation to all cells in this column from row 2 downwards
        for (let i = 2; i <= 1000; i++) {
          worksheet.getCell(i, colIndex + 1).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [range],
            showErrorMessage: !isArray,
            errorStyle: isArray ? 'information' : 'stop',
            errorTitle: 'Invalid Value',
            error: isArray
              ? 'You can enter multiple values separated by commas. The list is a guide for available options.'
              : `Please select a value from the dropdown list.`,
          }
        }
      }
    }
  })

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Write the file
  const filePath = path.join(outputDir, `${tableName}-template.xlsx`)
  await workbook.xlsx.writeFile(filePath)
}

// =================================================================
// EXCEL PARSING AND TRANSFORMATION
// =================================================================

export interface ParsedSheetData<T> {
  data: T[]
  errors: { row: number; field: string; message: string }[]
}

/**
 * Parses an Excel file and validates it against a Zod schema.
 * @param filePath The path to the Excel file.
 * @param tableName The name of the table to identify the schema.
 * @returns An object containing the parsed data and any validation errors.
 */
export async function parseExcel<T>(
  filePath: string,
  tableName: keyof typeof TABLE_CONFIGS,
): Promise<ParsedSheetData<T>> {
  const config = TABLE_CONFIGS[tableName]
  if (!config) {
    throw new Error(`Invalid table name for parsing: ${tableName}`)
  }

  const { schema } = config
  const errors: { row: number; field: string; message: string }[] = []
  const data: T[] = []

  if (!fs.existsSync(filePath)) {
    errors.push({
      row: 0,
      field: 'file',
      message: `File not found: ${filePath}`,
    })
    return { data, errors }
  }

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const worksheet = workbook.getWorksheet(1) // Get the first worksheet

  if (!worksheet) {
    errors.push({
      row: 0,
      field: 'file',
      message: 'No worksheet found in the file.',
    })
    return { data, errors }
  }

  const headerRow = worksheet.getRow(1)
  const headers = headerRow.values as string[]
  headers.shift() // Remove the first empty element if it exists from exceljs

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // Skip header row

    const rowData: Record<string, string | number | boolean | Date | null> = {}
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1]
      if (header) {
        const cellValue = cell.value
        if (cellValue === null || cellValue === undefined) {
          rowData[header] = null
        } else if (
          typeof cellValue === 'string' ||
          typeof cellValue === 'number' ||
          typeof cellValue === 'boolean' ||
          cellValue instanceof Date
        ) {
          rowData[header] = cellValue
        } else if (typeof cellValue === 'object' && 'text' in cellValue) {
          rowData[header] = (cellValue as { text: string }).text
        } else {
          rowData[header] = cell.text
        }
      }
    })

    const parsed = schema.safeParse(rowData)
    if (parsed.success) {
      data.push(parsed.data as T)
    } else {
      parsed.error.issues.forEach((err: z.ZodIssue) => {
        errors.push({
          row: rowNumber,
          field: err.path.join('.'),
          message: err.message,
        })
      })
    }
  })

  return { data, errors }
}
