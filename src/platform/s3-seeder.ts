import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { Config } from "../config.js";
import type { AgentCoreSandbox } from "./agentcore-sandbox.js";

const DEST_DIR = "documents";

export class S3Seeder {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly prefix: string;

  constructor(config: Config) {
    this.bucket = config.s3Bucket!;
    this.prefix = config.s3Prefix;
    this.s3 = new S3Client({ region: config.awsRegion });
  }

  async seed(sandbox: AgentCoreSandbox, sessionId: string): Promise<void> {
    const keys = await this.listObjects();

    if (keys.length === 0) {
      console.log("No documents found in s3://%s/%s", this.bucket, this.prefix);
      return;
    }

    const copies = keys
      .map((key) => {
        const relative = this.prefix ? key.slice(this.prefix.length) : key;
        return `aws s3 cp "s3://${this.bucket}/${key}" "${DEST_DIR}/${relative}"`;
      })
      .join(" && ");

    console.log(`Seeding ${keys.length} file(s) into ${DEST_DIR}...`);

    const result = await sandbox.executeCommand(
      sessionId,
      `mkdir -p ${DEST_DIR} && ${copies}`,
    );

    if (result.isError) {
      throw new Error(`Failed to seed documents: ${result.output}`);
    }
    console.log(result.output);
  }

  private async listObjects(): Promise<string[]> {
    const keys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: this.prefix,
          ContinuationToken: continuationToken,
        }),
      );
      for (const obj of response.Contents ?? []) {
        if (obj.Key && !obj.Key.endsWith("/")) {
          keys.push(obj.Key);
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return keys;
  }
}
