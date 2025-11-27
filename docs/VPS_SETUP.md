# 🚀 VPS Setup & Deployment Guide

Panduan lengkap untuk setup VPS kosong dan deploy aplikasi Kedai Bunda POS.

## 📋 Prerequisites

- VPS dengan OS Ubuntu 22.04 LTS (recommended) atau Debian 11+
- Minimal 1GB RAM, 1 CPU Core
- Domain yang sudah di-pointing ke IP VPS (opsional, untuk HTTPS)
- SSH access ke VPS

---

## 📝 To-Do List untuk Setup VPS

### 1️⃣ Update System & Install Basic Tools

```bash
# Login ke VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install basic tools
apt install -y curl wget git vim htop ufw
```

### 2️⃣ Create Non-Root User (Security Best Practice)

```bash
# Create new user
adduser kedai

# Add to sudo group
usermod -aG sudo kedai

# Setup SSH key for new user
mkdir -p /home/kedai/.ssh
cp ~/.ssh/authorized_keys /home/kedai/.ssh/
chown -R kedai:kedai /home/kedai/.ssh
chmod 700 /home/kedai/.ssh
chmod 600 /home/kedai/.ssh/authorized_keys

# Switch to new user
su - kedai
```

### 3️⃣ Setup Firewall (UFW)

```bash
# Enable firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow API port (if needed)
sudo ufw allow 8000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 4️⃣ Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again to apply group changes
exit
ssh kedai@YOUR_VPS_IP

# Verify Docker installation
docker --version
docker compose version
```

### 5️⃣ Install Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### 6️⃣ Clone Repository & Setup Project

```bash
# Create app directory
sudo mkdir -p /opt/kedai-bunda
sudo chown kedai:kedai /opt/kedai-bunda
cd /opt/kedai-bunda

# Clone repository
git clone https://github.com/YOUR_USERNAME/kedai-bunda-pwa.git .

# Copy environment file
cp .env.production.example .env.production

# Generate secrets
# APP_KEY (base64 encoded 32 random bytes)
echo "APP_KEY=base64:$(openssl rand -base64 32)"

# JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
```

### 7️⃣ Configure Environment Variables

```bash
# Edit production environment
nano .env.production
```

Isi dengan:

```env
# App Settings
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_KEY=base64:YOUR_GENERATED_KEY

# JWT Secret
JWT_SECRET=YOUR_GENERATED_JWT_SECRET

# Ports
API_PORT=8000
WEB_PORT=3000

# API URL for frontend
VITE_API_URL=https://your-domain.com/api
```

### 8️⃣ Setup Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/kedai-bunda
```

Paste konfigurasi ini:

```nginx
# API Backend
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        client_max_body_size 50M;
    }
}

# Web Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/kedai-bunda /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 9️⃣ Setup SSL dengan Certbot (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 🔟 Deploy Application

```bash
cd /opt/kedai-bunda

# Copy env file
cp .env.production .env

# Build and start containers
./deploy.sh fresh

# Check status
./deploy.sh status

# View logs
./deploy.sh logs
```

---

## 🔐 GitHub Actions Secrets

Setup secrets di GitHub Repository Settings → Secrets and variables → Actions:

| Secret Name      | Description          | Example                           |
| ---------------- | -------------------- | --------------------------------- |
| `VPS_HOST`       | IP address VPS       | `123.456.789.0`                   |
| `VPS_USERNAME`   | SSH username         | `kedai`                           |
| `VPS_SSH_KEY`    | SSH private key      | `-----BEGIN OPENSSH...`           |
| `VPS_PORT`       | SSH port (optional)  | `22`                              |
| `APP_PATH`       | App directory        | `/opt/kedai-bunda`                |
| `VITE_API_URL`   | API URL for frontend | `https://api.your-domain.com/api` |
| `PRODUCTION_URL` | Production URL       | `https://your-domain.com`         |

### Generate SSH Key for GitHub Actions

```bash
# On your local machine or VPS
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github-actions

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/github-actions.pub kedai@YOUR_VPS_IP

# The PRIVATE key goes to GitHub Secrets (VPS_SSH_KEY)
cat ~/.ssh/github-actions
```

---

## 🔧 Useful Commands

```bash
# Start services
./deploy.sh start

# Stop services
./deploy.sh stop

# Restart services
./deploy.sh restart

# View logs
./deploy.sh logs

# Check status
./deploy.sh status

# Shell into API container
./deploy.sh shell api

# Run artisan commands
./deploy.sh artisan migrate
./deploy.sh artisan tinker
./deploy.sh artisan cache:clear

# Update deployment
./deploy.sh update

# Fresh install (reset all data)
./deploy.sh fresh
```

---

## 🔍 Troubleshooting

### Container not starting

```bash
# Check logs
docker compose logs api
docker compose logs web

# Check container status
docker compose ps -a
```

### Permission issues

```bash
# Fix storage permissions
docker compose exec api chown -R www-data:www-data storage
docker compose exec api chmod -R 775 storage
```

### Database issues

```bash
# Reset database
./deploy.sh artisan migrate:fresh --seed
```

### Clear all caches

```bash
./deploy.sh artisan cache:clear
./deploy.sh artisan config:clear
./deploy.sh artisan route:clear
./deploy.sh artisan view:clear
```

---

## 📊 Monitoring

### Check resource usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Cleanup unused resources
docker system prune -a
```

### Setup simple uptime monitoring

```bash
# Install uptime-kuma (optional)
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  --restart unless-stopped \
  louislam/uptime-kuma
```

---

## 🔄 Backup & Restore

### Backup database

```bash
# Backup SQLite database
docker compose exec api cp /var/www/html/database/database.sqlite /var/www/html/storage/backup_$(date +%Y%m%d).sqlite

# Copy to host
docker compose cp api:/var/www/html/storage/backup_*.sqlite ./backups/
```

### Restore database

```bash
# Copy backup to container
docker compose cp ./backups/backup_20241127.sqlite api:/var/www/html/database/database.sqlite

# Restart API
docker compose restart api
```

---

## 🎉 Done!

Setelah semua langkah selesai, aplikasi Kedai Bunda POS kamu akan berjalan di:

- **Web**: https://your-domain.com
- **API**: https://api.your-domain.com
- **API Docs**: https://api.your-domain.com/api/documentation

Setiap kali kamu push ke branch `main`, GitHub Actions akan otomatis deploy ke VPS! 🚀
