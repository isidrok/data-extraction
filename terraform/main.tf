terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.17"
    }
  }

  required_version = ">= 1.6"

  backend "s3" {
    bucket         = "data-extraction-tfstate-427064007577"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "data-extraction-tfstate-lock"
  }
}

provider "aws" {
  region = var.aws_region
}
