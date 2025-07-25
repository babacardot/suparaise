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
    const instruction = `You are a Typeform specialist agent. Navigate to ${targetUrl} and complete the Typeform for ${targetName}.

${this.buildCoreDataSection(smartData)}

**TYPEFORM-SPECIFIC STRATEGY:**

**1. Typeform Navigation**
- Take initial screenshot to assess form structure
- Look for welcome/intro screen with "Start" or "Get Started" button
- Typeforms are single-question-per-screen - progress step by step
- Use "OK" or "Enter" to advance between questions

**2. Question Types Handling**
- **Multiple Choice**: Click the best matching option
- **Dropdown**: Click to open, scan options, select best match
- **Text Input**: Type exact data, press Enter to continue
- **Email**: Use founder email from data
- **Number**: Input exact numerical values
- **Yes/No**: Select based on data (incorporated=Yes, etc.)
- **Scale/Rating**: Select appropriate rating based on question context

**3. Typeform Dropdown Protocol**
- Click dropdown to open options list
- Scan all available choices carefully
- Priority: Exact match → Close match → Industry variations → "Other"
- NEVER leave as typed text - must select option
- Common Typeform dropdowns: Industry, Location, Company Size, Stage

**4. Text Response Strategy**
- Short answers: Use appropriate description based on question length
- Company description: Match to short/medium/long based on space available
- Founder info: Use exact data provided
- Financial questions: Use exact numbers from data

**5. Progress Through Form**
- Answer one question at a time systematically
- Take screenshots at key questions for debugging
- Handle conditional questions based on previous answers
- Look for progress indicators to track completion

**SUCCESS CRITERIA:**
- Complete all questions in sequence
- Reach final "Thank you" or submission confirmation screen
- All dropdowns properly selected (not typed)
- Accurate data from provided information

Complete the Typeform step by step until submission confirmation.`

    // Validate instruction quality
    const validation = this.validateInstruction(instruction)
    if (!validation.isValid) {
      console.warn('Typeform instruction validation issues:', validation.issues)
    }

    return instruction
  }

  // Typeform-specific helper methods
  private getQuestionTypeGuidance(): string {
    return `
**TYPEFORM QUESTION TYPE GUIDE:**
- **Welcome Screen**: Click "Start" or "Get Started"
- **Multiple Choice**: Click on the circle/option that best matches
- **Dropdown**: Click dropdown, scan all options, select best match
- **Short Text**: Type concise answer, press Enter
- **Long Text**: Use appropriate description length
- **Email**: Use exact founder email
- **Number**: Input numerical values only
- **Date**: Use appropriate date format if available
- **Yes/No**: Select based on provided data
- **Opinion Scale**: Select rating based on context
- **Rating**: Choose appropriate star/number rating`
  }

  // Method to get Typeform-specific success indicators
  getSuccessIndicators(): string[] {
    return [
      'Progress bar shows 100% completion',
      'Final "Thank you" message displayed',
      'Confirmation screen with checkmark or success icon',
      'URL changes to confirmation/success page',
      'Form shows "Submitted" or "Complete" status',
    ]
  }
}
