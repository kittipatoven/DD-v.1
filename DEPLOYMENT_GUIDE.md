# DevOps Deployment Guide
**Project:** DD Computer (Chat Commerce Platform)
**Date:** April 18, 2026
**Auditor:** DevOps Engineer (Production Level)

---

## Executive Summary

Complete deployment guide for DD Computer platform (NestJS Backend + Next.js Frontend + MySQL + WebSocket) on VPS.

**Target OS:** Ubuntu 22.04 LTS
**Architecture:** Single VPS with PM2 process manager
**Database:** MySQL 8.4
**Web Server:** Nginx reverse proxy

---

## 1. SERVER SETUP

### 1.1 Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git vim ufw

# Set timezone
sudo timedatectl set-timezone Asia/Bangkok
```

### 1.2 Install Node.js (Node 20 LTS)

```bash
# Install Node.js using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should be v20.x.x
npm -v   # Should be 10.x.x
```

### 1.3 Install MySQL 8.4

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL (optional but recommended)
sudo mysql_secure_installation
```

### 1.4 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Allow HTTP/HTTPS through firewall
sudo ufw allow 'Nginx Full'
```

### 1.5 Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
# Execute the command shown by pm2 startup
```

---

## 2. DEPLOY BACKEND

### 2.1 Clone Repository

```bash
# Create project directory
sudo mkdir -p /var/www/dd-computer
sudo chown $USER:$USER /var/www/dd-computer
cd /var/www/dd-computer

# Clone repository (replace with your repo URL)
git clone https://github.com/yourusername/dd-computer.git .
```

### 2.2 Setup Backend

```bash
cd /var/www/dd-computer/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=dd_computer

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://your-domain.com/auth/google/callback

# Server
PORT=3001
NODE_ENV=production
EOF
```

### 2.3 Setup Database

```bash
# Create database
sudo mysql -u root -p << EOF
CREATE DATABASE dd_computer;
EOF

# Run TypeORM migrations (if using migrations)
npm run migration:run

# OR let TypeORM synchronize (for development only, not recommended for production)
# The app will auto-create tables with synchronize: true in app.module.ts
# For production, set synchronize: false and use migrations
```

### 2.4 Build Backend

```bash
# Build TypeScript
npm run build

# Verify build
ls -la dist/
```

### 2.5 Start Backend with PM2

```bash
# Start backend
pm2 start dist/main.js --name dd-computer-backend

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs dd-computer-backend
```

---

## 3. DEPLOY FRONTEND

### 3.1 Setup Frontend

```bash
cd /var/www/dd-computer/frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://your-domain.com
NEXT_PUBLIC_WS_URL=http://your-domain.com
EOF
```

### 3.2 Build Frontend

```bash
# Build Next.js app
npm run build

# Verify build
ls -la .next/
```

### 3.3 Start Frontend with PM2

```bash
# Start frontend
pm2 start npm --name dd-computer-frontend -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

---

## 4. NGINX CONFIGURATION

### 4.1 Configure Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/dd-computer
```

**Nginx Configuration:**

```nginx
# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificate (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (Socket.io)
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Client uploads
    client_max_body_size 20M;
}
```

### 4.2 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dd-computer /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 5. SSL CERTIFICATE (Let's Encrypt)

### 5.1 Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## 6. FIREWALL CONFIGURATION

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Node.js ports (if needed for direct access)
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# Check status
sudo ufw status
```

---

## 7. MONITORING & LOGGING

### 7.1 PM2 Monitoring

```bash
# Install PM2 Plus (optional)
pm2 plus

# Monitor all processes
pm2 monit

# View logs
pm2 logs

# Restart app
pm2 restart dd-computer-backend
pm2 restart dd-computer-frontend
```

### 7.2 Application Logs

```bash
# Backend logs
tail -f /var/www/dd-computer/backend/logs/combined.log

# Frontend logs (Next.js)
tail -f /var/www/dd-computer/frontend/.next/server-logs.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 7.3 MySQL Logs

```bash
# MySQL error log
sudo tail -f /var/log/mysql/error.log
```

---

## 8. BACKUP STRATEGY

### 8.1 Database Backup

```bash
# Create backup script
cat > /var/www/dd-computer/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/dd-computer
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u root -pYOUR_PASSWORD dd_computer > $BACKUP_DIR/dd_computer_$DATE.sql

# Compress
gzip $BACKUP_DIR/dd_computer_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /var/www/dd-computer/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /var/www/dd-computer/backup-db.sh
```

### 8.2 Application Backup

```bash
# Backup source code
tar -czf /var/backups/dd-computer/source_$(date +%Y%m%d).tar.gz /var/www/dd-computer
```

