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
    const companyName = smartData.primary_data.company_name || 'TestStartup Inc'
    const founderName = smartData.primary_data.lead_founder_name || 'John Doe'
    const founderEmail =
      smartData.primary_data.lead_founder_email || 'founder@startup.com'
    const founderPhone = smartData.primary_data.lead_founder_phone || ''
    const companyDescription =
      smartData.description_by_length.medium ||
      smartData.description_by_length.short

    const instruction = `You are a Contact Form specialist agent. Navigate to ${targetUrl} and complete the contact form for ${targetName}.

**CORE INFORMATION:**
- Name: "${founderName}"
- Company: "${companyName}"
- Email: "${founderEmail}"
- Phone: "${founderPhone}"
- Message: "${companyDescription}"

**CONTACT FORM STRATEGY:**

**1. Page Navigation**
- Navigate to the target URL
- Scroll down to locate the contact form
- Take screenshot of the form area
- Identify all form fields (usually: Name, Email, Company, Message)

**2. Form Field Filling**
- **Name field**: Enter founder name exactly: "${founderName}"
- **Email field**: Enter founder email exactly: "${founderEmail}"
- **Company field**: Enter company name exactly: "${companyName}"
- **Message/Description field**: Enter the pre-written description
- **Phone field** (if present): Enter "${founderPhone}" if available

**3. Message Field Strategy**
- Use the medium-length company description for message field
- DO NOT modify or improvise - use exact text provided
- If character limit, use short description instead
- Professional, compelling message from provided data

**4. Additional Fields Handling**
- **Subject field**: Use format "Partnership Inquiry - ${companyName}"
- **Industry dropdown**: Select from these options: ${smartData.industry_variations.slice(0, 3).join(', ')}
- **Budget/Investment dropdowns**: Select appropriate funding stage option
- **How did you hear**: Select "Website" or "Online" if required
- **Company size**: Select appropriate team size if available

**5. Form Submission**
- Verify all fields are completed
- Look for checkbox agreements (terms/privacy) and check if required
- Click Submit/Send button
- Wait for confirmation message or page redirect
- Take screenshot of success confirmation

**SUCCESS CRITERIA:**
- Clean, professional contact form submission
- Accurate contact information
- Compelling message using provided description
- Successful submission with confirmation

Complete the contact form efficiently and submit.`

    // Validate instruction quality
    const validation = this.validateInstruction(instruction)
    if (!validation.isValid) {
      console.warn(
        'Contact Form instruction validation issues:',
        validation.issues,
      )
    }

    return instruction
  }

  // Contact Form-specific helper methods
  getCommonFieldMappings(): Record<string, string> {
    return {
      Name: 'lead_founder_name',
      'First Name': 'lead_founder_name (first part)',
      'Last Name': 'lead_founder_name (last part)',
      Email: 'lead_founder_email',
      Company: 'company_name',
      Organization: 'company_name',
      Phone: 'lead_founder_phone',
      Message: 'description_by_length.medium',
      Comments: 'description_by_length.medium',
      Description: 'description_by_length.long',
      Subject: 'Partnership Inquiry - [Company Name]',
      Industry: 'company_industry',
      Website: 'company_website',
    }
  }

  // Method to generate subject line variations
  getSubjectLineOptions(companyName: string): string[] {
    return [
      `Partnership Inquiry - ${companyName}`,
      `Investment Opportunity - ${companyName}`,
      `Business Inquiry from ${companyName}`,
      `Collaboration Request - ${companyName}`,
      `${companyName} - Partnership Discussion`,
    ]
  }

  // Contact form success indicators
  getSuccessIndicators(): string[] {
    return [
      'Success message "Thank you for contacting us"',
      'Confirmation message "Your message has been sent"',
      '"We will get back to you" message',
      'Page redirect to thank you/success page',
      'Email confirmation message appears',
      'Form fields clear after submission',
      'Success icon or checkmark appears',
    ]
  }

  // Common contact form field variations
  getFieldVariations(): Record<string, string[]> {
    return {
      name: ['Name', 'Full Name', 'Your Name', 'Contact Name'],
      email: ['Email', 'Email Address', 'Your Email', 'Contact Email'],
      company: ['Company', 'Company Name', 'Organization', 'Business Name'],
      phone: ['Phone', 'Phone Number', 'Contact Number', 'Mobile'],
      message: ['Message', 'Comments', 'Description', 'Inquiry', 'Details'],
      subject: ['Subject', 'Topic', 'Regarding', 'About'],
    }
  }
}
