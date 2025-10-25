output "ec2_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_eip.blog.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.blog.id
}

output "backup_bucket" {
  description = "S3 bucket for database backups"
  value       = aws_s3_bucket.backups.id
}

output "api_endpoint" {
  description = "API endpoint URL"
  value       = "https://api.${var.domain_name}"
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i ~/.ssh/${var.ssh_key_name}.pem ubuntu@${aws_eip.blog.public_ip}"
}
