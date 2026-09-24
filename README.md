# Data Extraction Agent

An AI agent that extracts structured data from documents (PDFs, Excel files) using a Python sandbox running on AWS Bedrock AgentCore.

## What it does

The agent receives a prompt describing what to extract from documents, then:

1. Seeds the sandbox with files from S3 (or a local directory)
2. Runs Python code in an isolated AgentCore Code Interpreter session to read and parse the files
3. Returns extracted data (tables, figures, metrics) as structured output

The sample prompt extracts regional revenue from a PDF and department costs from an Excel headcount sheet.

## Architecture

- **Agent**: [Strands Agents SDK](https://github.com/strands-agents/sdk-js) with Amazon Bedrock Models
- **Sandbox**: AWS Bedrock AgentCore Code Interpreter (managed Python environment)
- **File seeding**: S3 bucket → sandbox, or local files for development
- **Skills**: Custom prompt skills loaded from `src/skills/`
- **Infrastructure**: Terraform (S3 bucket, AgentCore Code Interpreter)

## Prerequisites

- Node.js and pnpm
- AWS credentials with Bedrock + AgentCore access
- A provisioned AgentCore Code Interpreter (see Terraform below but feel free to create manually)

## Setup

```bash
pnpm install
cp .env.example .env
# fill in .env values
```

### Environment variables

| Variable              | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `CODE_INTERPRETER_ID` | AgentCore Code Interpreter resource ID                  |
| `AWS_REGION`          | AWS region (e.g. `us-east-1`)                           |
| `BEDROCK_MODEL_ID`    | Bedrock model ID                                        |
| `S3_BUCKET`           | S3 bucket to seed files from (omit to use local seeder) |
| `S3_PREFIX`           | S3 key prefix for documents (default: `documents/`)     |

### Provision infrastructure (optional)

```bash
cd terraform
terraform init
terraform apply
```

This creates the S3 bucket and AgentCore Code Interpreter. Copy the output `code_interpreter_id` into `.env`.

## Run

```bash
pnpm dev
```

The agent will start an AgentCore session, seed files into it, run the extraction, print the results, and stop the session.
