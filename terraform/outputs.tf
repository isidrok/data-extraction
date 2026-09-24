output "aws_region" {
  value = var.aws_region
}

output "github_actions_role_arn" {
  description = "ARN to use in the GitHub Actions workflow's role-to-assume"
  value       = aws_iam_role.github_actions.arn
}
