import { BaseFormSpecialist } from './base-specialist'
import { FormType, SmartDataMapping, BrowserUseConfig } from './types'

export class AirtableSpecialist extends BaseFormSpecialist {
  readonly type: FormType = 'airtable'
  readonly name = 'Airtable Forms Specialist'
  readonly description =
    'Handles Airtable forms, including uploading files via Link (URL) in the Attach files modal'

  canHandle(url: string): boolean {
    const urlLower = url.toLowerCase()
    return urlLower.includes('airtable.com')
  }

  // Airtable-specific Browser Use configuration
  getBrowserConfig(): Partial<BrowserUseConfig> {
    return {
      ...super.getBrowserConfig(),
      max_agent_steps: 65,
      highlight_elements: true,
      // Favor non-reasoning per mapping
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

    const instruction = `You are an Airtable forms specialist. Your task is to complete the form for "${targetName}" at: ${targetUrl}.

${this.buildCoreDataSection(smartData)}

**AIRTABLE-SPECIFIC STRATEGY:**
1.  **Navigate & Prepare**: Go to the URL, accept cookies if prompted, and wait for the form to fully load (look for the Submit button near the end).
2.  **Fill Core Fields**: Use exact provided values for common fields such as Name, Email, Company, Website, and Description. Prefer the most appropriate description length based on the field type.
3.  **Dropdowns & Choices**: Open dropdowns, review all options, and choose the closest match using the industry and location variations provided.
4.  **Attach Files (Pitch Deck via URL)**:
    - If the form includes an "Attach files" or similar upload field, click it to open the file picker modal.
    - In the modal, select the second option labeled "Link (URL)" (sometimes shown as "Link"), not local files, webcam, Google Drive, or OneDrive.
    - In the field "Add files from URL", paste the deck URL: ${deckUrl || '[no deck url provided]'}
    - Confirm by clicking Add/Upload and wait until the file chip appears to ensure the upload is attached.
    - If no deck URL is provided or the Link (URL) option is unavailable, skip the upload and continue.
5.  **Other Field Types**: For multi-selects, checkboxes, radios, and textareas, select or enter the best fitting answer grounded in the provided data. Do not invent new facts.
6.  **Submit**: Scroll to the bottom, click Submit, and verify the success/thank-you confirmation.

${this.getGlobalGuidelines(smartData)}

**SUCCESS CRITERIA:**
- The form is submitted successfully and a confirmation/thank-you screen is shown.
- All required fields are completed accurately.
- If an upload field exists, the pitch deck is attached via Link (URL) when a deck URL is available; otherwise, the step is skipped gracefully.

Capture your plan and decisions in the 'thinking' field and proceed efficiently.`

    // Validate instruction quality
    const validation = this.validateInstruction(instruction)
    if (!validation.isValid) {
      console.warn('Airtable instruction validation issues:', validation.issues)
    }

    return instruction
  }
}
