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

variable "tfc_org_id" {
  description = "Terraform Cloud organization ID (e.g. org-xxxx)"
  type        = string
  default     = "org-HdTTZVUag4cEXVgz"
}

variable "tfc_workspace" {
  description = "Terraform Cloud workspace name"
  type        = string
  default     = "data-extraction"
}
