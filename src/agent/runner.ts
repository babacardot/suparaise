import "dotenv/config";
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { Startup } from "../lib/types";

export async function runFormFillingAgent(startup: Startup, targetUrl: string) {
    console.log(`\n🤖 Starting agent for ${targetUrl}...`);

    const apiKey = process.env.HYPERBROWSER_API_KEY;
    if (!apiKey) {
        throw new Error("HYPERBROWSER_API_KEY is not set in the environment variables.");
    }

    const hbClient = new Hyperbrowser({ apiKey });

    const objective = `
        Your task is to apply to the VC form at the URL: ${targetUrl}.
        You will use the following data for the startup to fill out the form.

        --- STARTUP DATA ---
        Name: ${startup.name}
        Website: ${startup.website}
        One-liner: ${startup.oneLiner}
        Description: ${startup.description}

        Founders:
        ${startup.founders.map(f => `- ${f.fullName}, ${f.email}, ${f.linkedin}`).join('\n')}

        Here are some common questions and their answers. Use them if the form asks for them:
        ${Object.entries(startup.commonResponses).map(([q, a]) => `- Question: "${q}"\n  Answer: "${a}"`).join('\n\n')}
        --- END STARTUP DATA ---

        Please navigate the page, fill in all the fields accurately with the provided data, and submit the application.
        If you encounter a field for which you don't have data, use your best judgment or state that the information is not available.
        Confirm that the application has been successfully submitted. If you cannot submit, explain why.
        Return a summary of what you did and the final status of the application.
    `;

    try {
        const result = await hbClient.agents.claudeComputerUse.startAndWait({
            task: objective,
        });

        console.log(`✅ Agent for ${targetUrl} finished.`);
        return result.data?.finalResult;
    } catch (error) {
        console.error(`❌ Agent for ${targetUrl} encountered an error:`, error);
        throw error;
    }
} 