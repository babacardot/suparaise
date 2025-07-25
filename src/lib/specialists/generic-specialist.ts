import { BaseFormSpecialist } from './base-specialist'
import { FormType, SmartDataMapping } from './types'

export class GenericSpecialist extends BaseFormSpecialist {
  readonly type: FormType = 'generic'
  readonly name = 'Generic Form Specialist'
  readonly description =
    'Fallback specialist for any form type not covered by other specialists'

  canHandle(): boolean {
    // Generic specialist handles everything as fallback
    return true
  }

  buildInstruction(
    targetUrl: string,
    targetName: string,
    smartData: SmartDataMapping,
  ): string {
    const instruction = `You are a form-filling automation agent. Navigate to ${targetUrl} and complete the application form for ${targetName}.

${this.buildCoreDataSection(smartData)}

**EXECUTION STRATEGY:**

**1. Navigation & Assessment**
- Navigate to the URL and take initial screenshot
- If form is pre-filled or shows "already submitted", refresh or find "Start Over"
- Locate the application form (look for "Apply Now", "Start Application" buttons)

**2. Critical Dropdown Handling**
- ALWAYS click dropdown first to see all options
- Scan options thoroughly before deciding
- Priority: Exact match → Close match → Category match → "Other" → First option
- NEVER leave typed text - must select from dropdown options
- 90% of failures happen when dropdowns have typed text instead of selections

**3. Form Filling Strategy**
- Use exact data provided above - NO improvisation
- For industry: Try provided variations in order until one works
- For location: Try provided variations in order until one works  
- For descriptions: Match field length (short/medium/long) to appropriate description
- For dropdowns: Follow critical handling protocol above
- Take screenshots at major steps for debugging

**4. Submission Process**
- Progress through multi-step forms systematically
- Handle "Next", "Continue", "Submit" buttons appropriately
- Capture final confirmation screens
- If errors occur, attempt resolution then document

**SUCCESS CRITERIA:**
- Form successfully submitted with confirmation
- Maximum fields completed accurately using provided data
- All dropdowns show selected values (not typed text)
- Professional responses using exact descriptions provided

Complete the application systematically and submit successfully.`

    // Validate instruction quality
    const validation = this.validateInstruction(instruction)
    if (!validation.isValid) {
      console.warn(
        'Generic specialist instruction validation issues:',
        validation.issues,
      )
    }

    return instruction
  }

  // Generic form handling strategies
  getCommonStrategies(): Record<string, string> {
    return {
      'Multi-step forms':
        'Progress through each step systematically using Next/Continue buttons',
      'Single page forms':
        'Fill all visible fields then scroll down to find Submit button',
      'Modal/popup forms':
        'Complete form within modal, look for Submit or Close buttons',
      'Embedded forms':
        'Identify form boundaries, complete all fields within form area',
      'Conditional forms':
        'Answer questions that trigger additional fields based on responses',
    }
  }

  // Common field type handling
  getFieldTypeHandling(): Record<string, string> {
    return {
      'Text input': 'Enter exact data from provided information',
      Textarea: 'Use appropriate description based on field size',
      'Select dropdown': 'Click to open, scan options, select best match',
      'Radio buttons': 'Select single best option',
      Checkboxes: 'Select all relevant options',
      'File upload': 'Note requirement but skip unless specified',
      'Date picker': 'Use appropriate date format',
      'Number input': 'Enter numerical values only',
      'Email input': 'Use exact founder email',
      'URL input': 'Use company website URL',
    }
  }

  // Generic success indicators
  getSuccessIndicators(): string[] {
    return [
      'Confirmation message displayed',
      'Thank you page appears',
      'Success notification shown',
      'URL changes to confirmation page',
      'Form disappears or is replaced with success message',
      'Email confirmation mentioned',
      'Reference number or ID provided',
    ]
  }
}
