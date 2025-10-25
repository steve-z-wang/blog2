# EC2-Based Infrastructure (~$14/month)

This is a cost-optimized version of the blog infrastructure using a single EC2 instance instead of ECS/Fargate.

## Cost Comparison

**Old Setup (ECS)**: ~$93/month
- NAT Gateway: $38/month
- ALB: $21/month
- ECS Fargate: $18/month
- RDS: $14/month
- S3/CloudFront: $2/month

**New Setup (EC2)**: ~$14/month ⚡ **85% savings!**
- EC2 t4g.small: $12/month
- S3 (backups): $0.10/month
- S3/CloudFront (frontend): $1/month
- Route53: $1/month

## What's Included

- ✅ EC2 instance running Node.js backend + PostgreSQL
- ✅ Caddy web server for automatic HTTPS
- ✅ Automated daily database backups to S3
- ✅ 30-day backup retention
- ✅ Public subnet (no NAT Gateway needed)
- ✅ Elastic IP for stable DNS

## Prerequisites

1. Create an SSH key pair in AWS EC2 console
2. Download the `.pem` file
3. Set `ssh_key_name` variable to match your key name

## Deployment

1. Copy terraform.tfvars.example to terraform.tfvars
2. Fill in your values
3. Export sensitive variables:
   ```bash
   export TF_VAR_db_password="your-password"
   export TF_VAR_admin_api_key="your-api-key"
   ```
4. Deploy:
   ```bash
   terraform init
   terraform apply
   ```

## Backend Deployment

After terraform creates the EC2 instance, deploy the backend:

```bash
# SSH into EC2
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2_IP>

# Clone repo
git clone https://github.com/steve-z-wang/blog2.git
cd blog2/backend

# Install dependencies
npm install

# Build
npm run build

# Copy built files to /opt/blog
sudo cp -r dist/* /opt/blog/
sudo cp package*.json /opt/blog/
cd /opt/blog
sudo npm install --production

# Start service
sudo systemctl start blog-backend
sudo systemctl enable blog-backend
```

## Monitoring

```bash
# Check backend status
sudo systemctl status blog-backend

# View logs
sudo journalctl -u blog-backend -f

# Check PostgreSQL
sudo -u postgres psql blog_db

# List backups
aws s3 ls s3://blog-v2-db-backups/
```

## Backup & Restore

Backups run automatically daily at 2 AM.

**Manual backup:**
```bash
sudo /usr/local/bin/backup-blog-db.sh
```

**Restore from backup:**
```bash
# Download backup
aws s3 cp s3://blog-v2-db-backups/blog_db_backup_YYYYMMDD_HHMMSS.sql.gz /tmp/

# Restore
gunzip /tmp/blog_db_backup_*.sql.gz
sudo -u postgres psql blog_db < /tmp/blog_db_backup_*.sql
```
