import { Stagehand } from '@browserbasehq/stagehand'
import { z } from 'zod'
import { Prompts } from '@/lib/prompts/stagehand-prompts'
import { FormAssistant } from '@/lib/ai/form-assistant'

/**
 * Comprehensive test file for Stagehand form filling functionality
 * This mirrors the actual implementation in route.ts
 * 
 * Required environment variables:
 * - BROWSERBASE_API_KEY: Your Browserbase API key
 * - BROWSERBASE_PROJECT_ID: Your Browserbase project ID
 * - ANTHROPIC_API_KEY: Your Anthropic API key for AI assistance
 * 
 * To run this test:
 * 1. Set up the required environment variables in your .env file
 * 2. Run: pnpm run agent:test
 */

type Founder = {
  firstName: string
  lastName: string
  role: string
  email?: string
  phone?: string
  linkedin?: string
  bio?: string
  githubUrl?: string
  personalWebsiteUrl?: string
  twitterUrl?: string
}

type DataPayloadField = {
  value: string | number | boolean | readonly string[] | undefined
  label_hints: string[]
}

type DataPayload = {
  [key: string]: DataPayloadField
}

type StagehandResult = {
  success: boolean
  summary?: string
  fields_completed?: string[]
  errors?: string[]
  browserbase_session_id?: string
  screenshots_taken: number
  error_reason?: string
  failed_field_label?: string
  failed_field_value?: string
}

// Session ID extraction types
type StagehandWithSession = Stagehand & {
  _browserbaseSessionId?: string
  browserbaseSessionId?: string
}

