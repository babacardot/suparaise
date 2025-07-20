import { createClient } from '@supabase/supabase-js';
import { Hyperbrowser } from '@hyperbrowser/sdk';
import { chromium, Page } from 'playwright-core';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// --- Initialize Clients ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and Service Key must be provided.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const hbClient = new Hyperbrowser({
    apiKey: process.env.HYPERBROWSER_API_KEY,
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


// --- Action Schemas (The "Tools" our agent can use) ---
const fillActionSchema = z.object({
    action: z.literal('fill'),
    selector: z.string().describe('CSS selector for the input field'),
    value: z.string().describe('The value to fill in'),
    description: z.string().describe('A brief explanation of why this action is being taken'),
});

const clickActionSchema = z.object({
    action: z.literal('click'),
    selector: z.string().describe('CSS selector for the element to click'),
    description: z.string().describe('A brief explanation of why this action is being taken'),
});

const selectActionSchema = z.object({
    action: z.literal('select'),
    selector: z.string().describe('CSS selector for the select element'),
    value: z.string().describe('The value of the option to select'),
    description: z.string().describe('A brief explanation of why this action is being taken'),
});

const uploadActionSchema = z.object({
    action: z.literal('upload'),
    selector: z.string().describe('CSS selector for the file input element'),
    fileName: z.string().describe('The name of the file to be uploaded, e.g., "pitch-deck.pdf"'),
    description: z.string().describe('A brief explanation that a file upload is required'),
});

const submitActionSchema = z.object({
    action: z.literal('submit'),
    description: z.string().describe('A brief explanation that the form is ready for submission'),
});

const agentActionSchema = z.union([
    fillActionSchema,
    clickActionSchema,
    selectActionSchema,
    uploadActionSchema,
    submitActionSchema,
]);
type AgentAction = z.infer<typeof agentActionSchema>;


// --- Placeholder Types (We will refine these) ---
type StartupData = {
    id: string;
    name: string;
    pitch_deck_url?: string;
    // Add other startup fields as needed
};
type TargetData = {
    id: string;
    name: string;
    application_url: string;
    // Add other target fields as needed
};

// --- Main Execution Function ---
export const executeJob = async (submissionId: string) => {
    console.log(`[${submissionId}] Starting job...`);

    let session: Awaited<ReturnType<typeof hbClient.sessions.create>> | null = null;

    try {
        // 1. Fetch Job Data from Supabase
        const { startupData, targetData } = await fetchJobData(submissionId);
        await updateSubmissionStatus(submissionId, 'in_progress');
        console.log(`[${submissionId}] Fetched data for startup "${startupData.name}" and target "${targetData.name}"`);

        // 2. Create Hyperbrowser Session
        console.log(`[${submissionId}] Creating Hyperbrowser session...`);
        session = await hbClient.sessions.create();
        console.log(`[${submissionId}] Session created. Live URL: ${session.liveUrl}`);

        // 3. Connect Playwright
        console.log(`[${submissionId}] Connecting Playwright...`);
        const browser = await chromium.connectOverCDP(session.wsEndpoint);
        const page = browser.contexts()[0].pages()[0];
        console.log(`[${submissionId}] Playwright connected. Navigating to start URL...`);
        await page.goto(targetData.application_url, { waitUntil: 'domcontentloaded' });
        console.log(`[${submissionId}] Navigation complete. Page title: ${await page.title()}`);

        // 4. Perception-Action Loop
        console.log(`[${submissionId}] Starting perception-action loop...`);
        let loopCount = 0;
        const maxLoops = 15; // Safeguard against infinite loops

        while (loopCount < maxLoops) {
            loopCount++;
            console.log(`[${submissionId}] Loop ${loopCount}/${maxLoops}`);

            const pageContent = await getPageContent(page);
            const nextAction = await planNextAction(pageContent, startupData, targetData);

            if (nextAction.action === 'submit') {
                console.log(`[${submissionId}] Agent decided to submit the form. Reason: ${nextAction.description}`);
                // TODO: Perform final submission click
                break;
            }

            await executeAction(page, nextAction, startupData);
            console.log(`[${submissionId}] Executed: ${nextAction.action} on '${nextAction.selector}'. Reason: ${nextAction.description}`);

            // Add a small delay to mimic human behavior and wait for page to react
            await page.waitForTimeout(1000);
        }

        if (loopCount >= maxLoops) {
            throw new Error('Agent reached maximum loop count without submitting.');
        }


        // 5. Handle file uploads (This is now integrated into the action loop)

        // After completion...
        await updateSubmissionStatus(submissionId, 'completed');
        console.log(`[${submissionId}] Job completed successfully.`);

    } catch (error) {
        console.error(`[${submissionId}] Error during job execution:`, error);
        await updateSubmissionStatus(submissionId, 'failed', (error as Error).message);
    } finally {
        // 7. Close Session
        if (session) {
            console.log(`[${submissionId}] Stopping Hyperbrowser session...`);
            await hbClient.sessions.stop(session.id);
            console.log(`[${submissionId}] Session stopped.`);
        }
    }
};

