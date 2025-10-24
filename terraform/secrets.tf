# AWS Secrets Manager for sensitive configuration

# Admin API Key Secret
resource "aws_secretsmanager_secret" "admin_api_key" {
  name        = "${var.project_name}-admin-api-key"
  description = "API key for admin operations (creating/updating/deleting posts)"

  tags = {
    Name = "${var.project_name}-admin-api-key"
  }
}

resource "aws_secretsmanager_secret_version" "admin_api_key" {
  secret_id     = aws_secretsmanager_secret.admin_api_key.id
  secret_string = var.admin_api_key
}

# IAM policy to allow ECS task execution role to read secrets
resource "aws_iam_role_policy" "ecs_secrets_access" {
  name = "${var.project_name}-ecs-secrets-access"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.admin_api_key.arn
        ]
      }
    ]
  })
}
