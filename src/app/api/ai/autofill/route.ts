import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { LRUCache } from 'lru-cache'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// In-memory cache for scraped website content
const scrapeCache = new LRUCache<string, string>({
  max: 100, // Maximum number of websites to cache
  ttl: 1000 * 60 * 60 * 24, // Cache items for 24 hours
})

interface WebsiteAutofillRequest {
  websiteUrl: string
  context?: {
    companyName?: string
  }
}

interface AutofillData {
  name?: string
  descriptionShort?: string
  descriptionMedium?: string
  descriptionLong?: string
  industry?: string
  location?: string
  foundedYear?: number
}

const scrapeWebsite = async (url: string): Promise<string> => {
  try {
    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

    // Return cached content if available
    if (scrapeCache.has(normalizedUrl)) {
      return scrapeCache.get(normalizedUrl) as string
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua':
          '"Google Chrome";v="91", "Chromium";v="91", ";Not A Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    // Primary extraction method - improved content extraction with better preservation of meaningful content
    let textContent = html
      // Remove scripts, styles, and other non-content elements
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Convert common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '…')
      // Extract text from title and meta tags first (important content)
      .replace(/<title[^>]*>([^<]+)<\/title>/gi, ' $1 ')
      .replace(/<meta[^>]*name="description"[^>]*content="([^"]+)"/gi, ' $1 ')
      .replace(
        /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/gi,
        ' $1 ',
      )
      .replace(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/gi, ' $1 ')
      // Preserve structure with line breaks for headers and paragraphs
      .replace(
        /<\/?(h[1-6]|p|div|section|article|main|header|footer|nav|ul|ol|li)[^>]*>/gi,
        '\n',
      )
      .replace(/<br[^>]*>/gi, '\n')
      // Remove all remaining HTML tags
      .replace(/<[^>]*>/g, ' ')
      // Clean up whitespace but preserve some structure
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple newlines to double newlines
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n\s+/g, '\n') // Remove spaces after newlines
      .replace(/\s+\n/g, '\n') // Remove spaces before newlines
      .trim()

    // More selective filtering - only remove obvious navigation patterns
    // Remove standalone navigation words (not part of sentences)
    textContent = textContent
      .replace(
        /\n(home|about|contact|privacy|terms|cookies|support|help|login|signup|sign up|sign in|menu|search)\n/gi,
        '\n',
      )
      .replace(
        /^(home|about|contact|privacy|terms|cookies|support|help|login|signup|sign up|sign in|menu|search)\s/gi,
        '',
      )
      .replace(
        /\s(home|about|contact|privacy|terms|cookies|support|help|login|signup|sign up|sign in|menu|search)$/gi,
        '',
      )
      // Remove common footer patterns
      .replace(/\n(copyright|all rights reserved|©|\d{4})\s*[^\n]*\n/gi, '\n')
      .replace(
        /\n(follow us|social media|newsletter|subscribe)\s*[^\n]*\n/gi,
        '\n',
      )
      // Clean up remaining whitespace
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim()

    // If primary extraction resulted in very short content, try alternative approaches
    if (textContent.length < 100) {
      console.log(
        'Primary extraction yielded short content, trying fallback methods...',
      )

      // Fallback 1: Extract JSON-LD structured data
      const jsonLdMatches = html.match(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
      )
      let structuredData = ''
      if (jsonLdMatches) {
        jsonLdMatches.forEach((match) => {
          const jsonContent = match
            .replace(/<script[^>]*type="application\/ld\+json"[^>]*>/i, '')
            .replace(/<\/script>/i, '')
          try {
            const parsed = JSON.parse(jsonContent)
            if (parsed.name) structuredData += `COMPANY_NAME: ${parsed.name}\n`
            if (parsed.description)
              structuredData += `DESCRIPTION: ${parsed.description}\n`
            if (parsed.address)
              structuredData += `ADDRESS: ${JSON.stringify(parsed.address)}\n`
            if (parsed.foundingDate)
              structuredData += `FOUNDED: ${parsed.foundingDate}\n`
            if (parsed.industry)
              structuredData += `INDUSTRY: ${parsed.industry}\n`
            if (parsed.url) structuredData += `URL: ${parsed.url}\n`
          } catch {
            // Ignore invalid JSON
          }
        })
      }

      // Fallback 2: More aggressive meta tag extraction
      const metaExtraction = html
        .replace(/<title[^>]*>([^<]+)<\/title>/gi, 'TITLE: $1\n')
        .replace(
          /<meta[^>]*name="description"[^>]*content="([^"]+)"/gi,
          'DESCRIPTION: $1\n',
        )
        .replace(
          /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/gi,
          'OG_DESCRIPTION: $1\n',
        )
        .replace(
          /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/gi,
          'OG_TITLE: $1\n',
        )
        .replace(
          /<meta[^>]*name="keywords"[^>]*content="([^"]+)"/gi,
          'KEYWORDS: $1\n',
        )
        .replace(
          /<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/gi,
          'SITE_NAME: $1\n',
        )
        .replace(
          /<meta[^>]*name="twitter:description"[^>]*content="([^"]+)"/gi,
          'TWITTER_DESCRIPTION: $1\n',
        )
        .replace(
          /<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/gi,
          'TWITTER_TITLE: $1\n',
        )
        .replace(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi, 'HEADING: $1\n')
        .replace(/<p[^>]*>([^<]+)<\/p>/gi, 'PARAGRAPH: $1\n')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Fallback 3: Basic text extraction without aggressive filtering
      const basicExtraction = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Use the longest extraction that has meaningful content
      const candidates = [
        textContent,
        structuredData,
        metaExtraction,
        basicExtraction,
      ]
        .filter((content) => content.length > 20)
        .sort((a, b) => b.length - a.length)

      if (candidates.length > 0) {
        textContent = candidates[0]
      }
    }

    // More lenient content length check - reduced from 50 to 20 characters
    if (textContent.length < 20) {
      throw new Error('Website content too short after processing')
    }

    // Ensure we have meaningful content with better threshold
    if (textContent.length < 20) {
      throw new Error('Website content too short after processing')
    }

    const result = textContent.substring(0, 15000) // Increased from 12000 to 15000
    // Cache the scraped content on success
    if (result) {
      scrapeCache.set(normalizedUrl, result)
    }
    return result
  } catch (error) {
    console.error('Website scraping error:', error)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Website took too long to respond (timeout)')
      }
      throw new Error(`Failed to fetch website: ${error.message}`)
    }

    throw new Error('Failed to fetch website content')
  }
}

