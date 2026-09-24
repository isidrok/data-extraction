import { tool } from "@strands-agents/sdk";
import { z } from "zod";
import { AgentCoreSandbox } from "../platform/agentcore-sandbox.js";

export function createCodeExecutionTool(
  sandbox: AgentCoreSandbox,
  sessionId: string,
) {
  return tool({
    name: "execute_code",
    description:
      "Execute Python code in the AgentCore code interpreter sandbox. Use this to run computations, data analysis, or any Python code.",
    inputSchema: z.object({
      code: z.string().describe("The Python code to execute"),
    }),
    callback: async ({ code }) => {
      try {
        const result = await sandbox.executeCode(sessionId, code);
        if (result.isError) {
          return `Error:\n${result.output}`;
        }
        return result.output || "(no output)";
      } catch (err) {
        console.error("execute_code failed:", err);
        throw err;
      }
    },
  });
}
