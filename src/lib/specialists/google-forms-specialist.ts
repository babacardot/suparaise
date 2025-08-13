import { BaseFormSpecialist } from './base-specialist'
import { FormType, SmartDataMapping, BrowserUseConfig } from './types'

export class GoogleFormsSpecialist extends BaseFormSpecialist {
  readonly type: FormType = 'google'
  readonly name = 'Google Forms Specialist'
  readonly description =
    'Handles Google Forms with validation, required fields, and comprehensive dropdown lists'

  canHandle(url: string): boolean {
    const urlLower = url.toLowerCase()
    return (
      urlLower.includes('forms.gle') ||
      urlLower.includes('docs.google.com/forms')
    )
  }

  // Google Forms-specific Browser Use configuration
  getBrowserConfig(): Partial<BrowserUseConfig> {
    return {
      ...super.getBrowserConfig(),
      max_agent_steps: 45, // Google Forms are typically more straightforward in Browser Use
      highlight_elements: false, // Google Forms have clear structure, no highlighting needed in Browser Use
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

    const instruction = `You are a Google Forms specialist agent. Navigate to ${targetUrl} and complete the Google Form for ${targetName}.

${this.buildCoreDataSection(smartData)}

**GOOGLE FORMS-SPECIFIC STRATEGY:**

**1. Form Structure Recognition**
- Take initial screenshot of form layout
- Google Forms typically show all questions on one page or sections
- Look for required field indicators (red asterisks *)
- Identify form sections and progress through systematically

**2. Google Forms Field Types**
- **Text boxes**: Enter exact data from provided information
- **Dropdowns**: Click dropdown arrow, scan options, select best match
- **Multiple choice**: Click radio button for best option
- **Checkboxes**: Select relevant options (can be multiple)
- **File upload**: Note requirement but skip unless specified
- **Scale/Grid**: Select appropriate ratings based on context

**3. Google Forms Dropdown Handling**
- Click the dropdown arrow to expand options
- Scroll through all available options if list is long
- Match with industry/location variations provided
- Select closest option - Google Forms often have comprehensive lists
- Ensure selection shows in field (not blank)

**4. Validation & Required Fields**
- Fill all required fields (marked with red asterisk *)
- Google Forms shows validation errors - address them before proceeding
- Email fields must be valid email format
- Number fields require numeric input only

**5. File Upload Handling**
- If a File upload question exists, do not use Google Drive or local files.
- Prefer a link/URL-based response if provided by the form (for example, a short answer field labeled "Link" or "Pitch Deck URL"). Paste: ${deckUrl || 'deck will be provided by mail'}
- If only true file uploads are allowed, skip the file attachment and proceed.

**6. Submission Process**
- Scroll to bottom to find "Submit" button
- Review form for any missed required fields
- Click Submit and wait for confirmation message
- Take screenshot of confirmation page

${this.getGlobalGuidelines(smartData)}

**SUCCESS CRITERIA:**
- All required fields completed accurately
- Validation errors resolved
- Successful submission with confirmation message
- Data accuracy maintained throughout

Complete the Google Form and submit successfully.`

    // Validate instruction quality
    const validation = this.validateInstruction(instruction)
    if (!validation.isValid) {
      console.warn(
        'Google Forms instruction validation issues:',
        validation.issues,
      )
    }

    return instruction
  }

  // Google Forms-specific helper methods
  private getValidationGuidance(): string {
    return `
**GOOGLE FORMS VALIDATION GUIDE:**
- **Required Fields**: Look for red asterisk (*) - must be filled
- **Email Validation**: Must be valid email format (user@domain.com)
- **Number Fields**: Only numeric characters allowed
- **Date Fields**: Use MM/DD/YYYY or DD/MM/YYYY format
- **URL Fields**: Must start with http:// or https://
- **Range Fields**: Must be within specified min/max values`
  }

  // Method to get Google Forms-specific field types
  getFieldTypeHandling(): Record<string, string> {
    return {
      'Short answer': 'Single line text input - use concise data',
      Paragraph: 'Multi-line text - use appropriate description length',
      'Multiple choice': 'Radio buttons - select one option',
      Checkboxes: 'Can select multiple options',
      Dropdown: 'Click arrow to expand, select from list',
      'File upload': 'Note requirement, skip unless specified',
      'Linear scale': 'Select number on scale based on context',
      'Multiple choice grid': 'Select radio button for each row',
      'Checkbox grid': 'Can select multiple checkboxes per row',
      Date: 'Use date picker or type in required format',
      Time: 'Use time picker or type in HH:MM format',
    }
  }

  // Method to get Google Forms-specific success indicators
  getSuccessIndicators(): string[] {
    return [
      'Green confirmation message "Your response has been recorded"',
      'Thank you page with Google Forms branding',
      'URL changes to confirmation page',
      'Option to "Submit another response" appears',
      'Confirmation screen shows timestamp of submission',
    ]
  }

  // Google Forms error handling guidance
  getErrorHandling(): Record<string, string> {
    return {
      'This field is required':
        'Fill the required field marked with red asterisk',
      'Please enter a valid email address':
        'Check email format (user@domain.com)',
      'Please enter a number': 'Remove any non-numeric characters',
      'Please enter a valid URL': 'Ensure URL starts with http:// or https://',
      'Response is too long': 'Use shorter description from data',
      'Please select an option': 'Choose from dropdown or radio button options',
    }
  }
}