// Map common industry variations to exact database enum values
const mapIndustryToEnum = (industry: string): string => {
  const industryMap: Record<string, string> = {
    // Common variations that AI might return
    FinTech: 'Fintech',
    fintech: 'Fintech',
    FINTECH: 'Fintech',
    HealthTech: 'Healthtech',
    healthtech: 'Healthtech',
    HEALTHTECH: 'Healthtech',
    SaaS: 'B2B SaaS',
    saas: 'B2B SaaS',
    SAAS: 'B2B SaaS',
    'B2B SaaS': 'B2B SaaS', // Keep exact matches
    EdTech: 'Education',
    edtech: 'Education',
    EDTECH: 'Education',
    PropTech: 'PropTech', // Keep exact match
    proptech: 'PropTech',
    PROPTECH: 'PropTech',
    InsurTech: 'InsurTech', // Keep exact match
    insurtech: 'InsurTech',
    INSURTECH: 'InsurTech',
    AdTech: 'AdTech', // Keep exact match
    adtech: 'AdTech',
    ADTECH: 'AdTech',
    AI: 'AI/ML',
    'Machine Learning': 'AI/ML',
    'Artificial Intelligence': 'AI/ML',
    ML: 'AI/ML',
    Ecommerce: 'E-commerce',
    ecommerce: 'E-commerce',
    'E-Commerce': 'E-commerce',
    'Food and Beverage': 'Food & Beverage',
    'F&B': 'Food & Beverage',
    'Real estate': 'Real Estate',
    realestate: 'Real Estate',
    Tech: 'Other',
    Technology: 'Other',
  }

  // Return mapped value or original value if no mapping exists
  return industryMap[industry] || industry
}

