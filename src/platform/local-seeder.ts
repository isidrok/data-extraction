import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import type { AgentCoreSandbox } from "./agentcore-sandbox.js";

const SAMPLES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../samples",
);
const DEST_DIR = "documents";

function dirname(path: string): string {
  return path.substring(0, path.lastIndexOf("/"));
}

export class LocalSeeder {
  async seed(sandbox: AgentCoreSandbox, sessionId: string): Promise<void> {
    const files = readdirSync(SAMPLES_DIR).filter((f) =>
      statSync(join(SAMPLES_DIR, f)).isFile(),
    );

    console.log(`Uploading ${files.length} sample file(s) to ${DEST_DIR}/...`);

    for (const file of files) {
      const blob = readFileSync(join(SAMPLES_DIR, file));
      await sandbox.writeFile(sessionId, `${DEST_DIR}/${file}`, blob);
      console.log(`  uploaded: ${file}`);
    }
  }
}
