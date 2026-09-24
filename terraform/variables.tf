variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name, used as a prefix for resource names"
  type        = string
  default     = "data-extraction"
}

variable "github_org" {
  description = "GitHub organization or username that owns the repo"
  type        = string
  default     = "isidrok"
}

variable "github_user_id" {
  description = "GitHub numeric user/org ID (from the sub claim: repo:org@ID/repo@repoID)"
  type        = string
  default     = "24705324"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "data-extraction"
}
