export const Prompts = {
  // Observation prompts
  discoverFormFields:
    'Find all form fields currently visible on the page: input boxes, textareas, dropdowns, checkboxes, radio buttons, and file uploads. Focus only on fields that are currently visible and interactable. Return each field with its label, placeholder text, and field type.',
  findStartButton:
    "Look for a prominent button or link to begin the application process. Common text includes: 'Start Application', 'Apply Now', 'Begin', 'Get Started', 'Continue', or 'Start Here'.",
  findNextButton:
    "Find the button to proceed to the next step or section. Look for: 'Next', 'Continue', 'Proceed', 'Next Step', 'Save & Continue', or arrow buttons (→).",
  findSubmitButton:
    "Locate the final submission button to complete the application. Look for: 'Submit Application', 'Send Application', 'Apply Now', 'Finish', 'Complete', 'Submit', or 'Send'.",
  extractSummary:
    'Analyze the current page state after the form submission process. Did you see a success message, confirmation page, thank you message, or email confirmation notice? Provide a detailed summary of what fields were filled, what actions were taken, and whether the submission appears to have succeeded based on page content and visual cues.',

  // AI-powered field matching prompt
  matchFieldWithData: (fieldDescription: string, dataPayload: Record<string, unknown>) => {
    const availableDataKeys = Object.keys(dataPayload).join(', ')
    return `Analyze this form field: "${fieldDescription}"
    
Available data keys: ${availableDataKeys}

Based on the field description, determine which data key from the payload would be the best match. Consider:
- Semantic meaning (e.g., "Company Name" matches "company_name")
- Common variations (e.g., "Startup Name" also matches "company_name") 
- Field context (e.g., "Tell us about your company" could match "company_description_long")
- Business context (e.g., "Founder Name" matches "lead_founder_name")

Return the best matching data key, a confidence score (0-100), and your reasoning. If no good match exists, return null for bestMatch and score 0.`
  },

  // Dynamic action prompts (functions that return strings)
  typeIntoDateField: (value: string, description: string) =>
    `Carefully type "${value}" into the date field labeled '${description}'. Clear the field first if it has existing content, then type the new value slowly to ensure proper input recognition.`,
  
  clickDropdown: (description: string) =>
    `Click on the dropdown field labeled '${description}' to open the options menu. Wait for the dropdown to fully expand before proceeding.`,

  selectDropdownOption: (value: string) =>
    `From the currently open dropdown options, find and click the option that best matches or contains "${value}". Look for exact matches first, then partial matches.`,
  
  fillGenericInput: (description: string, value: string) =>
    `Locate and focus on the input field labeled '${description}', clear any existing content, then type: "${value}". Ensure the field accepts the input before proceeding.`,

  // Smart dropdown handling for industry and other enum fields
  fillDropdownSmart: (description: string, value: string) =>
    `Fill the dropdown field labeled '${description}' intelligently:
    1. First click the dropdown to open it
    2. Type the first 2-3 characters of "${value}" to filter options
    3. Look for the closest matching option (e.g., "AI" for "Artificial Intelligence", "Tech" for "Technology", "Soft" for "Software")
    4. Select the best match from the filtered dropdown options
    5. If no close match exists, select the most relevant general category`,

  selectFromDropdown: (targetValue: string) =>
    `Look at the dropdown options that are now visible and select the one that best matches "${targetValue}". Priority order:
    1. Exact match
    2. Partial match (e.g., "AI" for "Artificial Intelligence") 
    3. Related category (e.g., "Technology" for tech-related terms)
    4. Closest semantic match
    5. IMPORTANT: If no good match exists, select the FIRST available option to keep the form progressing`,

  selectAnyFromDropdown: () =>
    `The dropdown is open but no close match was found for the target value. Select ANY of the available dropdown options to continue with the form. Just pick the first visible option or any reasonable choice to keep progressing.`,

  forceSelectAnyDropdownOption: () =>
    `URGENT: The dropdown selection is failing. Force select ANY available option from the dropdown to proceed. Look for ANY clickable dropdown option, list item, or selectable element and click it immediately. Priority is PROGRESS over perfect matching.`,

  pressEnterToSelect: () =>
    `Press the Enter key to select the currently highlighted/focused option in the dropdown, or use Tab to navigate and Enter to select any available option.`,

  answerQuestion: (question: string, answer: string) =>
    `Find the input field for the question "${question}" and provide the answer: "${answer}". Make sure to fill the correct field that corresponds to this specific question.`,
  
  // AI-powered question answering for complex fields
  answerComplexQuestion: (question: string, startupData: Record<string, unknown>, foundersData: Record<string, unknown>[]) => {
    return `You are an AI assistant helping to fill out a form for a startup. Answer this question: "${question}"

Use the following startup information to craft a thoughtful, relevant response:

Company Data: ${JSON.stringify(startupData, null, 2)}
Founders Data: ${JSON.stringify(foundersData, null, 2)}

Guidelines:
- Be specific and factual based on the provided data
- Keep answers concise but informative
- Tailor the response to what the question is asking for
- If specific data isn't available, provide a professional response based on context
- For open-ended questions, synthesize multiple data points into a coherent answer

Provide a well-structured answer that would be appropriate for a VC application form.`
  },
  
  // Enhanced field detection prompts
  findCurrentlyVisibleFields:
    'Identify all form fields that are currently visible and ready for input on this page. Ignore fields that are hidden, disabled, or in collapsed sections. Focus on the immediate next field(s) that need to be filled.',
    
  checkFieldValidation: (fieldDescription: string) =>
    `After filling the field '${fieldDescription}', check if there are any validation errors, required field indicators, or error messages displayed. Report the current state of the field.`,
    
  scrollToNextSection:
    'Scroll down slowly to reveal more form fields if the current section appears to be complete. Look for additional form sections, steps, or pages that might contain more fields to fill.',

  // Enhanced complex question detection
  identifyComplexQuestions: 
    'Scan the current page for complex, open-ended questions that require thoughtful responses rather than simple data entry. Look for questions like: "Tell us about your company", "What problem are you solving?", "Describe your market opportunity", "What makes your team unique?", etc. These questions typically have larger text areas and require more than basic data entry.'
}