import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

type DataPayload = {
  [key: string]: {
    value: string | number | boolean | readonly string[] | undefined
    label_hints: string[]
  }
}

type Founder = {
  firstName: string
  lastName: string
  role: string
  email?: string
  phone?: string
  linkedin?: string
  bio?: string
  githubUrl?: string
  personalWebsiteUrl?: string
  twitterUrl?: string
}

/**
 * AI-powered form assistant that can handle complex questions and intelligent field matching
 */
export class FormAssistant {
  private model = anthropic('claude-3-5-sonnet-20241022')

  /**
   * Generates an intelligent answer to a complex open-ended question using startup data
   */
  async answerComplexQuestion(
    question: string,
    startupData: Record<string, unknown>,
    foundersData: Founder[]
  ): Promise<string> {
    try {
      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant helping to fill out VC application forms for startups. Your goal is to provide professional, compelling, and accurate responses based on the startup's data.

Guidelines:
- Be specific and factual based on the provided data
- Keep answers concise but informative (typically 50-200 words unless more detail is clearly needed)
- Tailor the response to what the question is asking for
- Use a professional, confident tone appropriate for VC applications
- If specific data isn't available, provide a professional response based on available context
- Focus on what makes the startup compelling and investable
- Synthesize multiple data points into coherent narratives when appropriate`
          },
          {
            role: 'user',
            content: `Please answer this application question: "${question}"

Startup Information:
${JSON.stringify(startupData, null, 2)}

Founders Information:
${JSON.stringify(foundersData, null, 2)}

Provide a well-structured answer that would be appropriate for a VC application form.`
          }
        ],
        temperature: 0.7,
        maxTokens: 500
      })

      return response.text.trim()
    } catch (error) {
      console.error('Error generating AI response:', error)
      // Fallback to a basic response if AI fails
      return this.generateFallbackResponse(question, startupData)
    }
  }

  /**
   * Intelligently matches a form field with available data using AI reasoning
   */
  async matchFieldWithData(
    fieldDescription: string,
    dataPayload: DataPayload
  ): Promise<{
    bestMatch: string | null
    relevanceScore: number
    reasoning: string
  }> {
    try {
      const dataPreview = Object.entries(dataPayload)
        .map(([key, data]) => `${key}: ${data.label_hints.join(', ')}`)
        .join('\n')

      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert at matching form fields with structured data. Analyze the field description and determine the best matching data key.

Your task:
1. Understand what the field is asking for semantically
2. Match it with the most appropriate data key
3. Provide a confidence score (0-100)
4. Explain your reasoning

Consider:
- Semantic meaning (e.g., "Company Name" → "company_name")
- Common variations (e.g., "Startup Name" → "company_name") 
- Field context (e.g., "Tell us about your company" → "company_description_long")
- Business context (e.g., "Founder Name" → "lead_founder_name")

Respond in this JSON format:
{
  "bestMatch": "key_name_or_null",
  "relevanceScore": 85,
  "reasoning": "explanation of the match"
}`
          },
          {
            role: 'user',
            content: `Field to match: "${fieldDescription}"

Available data keys and their hints:
${dataPreview}

Which data key best matches this field? If no good match exists (score < 60), return null for bestMatch.`
          }
        ],
        temperature: 0.3,
        maxTokens: 200
      })

      // Parse the JSON response
      try {
        const parsed = JSON.parse(response.text)
        return {
          bestMatch: parsed.bestMatch,
          relevanceScore: parsed.relevanceScore || 0,
          reasoning: parsed.reasoning || 'No reasoning provided'
        }
      } catch {
        // If JSON parsing fails, return a safe default
        return {
          bestMatch: null,
          relevanceScore: 0,
          reasoning: 'Failed to parse AI response'
        }
      }
    } catch (error) {
      console.error('Error in AI field matching:', error)
      return {
        bestMatch: null,
        relevanceScore: 0,
        reasoning: 'AI matching failed, falling back to simple matching'
      }
    }
  }

  /**
   * Detects if a field requires a complex, thoughtful response rather than simple data entry
   */
  async isComplexQuestion(fieldDescription: string, fieldType?: string): Promise<boolean> {
    try {
      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Determine if this form field requires a complex, thoughtful response (like an essay question) or simple data entry.

Complex questions typically:
- Ask for descriptions, explanations, or narratives
- Have large text areas (textarea, long text inputs)
- Ask "Tell us about...", "Describe...", "What...", "How...", "Why..."
- Require more than basic facts (name, email, numbers, dates)

Simple fields typically:
- Ask for basic facts: name, email, phone, address, numbers, dates
- Have short text inputs, dropdowns, checkboxes
- Can be answered with existing structured data

Respond with just "true" or "false".`
          },
          {
            role: 'user',
            content: `Field: "${fieldDescription}"
Field type: ${fieldType || 'unknown'}

Is this a complex question requiring thoughtful response?`
          }
        ],
        temperature: 0.1,
        maxTokens: 10
      })

      return response.text.trim().toLowerCase() === 'true'
    } catch (error) {
      console.error('Error detecting complex question:', error)
      // Fallback: Use simple heuristics
      const desc = fieldDescription.toLowerCase()
      return desc.includes('tell us') || 
             desc.includes('describe') || 
             desc.includes('what') && desc.length > 20 ||
             desc.includes('why') ||
             desc.includes('how') && desc.length > 15
    }
  }

  /**
   * Maps industry values to common form dropdown options
   */
  mapIndustryValue(originalValue: string): string {
    const industryMappings: Record<string, string> = {
      'Artificial Intelligence': 'AI',
      'AI/ML': 'AI', 
      'Machine Learning': 'AI',
      'Deep tech': 'AI',
      'Software': 'Tech',
      'Technology': 'Tech',
      'B2B SaaS': 'SaaS',
      'SaaS': 'Software',
      'Fintech': 'Finance',
      'Financial Technology': 'Finance',
      'Healthtech': 'Healthcare',
      'Health Technology': 'Healthcare',
      'Climate tech': 'Climate',
      'Clean tech': 'Climate',
      'E-commerce': 'Ecommerce',
      'Consumer': 'Consumer',
      'Enterprise': 'B2B',
      'Developer tools': 'Developer',
      'Cybersecurity': 'Security',
      'Biotech': 'Biotech',
      'Biotechnology': 'Biotech'
    }

    return industryMappings[originalValue] || originalValue
  }

  /**
   * Gets the best partial match for dropdown typing
   */
  getPartialTypingValue(value: string): string {
    // For industry, use first 2-3 chars that are most likely to match
    const partialMappings: Record<string, string> = {
      'Artificial Intelligence': 'AI',
      'AI/ML': 'AI',
      'Machine Learning': 'ML', 
      'Software': 'Soft',
      'Technology': 'Tech',
      'B2B SaaS': 'SaaS',
      'Fintech': 'Fin',
      'Healthtech': 'Heal',
      'Climate tech': 'Clim',
      'E-commerce': 'Eco'
    }

    return partialMappings[value] || value.substring(0, 3)
  }

  /**
   * Gets fallback options when exact match not found
   */
  getFallbackOptions(originalValue: string): string[] {
    const value = originalValue.toLowerCase()
    
    // Return multiple fallback options in priority order
    if (value.includes('ai') || value.includes('artificial') || value.includes('intelligence') || value.includes('machine')) {
      return ['Technology', 'Software', 'Tech', 'Computer', 'Engineering', 'Innovation']
    }
    if (value.includes('software') || value.includes('saas') || value.includes('tech')) {
      return ['Technology', 'Software', 'Computer', 'Engineering', 'Internet']
    }
    if (value.includes('finance') || value.includes('fintech')) {
      return ['Finance', 'Financial', 'Banking', 'Business', 'Services']
    }
    if (value.includes('health') || value.includes('medical')) {
      return ['Healthcare', 'Medical', 'Health', 'Life Sciences', 'Biology']
    }
    
    // Generic fallbacks
    return ['Technology', 'Business', 'Services', 'Other', 'General']
  }

  /**
   * Generates a fallback response when AI processing fails
   */
  private generateFallbackResponse(question: string, startupData: Record<string, unknown>): string {
    const questionLower = question.toLowerCase()
    
    if (questionLower.includes('company') || questionLower.includes('startup')) {
      return startupData.description_medium as string || startupData.description_short as string || 'We are an innovative startup focused on solving important problems in our industry.'
    }
    
    if (questionLower.includes('problem') || questionLower.includes('solving')) {
      return startupData.description_long as string || 'We are addressing a significant market need with our innovative solution.'
    }
    
    if (questionLower.includes('market') || questionLower.includes('opportunity')) {
      return startupData.market_summary as string || 'We operate in a large and growing market with significant opportunity for disruption.'
    }
    
    if (questionLower.includes('team') || questionLower.includes('founder')) {
      return 'Our experienced team brings together diverse expertise and a track record of success in building innovative solutions.'
    }
    
    return 'We are excited about the opportunity to share more details about our innovative startup and growth plans.'
  }
} 