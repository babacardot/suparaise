import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface IngestRequest {
  content: string
  websiteUrl?: string
  context?: {
    companyName?: string
  }
}

interface IngestData {
  // Company Information
  name?: string
  website?: string
  industry?: string
  location?: string
  foundedYear?: number
  descriptionShort?: string
  descriptionMedium?: string
  descriptionLong?: string

  // Fundraising Information
  fundingRound?: string
  investmentInstrument?: string
  fundingAmountSought?: number
  preMoneyValuation?: number
  revenueModel?: string
  currentRunway?: number

  // Business Metrics
  mrr?: number
  arr?: number
  employeeCount?: number
  tractionSummary?: string
  marketSummary?: string
  keyCustomers?: string
  competitors?: string

  // Additional Information
  operatingCountries?: string[]
  legalStructure?: string
  isIncorporated?: boolean
  incorporationCountry?: string
  incorporationCity?: string
}

const extractStartupData = async (
  content: string,
  websiteUrl?: string,
  context?: { companyName?: string },
): Promise<IngestData> => {
  const prompt = `You are an expert at extracting comprehensive startup information from fundraising documents, applications, and business content. Analyze the following content and extract all relevant startup data for a fundraising application.

${context?.companyName ? `Expected Company Name: ${context.companyName}` : ''}
${websiteUrl ? `Website URL: ${websiteUrl}` : ''}

Content to analyze:
${content}

Extract the following information and return it as a JSON object with these exact fields (use null for any field you cannot determine confidently):

{
  "name": "Company name (string or null)",
  "website": "Company website URL (string or null)",
  "industry": "Primary industry/sector (string or null)",
  "location": "Primary location/headquarters (string or null)",
  "foundedYear": "Year founded (number or null)",
  "descriptionShort": "One-liner description under 100 characters (string or null)",
  "descriptionMedium": "Elevator pitch under 300 characters (string or null)",
  "descriptionLong": "Detailed company description (string or null)",
  "fundingRound": "Funding round stage (string or null)",
  "investmentInstrument": "Type of investment (string or null)",
  "fundingAmountSought": "Amount seeking to raise in USD (number or null)",
  "preMoneyValuation": "Pre-money valuation in USD (number or null)",
  "revenueModel": "Revenue model type (string or null)",
  "currentRunway": "Current runway in months (number or null)",
  "mrr": "Monthly recurring revenue in USD (number or null)",
  "arr": "Annual recurring revenue in USD (number or null)",
  "employeeCount": "Number of employees (number or null)",
  "tractionSummary": "Key traction metrics and achievements (string or null)",
  "marketSummary": "Market analysis and opportunity (string or null)",
  "keyCustomers": "Notable customers and clients (string or null)",
  "competitors": "Main competitors (string or null)",
  "operatingCountries": "Countries where company operates (array of strings or null)",
  "legalStructure": "Legal structure type (string or null)",
  "isIncorporated": "Whether company is incorporated (boolean or null)",
  "incorporationCountry": "Country of incorporation (string or null)",
  "incorporationCity": "City of incorporation (string or null)"
}

Guidelines:
- RESPECT ORIGINAL CONTENT: Use existing well-written descriptions, taglines, and content as-is when they're professional and appropriate
- Be thorough but conservative - only extract information you're confident about
- For monetary amounts, convert to USD numbers without currency symbols (e.g., $1M = 1000000)
- For descriptions, preserve the original tone and language when it's professional and compelling
- Extract specific metrics like MRR/ARR, growth rates, user counts, revenue figures into appropriate fields
- Include market size, TAM/SAM, competitive advantages in market summary
- For funding round, use standard terms like "Pre-Seed", "Seed", "Series A", "Series B", etc.
- For investment instrument, use terms like "Equity", "SAFE", "Convertible Note", "Priced Round", etc.
- For revenue model, use terms like "SaaS", "Marketplace", "Freemium", "Subscription", "Transaction-based", etc.
- For legal structure, use terms like "Delaware C-Corp", "LLC", "Inc.", "Ltd.", etc.
- For industry, use categories like "SaaS", "FinTech", "HealthTech", "E-commerce", "AI/ML", "EdTech", "Agriculture", "Food & Beverage", "Logistics", "Marketplace", etc.
- Operating countries should be an array of country names
- Employee count should be the actual number or best estimate
- Current runway should be in months (e.g., 12 for 12 months)
- Look for founded year in various formats and convert to number
- For African companies, common locations include "Lagos, Nigeria", "Nairobi, Kenya", "Cape Town, South Africa", "Accra, Ghana", "Cairo, Egypt", etc.
- Extract customer names, partnerships, and validation into keyCustomers
- Extract competitor names and competitive landscape into competitors
- Be flexible with content formats - could be pitch decks, applications, business plans, etc.
- Return ONLY the JSON object, no additional text or explanations

JSON Response:`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.1, // Reduced temperature for more faithful extraction
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseContent =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response with better error handling
    try {
      const extractedData = JSON.parse(responseContent) as IngestData
      return extractedData
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', responseContent)
      console.error('Parse error:', parseError)

      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[0]) as IngestData
          return extractedData
        } catch {
          // If still fails, return empty data
        }
      }

      throw new Error('Failed to parse extracted data from AI response')
    }
  } catch (error) {
    console.error('AI extraction error:', error)
    throw new Error('Failed to extract startup data from content')
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, websiteUrl, context }: IngestRequest = await req.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 },
      )
    }

    // More lenient content validation
    if (content.trim().length < 20) {
      return NextResponse.json(
        {
          error: 'Content too short for analysis',
          details: `Content length: ${content.trim().length} characters. Minimum: 20 characters.`,
        },
        { status: 400 },
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 },
      )
    }

    // Add debug logging for content length
    console.log(`Content ingest: ${content.trim().length} characters`)
    if (websiteUrl) {
      console.log(`Website context: ${websiteUrl}`)
    }

    // Extract startup data using AI
    try {
      const extractedData = await extractStartupData(
        content.trim(),
        websiteUrl,
        context,
      )

      console.log('Successfully extracted ingest data:', {
        websiteUrl: websiteUrl || 'N/A',
        extractedFields: Object.keys(extractedData).filter((key) => {
          const value = extractedData[key as keyof IngestData]
          return value !== null && value !== undefined && value !== ''
        }),
        contentLength: content.trim().length,
      })

      return NextResponse.json({
        success: true,
        data: extractedData,
        source: 'content-analysis',
        contentLength: content.trim().length,
      })
    } catch (aiError) {
      console.error('AI extraction failed:', {
        websiteUrl: websiteUrl || 'N/A',
        contentLength: content.trim().length,
        error: aiError instanceof Error ? aiError.message : 'Unknown AI error',
      })

      return NextResponse.json(
        {
          error: 'Failed to extract startup data',
          details:
            aiError instanceof Error ? aiError.message : 'Unknown AI error',
          websiteUrl: websiteUrl || undefined,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Content ingest error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Failed to analyze content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
