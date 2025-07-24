import { NextRequest, NextResponse } from 'next/server'
import { Stagehand } from '@browserbasehq/stagehand'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Prompts } from '@/lib/prompts/stagehand-prompts'
import { FormAssistant } from '@/lib/ai/form-assistant'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Define types for better readability and type safety
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

type StagehandWithContext = Stagehand & {
  context?: {
    sessionId?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startupId, targetId, userId } = await request.json()

    if (!startupId || !targetId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    // 1. Fetch all necessary data from Supabase in parallel
    const [
      { data: startup, error: startupError },
      { data: target, error: targetError },
      { data: founders, error: foundersError },
      { data: commonResponses, error: commonResponsesError },
    ] = await Promise.all([
      supabaseAdmin.rpc('get_user_startup_data', {
        p_user_id: userId,
        p_startup_id: startupId,
      }),
      supabaseAdmin.rpc('get_target_by_id', { p_target_id: targetId }),
      supabaseAdmin.rpc('get_startup_founders', {
        p_user_id: userId,
        p_startup_id: startupId,
      }),
      supabaseAdmin.rpc('get_common_responses', {
        p_startup_id: startupId,
        p_user_id: userId,
      }),
    ])

    if (
      startupError ||
      targetError ||
      foundersError ||
      commonResponsesError ||
      !Array.isArray(commonResponses)
    ) {
      console.error({
        startupError,
        targetError,
        foundersError,
        commonResponsesError,
        commonResponses,
      })
      return NextResponse.json(
        { error: 'Failed to fetch required data from Supabase.' },
        { status: 500 },
      )
    }

    // Process founder data to get the lead founder
    const leadFounder: Founder | undefined = (founders as Founder[])?.[0]

    // 2. Create a structured data payload for the agent
    const dataPayload: DataPayload = {
      company_name: {
        value: startup.name,
        label_hints: ['Company Name', 'Startup Name', 'Name'],
      },
      company_website: {
        value: startup.website,
        label_hints: ['Website', 'URL'],
      },
      company_description_short: {
        value: startup.description_short,
        label_hints: [
          'Short Description',
          'Elevator Pitch',
          'Summary',
          'One-liner',
        ],
      },
      company_description_medium: {
        value: startup.description_medium,
        label_hints: ['Elevator Pitch', 'Brief Description'],
      },
      company_description_long: {
        value: startup.description_long,
        label_hints: [
          'Detailed Description',
          'Tell us about your company',
          'Full Description',
        ],
      },
      company_industry: {
        value: startup.industry,
        label_hints: ['Industry', 'Sector', 'Market'],
      },
      company_location: {
        value: startup.location,
        label_hints: ['Location', 'Headquarters', 'City', 'Country'],
      },
      company_founded_year: {
        value: startup.founded_year || undefined,
        label_hints: ['Founded Year', 'Year Founded', 'Founding Date', 'Founded', 'Year'],
      },
      company_incorporation_status: {
        value: startup.is_incorporated,
        label_hints: ['Incorporation Status', 'Incorporated?'],
      },
      company_legal_structure: {
        value: startup.legal_structure,
        label_hints: ['Legal Structure', 'Entity Type'],
      },
      company_team_size: {
        value: startup.employee_count,
        label_hints: ['Team Size', 'Employee Count', 'Number of Employees'],
      },
      company_revenue_model: {
        value: startup.revenue_model,
        label_hints: ['Revenue Model', 'Business Model'],
      },
      company_funding_stage: {
        value: startup.funding_round,
        label_hints: ['Funding Stage', 'Funding Round', 'Stage'],
      },
      company_funding_amount_sought: {
        value: startup.funding_amount_sought,
        label_hints: ['Funding Amount Sought', 'Raising', 'Ask Amount'],
      },
      company_pre_money_valuation: {
        value: startup.pre_money_valuation,
        label_hints: ['Pre-money Valuation', 'Valuation'],
      },
      company_investment_instrument: {
        value: startup.investment_instrument,
        label_hints: ['Investment Instrument', 'Instrument'],
      },
      company_competitors: {
        value: startup.competitors,
        label_hints: ['Competitors', 'Competitive Landscape'],
      },
      company_traction: {
        value: startup.traction_summary,
        label_hints: ['Traction', 'Key Metrics', 'Progress'],
      },
      company_market: {
        value: startup.market_summary,
        label_hints: ['Market', 'Market Size', 'TAM/SAM/SOM'],
      },
      lead_founder_name: {
        value: leadFounder
          ? `${leadFounder.firstName} ${leadFounder.lastName}`
          : undefined,
        label_hints: ['Lead Founder Name', 'Your Name', "Founder's Name"],
      },
      lead_founder_email: {
        value: leadFounder?.email,
        label_hints: ['Contact Email', 'Your Email', "Founder's Email"],
      },
      lead_founder_phone: {
        value: leadFounder?.phone,
        label_hints: ['Phone Number', 'Contact Number'],
      },
      lead_founder_linkedin: {
        value: leadFounder?.linkedin,
        label_hints: ['LinkedIn Profile', 'LinkedIn URL'],
      },
      founder_background: {
        value: leadFounder?.bio,
        label_hints: ['Founder Background', 'Experience', 'Bio'],
      },
      lead_founder_github: {
        value: leadFounder?.githubUrl,
        label_hints: ['GitHub Profile', 'GitHub URL'],
      },
      lead_founder_website: {
        value: leadFounder?.personalWebsiteUrl,
        label_hints: ['Personal Website', 'Founder Website'],
      },
      lead_founder_twitter: {
        value: leadFounder?.twitterUrl,
        label_hints: ['Twitter Profile', 'X Profile', 'Twitter URL'],
      },
      metrics_mrr: {
        value: startup.mrr,
        label_hints: ['MRR', 'Monthly Recurring Revenue'],
      },
      metrics_arr: {
        value: startup.arr,
        label_hints: ['ARR', 'Annual Recurring Revenue'],
      },
      team_founders: {
        value: (founders as Founder[])
          .map((f: Founder) => `${f.firstName} ${f.lastName} (${f.role})`)
          .join(', '),
        label_hints: ['Founders', 'Team', 'Who are the founders?'],
      },
      asset_pitch_deck: {
        value: startup.pitch_deck_url,
        label_hints: ['Pitch Deck', 'Deck', 'Presentation'],
      },
      asset_demo_video: {
        value: startup.intro_video_url,
        label_hints: ['Demo Video', 'Product Demo', 'Intro Video'],
      },
    }

    // 3. Queue the submission in the database
    const { data: queueData, error: queueError } = await supabaseAdmin.rpc(
      'queue_submission',
      {
        p_user_id: userId,
        p_startup_id: startupId,
        p_target_id: targetId,
        p_browserbase_job_id: `stagehand_${Date.now()}`,
      },
    )

    if (queueError) {
      console.error('Queue submission error:', queueError)
      return NextResponse.json({ error: queueError.message }, { status: 500 })
    }

    const { submission_id: submissionId, status, queue_position } = queueData

    // If the submission was queued, return immediately
    if (status === 'queued') {
      return NextResponse.json({
        success: true,
        status: 'queued',
        queuePosition: queue_position,
        targetName: target.name,
        submissionId,
      })
    }

    // 5. Initialize Stagehand and AI assistant and run the submission
    console.log('🚀 Starting Stagehand form filling for:', startup.name)
    const stagehand = new Stagehand({
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      env: 'BROWSERBASE',
    })
    const formAssistant = new FormAssistant()

    let sessionId: string
    let result: StagehandResult

    try {
      await stagehand.init()
      const page = stagehand.page

      // Step 1: Navigate to the target URL with proper viewport
      console.log(`Setting viewport and navigating to ${target.application_url}...`)
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto(target.application_url)
      await page.waitForLoadState('networkidle')

      // Step 2: Dynamically discover and fill form fields based on page layout
      console.log('Discovering all form fields on the page...')

      let allFields = await page.observe({
        instruction: Prompts.discoverFormFields,
        returnAction: true,
      })

      // If no fields are found, look for a "Start" button to initiate the form
      if (allFields.length === 0) {
        console.log(
          'No form fields found. Looking for a start button to initiate the form...',
        )
        try {
          const [startButton] = await page.observe({
            instruction: Prompts.findStartButton,
            returnAction: true,
          })

          if (startButton && startButton.selector) {
            console.log('Found a start button. Clicking it...')
            await page.act(startButton)

            // Re-observe the page for form fields
            console.log(
              'Re-observing for form fields after clicking start button...',
            )
            allFields = await page.observe({
              instruction: Prompts.discoverFormFields,
              returnAction: true,
            })
          } else {
            console.warn(
              'Could not find a start button. The form might be unloadable or structured unusually.',
            )
          }
        } catch (e) {
          console.error('Error trying to find and click a start button:', e)
        }
      }

      console.log(`Discovered ${allFields.length} initial potential fields.`)

      const MAX_STEPS = 30  // Reduced to prevent excessive loops
      let currentStep = 0
      let formSubmitted = false

      type MatchedData = {
        value: string | number | boolean | readonly string[] | undefined
        key: string
        relevanceScore: number
      }

      while (currentStep < MAX_STEPS && !formSubmitted) {
        currentStep++
        console.log(`--- Step ${currentStep}/${MAX_STEPS} ---`)

        // Re-observe the page on each step to get the current state
        const currentFields = await page.observe({
          instruction: Prompts.discoverFormFields,
          returnAction: true,
        })

        let actionTakenThisStep = false
        const filledDataKeys = new Set<string>()

        // 1. Use AI to intelligently match fields with data and detect complex questions
        const potentialMatches: MatchedData[] = []
        const complexQuestions: Array<{field: {description: string}, question: string}> = []
        
        for (const observedField of currentFields) {
          if (!observedField.description) continue

          // First, check if this is a complex question that needs AI-generated response
          const isComplex = await formAssistant.isComplexQuestion(observedField.description)
          
          if (isComplex) {
            console.log(`Detected complex question: "${observedField.description}"`)
            complexQuestions.push({
              field: observedField,
              question: observedField.description
            })
            continue
          }

          // For simple fields, use AI-powered field matching
          const fieldMatching = await formAssistant.matchFieldWithData(observedField.description, dataPayload)

          if (fieldMatching.bestMatch && fieldMatching.relevanceScore > 60 && !filledDataKeys.has(fieldMatching.bestMatch)) {
            const matchedValue = dataPayload[fieldMatching.bestMatch]?.value
            if (matchedValue) {
              potentialMatches.push({
                value: matchedValue,
                key: fieldMatching.bestMatch,
                relevanceScore: fieldMatching.relevanceScore
              })
              console.log(`AI matched field "${observedField.description}" with "${fieldMatching.bestMatch}" (confidence: ${fieldMatching.relevanceScore}%) - ${fieldMatching.reasoning}`)
            }
          }
        }

        // 2. Handle complex questions first with AI-generated responses
        if (complexQuestions.length > 0) {
          const complexQuestion = complexQuestions[0] // Process one at a time
          console.log(`Generating AI response for: "${complexQuestion.question}"`)
          
          try {
            const aiAnswer = await formAssistant.answerComplexQuestion(
              complexQuestion.question,
              startup,
              founders as Founder[]
            )
            
            console.log(`Generated AI answer (${aiAnswer.length} chars): ${aiAnswer.substring(0, 100)}...`)
            
            await page.act({
              action: Prompts.fillGenericInput(complexQuestion.field.description, aiAnswer)
            })
            
            actionTakenThisStep = true
            await page.waitForTimeout(500)
            
            // Continue to next step after handling complex question
            continue
          } catch (error) {
            console.error(`Error handling complex question "${complexQuestion.question}":`, error)
            // Continue with simple field matching if complex question fails
          }
        }

        // 2. Sort matches by relevance score and process the best one
        potentialMatches.sort((a, b) => b.relevanceScore - a.relevanceScore)
        const matchedData = potentialMatches[0]

        if (matchedData && matchedData.value) {
          // Find the corresponding field for this match
          const targetField = currentFields.find(field => {
            if (!field.description) return false
            const dataField = dataPayload[matchedData.key]
            return dataField?.label_hints.some(hint => 
              field.description.toLowerCase().includes(hint.toLowerCase())
            )
          })

          if (targetField) {
            console.log(
              `[Score: ${matchedData.relevanceScore}] Processing field "${targetField.description}" with data key "${matchedData.key}"`,
            )
            filledDataKeys.add(matchedData.key)

            try {
              const description = (targetField.description || '').toLowerCase()
              const isDateField = description.includes('date') || description.includes('year') || description.includes('founded')
              const isDropdown =
                description.includes('dropdown') ||
                description.includes('select') ||
                description.includes('combobox')

              // Special handling for founded year - just use the year number
              if (matchedData.key === 'company_founded_year') {
                console.log(
                  `Handling founded year field with value: ${matchedData.value}`,
                )
                await page.act({
                  action: Prompts.fillGenericInput(
                    targetField.description,
                    String(matchedData.value),
                  ),
                })
              } else if (isDateField) {
                console.log(
                  `Handling date field for key '${matchedData.key}'...`,
                )
                await page.act({
                  action: Prompts.typeIntoDateField(
                    String(matchedData.value),
                    targetField.description,
                  ),
                })
              } else if (isDropdown) {
                console.log(
                  `Handling dropdown for key '${matchedData.key}'...`,
                )
                
                if (matchedData.key === 'company_industry') {
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
                  
                  // Step 3: Try to select the best match with aggressive fallback strategy
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
                    
                    // Try 4: Force selection
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
                    
                    // Try 5: Keyboard navigation
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
                    
                    // Try 6: Emergency typing
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
                  // Standard dropdown handling
                  await page.act({
                    action: Prompts.clickDropdown(targetField.description),
                  })
                  await page.waitForTimeout(500)
                  await page.act({
                    action: Prompts.selectDropdownOption(
                      String(matchedData.value),
                    ),
                  })
                }
              } else {
                console.log(
                  `Handling standard input for key '${matchedData.key}'...`,
                )
                await page.act({
                  action: Prompts.fillGenericInput(
                    targetField.description,
                    String(matchedData.value),
                  ),
                })
              }
              actionTakenThisStep = true
              
              // Add small delay after filling each field to prevent race conditions
              await page.waitForTimeout(300)
              
              // Validate field was filled successfully
              try {
                const validationResult = await page.extract({
                  instruction: Prompts.checkFieldValidation(targetField.description),
                  schema: z.object({
                    success: z.boolean().describe('Whether the field was filled successfully'),
                    hasErrors: z.boolean().describe('Whether there are validation errors'),
                    errorMessage: z.string().optional().describe('Any error message shown')
                  })
                })
                
                if (validationResult.hasErrors) {
                  console.warn(`Validation error for ${matchedData.key}: ${validationResult.errorMessage}`)
                  // Don't mark as processed if there's a validation error - might need retry
                } else {
                  console.log(`Successfully filled and validated field: ${matchedData.key}`)
                }
              } catch {
                console.warn(`Could not validate field ${matchedData.key}, proceeding anyway`)
              }
              
              // Only process one field per step for better control
              break
            } catch (e) {
              console.error(
                `Error processing field for key ${matchedData.key}:`,
                e,
              )
              
              // Try fallback approach for industry fields
              if (matchedData.key === 'company_industry') {
                try {
                  const mappedValue = formAssistant.mapIndustryValue(String(matchedData.value))
                  console.log(`🔄 Trying fallback with mapped value: "${mappedValue}"`)
                  await page.act({
                    action: Prompts.fillGenericInput(targetField.description, mappedValue)
                  })
                  console.log(`✅ Fallback succeeded for ${matchedData.key}`)
                } catch (fallbackError) {
                  console.error(`❌ Fallback also failed for ${matchedData.key}:`, fallbackError)
                }
              }
              
              // If field filling fails, mark it as processed to avoid infinite loops
              filledDataKeys.add(matchedData.key)
              
              // Try to continue with next field instead of getting stuck
              continue
            }
          }
        }

        if (actionTakenThisStep) {
          // Wait a bit for any dynamic content to load
          await page.waitForTimeout(800)
          
          // Check if there are more fields visible on current page before navigating
          try {
            const currentVisibleFields = await page.observe({
              instruction: Prompts.findCurrentlyVisibleFields,
              returnAction: true,
            })
            
            // If there are still visible fields, continue filling them
            if (currentVisibleFields && currentVisibleFields.length > 0) {
              console.log(`Found ${currentVisibleFields.length} more fields on current page, continuing to fill...`)
              continue
            }
          } catch (e) {
            console.warn('Could not check for visible fields:', e)
          }
          
          // Try to find and click next button
          try {
            const [nextButton] = await page.observe({
              instruction: Prompts.findNextButton,
              returnAction: true,
            })
            if (nextButton && nextButton.selector) {
              console.log('Found a "Next/Continue" button. Clicking it...')
              await page.act(nextButton)
              await page.waitForLoadState('networkidle')
              continue // Move to the next step in the loop
            }
          } catch {
            console.log("No 'Next' button found on this page.")
          }
          
          // Try scrolling to reveal more content
          try {
            await page.act({ action: Prompts.scrollToNextSection })
            await page.waitForTimeout(500)
          } catch {
            console.log('Could not scroll to find more fields')
          }
        }

        // 2. If no fields were filled, look for a final submit button
        try {
          const [submitButton] = await page.observe({
            instruction: Prompts.findSubmitButton,
            returnAction: true,
          })
          if (submitButton && submitButton.selector) {
            console.log('Found the final submission button. Clicking it...')
            await page.act(submitButton)
            formSubmitted = true // Exit the loop
            break
          }
        } catch {
          console.log('No final submit button found yet.')
        }

        // 3. If no action was taken at all, we are likely done or stuck
        if (!actionTakenThisStep) {
          console.log(
            'No immediate actions available. Checking for alternative navigation or completion...',
          )
          
          // Last attempt to find any interactive elements
          try {
            const anyButtons = await page.observe({
              instruction: 'Find any clickable buttons, links, or interactive elements that might help progress the form or complete the submission',
              returnAction: true
            })
            
            if (anyButtons && anyButtons.length > 0) {
              console.log('Found potential navigation elements, trying the first one...')
              await page.act(anyButtons[0])
              await page.waitForTimeout(1000)
              continue
            }
          } catch (e) {
            console.warn('No alternative navigation found:', e)
          }
          
          console.log('No fields to fill and no navigation/submit buttons found. Ending interaction.')
          break
        }
      }

      // Step 5: Extract a detailed summary of what happened.
      console.log('Extracting submission result...')
      const submissionResult = await page.extract({
        instruction: Prompts.extractSummary,
        schema: z.object({
          success: z
            .boolean()
            .describe('Whether the form was successfully submitted.'),
          summary: z
            .string()
            .describe(
              'A summary of the actions taken and the final result.',
            ),
          fields_completed: z
            .array(z.string())
            .optional()
            .describe(
              'An array of field labels that were successfully filled.',
            ),
          errors: z
            .array(z.string())
            .optional()
            .describe('Any errors encountered during the process.'),
        }),
      })

      sessionId =
        (stagehand as StagehandWithContext).context?.sessionId || 'unknown'
      console.log(
        `🎥 Session recording available at: https://browserbase.com/sessions/${sessionId}`,
      )

      result = {
        ...submissionResult,
        screenshots_taken: 0, // This can be enhanced later if needed
      }
    } catch (error: unknown) {
      console.error('Stagehand error:', error)
      let errorMessage = 'An unknown error occurred during form filling.'
      if (error instanceof Error) {
        errorMessage = `Form filling failed: ${error.message}`
      }
      result = {
        success: false,
        error_reason: errorMessage,
        failed_field_label: 'Unknown',
        failed_field_value: 'Unknown',
        screenshots_taken: 0,
      }
      sessionId = 'unknown'
    } finally {
      await stagehand.close()
    }

    // 6. Update submission record with session data and final status
    if (sessionId !== 'unknown') {
      await supabaseAdmin.rpc('update_submission_session_data', {
        p_submission_id: submissionId,
        p_submission_type: 'fund',
        p_session_id: sessionId,
        p_session_replay_url: `https://browserbase.com/sessions/${sessionId}`,
        p_screenshots_taken: result.screenshots_taken || 0,
        p_debug_data: { stagehand_result: result, verbose_logging: true },
      })
    }

    await supabaseAdmin
      .from('submissions')
      .update({
        status: result.success ? 'completed' : 'failed',
        agent_notes: result.success ? result.summary : result.error_reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    // 7. Asynchronously trigger the queue processor to start the next job
    // We don't need to await this, just fire and forget.
    console.log(`Triggering queue processor for startup ${startupId}...`)
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-queue`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }).catch((e) => console.error('Failed to trigger queue processor:', e))

    return NextResponse.json({
      success: true,
      status: result.success ? 'completed' : 'failed',
      targetName: target.name,
      submissionId,
      result,
      session_id: sessionId,
      session_replay_url:
        sessionId !== 'unknown'
          ? `https://browserbase.com/sessions/${sessionId}`
          : null,
    })
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred in the API.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    console.error('Form submission API error:', error)
    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    )
  }
}
