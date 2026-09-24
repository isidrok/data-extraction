import { Agent, BedrockModel } from "@strands-agents/sdk";
import { AgentSkills } from "@strands-agents/sdk/vended-plugins/skills";
import type { Config } from "./config.js";
import { AgentCoreSandbox } from "./platform/agentcore-sandbox.js";
import { createCodeExecutionTool } from "./tools/execute-code-tool.js";
import { createViewImageTool } from "./tools/view-image-tool.js";

export function createAgent(
  config: Config,
  sandbox: AgentCoreSandbox,
  sessionId: string,
): Agent {
  return new Agent({
    model: new BedrockModel({
      region: config.awsRegion,
      modelId: config.bedrockModelId,
      cacheConfig: { strategy: "auto" },
    }),
    tools: [
      createCodeExecutionTool(sandbox, sessionId),
      createViewImageTool(sandbox, sessionId),
    ],
    plugins: [new AgentSkills({ skills: ["./src/skills/"] })],
    systemPrompt:
      "You are a helpful data extraction assistant with access to a Python sandbox.\n\n" +
      "## Tools\n" +
      "- **execute_code**: Run Python in the sandbox for computation, file processing, and analysis.\n" +
      "- **view_image**: Download an image from the sandbox and view it. Use after saving any chart or plot.",
  });
}
