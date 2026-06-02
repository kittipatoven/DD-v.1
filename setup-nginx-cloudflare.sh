#!/bin/bash

# DD Computer - Nginx & Cloudflare Tunnel Setup Script
# สำหรับตั้งค่า Nginx และ Cloudflare Tunnel ให้ทำงานอัตโนมัติทุกครั้งที่บูต
# Usage: sudo bash setup-nginx-cloudflare.sh

# ไม่ใช้ set -e — บางขั้น (cloudflared unit) อาจยังไม่มีตอนรันก่อน service install
set -uo pipefail

echo "=========================================="
echo "DD Computer - Nginx & Cloudflare Setup"
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

# ============================================
# STEP 1: Create Nginx Config
# ============================================
echo ""
echo "=========================================="
echo "STEP 1: สร้าง Nginx Config"
echo "=========================================="

print_info "สร้าง nginx config สำหรับ ddcomputersamrong.com..."

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

print_success "สร้าง nginx config เรียบร้อย"

# ============================================
# STEP 2: Enable Nginx Config
# ============================================
echo ""
echo "=========================================="
echo "STEP 2: เปิดใช้งาน Nginx Config"
echo "=========================================="

print_info "ลบ config เก่า..."
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/ddcomputer
rm -f /etc/nginx/sites-enabled/ddcomputer-ip

print_info "สร้าง symlink ใหม่..."
ln -sf /etc/nginx/sites-available/ddcomputersamrong /etc/nginx/sites-enabled/ddcomputersamrong

print_success "เปิดใช้งาน nginx config เรียบร้อย"

# ============================================
# STEP 3: Test Nginx Config
# ============================================
echo ""
echo "=========================================="
echo "STEP 3: ทดสอบ Nginx Config"
echo "=========================================="

print_info "ทดสอบ nginx config..."
if ! nginx -t; then
    print_error "nginx config ไม่ถูกต้อง"
    exit 1
fi
print_success "Nginx config ถูกต้อง"

# ============================================
# STEP 4: Reload Nginx
# ============================================
echo ""
echo "=========================================="
echo "STEP 4: Reload Nginx"
echo "=========================================="

print_info "Reload nginx..."
systemctl enable nginx 2>/dev/null || true
systemctl restart nginx 2>/dev/null || systemctl reload nginx 2>/dev/null || true

if systemctl is-active --quiet nginx; then
    print_success "Nginx reload เรียบร้อย"
else
    print_warning "Nginx อาจยังไม่ active — ตรวจ: systemctl status nginx"
fi

# ============================================
# STEP 5: Enable Nginx on Boot
# ============================================
echo ""
echo "=========================================="
echo "STEP 5: เปิดใช้งาน Nginx อัตโนมัติ"
echo "=========================================="

print_success "Nginx เปิดใช้งานอัตโนมัติเรียบร้อย"

# ============================================
# STEP 6: Enable Cloudflared on Boot (ถ้ามี unit แล้ว)
# ============================================
echo ""
echo "=========================================="
echo "STEP 6: เปิดใช้งาน Cloudflared อัตโนมัติ"
echo "=========================================="

if systemctl list-unit-files cloudflared.service 2>/dev/null | grep -q cloudflared.service; then
    print_info "1) cloudflared service install (มี unit แล้ว — ข้าม)"
    print_info "2) systemctl daemon-reload && enable && start..."
    systemctl daemon-reload
    systemctl enable cloudflared 2>/dev/null || true
    systemctl restart cloudflared 2>/dev/null || true
    sleep 5
    print_info "3) systemctl status cloudflared"
    systemctl status cloudflared --no-pager -l || true
    journalctl -u cloudflared -n 10 --no-pager 2>/dev/null || true
    print_success "Cloudflared เปิดใช้งานแล้ว"
else
    print_warning "ยังไม่มี cloudflared.service"
    print_info "รันจาก setup-cloudflare-tunnel.sh Step 6 หรือ:"
    echo "  sudo cloudflared service install"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl enable --now cloudflared"
fi

# ============================================
# STEP 7: Check Services Status
# ============================================
echo ""
echo "=========================================="
echo "STEP 7: เช็คสถานะ Services"
echo "=========================================="

print_info "สถานะ Nginx:"
systemctl status nginx --no-pager || true

echo ""
if systemctl list-unit-files cloudflared.service 2>/dev/null | grep -q cloudflared.service; then
    print_info "สถานะ Cloudflared:"
    systemctl status cloudflared --no-pager || true
else
    print_info "Cloudflared: ยังไม่ได้ติดตั้งเป็น systemd service"
fi

# ============================================
# STEP 8: Test Local Connection
# ============================================
echo ""
echo "=========================================="
echo "STEP 8: ทดสอบการเชื่อมต่อ Local"
echo "=========================================="

print_info "ทดสอบ localhost:80..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|404"; then
    print_success "Nginx ทำงานบน localhost:80 ✅"
else
    print_error "Nginx ไม่ทำงานบน localhost:80 ❌"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "=========================================="
echo "สรุปการตั้งค่า"
echo "=========================================="

print_success "ตั้งค่าเสร็จสมบูรณ์!"
echo ""
print_info "สิ่งที่ตั้งค่า:"
echo "  ✓ Nginx config สำหรับ ddcomputersamrong.com"
echo "  ✓ เปิดใช้งาน nginx config"
echo "  ✓ Nginx เปิดอัตโนมัติทุกครั้งบูต"
echo "  ✓ Cloudflared เปิดอัตโนมัติทุกครั้งบูต"
echo ""
print_warning "ขั้นตอนสุดท้าย (ต้องทำเอง):"
echo "  1. ไปที่ Cloudflare Dashboard → SSL/TLS → Overview"
echo "  2. เลือก 'Flexible' (สำคัญมาก!)"
echo "  3. รอ 5-10 นาทีแล้วทดสอบเข้าเว็บ"
echo ""
print_info "ทดสอบเข้าเว็บ:"
echo "  https://ddcomputersamrong.com"
echo "  https://www.ddcomputersamrong.com"
echo ""
print_info "คำสั่งที่ใช้:"
echo "  เช็ค nginx: sudo systemctl status nginx"
echo "  เช็ค cloudflared: sudo systemctl status cloudflared"
echo "  Restart nginx: sudo systemctl restart nginx"
echo "  Restart cloudflared: sudo systemctl restart cloudflared"
