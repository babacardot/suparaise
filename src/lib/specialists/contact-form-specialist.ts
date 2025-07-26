import { BaseFormSpecialist } from './base-specialist'
import { FormType, SmartDataMapping, BrowserUseConfig } from './types'

export class ContactFormSpecialist extends BaseFormSpecialist {
  readonly type: FormType = 'contact'
  readonly name = 'Contact Form Specialist'
  readonly description =
    'Handles simple contact forms with basic fields (name, email, company, message)'

  canHandle(url: string): boolean {
    const urlLower = url.toLowerCase()
    return (
      urlLower.includes('contact') ||
      urlLower.includes('get-in-touch') ||
      urlLower.includes('reach-out') ||
      urlLower.includes('connect') ||
      urlLower.includes('contact-us')
    )
  }

  // Contact Form-specific Browser Use configuration
  getBrowserConfig(): Partial<BrowserUseConfig> {
    return {
      ...super.getBrowserConfig(),
      max_agent_steps: 30, // Contact forms are usually simple and quick in Browser Use
      highlight_elements: false, // Simple forms don't need highlighting in Browser Use
    }
  }

  buildInstruction(
    targetUrl: string,
    targetName: string,
    smartData: SmartDataMapping,
  ): string {
    const { primary_data, description_by_length, industry_variations } =
      smartData

    const founderName = primary_data.lead_founder_name || 'the founder'
    const companyName = primary_data.company_name || 'our company'
    const teamInfo =
      primary_data.team_founders &&
      primary_data.team_founders.split(',').length > 1
        ? `Our founding team is led by ${founderName}.`
        : `My name is ${founderName}, founder of ${companyName}.`

    const message = `
Hello,

${teamInfo}

${description_by_length.medium || description_by_length.short}

We are operating in the ${primary_data.company_industry || industry_variations[0]} space, focusing on ${primary_data.market_summary || 'addressing key market needs'}.

We would be delighted to discuss how we can create value together. Our deck is available here for your convenience: ${primary_data.asset_cloud_drive || ''}.

Thank you for your time and consideration.

Best regards,
${founderName}
    `.trim()

    const instruction = `You are a contact form specialist agent. Your task is to navigate to ${targetUrl} and complete the contact form for ${targetName} with the goal of initiating a conversation.

${this.buildCoreDataSection(smartData)}

**EXECUTION STRATEGY:**
1.  **Analyze & Plan**: Navigate to the URL, find the contact form, and plan your approach in the 'thinking' field.
2.  **Fill Core Fields**: Use the exact data provided for fields like Name, Email, and Company.
3.  **Craft the Message**: For the main "Message" or "Description" field, use the following text. Do not modify it unless there is a character limit, in which case you should intelligently shorten it while preserving the key points.
    
    ---
    **MESSAGE TO USE:**
    ${message}
    ---

4.  **Handle Other Fields**: For fields like "Industry," "Budget," or "How did you hear about us?", use your judgment to select the most appropriate option based on the startup data.
5.  **Submit**: Complete the form and verify successful submission.

**SUCCESS CRITERIA:**
- The form is successfully submitted with a confirmation.
- The message is submitted exactly as crafted above, or thoughtfully shortened if necessary.

Use the 'thinking' field to document your plan and any decisions made.
`
    return instruction
  }
}
