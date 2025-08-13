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
      max_agent_steps: 50, // Contact forms are usually simple and quick in Browser Use
      highlight_elements: false, // Simple forms don't need highlighting in Browser Use
    }
  }

  buildInstruction(
    targetUrl: string,
    targetName: string,
    smartData: SmartDataMapping,
  ): string {
    const { primary_data, description_by_length } = smartData
    const planIdentifier = this.buildPlanIdentifier(smartData, targetName)

    const founderName = primary_data.lead_founder_name || 'the founder'
    const companyName = primary_data.company_name || 'our company'
    const teamFounders = (primary_data.team_founders || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s.toLowerCase() !== founderName.toLowerCase())
    const cofoundersPart =
      teamFounders.length > 0 ? `, along with ${teamFounders.join(', ')}` : ''

    const elevator =
      primary_data.elevator_pitch ||
      description_by_length.short ||
      description_by_length.medium ||
      'a high-potential product'
    const problemMarket =
      primary_data.problem_statement ||
      primary_data.market_summary ||
      'a clear pain point with strong market potential'
    const traction =
      primary_data.traction ||
      primary_data.traction_overview ||
      primary_data.kpis ||
      primary_data.metrics ||
      ''
    const whatWeDoDetails =
      primary_data.solution_summary ||
      primary_data.product_highlight ||
      description_by_length.medium ||
      ''
    const revenueModel =
      primary_data.revenue_model || primary_data.pricing_model || ''
    const differentiator =
      primary_data.unfair_advantage ||
      primary_data.usp ||
      primary_data.differentiator ||
      ''
    const marketPotential =
      primary_data.market_opportunity ||
      primary_data.market_size ||
      primary_data.tam_sam_som ||
      ''
    const deckUrl = primary_data.asset_cloud_drive || ''
    const founderLinkedIn =
      primary_data.lead_founder_linkedin ||
      primary_data.founder_linkedin ||
      primary_data.linkedin ||
      ''
    const founderGithub = primary_data.github_url || primary_data.github || ''

    const paragraphs: string[] = []
    paragraphs.push(`Hi ${targetName} team,`)
    paragraphs.push(
      `I'm ${founderName}, founder of ${companyName}${cofoundersPart}, we are building ${elevator}.`,
    )
    paragraphs.push(`We're addressing ${problemMarket}.`)
    if (traction) paragraphs.push(traction)
    if (whatWeDoDetails) paragraphs.push(whatWeDoDetails)
    if (revenueModel) paragraphs.push(revenueModel)
    if (differentiator) paragraphs.push(differentiator)
    if (marketPotential) paragraphs.push(marketPotential)
    paragraphs.push(
      `I'd love to discuss how ${companyName} can capture this opportunity with your backing.`,
    )
    paragraphs.push('Best regards,')
    paragraphs.push(founderName)
    if (founderLinkedIn) paragraphs.push(`LinkedIn: ${founderLinkedIn}`)
    if (founderGithub) paragraphs.push(`GitHub: ${founderGithub}`)
    if (deckUrl) paragraphs.push(`Pitch deck: ${deckUrl}`)

    const message = paragraphs.filter(Boolean).join('\n\n')

    const instruction = `${planIdentifier}

You are a contact form specialist agent. Your task is to navigate to ${targetUrl} and complete the contact form for ${targetName} with the goal of initiating a conversation.

${this.buildCoreDataSection(smartData)}

**EXECUTION STRATEGY:**
1.  **Analyze & Plan**: Navigate to the URL, scroll as needed to locate the contact form. If the page has sections like "PITCH US", "General enquiry", or "Partnership enquiry", click the relevant section to reveal the form.
2.  **Fill Core Fields**: Use the exact data provided for fields like Name, Email, and Company.
3.  **Subject/Reason Dropdowns**: If there is a dropdown for subject or reason, choose "Investment Opportunity" if available; otherwise choose "Partnership" or the closest option that reflects fundraising.
4.  **Craft the Message**: For the main "Message" or "Description" field, use the following text. Do not modify it unless there is a character limit, in which case you should intelligently shorten it while preserving the key points.
    
    ---
    **MESSAGE TO USE:**
    ${message}
    ---

5.  **Handle Other Fields**: For fields like "Industry," "Budget," or "How did you hear about us?", use your judgment to select the most appropriate option based on the startup data.
6.  **File Upload Handling**: If a file is requested, only attach via a link/URL field when available (paste the deck URL). Do not attempt third-party uploads or local files. If no link field exists, skip the upload.
7.  **Submit**: Complete the form and verify successful submission.

${this.getGlobalGuidelines(smartData)}

**SUCCESS CRITERIA:**
- The form is successfully submitted with a confirmation.
- The message is submitted exactly as crafted above, or thoughtfully shortened if necessary.

Use the 'thinking' field to document your plan and any decisions made.
`
    return instruction
  }
}
