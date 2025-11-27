# ✅ VPS Setup Checklist

Checklist singkat untuk setup VPS. Detail lengkap ada di `VPS_SETUP.md`

## Pre-Deployment

- [ ] VPS sudah ready (Ubuntu 22.04 LTS)
- [ ] Domain sudah pointing ke IP VPS
- [ ] SSH access sudah bisa

## VPS Setup (Jalankan di VPS)

### 1. System Update

```bash
apt update && apt upgrade -y
apt install -y curl wget git vim htop ufw
```

- [ ] System updated

### 2. Create User

```bash
adduser kedai
usermod -aG sudo kedai
```

- [ ] User `kedai` created

### 3. Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

- [ ] Firewall configured

### 4. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

- [ ] Docker installed

### 5. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

- [ ] Nginx installed

### 6. Clone Project

```bash
sudo mkdir -p /opt/kedai-bunda
sudo chown kedai:kedai /opt/kedai-bunda
cd /opt/kedai-bunda
git clone https://github.com/YOUR_USERNAME/kedai-bunda-pwa.git .
```

- [ ] Project cloned

### 7. Setup Environment

```bash
cp .env.production.example .env.production
nano .env.production
```

Generate keys:

```bash
# APP_KEY
echo "APP_KEY=base64:$(openssl rand -base64 32)"

# JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
```

- [ ] Environment configured
- [ ] APP_KEY generated
- [ ] JWT_SECRET generated

### 8. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/kedai-bunda
sudo ln -s /etc/nginx/sites-available/kedai-bunda /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

- [ ] Nginx reverse proxy configured

### 9. SSL Certificate

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

- [ ] SSL installed

### 10. Deploy

```bash
cd /opt/kedai-bunda
cp .env.production .env
./deploy.sh fresh
```

- [ ] Application deployed

## GitHub Secrets (Jalankan di GitHub)

Repository → Settings → Secrets and variables → Actions

- [ ] `VPS_HOST` - IP VPS
- [ ] `VPS_USERNAME` - `kedai`
- [ ] `VPS_SSH_KEY` - SSH private key
- [ ] `VPS_PORT` - `22`
- [ ] `APP_PATH` - `/opt/kedai-bunda`
- [ ] `VITE_API_URL` - `https://api.your-domain.com/api`
- [ ] `PRODUCTION_URL` - `https://your-domain.com`

## Generate SSH Key untuk GitHub Actions

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
ssh-copy-id -i ~/.ssh/github-actions.pub kedai@YOUR_VPS_IP
cat ~/.ssh/github-actions  # Copy ini ke VPS_SSH_KEY
```

- [ ] SSH key for GitHub Actions created

## Verification

- [ ] Web accessible at `https://your-domain.com`
- [ ] API accessible at `https://api.your-domain.com`
- [ ] GitHub Actions CI/CD working (push to main)

## Done! 🎉

Kamu sekarang punya:

- ✅ VPS yang secure dengan firewall
- ✅ Docker containers yang running
- ✅ SSL/HTTPS enabled
- ✅ Auto-deploy via GitHub Actions
