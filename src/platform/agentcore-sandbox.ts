import {
  BedrockAgentCoreClient,
  StartCodeInterpreterSessionCommand,
  StopCodeInterpreterSessionCommand,
  InvokeCodeInterpreterCommand,
  ToolName,
  ProgrammingLanguage,
  type CodeInterpreterStreamOutput,
  InvokeCodeInterpreterCommandOutput,
} from "@aws-sdk/client-bedrock-agentcore";
import type { Config } from "../config.js";

export interface CodeExecutionResult {
  output: string;
  isError: boolean;
}

export class AgentCoreSandbox {
  private client: BedrockAgentCoreClient;
  private readonly codeInterpreterIdentifier: string;

  constructor(config: Config) {
    this.codeInterpreterIdentifier = config.codeInterpreterId;
    this.client = new BedrockAgentCoreClient({ region: config.awsRegion });
  }

  async startSession(sessionTimeoutSeconds = 300): Promise<string> {
    const response = await this.client.send(
      new StartCodeInterpreterSessionCommand({
        codeInterpreterIdentifier: this.codeInterpreterIdentifier,
        name: "strands-agent-session",
        sessionTimeoutSeconds,
      }),
    );
    if (!response.sessionId) {
      throw new Error("AgentCore did not return a session ID");
    }
    return response.sessionId;
  }

  async stopSession(sessionId: string): Promise<void> {
    await this.client.send(
      new StopCodeInterpreterSessionCommand({
        codeInterpreterIdentifier: this.codeInterpreterIdentifier,
        sessionId,
      }),
    );
  }

  async executeCommand(
    sessionId: string,
    command: string,
  ): Promise<CodeExecutionResult> {
    const response = await this.client.send(
      new InvokeCodeInterpreterCommand({
        codeInterpreterIdentifier: this.codeInterpreterIdentifier,
        sessionId,
        name: ToolName.EXECUTE_COMMAND,
        arguments: { command },
      }),
    );

    return this.parseExecuteCodeStream(response);
  }

  async executeCode(
    sessionId: string,
    code: string,
  ): Promise<CodeExecutionResult> {
    const response = await this.client.send(
      new InvokeCodeInterpreterCommand({
        codeInterpreterIdentifier: this.codeInterpreterIdentifier,
        sessionId,
        name: ToolName.EXECUTE_CODE,
        arguments: { code, language: ProgrammingLanguage.PYTHON },
      }),
    );

    return this.parseExecuteCodeStream(response);
  }

  async writeFile(
    sessionId: string,
    path: string,
    blob: Uint8Array,
  ): Promise<void> {
    const response = await this.client.send(
      new InvokeCodeInterpreterCommand({
        codeInterpreterIdentifier: this.codeInterpreterIdentifier,
        sessionId,
        name: ToolName.WRITE_FILES,
        arguments: { content: [{ path, blob }] },
      }),
    );
    const result = await this.parseExecuteCodeStream(response);
    if (result.isError) {
      throw new Error(`Failed to write file ${path}: ${result.output}`);
    }
  }

  async readFile(sessionId: string, path: string): Promise<Uint8Array> {
    const response = await this.client.send(
      new InvokeCodeInterpreterCommand({
        codeInterpreterIdentifier: this.codeInterpreterIdentifier,
        sessionId,
        name: ToolName.READ_FILES,
        arguments: { paths: [path] },
      }),
    );

    return this.parseReadFileStream(response, path);
  }

  private async parseReadFileStream(
    response: InvokeCodeInterpreterCommandOutput,
    path: string,
  ) {
    for await (const event of response.stream as AsyncIterable<CodeInterpreterStreamOutput>) {
      if ("result" in event && event.result) {
        for (const block of event.result.content ?? []) {
          if ("resource" in block && block.resource?.blob) {
            return block.resource.blob;
          }
          if ("resource" in block && block.resource?.text) {
            return new TextEncoder().encode(block.resource.text);
          }
        }
      }
    }
    throw new Error(`File not found or empty: ${path}`);
  }

  private async parseExecuteCodeStream(
    response: InvokeCodeInterpreterCommandOutput,
  ) {
    const outputParts: string[] = [];
    let isError = false;

    for await (const event of response.stream as AsyncIterable<CodeInterpreterStreamOutput>) {
      if ("result" in event && event.result) {
        isError = event.result.isError ?? false;
        for (const block of event.result.content ?? []) {
          if ("text" in block && block.text) {
            outputParts.push(block.text);
          }
        }
      }
    }
    return { output: outputParts.join(""), isError };
  }
}
