import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface EnhanceRequest {
  text: string
  fieldType:
    | 'bio'
    | 'description-short'
    | 'description-medium'
    | 'description-long'
    | 'traction'
    | 'market'
    | 'customers'
  enhancementType?: 'grammar' | 'full'
  context?: {
    companyName?: string
    industry?: string
    founderName?: string
    role?: string
  }
}

const getPrompt = (
  fieldType: string,
  text: string,
  enhancementType: 'grammar' | 'full' = 'full',
  context?: {
    companyName?: string
    industry?: string
    founderName?: string
    role?: string
  },
) => {
  const grammarInstruction =
    'You are a professional proofreader. Fix any grammar, spelling, punctuation, or syntax errors in the text. Keep the original meaning and tone intact. Return ONLY the corrected text without any prefixes, labels, or explanations.'

  const fullInstruction =
    'You are an expert copywriter helping founders create compelling content for VC applications. First, correct any grammar, spelling, or punctuation errors. Then enhance the text while maintaining authenticity and core facts. Return ONLY the improved text without any prefixes, labels, or explanations and DO NOT use em dashes (—).'

  if (enhancementType === 'grammar') {
    return `${grammarInstruction}

Text to correct: "${text}"`
  }

  const baseInstruction = fullInstruction

  const prompts = {
    bio: `${baseInstruction}

Enhance this founder bio for VC applications:
- Keep it professional yet authentic
- Ensure clear experience and achievements
- Make it compelling and confident
- Keep it 2-3 sentences maximum
- Add quantified achievements when possible

${context?.founderName ? `Founder: ${context.founderName}` : ''}
${context?.role ? `Role: ${context.role}` : ''}
${context?.companyName ? `Company: ${context.companyName}` : ''}

Text to enhance: "${text}"`,

    'description-short': `${baseInstruction}

Enhance this company one-liner (keep under 100 characters):
- Make it concise and punchy
- Clear value proposition
- Memorable and impactful
- Include metrics when possible

${context?.companyName ? `Company: ${context.companyName}` : ''}
${context?.industry ? `Industry: ${context.industry}` : ''}

Text to enhance: "${text}"`,

    'description-medium': `${baseInstruction}

Enhance this elevator pitch (keep under 300 characters):
- Clear problem and solution
- Strong value proposition
- Compelling and professional
- Easy to understand

${context?.companyName ? `Company: ${context.companyName}` : ''}
${context?.industry ? `Industry: ${context.industry}` : ''}

Text to enhance: "${text}"`,

    'description-long': `${baseInstruction}

Enhance this company description:
- Comprehensive yet concise
- Clear problem, solution, and market opportunity
- Professional and compelling
- Well-structured with logical flow

${context?.companyName ? `Company: ${context.companyName}` : ''}
${context?.industry ? `Industry: ${context.industry}` : ''}

Text to enhance: "${text}"`,

    traction: `${baseInstruction}

Enhance this traction summary:
- Lead with strongest metrics
- Use specific numbers and percentages
- Show growth trajectory
- Be credible and impressive
- Include key partnerships or achievements

${context?.companyName ? `Company: ${context.companyName}` : ''}

Text to enhance: "${text}"`,

    market: `${baseInstruction}

Enhance this market summary:
- Clear market size and opportunity
- Show market understanding
- Highlight competitive advantages
- Professional and data-driven
- Compelling market positioning

${context?.companyName ? `Company: ${context.companyName}` : ''}
${context?.industry ? `Industry: ${context.industry}` : ''}

Text to enhance: "${text}"`,

    customers: `${baseInstruction}

Enhance this key customers description:
- Highlight prestigious or notable customers
- Show customer diversity and validation
- Include specific use cases or outcomes
- Be impressive yet credible

${context?.companyName ? `Company: ${context.companyName}` : ''}

Text to enhance: "${text}"`,
  }

  return (
    prompts[fieldType as keyof typeof prompts] || prompts['description-long']
  )
}

export async function POST(req: NextRequest) {
  try {
    const { text, fieldType, context, enhancementType }: EnhanceRequest = await req.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      )
    }

    const prompt = getPrompt(fieldType, text, enhancementType, context)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const enhancedText =
      response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : text

    return NextResponse.json({ enhancedText })
  } catch (error) {
    console.error('AI enhancement error:', error)
    return NextResponse.json(
      { error: 'Failed to enhance text' },
      { status: 500 },
    )
  }
}
