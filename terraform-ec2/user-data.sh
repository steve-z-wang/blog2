#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Install Caddy (for automatic HTTPS)
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# Install AWS CLI
apt-get install -y awscli

# Configure PostgreSQL
sudo -u postgres psql <<EOF
CREATE DATABASE blog_db;
CREATE USER blog_user WITH ENCRYPTED PASSWORD '${db_password}';
GRANT ALL PRIVILEGES ON DATABASE blog_db TO blog_user;
\c blog_db
GRANT ALL ON SCHEMA public TO blog_user;
EOF

# Create app directory
mkdir -p /opt/blog
chown ubuntu:ubuntu /opt/blog

# Create environment file
cat > /opt/blog/.env <<EOF
DATABASE_URL=postgresql://blog_user:${db_password}@localhost:5432/blog_db
PORT=5001
NODE_ENV=production
CORS_ORIGIN=https://${domain_name}
ADMIN_API_KEY=${admin_api_key}
EOF

chown ubuntu:ubuntu /opt/blog/.env
chmod 600 /opt/blog/.env

# Configure Caddy
cat > /etc/caddy/Caddyfile <<EOF
api.${domain_name} {
    reverse_proxy localhost:5001
}
EOF

systemctl restart caddy
systemctl enable caddy

# Create systemd service for blog backend
cat > /etc/systemd/system/blog-backend.service <<EOF
[Unit]
Description=Blog Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/blog
EnvironmentFile=/opt/blog/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create backup script
cat > /usr/local/bin/backup-blog-db.sh <<'SCRIPT'
#!/bin/bash
BACKUP_FILE="/tmp/blog_db_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
pg_dump -U blog_user blog_db | gzip > $BACKUP_FILE
aws s3 cp $BACKUP_FILE s3://${backup_bucket}/
rm $BACKUP_FILE
# Keep only last 30 days of backups
aws s3 ls s3://${backup_bucket}/ | while read -r line; do
  createDate=$(echo $line|awk {'print $1" "$2'})
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date --date "30 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line|awk {'print $4'})
    if [[ $fileName != "" ]]; then
      aws s3 rm s3://${backup_bucket}/$fileName
    fi
  fi
done
SCRIPT

chmod +x /usr/local/bin/backup-blog-db.sh

# Create cron job for daily backups at 2 AM
echo "0 2 * * * root /usr/local/bin/backup-blog-db.sh" > /etc/cron.d/blog-backup

# Note: Backend deployment will be done via GitHub Actions
echo "EC2 setup complete. Backend will be deployed via GitHub Actions."