const extractCompanyData = async (
  websiteContent: string,
  websiteUrl: string,
  context?: { companyName?: string },
): Promise<AutofillData> => {
  const prompt = `You are an expert at extracting company information from website content. Analyze the following website content and extract key company data for a startup fundraising application.

Website URL: ${websiteUrl}
${context?.companyName ? `Expected Company Name: ${context.companyName}` : ''}

Website Content:
${websiteContent}

Extract the following information and return it as a JSON object with these exact fields (use null for any field you cannot determine confidently):

{
  "name": "Company name (string or null)",
  "descriptionShort": "One-liner description under 100 characters (string or null)",
  "descriptionMedium": "Elevator pitch under 300 characters (string or null)", 
  "descriptionLong": "Detailed company description (string or null)",
  "industry": "Primary industry/sector (string or null)",
  "location": "Primary location/headquarters city and country (string or null)",
  "foundedYear": "Year founded (number or null)"
}

Guidelines:
- RESPECT ORIGINAL CONTENT: If the website has well-written taglines, descriptions, or slogans, use them as-is without reformulation
- For descriptionShort: Look for existing taglines, slogans, or hero text that's already concise and compelling - use these directly if they're under 100 characters
- For descriptionMedium: Use existing elevator pitches, "about us" summaries, or hero descriptions if they're well-written and under 300 characters
- For descriptionLong: Extract comprehensive descriptions from about pages, but preserve the original tone and wording when it's professional
- Only reformulate or combine text when the original content is unclear, too long, or unprofessional
- Be flexible and creative with limited content, but prioritize authentic website language over AI-generated alternatives
- Industry should be one of these exact values: "B2B SaaS", "Fintech", "Healthtech", "AI/ML", "Deep tech", "Climate tech", "Consumer", "E-commerce", "Marketplace", "Gaming", "Web3", "Developer tools", "Cybersecurity", "Logistics", "AdTech", "PropTech", "InsurTech", "Agriculture", "Automotive", "Biotechnology", "Construction", "Consulting", "Consumer Goods", "Education", "Energy", "Entertainment", "Environmental Services", "Fashion", "Food & Beverage", "Government", "Healthcare Services", "Hospitality", "Human Resources", "Insurance", "Legal", "Manufacturing", "Media", "Non-profit", "Pharmaceuticals", "Real Estate", "Retail", "Telecommunications", "Transportation", "Utilities", "Other"
- Location should be in format "City, Country" or just "Country" if city is unclear
- Look for founded year in various formats: "founded", "established", "since", "started", copyright years, etc.
- If the website seems to be for a specific region/country, infer location from context
- For African companies, common locations include "Lagos, Nigeria", "Nairobi, Kenya", "Cape Town, South Africa", "Accra, Ghana", "Cairo, Egypt", etc.
- Even if content seems minimal, try to extract at least the company name and a basic description
- Preserve the company's authentic voice and messaging style
- If website content is very limited, focus on extracting what's clearly available rather than returning all nulls
- Return ONLY the JSON object, no additional text or explanations

JSON Response:`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.1, // Reduced temperature for more faithful extraction
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response
    try {
      const extractedData = JSON.parse(content) as AutofillData

      // Map industry values to exact database enum values
      if (extractedData.industry) {
        extractedData.industry = mapIndustryToEnum(extractedData.industry)
      }

      // Validate and parse foundedYear
      if (extractedData.foundedYear) {
        // AI might return a string like "c. 2022" or a number.
        const yearString = String(extractedData.foundedYear).match(/\d{4}/) // Find a 4-digit number
        if (yearString) {
          const year = parseInt(yearString[0], 10)
          if (year > 1900 && year <= new Date().getFullYear()) {
            extractedData.foundedYear = year
          } else {
            extractedData.foundedYear = undefined // Invalid year
          }
        } else {
          extractedData.foundedYear = undefined // No year found
        }
      }

      return extractedData
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content)
      console.error('Parse error:', parseError)

      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[0]) as AutofillData
          return extractedData
        } catch {
          // If still fails, return empty data
        }
      }

      throw new Error('Failed to parse extracted data from AI response')
    }
  } catch (error) {
    console.error('AI extraction error:', error)
    throw new Error('Failed to extract company data from website')
  }
}

export async function POST(req: NextRequest) {
  try {
    const { websiteUrl, context }: WebsiteAutofillRequest = await req.json()

    if (!websiteUrl?.trim()) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 },
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 },
      )
    }

    // Scrape website content
    let websiteContent: string
    try {
      websiteContent = await scrapeWebsite(websiteUrl.trim())

      // Add debug logging for content length
      console.log(
        `Website content extracted: ${websiteContent.length} characters from ${websiteUrl}`,
      )
    } catch (error) {
      console.error('Website scraping failed:', {
        url: websiteUrl,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })

      return NextResponse.json(
        {
          error: 'Failed to access website',
          details: error instanceof Error ? error.message : 'Unknown error',
          url: websiteUrl,
        },
        { status: 400 },
      )
    }

    // More lenient content validation
    if (!websiteContent || websiteContent.length < 10) {
      console.error('Website content validation failed:', {
        url: websiteUrl,
        contentLength: websiteContent?.length || 0,
        contentPreview: websiteContent?.substring(0, 200) || 'No content',
      })

      return NextResponse.json(
        {
          error: 'Website content too short or empty',
          details: `Content length: ${websiteContent?.length || 0} characters`,
          url: websiteUrl,
        },
        { status: 400 },
      )
    }

    // Extract company data using AI
    try {
      const extractedData = await extractCompanyData(
        websiteContent,
        websiteUrl,
        context,
      )

      console.log('Successfully extracted data:', {
        url: websiteUrl,
        extractedFields: Object.keys(extractedData).filter(
          (key) => extractedData[key as keyof AutofillData] !== null,
        ),
      })

      return NextResponse.json({
        success: true,
        data: extractedData,
        source: 'website-analysis',
        contentLength: websiteContent.length,
      })
    } catch (aiError) {
      console.error('AI extraction failed:', {
        url: websiteUrl,
        contentLength: websiteContent.length,
        error: aiError instanceof Error ? aiError.message : 'Unknown AI error',
      })

      return NextResponse.json(
        {
          error: 'Failed to extract company data',
          details:
            aiError instanceof Error ? aiError.message : 'Unknown AI error',
          url: websiteUrl,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Website autofill error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Failed to analyze website',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
