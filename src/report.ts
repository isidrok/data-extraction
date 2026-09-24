import { writeFileSync } from "fs";
import type { Agent } from "@strands-agents/sdk";

type ContentItem = {
  type: string;
  text?: string;
  json?: unknown;
};

type Block = {
  type: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
  content?: ContentItem[];
};

export class Report {
  constructor(
    private readonly agent: Agent,
    private readonly path: string = "report.md",
  ) {}

  save(): void {
    const lines: string[] = ["# Session Report\n"];
    this.appendUsage(lines);
    this.appendTranscript(lines);
    writeFileSync(this.path, lines.join("\n"));
    console.log(`Report saved to ${this.path}`);
  }

  private appendUsage(lines: string[]): void {
    const metrics = this.agent.metrics;
    const usage = metrics.accumulatedUsage;

    const allCycles = metrics.agentInvocations.flatMap((inv) => inv.cycles);
    const maxOutputTokens = Math.max(
      0,
      ...allCycles.map((c) => c.usage.outputTokens),
    );

    lines.push("## Usage\n");
    lines.push(`| Metric | Tokens |`);
    lines.push(`|---|---|`);
    lines.push(`| Input | ${usage.inputTokens.toLocaleString()} |`);
    lines.push(`| Cache read | ${(usage.cacheReadInputTokens ?? 0).toLocaleString()} |`);
    lines.push(`| Cache write | ${(usage.cacheWriteInputTokens ?? 0).toLocaleString()} |`);
    lines.push(`| Output | ${usage.outputTokens.toLocaleString()} |`);
    lines.push(`| Max output (single call) | ${maxOutputTokens.toLocaleString()} |`);
    if (metrics.latestContextSize != null)
      lines.push(`| Context used (last call) | ${metrics.latestContextSize.toLocaleString()} |`);
    lines.push("");
  }

  private appendTranscript(lines: string[]): void {
    lines.push("## Transcript\n");

    if (this.agent.systemPrompt) {
      lines.push("### system\n");
      const sp = this.agent.systemPrompt as unknown as ContentItem[];
      const text = Array.isArray(sp)
        ? sp.map(this.renderContentItem).join("\n")
        : String(this.agent.systemPrompt);
      lines.push(text, "");
    }

    for (const message of this.agent.messages) {
      lines.push(`### ${message.role}\n`);
      for (const block of message.content) {
        const b = block as unknown as Block;
        if (b.type === "textBlock" && b.text) {
          lines.push(b.text);
        } else if (b.type === "toolUseBlock" && b.name && b.input) {
          const lang = b.name === "execute_code" ? "python" : "json";
          const inputStr =
            b.name === "execute_code"
              ? (b.input["code"] as string)
              : JSON.stringify(b.input, null, 2);
          lines.push(`**Tool:** \`${b.name}\`\n\`\`\`${lang}\n${inputStr}\n\`\`\``);
        } else if (b.type === "toolResultBlock" && b.content) {
          const content = b.content.map(this.renderContentItem).join("\n");
          lines.push(`**Result:**\n\`\`\`\n${content}\n\`\`\``);
        }
      }
      lines.push("");
    }
  }

  private renderContentItem = (c: ContentItem): string => {
    if (c.type === "textBlock" && c.text != null) return c.text;
    if (c.type === "jsonBlock" && c.json != null)
      return JSON.stringify(c.json, null, 2);
    return `[${c.type}]`;
  };
}
