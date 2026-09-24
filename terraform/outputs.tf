output "aws_region" {
  value = var.aws_region
}

output "github_actions_role_arn" {
  description = "ARN to use in the GitHub Actions workflow's role-to-assume"
  value       = aws_iam_role.github_actions.arn
}

output "code_interpreter_arn" {
  value = aws_bedrockagentcore_code_interpreter.main.code_interpreter_arn
}

output "data_bucket_name" {
  value = aws_s3_bucket.data.bucket
}
