#!/bin/bash

# DD Computer - Start All Services Script
# รันสคริปต์นี้หลังบูตเครื่องเพื่อเปิดทุก service
# Usage: sudo bash start-all-services.sh

set -e

echo "=========================================="
echo "DD Computer - Start All Services"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

# Check root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Set project directory
PROJECT_DIR="${DEPLOY_PROJECT_DIR:-$HOME/DD-v.1}"
cd "$PROJECT_DIR" || {
    print_error "Cannot find project directory: $PROJECT_DIR"
    exit 1
}

print_info "Project directory: $PROJECT_DIR"

# ============================================
# STEP 1: Start Docker Containers
# ============================================
echo ""
echo "=========================================="
echo "STEP 1: เริ่ม Docker Containers"
echo "=========================================="

print_info "ตรวจสอบ Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker ไม่ได้ติดตั้ง"
    exit 1
fi

print_info "เริ่ม Docker service..."
systemctl start docker
print_success "Docker service เริ่มแล้ว"

print_info "เริ่ม containers ด้วย docker-compose..."
if [ -f "docker-compose.prod.yml" ]; then
    docker compose -f docker-compose.prod.yml --env-file .env.production up -d
elif [ -f "docker-compose.yml" ]; then
    docker compose up -d
else
    print_error "ไม่พบ docker-compose.yml"
    exit 1
fi

print_success "Docker containers เริ่มแล้ว"

# ============================================
# STEP 2: Start Nginx
# ============================================
echo ""
echo "=========================================="
echo "STEP 2: เริ่ม Nginx"
echo "=========================================="

print_info "ตรวจสอบ Nginx config..."
if [ ! -f "/etc/nginx/sites-available/ddcomputersamrong" ]; then
    print_warning "Nginx config ยังไม่ถูกสร้าง"
    print_info "สร้าง Nginx config..."
    
    cat > /etc/nginx/sites-available/ddcomputersamrong << 'EOF'
# DD Computer - NGINX Configuration for Cloudflare Tunnel (HTTP only)
# Cloudflare handles SSL/TLS

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# Upstream servers
upstream backend {
    server localhost:3001;
    keepalive 64;
}

upstream frontend {
    server localhost:3000;
    keepalive 64;
}

# HTTP Server (Cloudflare Tunnel sends HTTP to localhost:80)
server {
    listen 80;
    listen [::]:80;
    server_name ddcomputersamrong.com www.ddcomputersamrong.com;

    # Client body size limit (for file uploads)
    client_max_body_size 50M;

    # Uploads directory (static files from backend)
    location /uploads/ {
        alias /var/www/ddcomputer/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        autoindex off;
    }

    # API Routes - Backend
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Routes (Socket.IO)
    location /socket.io/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Frontend - Next.js
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Logging
    access_log /var/log/nginx/ddcomputersamrong_access.log;
    error_log /var/log/nginx/ddcomputersamrong_error.log;
}
EOF
    
    print_success "สร้าง Nginx config เรียบร้อย"
    
    # Enable config
    ln -sf /etc/nginx/sites-available/ddcomputersamrong /etc/nginx/sites-enabled/ddcomputersamrong
    rm -f /etc/nginx/sites-enabled/default
    rm -f /etc/nginx/sites-enabled/ddcomputer
    rm -f /etc/nginx/sites-enabled/ddcomputer-ip
    
    print_success "เปิดใช้งาน Nginx config เรียบร้อย"
fi

print_info "ทดสอบ Nginx config..."
nginx -t

print_info "เริ่ม Nginx service..."
systemctl start nginx
systemctl enable nginx

print_success "Nginx เริ่มแล้ว"

# ============================================
# STEP 3: Start Cloudflared
# ============================================
echo ""
echo "=========================================="
echo "STEP 3: เริ่ม Cloudflared (Cloudflare Tunnel)"
echo "=========================================="

print_info "ตรวจสอบ Cloudflared..."
if ! command -v cloudflared &> /dev/null; then
    print_error "Cloudflared ไม่ได้ติดตั้ง"
    print_info "ติดตั้ง Cloudflared..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    dpkg -i cloudflared-linux-amd64.deb
    rm -f cloudflared-linux-amd64.deb
    print_success "ติดตั้ง Cloudflared เรียบร้อย"
fi

print_info "ตรวจสอบ config.yml..."
if [ ! -f "/etc/cloudflared/config.yml" ]; then
    print_warning "config.yml ยังไม่ถูกสร้าง"
    print_info "กรุณารัน setup-cloudflare-tunnel.sh ก่อน"
else
    print_success "config.yml พร้อม"
fi

print_info "เริ่ม Cloudflared service..."
systemctl start cloudflared
systemctl enable cloudflared

print_success "Cloudflared เริ่มแล้ว"

# ============================================
# STEP 4: Check Services Status
# ============================================
echo ""
echo "=========================================="
echo "STEP 4: เช็คสถานะ Services"
echo "=========================================="

print_info "สถานะ Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
print_info "สถานะ Nginx:"
systemctl status nginx --no-pager | head -n 10

echo ""
print_info "สถานะ Cloudflared:"
systemctl status cloudflared --no-pager | head -n 10

# ============================================
# STEP 5: Test Connections
# ============================================
echo ""
echo "=========================================="
echo "STEP 5: ทดสอบการเชื่อมต่อ"
echo "=========================================="

print_info "ทดสอบ localhost:80..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|404"; then
    print_success "Nginx ทำงานบน localhost:80 ✅"
else
    print_error "Nginx ไม่ทำงานบน localhost:80 ❌"
fi

print_info "ทดสอบ Backend (localhost:3001)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null | grep -q "200"; then
    print_success "Backend ทำงาน ✅"
else
    print_warning "Backend อาจยังไม่พร้อม (รอสักครู่)"
fi

print_info "ทดสอบ Frontend (localhost:3000)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200\|404"; then
    print_success "Frontend ทำงาน ✅"
else
    print_warning "Frontend อาจยังไม่พร้อม (รอสักครู่)"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "=========================================="
echo "สรุป"
echo "=========================================="

print_success "ทุก service เริ่มทำงานแล้ว!"
echo ""
print_info "Services ที่เริ่มแล้ว:"
echo "  ✓ Docker Containers (MySQL, Backend, Frontend, phpMyAdmin)"
echo "  ✓ Nginx (HTTP on port 80)"
echo "  ✓ Cloudflared (Cloudflare Tunnel)"
echo ""
print_info "เว็บไซต์สามารถเข้าได้:"
echo "  https://ddcomputersamrong.com"
echo "  https://www.ddcomputersamrong.com"
echo ""
print_warning "ข้อสำคัญ:"
echo "  1. ตรวจสอบ Cloudflare SSL/TLS เป็น 'Flexible'"
echo "  2. รอ 5-10 นาทีสำหรับ DNS propagation"
echo "  3. ถ้าเว็บไม่เข้า ให้รออีกสักครู่"
echo ""
print_info "คำสั่งที่ใช้:"
echo "  เช็ค containers: docker ps"
echo "  เช็ค nginx: sudo systemctl status nginx"
echo "  เช็ค cloudflared: sudo systemctl status cloudflared"
echo "  Restart nginx: sudo systemctl restart nginx"
echo "  Restart cloudflared: sudo systemctl restart cloudflared"
echo "  Restart containers: docker compose restart"
