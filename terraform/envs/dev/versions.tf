terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Local state for this solo mini-project. Revisit (S3 + DynamoDB lock) if
  # this ever needs multi-machine or CI-driven applies.
}

provider "aws" {
  region = var.aws_region
}
