# Production Deployment Guide

This guide provides step-by-step instructions for deploying Tomua Map Travel to a production environment.

## 📋 Prerequisites

### Server Requirements

- **OS**: Ubuntu 22.04 LTS or newer
- **CPU**: 2+ cores
- **RAM**: 4GB+ recommended
- **Storage**: 20GB+ (depends on uploads)
- **Docker**: 24.0+
- **Docker Compose**: 2.20+

### Domain & SSL

- Domain name pointed to server IP
- SSL certificate (Let's Encrypt recommended)

## 🚀 Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Clone Repository

```bash
# Clone to production directory
cd /opt
sudo git clone https://github.com/godBuddha/tomua-map-travel.git
cd tomua-map-travel

# Set permissions
sudo chown -R $USER:$USER .
```

### 3. Configure Environment

```bash
# Copy environment template
cp server/.env.example .env

# Edit with production values
nano .env
```

**Required settings for production:**

```bash
# Server
NODE_ENV=production

# Database (use strong password!)
DB_PASSWORD=<generate-strong-password-min-24-chars>
DB_USER=tomua_admin
DB_NAME=tomua_tourism

# JWT (generate unique secrets!)
JWT_SECRET=<generate-64-char-hex-secret>
JWT_REFRESH_SECRET=<generate-64-char-hex-secret>

# CORS (your production domain)
CORS_ORIGIN=https://your-domain.com

# Admin (change immediately after first login!)
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=<strong-admin-password>
```

### 4. Configure Nginx for SSL

Create `nginx.ssl.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://server:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Swagger API Documentation
    location /api-docs/ {
        proxy_pass http://server:5000/api-docs/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploaded files
    location /uploads/ {
        alias /usr/share/nginx/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update docker-compose to use SSL config
# Change nginx volume to nginx.ssl.conf
```

### 6. Deploy with Docker Compose

```bash
# Build and start services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 7. Initialize Database

```bash
# Run migrations
docker exec tomua_server npx knex migrate:latest

# Seed initial data
docker exec tomua_server npx knex seed:run

# Verify database
docker exec tomua_postgres psql -U tomua_admin -d tomua_tourism -c "\dt"
```

### 8. Post-Deployment Setup

```bash
# Change admin password immediately!
# Login to http://your-domain.com/admin.html
# Go to Settings > Change Password

# Create additional users as needed
# Go to Settings > Users > Add User
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct database access
sudo ufw deny 5432/tcp

# Check status
sudo ufw status
```

### 2. Docker Security

```bash
# Limit container resources
# Add to docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       cpus: '1'
#       memory: 512M
```

### 3. Database Security

```bash
# Change default PostgreSQL password
docker exec tomua_postgres psql -U tomua_admin -d tomua_tourism -c "ALTER USER tomua_admin WITH PASSWORD 'new_strong_password';"

# Update .env with new password
# Restart services
docker compose restart
```

## 📊 Monitoring

### 1. Health Checks

```bash
# API Health
curl https://your-domain.com/api/health

# Container health
docker compose ps

# Resource usage
docker stats
```

### 2. Log Monitoring

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f server

# Check error logs
docker exec tomua_server cat /app/logs/error.log
```

### 3. Database Monitoring

```bash
# Check database size
docker exec tomua_postgres psql -U tomua_admin -d tomua_tourism -c "SELECT pg_size_pretty(pg_database_size('tomua_tourism'));"

# Check active connections
docker exec tomua_postgres psql -U tomua_admin -d tomua_tourism -c "SELECT count(*) FROM pg_stat_activity;"
```

## 🔄 Backup & Recovery

### 1. Database Backup

```bash
# Create backup script
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec tomua_postgres pg_dump -U tomua_admin tomua_tourism > $BACKUP_DIR/backup_$DATE.sql

# Keep last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/backup.sh" | crontab -
```

### 2. Restore from Backup

```bash
# Stop services
docker compose down

# Restore database
docker exec -i tomua_postgres psql -U tomua_admin tomua_tourism < /opt/backups/backup_20260703_020000.sql

# Start services
docker compose up -d
```

## 🔄 Updates

### 1. Pull Latest Changes

```bash
cd /opt/tomua-map-travel
git pull origin main
```

### 2. Rebuild and Deploy

```bash
# Rebuild images
docker compose build

# Restart services
docker compose up -d

# Run new migrations if any
docker exec tomua_server npx knex migrate:latest
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs server

# Check if port is in use
sudo lsof -i :3000

# Restart Docker
sudo systemctl restart docker
```

### Database Connection Failed

```bash
# Check PostgreSQL status
docker compose ps postgres

# Check logs
docker compose logs postgres

# Verify credentials
docker exec tomua_postgres psql -U tomua_admin -d tomua_tourism -c "SELECT 1;"
```

### 502 Bad Gateway

```bash
# Check server container
docker compose ps server

# Check server logs
docker compose logs server

# Restart nginx
docker compose restart nginx
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Restart nginx
docker compose restart nginx
```

## 📈 Performance Tuning

### 1. PostgreSQL Optimization

```bash
# Edit postgresql.conf
docker exec -it tomua_postgres bash
vi /var/lib/postgresql/data/postgresql.conf

# Recommended settings for 4GB RAM:
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 4MB
maintenance_work_mem = 256MB
```

### 2. Nginx Optimization

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g;
```

### 3. Node.js Optimization

```bash
# In docker-compose.yml, add:
environment:
  NODE_OPTIONS: --max-old-space-size=512
```

---

**Last Updated**: 2026-07-03
