variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "blog-v2"
}

variable "domain_name" {
  description = "Domain name for the blog (e.g., example.com)"
  type        = string
  # You'll set this when you run terraform apply
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "blog_db"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
  # Set this via environment variable: TF_VAR_db_password
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "backend_container_port" {
  description = "Port the backend container listens on"
  type        = number
  default     = 5001
}

variable "backend_cpu" {
  description = "CPU units for backend ECS task"
  type        = number
  default     = 256 # 0.25 vCPU
}

variable "backend_memory" {
  description = "Memory (MB) for backend ECS task"
  type        = number
  default     = 512 # 512 MB
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 2
}

variable "rds_instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t4g.micro" # Free tier eligible
}

variable "rds_allocated_storage" {
  description = "Allocated storage for RDS (GB)"
  type        = number
  default     = 20
}

variable "rds_backup_retention_days" {
  description = "Number of days to retain RDS backups"
  type        = number
  default     = 7
}

variable "enable_rds_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = true
}

variable "admin_api_key" {
  description = "API key for admin operations (creating/updating/deleting posts)"
  type        = string
  sensitive   = true
  # Set this via environment variable: TF_VAR_admin_api_key
}
