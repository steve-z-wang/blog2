variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "blog-v2"
}

variable "domain_name" {
  description = "Domain name for the blog"
  type        = string
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "admin_api_key" {
  description = "API key for admin operations"
  type        = string
  sensitive   = true
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t4g.small" # ARM-based, cheaper
}

variable "ssh_key_name" {
  description = "SSH key pair name for EC2 access"
  type        = string
}
