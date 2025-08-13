import { BaseFormSpecialist } from './base-specialist'
import { FormType, SmartDataMapping, BrowserUseConfig } from './types'

export class TypeformSpecialist extends BaseFormSpecialist {
  readonly type: FormType = 'typeform'
  readonly name = 'Typeform Specialist'
  readonly description =
    'Handles Typeform multi-step dynamic forms with conditional logic'

  canHandle(url: string): boolean {
    const urlLower = url.toLowerCase()
    return urlLower.includes('typeform.com')
  }

  // Typeform-specific Browser Use configuration
  getBrowserConfig(): Partial<BrowserUseConfig> {
    return {
      ...super.getBrowserConfig(),
      max_agent_steps: 60, // Typeforms can be longer due to multi-step nature
      highlight_elements: true, // Helpful for dynamic question navigation in Browser Use
      // Prioritize non-reasoning per mapping
      use_thinking: true,
      flash_mode: false,
    }
  }

  buildInstruction(
    targetUrl: string,
    targetName: string,
    smartData: SmartDataMapping,
  ): string {
    const deckUrl = smartData.primary_data.asset_cloud_drive || ''

    const instruction = `You are an expert agent specializing in Typeform submissions. Your task is to complete the Typeform for "${targetName}" at the URL: ${targetUrl}.

${this.buildCoreDataSection(smartData)}

**STRATEGY:**
1.  **Navigate & Initiate**: Go to the URL and start the form.
2.  **Answer Systematically**: Proceed through the questions one by one. Answers should be 95% based on provided data. Synthesize high-confidence answers, but never invent new facts.
3.  **Handle Dropdowns**: For dropdowns (like industry or location), carefully select the best-fitting option from the available choices. Use the provided variations if a direct match isn't available.
4.  **Use Correct Descriptions**: Select the appropriate description length (short, medium, long) based on the question's context.
5.  **File Upload Handling**:
    - If a file upload is requested, only use a URL/link method if offered by the component. Paste: ${deckUrl || 'deck will be provided by mail'}
    - Do not attempt local files, Google Drive, OneDrive, webcam, or any OAuth-based integrations.
    - If no link method exists, skip the file upload and proceed; if possible, paste the deck URL into a related text field instead.
6.  **Submit**: Continue until you reach the final submission confirmation or "Thank you" screen, it can be up to 25 questions.

${this.getGlobalGuidelines(smartData)}

**SUCCESS CRITERIA:**
- The form is successfully submitted.
- You see a "Thank you" or confirmation message.

Your reasoning should be captured in the 'thinking' field of your output. Focus on being efficient and accurate.`

    // Validate instruction quality
    const validation = this.validateInstruction(instruction)
    if (!validation.isValid) {
      console.warn('Typeform instruction validation issues:', validation.issues)
    }

    return instruction
  }
}
