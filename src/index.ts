import "dotenv/config";
import HyperAgent from "@hyperbrowser/agent";
import { ChatAnthropic } from "@langchain/anthropic";

async function main() {
  console.log("Starting agent with Anthropic...");

  const llm = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-7-sonnet-20250219",
  });

  const agent = new HyperAgent({
    llm: llm,
    browserProvider: "Hyperbrowser",
  });

  const objective = `
    Go to Y Combinator's website, find the 'Apply' button, and click it.
    Then, find the form for applying and tell me the first question.
  `;

  try {
    const result = await agent.executeTask(objective);
    console.log("Agent finished with result:", result.output);
  } catch (error) {
    console.error("Agent encountered an error:", error);
  } finally {
    await agent.closeAgent();
    console.log("Agent closed.");
  }
}

main().catch(console.error); 