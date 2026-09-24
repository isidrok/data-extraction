output "aws_region" {
  value = var.aws_region
}

output "tfc_role_arn" {
  description = "ARN to set as AWS_ROLE_ARN in TFC workspace"
  value       = aws_iam_role.tfc.arn
}

output "code_interpreter_arn" {
  value = aws_bedrockagentcore_code_interpreter.main.code_interpreter_arn
}

output "data_bucket_name" {
  value = aws_s3_bucket.data.bucket
}
