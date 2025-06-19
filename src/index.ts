import { Agent } from "@hyperbrowser/agent";
import { config } from "dotenv";

config();

async function main() {
  const agent = new Agent({
    apiKey: process.env.HYPERBROWSER_API_KEY,
  });

  const objective = `
    Go to Y Combinator's website, find the 'Apply' button, and click it.
    Then, find the form for applying and tell me the first question.
  `;

  try {
    const result = await agent.run(objective);
    console.log("Agent finished with result:", result);
  } catch (error) {
    console.error("Agent encountered an error:", error);
  }
}

main(); 