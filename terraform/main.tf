terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment this when you create an S3 bucket for Terraform state
  # backend "s3" {
  #   bucket         = "your-blog-terraform-state"
  #   key            = "blog/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "blog-v2"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
