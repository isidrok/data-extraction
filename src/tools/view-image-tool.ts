import { tool } from "@strands-agents/sdk";
import { z } from "zod";
import { AgentCoreSandbox } from "../platform/agentcore-sandbox.js";

export function createViewImageTool(
  sandbox: AgentCoreSandbox,
  sessionId: string,
) {
  return tool({
    name: "view_image",
    description:
      "Download a PNG image from the sandbox and put it in context so you can see it.",
    inputSchema: z.object({
      path: z
        .string()
        .describe("Absolute or relative path to the PNG file in the sandbox"),
    }),
    callback: async ({ path }) => {
      try {
        const bytes = await sandbox.readFile(sessionId, path);
        return [{ image: { format: "png", source: { bytes } } }];
      } catch (err) {
        console.error("view_image failed:", err);
        return `Error reading image: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  });
}