const getPageContent = async (page: Page): Promise<string> => {
    // A more sophisticated implementation would clean this HTML,
    // remove scripts/styles, and maybe even use the accessibility tree.
    return await page.content();
};

const planNextAction = async (pageContent: string, startupData: StartupData, targetData: TargetData): Promise<AgentAction> => {
    const systemPrompt = `
You are an expert web agent. Your task is to fill out a VC application form.
You will be given the current state of the web page and a JSON object with startup data.
Analyze the page and the data, and decide on the single next action to take.
The available actions are: fill, click, select, upload, or submit.
If you see a file input, you MUST use the 'upload' action.
When the form is completely filled and ready to be submitted, return the 'submit' action.
Base your decisions strictly on the provided data. Do not invent information.
Prioritize filling out visible fields first.
    `;

    const userPrompt = `
Here is the startup's data:
${JSON.stringify(startupData, null, 2)}

Here is the target VC's information:
${JSON.stringify(targetData, null, 2)}

Here is the current page content:
\`\`\`html
${pageContent}
\`\`\`

What is the single next action you should take?
    `;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        tools: [{ type: 'function', function: { name: 'execute_action', description: 'Execute the next agent action', parameters: zodToJsonSchema(agentActionSchema) } }],
        tool_choice: { type: 'function', function: { name: 'execute_action' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'execute_action') {
        throw new Error('AI failed to produce a valid action.');
    }

    const parsedArgs = JSON.parse(toolCall.function.arguments);
    return agentActionSchema.parse(parsedArgs) as AgentAction;
};

const executeAction = async (page: Page, action: AgentAction, startupData: StartupData) => {
    switch (action.action) {
        case 'fill':
            await page.fill(action.selector, action.value);
            break;
        case 'click':
            await page.click(action.selector);
            break;
        case 'select':
            await page.selectOption(action.selector, action.value);
            break;
        case 'upload':
            console.log(`Uploading file to selector: ${action.selector}`);
            if (!startupData.pitch_deck_url) {
                throw new Error('Agent tried to upload a file, but no pitch_deck_url is available.');
            }
            const response = await fetch(startupData.pitch_deck_url);
            if (!response.ok) {
                throw new Error(`Failed to download pitch deck from ${startupData.pitch_deck_url}`);
            }
            const fileBuffer = await response.arrayBuffer();
            await page.setInputFiles(action.selector, {
                name: action.fileName,
                mimeType: 'application/pdf', // Assuming PDF for now, can be made dynamic later
                buffer: Buffer.from(fileBuffer),
            });
            break;
        case 'submit':
            // This case is handled in the main loop, but we include it for completeness
            console.log('Submit action planned. Execution will be handled by the main loop.');
            break;
        default:
            // This should not be reachable if Zod parsing is correct
            throw new Error(`Unknown action type`);
    }
}


// --- Helper Functions ---

const fetchJobData = async (submissionId: string): Promise<{ startupData: StartupData, targetData: TargetData }> => {
    const { data: submission, error } = await supabase
        .from('submissions')
        .select(`
            *,
            startups (*),
            targets (*)
        `)
        .eq('id', submissionId)
        .single();

    if (error || !submission) {
        throw new Error(`Failed to fetch submission ${submissionId}: ${error?.message}`);
    }

    if (!submission.startups || !submission.targets) {
        throw new Error(`Missing startup or target data for submission ${submissionId}`);
    }

    // We can expand this to fetch founders, common responses etc. later
    return {
        startupData: submission.startups,
        targetData: submission.targets,
    };
};

const updateSubmissionStatus = async (submissionId: string, status: 'in_progress' | 'completed' | 'failed' | 'queued', notes?: string) => {
    const { error } = await supabase
        .from('submissions')
        .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
        .eq('id', submissionId);

    if (error) {
        console.error(`Failed to update status for submission ${submissionId}:`, error);
    }
};
