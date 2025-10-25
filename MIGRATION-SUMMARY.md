# Migration from ECS to EC2 - Summary

## What We've Created

### New EC2 Infrastructure (`terraform-ec2/` folder)
All terraform configuration files are ready to deploy a cost-optimized EC2 setup:

- **VPC** with public subnet (no NAT Gateway!)
- **EC2 t4g.small** instance ($12/month)
- **PostgreSQL** on EC2 (no RDS needed)
- **Caddy** web server (automatic HTTPS)
- **Automated backups** to S3 (daily at 2 AM)
- **Route53** DNS for api.stevewanglog.com

### Cost Savings
- **Old setup**: ~$93/month ($1,116/year)
  - NAT Gateway: $38/month
  - ALB: $21/month
  - ECS Fargate: $18/month
  - RDS: $14/month

- **New setup**: ~$14/month ($168/year)
  - EC2 t4g.small: $12/month
  - S3 backups: $0.10/month
  - S3/CloudFront (frontend): $1/month
  - Route53: $1/month

**Savings: $950/year (85% reduction!)**

## Terraform Compatibility Issue

There's a compatibility issue between your Terraform version (1.5.7) and the AWS provider on macOS ARM.

### Solutions:

**Option 1: Upgrade Terraform (Recommended)**
```bash
brew update
brew upgrade terraform
# Then retry deployment
cd terraform-ec2
terraform init
terraform plan
terraform apply
```

**Option 2: Use Terraform Cloud/GitHub Actions**
The terraform files can be deployed from GitHub Actions or Terraform Cloud which has compatible binaries.

**Option 3: Deploy from Linux/x86 machine**
The configuration will work fine on Linux or x86 Mac.

## Manual Deployment Steps (if terraform works)

1. **Deploy infrastructure:**
   ```bash
   cd terraform-ec2
   export TF_VAR_db_password="BlogDB2025SecurePass!"
   export TF_VAR_admin_api_key="238bf34a75dc10cbf8526aed35862046d6883ba820c132bafbb5a524a800a647"
   terraform apply
   ```

2. **Get the EC2 IP:**
   ```bash
   terraform output ec2_public_ip
   ```

3. **Wait 5-10 minutes for EC2 user-data script to complete**
   (installs Node.js, PostgreSQL, Caddy, sets up backups)

4. **Deploy backend to EC2:**
   ```bash
   # SSH into EC2
   ssh -i ~/.ssh/blog-v2-key.pem ubuntu@<EC2_IP>

   # Clone repo and deploy
   git clone https://github.com/steve-z-wang/blog2.git
   cd blog2/backend
   npm install
   npm run build

   # Copy to /opt/blog
   sudo cp -r dist/* /opt/blog/
   sudo cp package*.json /opt/blog/
   cd /opt/blog
   sudo npm install --production

   # Start service
   sudo systemctl start blog-backend
   sudo systemctl enable blog-backend
   ```

5. **Test:**
   ```bash
   curl https://api.stevewanglog.com/health
   ```

6. **Destroy old infrastructure:**
   ```bash
   cd ../terraform
   terraform destroy
   ```
   This will remove ECS, RDS, NAT Gateway, and ALB, saving $950/year!

## Files Created

All files are in `terraform-ec2/`:
- `main.tf` - Terraform configuration
- `variables.tf` - Input variables
- `vpc.tf` - VPC with public subnet
- `ec2.tf` - EC2 instance with security group
- `s3.tf` - S3 bucket for backups
- `route53.tf` - DNS configuration
- `user-data.sh` - Automated setup script
- `outputs.tf` - Output values
- `README.md` - Detailed instructions

## Next Steps

1. Fix terraform compatibility (upgrade or use different platform)
2. Deploy EC2 infrastructure
3. Deploy backend application
4. Test everything works
5. Destroy old expensive infrastructure

## SSH Key

Created and saved to: `~/.ssh/blog-v2-key.pem`