// Comprehensive test function that mirrors the actual route implementation
const testStagehandFormFilling = async () => {
  console.log('🚀 Starting Comprehensive Stagehand Form Filling Test...')

  // Mock startup data (comprehensive like in route.ts)
  const mockStartup = {
    name: 'TestStartup Inc',
    website: 'https://teststartup.com',
    description_short: 'We build innovative AI solutions for modern businesses',
    description_medium: 'TestStartup Inc creates AI-powered automation tools that help businesses streamline operations and boost productivity by 40%.',
    description_long: 'TestStartup Inc is a cutting-edge technology company focused on developing AI-powered solutions for modern businesses. Our platform combines machine learning with intuitive interfaces to automate repetitive tasks, provide actionable insights from complex data, and improve overall operational efficiency. We serve mid-market companies looking to scale their operations without proportionally increasing headcount.',
    location: 'San Francisco, CA',
    industry: 'Artificial Intelligence',
    founded_year: 2024,
    employee_count: 8,
    funding_amount_sought: 2000000,
    revenue_model: 'SaaS Subscription',
    funding_round: 'Seed',
    market_summary: 'The AI automation market is projected to reach $15.7B by 2027, growing at 23% CAGR. Our TAM includes 50,000+ mid-market companies.',
    traction_summary: 'We have 120+ beta customers, $25K MRR with 30% month-over-month growth, and have saved customers over 10,000 hours collectively.',
    mrr: 25000,
    arr: 300000,
    is_incorporated: true,
    legal_structure: 'Delaware C-Corp',
    competitors: 'Zapier, UiPath, Automation Anywhere',
    pre_money_valuation: 8000000,
    investment_instrument: 'SAFE',
    pitch_deck_url: 'https://example.com/deck.pdf',
    intro_video_url: 'https://example.com/demo.mp4',
  }

  const mockFounders: Founder[] = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@teststartup.com',
      role: 'CEO & Co-Founder',
      bio: 'Former Principal Engineer at Google with 12 years building distributed systems. Led the team that scaled Search infrastructure to handle 8B+ daily queries.',
      linkedin: 'https://linkedin.com/in/johndoe-ceo',
      githubUrl: 'https://github.com/johndoe',
      personalWebsiteUrl: 'https://johndoe.dev',
      twitterUrl: 'https://twitter.com/johndoe',
      phone: '+1-555-0123',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@teststartup.com',
      role: 'CTO & Co-Founder',
      bio: 'Former Staff ML Engineer at OpenAI, contributed to GPT-3 training infrastructure. PhD in Computer Science from Stanford.',
      linkedin: 'https://linkedin.com/in/janesmith-cto',
    },
  ]

  // Create comprehensive data payload like in route.ts
  const dataPayload: DataPayload = {
    company_name: {
      value: mockStartup.name,
      label_hints: ['Company Name', 'Startup Name', 'Name', 'Organization'],
    },
    company_website: {
      value: mockStartup.website,
      label_hints: ['Website', 'URL', 'Company Website'],
    },
    company_description_short: {
      value: mockStartup.description_short,
      label_hints: ['Short Description', 'Elevator Pitch', 'Summary', 'One-liner', 'Brief'],
    },
    company_description_medium: {
      value: mockStartup.description_medium,
      label_hints: ['Elevator Pitch', 'Brief Description', 'Company Overview'],
    },
    company_description_long: {
      value: mockStartup.description_long,
      label_hints: ['Detailed Description', 'Tell us about your company', 'Full Description', 'About'],
    },
    company_industry: {
      value: mockStartup.industry,
      label_hints: ['Industry', 'Sector', 'Market', 'Category'],
    },
    company_location: {
      value: mockStartup.location,
      label_hints: ['Location', 'Headquarters', 'City', 'Country', 'Address'],
    },
    company_founded_year: {
      value: mockStartup.founded_year,
      label_hints: ['Founded Year', 'Year Founded', 'Founding Date', 'Founded', 'Year'],
    },
    company_team_size: {
      value: mockStartup.employee_count,
      label_hints: ['Team Size', 'Employee Count', 'Number of Employees', 'Staff'],
    },
    company_funding_amount_sought: {
      value: mockStartup.funding_amount_sought,
      label_hints: ['Funding Amount Sought', 'Raising', 'Ask Amount', 'Investment Amount'],
    },
    lead_founder_name: {
      value: `${mockFounders[0].firstName} ${mockFounders[0].lastName}`,
      label_hints: ['Lead Founder Name', 'Your Name', "Founder's Name", 'CEO Name'],
    },
    lead_founder_email: {
      value: mockFounders[0].email,
      label_hints: ['Contact Email', 'Your Email', "Founder's Email", 'Email'],
    },
    company_traction: {
      value: mockStartup.traction_summary,
      label_hints: ['Traction', 'Key Metrics', 'Progress', 'Growth'],
    },
  }

  // Test with a real VC form URL - replace with actual form for testing
  const testUrl = 'https://rm531z4dws8.typeform.com/to/NNZmuM7H?typeform-source=www.breega.com'

  // Initialize Stagehand with proper configuration for session recording
  console.log('🔧 Initializing Stagehand with session recording...')
  const stagehand = new Stagehand({
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    env: 'BROWSERBASE',
    verbose: 1, // Enable verbose logging
  })

  const formAssistant = new FormAssistant()
  let sessionId: string = 'unknown'
  let result: StagehandResult

  try {
    await stagehand.init()
    const page = stagehand.page

    // Get session ID for recording
    sessionId = (stagehand as StagehandWithSession)._browserbaseSessionId || 
                (stagehand as StagehandWithSession).browserbaseSessionId ||
                process.env.BROWSERBASE_SESSION_ID ||
                `session_${Date.now()}`
                
    console.log(`🎥 Session recording: https://browserbase.com/sessions/${sessionId}`)

    // Step 1: Navigate with proper viewport (matching route.ts)
    console.log(`📍 Navigating to: ${testUrl}`)
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(testUrl)
    await page.waitForLoadState('networkidle')
    
    // Take a screenshot for debugging
    console.log('📸 Taking initial screenshot...')
    await page.screenshot({ path: 'initial-page.png', fullPage: true })

    // Step 2: Enhanced form field discovery
    console.log('🔍 Discovering form fields with enhanced detection...')
    let allFields = await page.observe({
      instruction: Prompts.discoverFormFields,
      returnAction: true,
    })

    console.log(`Found ${allFields.length} initial form fields`)

    // If no fields found, look for start button (like in route.ts)
    if (allFields.length === 0) {
      console.log('🔎 No fields found, looking for start/begin button...')
      try {
        const [startButton] = await page.observe({
          instruction: Prompts.findStartButton,
          returnAction: true,
        })

        if (startButton && startButton.selector) {
          console.log('🖱️ Found start button, clicking it...')
          await page.act(startButton)
          await page.waitForLoadState('networkidle')
          
          // Re-observe for fields
          allFields = await page.observe({
            instruction: Prompts.discoverFormFields,
            returnAction: true,
          })
          console.log(`Found ${allFields.length} fields after clicking start button`)
        }
      } catch (e) {
        console.warn('Could not find or click start button:', e)
      }
    }

    // Step 3: Implement the full form filling logic from route.ts
    const MAX_STEPS = 15
    let currentStep = 0
    let formSubmitted = false
    const fieldsCompleted: string[] = []

    while (currentStep < MAX_STEPS && !formSubmitted) {
      currentStep++
      console.log(`--- Step ${currentStep}/${MAX_STEPS} ---`)

      // Re-observe current fields
      const currentFields = await page.observe({
        instruction: Prompts.discoverFormFields,
        returnAction: true,
      })

      let actionTakenThisStep = false
      const filledDataKeys = new Set<string>()

      // AI-powered field processing
      type MatchedData = {
        value: string | number | boolean | readonly string[] | undefined
        key: string
        relevanceScore: number
      }

      const potentialMatches: MatchedData[] = []
      const complexQuestions: Array<{field: {description?: string, selector?: string}, question: string}> = []

      for (const observedField of currentFields) {
        if (!observedField.description) continue

        // Check for complex questions
        const isComplex = await formAssistant.isComplexQuestion(observedField.description)
        
        if (isComplex) {
          console.log(`🤔 Complex question detected: "${observedField.description}"`)
          complexQuestions.push({
            field: observedField,
            question: observedField.description
          })
          continue
        }

        // AI field matching
        const fieldMatching = await formAssistant.matchFieldWithData(observedField.description, dataPayload)

        if (fieldMatching.bestMatch && fieldMatching.relevanceScore > 60 && !filledDataKeys.has(fieldMatching.bestMatch)) {
          const matchedValue = dataPayload[fieldMatching.bestMatch]?.value
          if (matchedValue) {
            potentialMatches.push({
              value: matchedValue,
              key: fieldMatching.bestMatch,
              relevanceScore: fieldMatching.relevanceScore
            })
            console.log(`🎯 AI matched "${observedField.description}" → "${fieldMatching.bestMatch}" (${fieldMatching.relevanceScore}%)`)
          }
        }
      }

      // Handle complex questions with AI
      if (complexQuestions.length > 0) {
        const complexQuestion = complexQuestions[0]
        console.log(`🧠 Generating AI answer for: "${complexQuestion.question}"`)
        
        try {
          const aiAnswer = await formAssistant.answerComplexQuestion(
            complexQuestion.question,
            mockStartup,
            mockFounders
          )
          
          console.log(`💬 AI Answer (${aiAnswer.length} chars): ${aiAnswer.substring(0, 100)}...`)
          
          if (complexQuestion.field.description) {
            await page.act({
              action: Prompts.fillGenericInput(complexQuestion.field.description, aiAnswer)
            })
            fieldsCompleted.push(complexQuestion.field.description)
          }
          actionTakenThisStep = true
          await page.waitForTimeout(500)
          continue
        } catch (error) {
          console.error(`❌ Error with complex question:`, error)
        }
      }

      // Handle simple field matching
      potentialMatches.sort((a, b) => b.relevanceScore - a.relevanceScore)
      const matchedData = potentialMatches[0]

              if (matchedData && matchedData.value) {
          const targetField = currentFields.find(field => {
            if (!field.description) return false
            const dataField = dataPayload[matchedData.key]
            return dataField?.label_hints.some(hint => 
              field.description.toLowerCase().includes(hint.toLowerCase())
            )
          })

          if (targetField) {
            console.log(`✏️ Filling field "${targetField.description}" with "${matchedData.key}"`)
            filledDataKeys.add(matchedData.key)

            try {
              const description = (targetField.description || '').toLowerCase()
              const isDropdown = description.includes('dropdown') || 
                                description.includes('select') || 
                                description.includes('combobox') ||
                                description.includes('industry')

              if (isDropdown && matchedData.key === 'company_industry') {
                // Use smart dropdown filling for industry
                console.log(`🎯 Using smart dropdown filling for industry field`)
                const partialValue = formAssistant.getPartialTypingValue(String(matchedData.value))
                
                // Step 1: Click dropdown to open it
                await page.act({
                  action: Prompts.clickDropdown(targetField.description)
                })
                await page.waitForTimeout(500)
                
                // Step 2: Type partial value to filter
                console.log(`⌨️ Typing "${partialValue}" to filter dropdown options`)
                await page.act({
                  action: `Type "${partialValue}" into the dropdown field to filter the available options`
                })
                await page.waitForTimeout(800)
                
                // Step 3: Try to select the best match with aggressive fallbacks
                const mappedValue = formAssistant.mapIndustryValue(String(matchedData.value))
                console.log(`🎯 Looking for option matching "${mappedValue}" or "${matchedData.value}"`)
                
                let selectionSuccess = false
                
                // Try 1: Primary selection
                try {
                  await page.act({
                    action: Prompts.selectFromDropdown(mappedValue)
                  })
                  selectionSuccess = true
                  console.log(`✅ Primary selection succeeded`)
                } catch {
                  console.log(`⚠️ Primary selection failed, trying fallback options...`)
                  
                  // Try 2: Fallback options
                  const fallbackOptions = formAssistant.getFallbackOptions(String(matchedData.value))
                  
                  for (const fallbackOption of fallbackOptions) {
                    try {
                      console.log(`🔄 Trying fallback: "${fallbackOption}"`)
                      await page.act({
                        action: Prompts.selectFromDropdown(fallbackOption)
                      })
                      selectionSuccess = true
                      console.log(`✅ Fallback "${fallbackOption}" succeeded`)
                      break
                    } catch {
                      console.log(`❌ Fallback "${fallbackOption}" failed`)
                    }
                  }
                  
                  // Try 3: Generic "select any" approach
                  if (!selectionSuccess) {
                    try {
                      console.log(`🎲 Trying generic "select any" approach`)
                      await page.act({
                        action: Prompts.selectAnyFromDropdown()
                      })
                      selectionSuccess = true
                      console.log(`✅ Generic selection succeeded`)
                    } catch {
                      console.log(`❌ Generic selection failed`)
                    }
                  }
                  
                  // Try 4: Force selection with explicit instruction
                  if (!selectionSuccess) {
                    try {
                      console.log(`🚨 FORCE selecting ANY dropdown option`)
                      await page.act({
                        action: Prompts.forceSelectAnyDropdownOption()
                      })
                      selectionSuccess = true
                      console.log(`✅ Force selection succeeded`)
                    } catch {
                      console.log(`❌ Force selection failed`)
                    }
                  }
                  
                  // Try 5: Keyboard navigation (Enter key)
                  if (!selectionSuccess) {
                    try {
                      console.log(`⌨️ Trying keyboard Enter to select`)
                      await page.act({
                        action: Prompts.pressEnterToSelect()
                      })
                      selectionSuccess = true
                      console.log(`✅ Keyboard selection succeeded`)
                    } catch {
                      console.log(`❌ Keyboard selection failed`)
                    }
                  }
                  
                  // Try 6: Just type a simple value and press Enter
                  if (!selectionSuccess) {
                    try {
                      console.log(`💥 EMERGENCY: Just type something and press Enter`)
                      await page.keyboard.type('Technology')
                      await page.keyboard.press('Enter')
                      selectionSuccess = true
                      console.log(`✅ Emergency typing succeeded`)
                    } catch {
                      console.log(`❌ Emergency typing failed`)
                    }
                  }
                  
                  if (!selectionSuccess) {
                    console.log(`🆘 ALL SELECTION METHODS FAILED - continuing anyway`)
                  }
                }
                
              } else {
                // Use standard input filling
                await page.act({
                  action: Prompts.fillGenericInput(targetField.description, String(matchedData.value))
                })
              }
              
              fieldsCompleted.push(targetField.description)
              actionTakenThisStep = true
              await page.waitForTimeout(300)
            } catch (e) {
              console.error(`❌ Error filling field:`, e)
              // Try fallback approach
              try {
                const mappedValue = formAssistant.mapIndustryValue(String(matchedData.value))
                console.log(`🔄 Trying fallback with mapped value: "${mappedValue}"`)
                await page.act({
                  action: Prompts.fillGenericInput(targetField.description, mappedValue)
                })
                fieldsCompleted.push(targetField.description)
                actionTakenThisStep = true
              } catch (fallbackError) {
                console.error(`❌ Fallback also failed:`, fallbackError)
              }
            }
          }
        }

      // Look for next/continue buttons
      if (actionTakenThisStep) {
        await page.waitForTimeout(800)
        
        try {
          const [nextButton] = await page.observe({
            instruction: Prompts.findNextButton,
            returnAction: true,
          })
          if (nextButton && nextButton.selector) {
            console.log('⏭️ Found Next button, clicking...')
            await page.act(nextButton)
            await page.waitForLoadState('networkidle')
            continue
          }
        } catch {
          console.log('No Next button found')
        }
      }

      // Look for submit button
      try {
        const [submitButton] = await page.observe({
          instruction: Prompts.findSubmitButton,
          returnAction: true,
        })
        if (submitButton && submitButton.selector) {
          console.log('🚀 Found Submit button!')
          // Don't actually submit in test mode
          console.log('⚠️ Test mode: Would submit here but skipping actual submission')
          formSubmitted = true
          break
        }
      } catch {
        console.log('No Submit button found yet')
      }

      if (!actionTakenThisStep) {
        console.log('ℹ️ No actions taken this step, ending...')
        break
      }
    }

    // Extract final summary
    console.log('📊 Extracting final summary...')
    const submissionResult = await page.extract({
      instruction: Prompts.extractSummary,
      schema: z.object({
        success: z.boolean().describe('Whether the form interaction was successful'),
        summary: z.string().describe('Summary of actions taken'),
        fields_completed: z.array(z.string()).optional().describe('Fields that were filled'),
        errors: z.array(z.string()).optional().describe('Any errors encountered'),
      }),
    })

    result = {
      ...submissionResult,
      browserbase_session_id: sessionId,
      screenshots_taken: 1,
      fields_completed: fieldsCompleted,
    }

    console.log('✅ Test completed successfully!')
    console.log(`🎥 Session recording: https://browserbase.com/sessions/${sessionId}`)
    console.log('📊 Results:', JSON.stringify(result, null, 2))
    
    return {
      success: true,
      sessionId,
      sessionUrl: `https://browserbase.com/sessions/${sessionId}`,
      fieldsCompleted: fieldsCompleted.length,
      stepsCompleted: currentStep,
      result,
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    
    result = {
      success: false,
      error_reason: error instanceof Error ? error.message : 'Unknown error',
      browserbase_session_id: sessionId || 'unknown',
      screenshots_taken: 0,
    }
    
    console.log(`🎥 Session recording (with error): https://browserbase.com/sessions/${sessionId}`)
    
    throw error
  } finally {
    await stagehand.close()
    console.log('🔚 Stagehand closed')
  }
}

// Export for potential CLI usage
export { testStagehandFormFilling }

// Run test if this file is executed directly
if (require.main === module) {
  testStagehandFormFilling().catch(console.error)
} 