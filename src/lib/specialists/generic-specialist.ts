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
    const instruction = `You are an expert form-filling agent. Your goal is to complete the application for "${targetName}" at the URL: ${targetUrl}.

${this.buildCoreDataSection(smartData)}

**EXECUTION STRATEGY:**
1.  **Analyze & Plan**: Navigate to the URL, assess the form's structure, and create a plan in the 'thinking' field.
2.  **Execute Systematically**: Fill out the form fields accurately. Your answers should be 95% based on the provided data. For questions where a direct answer isn't available, you may synthesize a reasonable response based on the existing data, but you must not invent new facts or features. Create a high-confidence answer based on the data provided.
3.  **Critical Dropdown Handling**: For dropdowns, always inspect the available options before making a selection. Prioritize the best fit from the list over typing a custom value.
4.  **Submission Process**: Complete all steps and verify successful submission by looking for a confirmation message like "Thank you" or "Success". Handle "Next", "Continue", "OK", "Submit" buttons appropriately till the last step/question.

**SUCCESS CRITERIA:**
- The form is successfully submitted with confirmation.
- All answers are intelligently derived from the data provided.

Use the 'thinking' field to document your plan, decisions, and any fields you synthesize. Adapt to the form's layout and proceed efficiently.`

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
}
