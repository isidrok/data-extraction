import "dotenv/config";
import { loadConfig } from "./config.js";
import { AgentCoreSandbox } from "./platform/agentcore-sandbox.js";
import { S3Seeder } from "./platform/s3-seeder.js";
import { LocalSeeder } from "./platform/local-seeder.js";
import { createAgent } from "./agent.js";
import { Report } from "./report.js";

const config = loadConfig();
const sandbox = new AgentCoreSandbox(config);
const seeder = config.s3Bucket ? new S3Seeder(config) : new LocalSeeder();

async function main() {
  const sessionId = await sandbox.startSession();
  console.log(`AgentCore session started: ${sessionId}`);

  try {
    await seeder.seed(sandbox, sessionId);

    const agent = createAgent(config, sandbox, sessionId);
    const prompt =
      "Look at the files in the documents directory. Extract the regional revenue figures from the PDF and the total cost per department from the Headcount sheet in the Excel file.";

    console.log(`\nPrompt: ${prompt}\n`);
    await agent.invoke([{ text: prompt }]);
    new Report(agent).save();
  } finally {
    await sandbox.stopSession(sessionId);
    console.log("\nAgentCore session stopped");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
