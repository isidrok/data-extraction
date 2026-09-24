export interface Config {
  codeInterpreterId: string;
  awsRegion: string;
  bedrockModelId: string;
  s3Bucket: string | undefined;
  s3Prefix: string;
}

export function loadConfig(): Config {
  const codeInterpreterId = process.env.CODE_INTERPRETER_ID;
  const bedrockModelId = process.env.BEDROCK_MODEL_ID;

  if (!codeInterpreterId) {
    throw new Error("CODE_INTERPRETER_ID environment variable is required");
  }
  if (!bedrockModelId) {
    throw new Error("BEDROCK_MODEL_ID environment variable is required");
  }

  return {
    codeInterpreterId,
    bedrockModelId,
    awsRegion: process.env.AWS_REGION ?? "us-east-1",
    s3Bucket: process.env.S3_BUCKET,
    s3Prefix: process.env.S3_PREFIX ?? "/documents",
  };
}