---

## 9. DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Server provisioned (Ubuntu 22.04)
- [ ] Domain name pointed to server IP
- [ ] SSH access configured
- [ ] Firewall rules configured

### Backend Deployment
- [ ] Node.js 20 installed
- [ ] MySQL 8.4 installed
- [ ] Database created
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] TypeScript compiled
- [ ] PM2 configured
- [ ] Backend running on port 3001
- [ ] API endpoints accessible

### Frontend Deployment
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Next.js built
- [ ] PM2 configured
- [ ] Frontend running on port 3000
- [ ] Frontend accessible

### Nginx Configuration
- [ ] Nginx installed
- [ ] SSL certificate obtained
- [ ] Reverse proxy configured
- [ ] WebSocket proxy configured
- [ ] HTTP to HTTPS redirect
- [ ] Nginx reloaded

### Security
- [ ] Firewall enabled
- [ ] Only necessary ports open
- [ ] SSL/TLS configured
- [ ] Strong passwords used
- [ ] JWT secret changed
- [ ] Database credentials secure

### Monitoring
- [ ] PM2 monitoring configured
- [ ] Log rotation configured
- [ ] Database backup scheduled
- [ ] Error tracking (optional)

---

## 10. TESTING DEPLOYMENT

### 10.1 Test Backend API

```bash
# Test health check
curl http://your-domain.com/api/auth/login

# Test WebSocket connection
wscat -c http://your-domain.com/socket.io/
```

### 10.2 Test Frontend

```bash
# Open browser
https://your-domain.com

# Test features:
- [ ] Login/Register works
- [ ] Products load
- [ ] Add to cart works
- [ ] Chat connects
- [ ] WebSocket messages work
```

---

## 11. TROUBLESHOOTING

### Backend won't start
```bash
# Check logs
pm2 logs dd-computer-backend

# Check if port is in use
sudo lsof -i :3001

# Restart backend
pm2 restart dd-computer-backend
```

### Frontend won't start
```bash
# Check logs
pm2 logs dd-computer-frontend

# Check if port is in use
sudo lsof -i :3000

# Restart frontend
pm2 restart dd-computer-frontend
```

### WebSocket connection fails
```bash
# Check Nginx config for WebSocket proxy
# Ensure Upgrade and Connection headers are set
# Check backend is running
pm2 status
```

### Database connection fails
```bash
# Check MySQL is running
sudo systemctl status mysql

# Check credentials in .env
cat /var/www/dd-computer/backend/.env

# Test connection
mysql -u root -p dd_computer
```

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Check Nginx config
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 12. SCALING CONSIDERATIONS

### For Higher Traffic:
1. **Add more VPS instances** behind load balancer
2. **Use separate database server** (RDS or managed MySQL)
3. **Implement Redis** for session storage and caching
4. **Use CDN** for static assets
5. **Enable Gzip compression** in Nginx
6. **Add rate limiting** in Nginx
7. **Use read replicas** for database
8. **Implement message queue** (RabbitMQ/Redis) for async tasks

---

## 13. PRODUCTION OPTIMIZATION

### Backend Optimizations
```typescript
// app.module.ts - Set synchronize to false
TypeOrmModule.forRoot({
  synchronize: false, // Use migrations instead
  logging: false, // Disable logging in production
  // ...
})
```

### Frontend Optimizations
```bash
# Build with optimizations
npm run build

# Enable compression in Nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

---

## 14. SECURITY BEST PRACTICES

1. **Change all default passwords**
2. **Use strong JWT secrets**
3. **Enable HTTPS only**
4. **Implement rate limiting**
5. **Use environment variables for secrets**
6. **Regular security updates**
7. **Monitor logs for suspicious activity**
8. **Implement fail2ban for SSH protection**
9. **Use SSH key authentication only**
10. **Disable root SSH login**

---

## 15. UPDATE & MAINTENANCE

### Update Application
```bash
cd /var/www/dd-computer
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart dd-computer-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart dd-computer-frontend
```

### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

---

## CONCLUSION

This deployment guide provides a complete production-ready setup for the DD Computer platform. Following these steps will result in a secure, scalable, and maintainable deployment.

**Final Checklist:**
- ✅ Server configured
- ✅ Backend deployed
- ✅ Frontend deployed
- ✅ Database configured
- ✅ Nginx reverse proxy
- ✅ SSL certificate
- ✅ Firewall configured
- ✅ PM2 process manager
- ✅ Monitoring setup
- ✅ Backup strategy
- ✅ Security measures

**Deployment Status:** Ready for production
