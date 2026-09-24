terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.17"
    }
  }

  required_version = ">= 1.6"

  cloud {
    organization = "Isidrok"

    workspaces {
      name = "data-extraction"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
