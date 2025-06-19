import "dotenv/config";
import { getStartupDataForCurrentUser } from "./lib/supabase/client";
import { vcTargets } from "./lib/data/targets";
import { runFormFillingAgent } from "./agent/runner";

async function main() {
    console.log("🚀 Starting Suparaise agent...");

    const startupData = await getStartupDataForCurrentUser();
    if (!startupData) {
        console.log("Could not fetch startup data. Exiting.");
        return;
    }

    const target = vcTargets[0];
    if (!target) {
        console.log("No VC targets found. Exiting.");
        return;
    }

    console.log(`\n🎯 Targeting: ${target.name}`);
    console.log(`📝 Using data for startup: ${startupData.name}`);

    try {
        const finalResult = await runFormFillingAgent(startupData, target.applicationUrl);
        console.log("\n--- FINAL RESULT ---");
        console.log(finalResult);
        console.log("--------------------");
    } catch (error) {
        console.error(`\n\nFailed to complete agent run for ${target.name}.`);
    }

    console.log("\n👋 Suparaise agent run finished.");
}

main().catch(error => {
    console.error("\nAn unexpected error occurred in the main process:", error);
    process.exit(1);
}); 