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
    }
  }

  buildInstruction(
    targetUrl: string,
    targetName: string,
    smartData: SmartDataMapping,
  ): string {
    const instruction = `You are an expert agent specializing in Typeform submissions. Your task is to complete the Typeform for "${targetName}" at the URL: ${targetUrl}.

${this.buildCoreDataSection(smartData)}

**STRATEGY:**
1.  **Navigate & Initiate**: Go to the URL and start the form.
2.  **Answer Systematically**: Proceed through the questions one by one. Answers should be 95% based on provided data. Synthesize high-confidence answers, but never invent new facts.
3.  **Handle Dropdowns**: For dropdowns (like industry or location), carefully select the best-fitting option from the available choices. Use the provided variations if a direct match isn't available.
4.  **Use Correct Descriptions**: Select the appropriate description length (short, medium, long) based on the question's context.
5.  **Submit**: Continue until you reach the final submission confirmation or "Thank you" screen, it can be up to 20 questions.

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
