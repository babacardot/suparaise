import { BaseFormSpecialist } from './base-specialist'
import { FormType, SmartDataMapping, BrowserUseConfig } from './types'

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
    const deckUrl = smartData.primary_data.asset_cloud_drive || ''
    const planIdentifier = this.buildPlanIdentifier(smartData, targetName)

    const instruction = `${planIdentifier}

You are an expert form-filling agent. Your goal is to complete the application for "${targetName}" at the URL: ${targetUrl}.

${this.buildCoreDataSection(smartData)}

**EXECUTION STRATEGY:**
1.  **Analyze & Plan**: Navigate to the URL, assess the form's structure, and create a plan in the 'thinking' field.
2.  **Execute Systematically**: Fill out the form fields accurately. Your answers should be 95% based on the provided data. For questions where a direct answer isn't available, you may synthesize a reasonable response based on the existing data, but you must not invent new facts or features. Create a high-confidence answer based on the data provided.
3.  **Critical Dropdown Handling**: For dropdowns, always inspect the available options before making a selection. Prioritize the best fit from the list over typing a custom value.
4.  **File Upload Handling**:
    - Prefer attaching the pitch deck via a URL/link field if the upload component provides an option to add a file from a link. Use: ${deckUrl || 'deck will be provided by mail'}
    - Do not attempt to use local files, webcam, Google Drive, OneDrive, or any third-party auth flows.
    - If only local file upload is supported and no link field is available, skip the upload and proceed. When appropriate, paste the deck URL into a text field labeled "Deck", "Current Deck", or "Presentation".
4.  **Submission Process**: Complete all steps and verify successful submission by looking for a confirmation message like "Thank you" or "Success". Handle "Next", "Continue", "OK", "Submit" buttons appropriately till the last step/question.

${this.getGlobalGuidelines(smartData)}

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

  // Generic should prefer speed unless a specialist opts in to deep reasoning
  getBrowserConfig(): Partial<BrowserUseConfig> {
    return {
      ...super.getBrowserConfig(),
    }
  }
}
