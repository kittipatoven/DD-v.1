#!/bin/bash

# DD Computer - Cloudflare Tunnel Setup Script
# สำหรับตั้งค่า Cloudflare Tunnel เพื่อเปิดเว็บจากบ้านโดยไม่ต้อง Port Forwarding
# หลักการ: Ubuntu เชื่อมออกไปหา Cloudflare → ไม่ต้อง Public IP / Port Forward / CGNAT
# Usage:
#   cd ~/DD-v.1 && sudo bash setup-cloudflare-tunnel.sh
#   sudo NONINTERACTIVE=1 bash setup-cloudflare-tunnel.sh   # ใช้ tunnel เดิม ไม่ถาม

set -euo pipefail

echo "=========================================="
echo "DD Computer - Cloudflare Tunnel Setup"
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

# ติดตั้ง cloudflared เป็น systemd service + ตรวจสอบ origin/HTTPS
install_cloudflared_systemd_service() {
    print_info "1) ติดตั้ง systemd service ของ cloudflared..."
    if systemctl list-unit-files cloudflared.service 2>/dev/null | grep -q '^cloudflared.service'; then
        print_info "พบ cloudflared.service แล้ว — อัปเดต unit จาก config ปัจจุบัน"
        cloudflared service install 2>/dev/null || true
    else
        cloudflared service install
    fi
    print_success "cloudflared service install เสร็จ"

    print_info "2) โหลด unit ใหม่ + เปิดใช้งาน..."
    systemctl daemon-reload
    systemctl enable cloudflared
    systemctl start cloudflared

    print_info "รอ service start (10 วินาที)..."
    sleep 10

    print_info "3) ตรวจสอบ cloudflared..."
    systemctl status cloudflared --no-pager -l || true
    echo ""
    journalctl -u cloudflared -n 20 --no-pager || true
    echo ""

    if systemctl is-active --quiet cloudflared; then
        print_success "cloudflared service: active ✅"
        return 0
    fi

    print_error "cloudflared service ไม่ active"
    journalctl -u cloudflared -n 50 --no-pager || true
    return 1
}

verify_tunnel_connectivity() {
    local domain="${1:-$DOMAIN_NAME}"

    print_info "4) ตรวจ origin http://127.0.0.1:80/ (ต้องได้ 200 ไม่ใช่ 301)..."
    local origin_code
    origin_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:80/ 2>/dev/null || echo "000")
    print_info "   HTTP status: ${origin_code}"
    curl -sI --max-time 10 http://127.0.0.1:80/ 2>/dev/null | head -8 || true
    echo ""

    case "$origin_code" in
        200|404)
            print_success "Origin ตอบสนอง ✅"
            ;;
        301|302)
            print_warning "Origin redirect (${origin_code}) — รัน setup-nginx-cloudflare.sh"
            ;;
        *)
            print_warning "Origin ไม่ปกติ (${origin_code}) — ตรวจ: systemctl status nginx && docker ps"
            ;;
    esac

    print_info "5) ตรวจเว็บ https://${domain}/ (รอ 1–2 นาทีหลัง tunnel ขึ้น)..."
    sleep 3
    local https_code
    https_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "https://${domain}/" 2>/dev/null || echo "000")
    print_info "   HTTPS status: ${https_code}"
    curl -sI --max-time 20 "https://${domain}/" 2>/dev/null | head -10 || true
    echo ""

    case "$https_code" in
        200|301|302)
            print_success "เว็บผ่าน Cloudflare ✅ (HTTP ${https_code})"
            ;;
        530)
            print_error "ยังได้ 530 — ตรวจ Tunnel HEALTHY ใน Dashboard และ systemctl status cloudflared"
            ;;
        000)
            print_warning "ไม่สามารถเชื่อม https://${domain} — ตรวจ DNS / รอ propagate"
            ;;
        *)
            print_warning "HTTPS status ${https_code} — อาจต้องรอหรือตรวจ docker/backend"
            ;;
    esac
}

# Check root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# โฟลเดอร์โปรเจกต์ (รันได้จากที่ไหนก็ได้)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
NONINTERACTIVE="${NONINTERACTIVE:-0}"

run_nginx_setup() {
    if [ ! -f "$SCRIPT_DIR/setup-nginx-cloudflare.sh" ]; then
        print_warning "ไม่พบ setup-nginx-cloudflare.sh"
        return 1
    fi
    print_info "รัน setup-nginx-cloudflare.sh ..."
    set +e
    bash "$SCRIPT_DIR/setup-nginx-cloudflare.sh"
    local rc=$?
    set -e
    if [ "$rc" -ne 0 ]; then
        print_warning "nginx setup exit code $rc — ตรวจ: nginx -t && systemctl status nginx"
    else
        print_success "Nginx สำหรับ Tunnel พร้อม"
    fi
    return 0
}

ensure_docker_stack() {
    if ! command -v docker &>/dev/null; then
        print_warning "ไม่พบ docker — ข้ามการ start containers"
        return 0
    fi
    if [ ! -f "$SCRIPT_DIR/docker-compose.prod.yml" ]; then
        print_warning "ไม่พบ docker-compose.prod.yml"
        return 0
    fi
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        if [ -f "$SCRIPT_DIR/.env.production.example" ]; then
            print_warning "ไม่พบ .env — copy จาก .env.production.example"
            cp "$SCRIPT_DIR/.env.production.example" "$SCRIPT_DIR/.env"
            print_info "แก้ไข .env แล้วรัน: nano $SCRIPT_DIR/.env"
        else
            print_warning "ไม่พบ .env — ข้าม docker compose up"
            return 0
        fi
    fi
    print_info "เริ่ม Docker stack (frontend + backend)..."
    set +e
    if docker compose -f "$SCRIPT_DIR/docker-compose.prod.yml" up -d frontend backend mysql 2>&1; then
        print_success "Docker stack เริ่มแล้ว"
    elif docker-compose -f "$SCRIPT_DIR/docker-compose.prod.yml" up -d frontend backend mysql 2>&1; then
        print_success "Docker stack เริ่มแล้ว (docker-compose)"
    else
        print_warning "Docker up ล้มเหลว — ตรวจ: docker ps && cat .env"
    fi
    set -e
    sleep 5
}

ensure_production_env_hints() {
  if [ -f "$SCRIPT_DIR/.env" ]; then
    if grep -q 'localhost' "$SCRIPT_DIR/.env" 2>/dev/null; then
      print_warning ".env ยังมี localhost — แก้เป็น https://${DOMAIN_NAME} ก่อน rebuild frontend"
      print_info "  NEXT_PUBLIC_API_URL=https://${DOMAIN_NAME}/api/v1"
      print_info "  NEXT_PUBLIC_WS_URL=https://${DOMAIN_NAME}"
      print_info "  API_URL=https://${DOMAIN_NAME}"
    fi
  fi
}

# ============================================
# LOAD CONFIGURATION
# ============================================
echo ""
echo "=========================================="
echo "Loading Configuration"
echo "=========================================="

set -a
[ -f "$SCRIPT_DIR/.env" ] && source "$SCRIPT_DIR/.env"
[ -f "$SCRIPT_DIR/.env.deploy" ] && source "$SCRIPT_DIR/.env.deploy"
set +a
print_success "โหลด config จาก $SCRIPT_DIR (.env / .env.deploy)"

# Set domain (prompt if not set)
DOMAIN_NAME="${DOMAIN_NAME:-ddcomputersamrong.com}"
if [ -z "$DOMAIN_NAME" ]; then
    read -p "Enter domain name (e.g., ddcomputersamrong.com): " DOMAIN_NAME
fi
print_success "Domain: $DOMAIN_NAME"

print_info "หลักการ Cloudflare Tunnel:"
print_info "  - Ubuntu เชื่อมออกไปหา Cloudflare (ไม่ใช่ Cloudflare เจาะเข้ามา)"
print_info "  - ไม่ต้อง Public IP / Port Forward / แก้ Router"
print_info "  - ใช้ localhost:80 เพราะ cloudflared กับ nginx อยู่เครื่องเดียวกัน"
echo ""

# ============================================
# STEP 1: Install cloudflared
# ============================================
echo ""
echo "=========================================="
echo "STEP 1: ติดตั้ง cloudflared"
echo "=========================================="

if command -v cloudflared &> /dev/null; then
    print_success "cloudflared ติดตั้งอยู่แล้ว"
    CLOUDFLARED_VERSION=$(cloudflared --version)
    print_info "Version: $CLOUDFLARED_VERSION"
else
    print_info "กำลังดาวน์โหลด cloudflared..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    
    print_info "กำลังติดตั้ง cloudflared..."
    sudo dpkg -i cloudflared-linux-amd64.deb
    
    print_success "cloudflared ติดตั้งเรียบร้อย"
    CLOUDFLARED_VERSION=$(cloudflared --version)
    print_info "Version: $CLOUDFLARED_VERSION"
    
    # Cleanup
    rm -f cloudflared-linux-amd64.deb
fi

# ============================================
# STEP 2: Authenticate cloudflared
# ============================================
echo ""
echo "=========================================="
echo "STEP 2: Authenticate cloudflared"
echo "=========================================="

# Check if certificate already exists
if [ -f "/root/.cloudflared/cert.pem" ]; then
    print_success "Certificate already found at /root/.cloudflared/cert.pem"
    print_info "Skipping authentication step..."
else
    print_info "รันคำสั่งนี้เพื่อ authenticate:"
    echo "sudo cloudflared tunnel login"
    echo ""
    print_info "จะเปิด browser ขึ้นมาให้คุณ authorize"
    echo ""
    print_warning "⚠️ สำคัญ: ต้องใช้ Cloudflare account ที่มีสิทธิ์จัดการโดเมน $DOMAIN_NAME"
    echo ""

    read -p "Authenticate เสร็จแล้วหรือยัง? (กด Enter เพื่อดำเนินการต่อ)"

    # Verify certificate exists after authentication
    if [ ! -f "/root/.cloudflared/cert.pem" ]; then
        print_error "❌ ไม่พบไฟล์ certificate!"
        print_error "Authentication ไม่สำเร็จ หรือ certificate ไม่ถูกสร้าง"
        echo ""
        print_info "วิธีแก้ไข:"
        echo "1. ตรวจสอบว่า login สำเร็จและได้ authorize ใน browser"
        echo "2. ลองรันคำสั่งนี้อีกครั้ง: sudo cloudflared tunnel login"
        echo "3. ตรวจสอบไฟล์: ls -la /root/.cloudflared/"
        echo "4. ถ้ายังไม่มี ให้ลอง: mkdir -p /root/.cloudflared && sudo cloudflared tunnel login"
        echo ""
        read -p "ลองใหม่หรือไม่? (y/N): " RETRY_AUTH
        if [[ "$RETRY_AUTH" =~ ^[Yy]$ ]]; then
            print_info "กำลังรัน authentication อีกครั้ง..."
            sudo cloudflared tunnel login
            if [ ! -f "/root/.cloudflared/cert.pem" ]; then
                print_error "❌ Authentication ยังคงล้มเหลว!"
                print_error "กรุณาตรวจสอบ Cloudflare account และ permission"
                exit 1
            fi
        else
            exit 1
        fi
    fi
    print_success "Certificate พร้อมใช้งาน"
fi

# ============================================
# STEP 3: Create Tunnel
# ============================================
echo ""
echo "=========================================="
echo "STEP 3: สร้าง Tunnel"
echo "=========================================="

TUNNEL_NAME="${TUNNEL_NAME:-ddcomputer-tunnel}"
if [ "$NONINTERACTIVE" != "1" ]; then
    read -p "ตั้งชื่อ Tunnel (${TUNNEL_NAME}): " TUNNEL_INPUT
    TUNNEL_NAME=${TUNNEL_INPUT:-$TUNNEL_NAME}
fi

# ใช้ tunnel เดิมถ้ามี (ลบเฉพาะเมื่อผู้ใช้ยืนยัน — ป้องกัน DNS 530 จาก tunnel ID เปลี่ยน)
TUNNEL_ID=""
if cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
    TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | awk -v n="$TUNNEL_NAME" '$0 ~ n {print $1}' | head -1)
    print_success "พบ Tunnel เดิม: $TUNNEL_NAME ($TUNNEL_ID)"
    USE_EXISTING="Y"
    if [ "$NONINTERACTIVE" != "1" ]; then
        read -p "ใช้ tunnel เดิม? (Y/n): " USE_EXISTING
        USE_EXISTING=${USE_EXISTING:-Y}
    fi
    if [[ ! "$USE_EXISTING" =~ ^[Yy]$ ]]; then
        print_warning "ลบ tunnel เก่า..."
        cloudflared tunnel delete "$TUNNEL_NAME" || true
        TUNNEL_ID=""
    fi
fi

# Double-check certificate before creating tunnel
if [ ! -f "/root/.cloudflared/cert.pem" ]; then
    print_error "❌ Certificate หายไประหว่างการทำงาน!"
    print_error "กรุณา authenticate ใหม่: sudo cloudflared tunnel login"
    exit 1
fi

if [ -z "$TUNNEL_ID" ]; then
    echo "Creating tunnel..."
    TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME")
    TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
fi

if [ -z "$TUNNEL_ID" ]; then
    TUNNEL_OUTPUT="${TUNNEL_OUTPUT:-}"
    print_error "ไม่สามารถสร้าง Tunnel ได้"
    print_error "Output: $TUNNEL_OUTPUT"
    echo ""
    
    # Check for specific certificate errors
    if echo "$TUNNEL_OUTPUT" | grep -q "origin certificate"; then
        print_error "❌ ปัญหา Certificate!"
        print_info "วิธีแก้ไข:"
        echo "1. ตรวจสอบ certificate: ls -la /root/.cloudflared/"
        echo "2. ลบ certificate เก่าและ authenticate ใหม่:"
        echo "   rm -rf /root/.cloudflared/"
        echo "   sudo cloudflared tunnel login"
        echo "3. ตรวจสอบว่าใช้ Cloudflare account ที่ถูกต้อง"
        echo "4. ตรวจสอบ permission บนโดเมน $DOMAIN_NAME"
    fi
    
    exit 1
fi

print_success "Tunnel สร้างเรียบร้อย"
print_info "Tunnel Name: $TUNNEL_NAME"
print_info "Tunnel ID: $TUNNEL_ID"

# ============================================
# STEP 4: Configure config.yml
# ============================================
echo ""
echo "=========================================="
echo "STEP 4: ตั้งค่า config.yml"
echo "=========================================="

# Ask for HTTPS/SSL configuration
echo ""
echo "SSL/HTTPS Configuration:"
echo "1) HTTP only (no SSL)"
echo "2) HTTPS (SSL termination at Cloudflare)"
SSL_OPTION="${SSL_OPTION:-2}"
if [ "$NONINTERACTIVE" != "1" ]; then
    read -p "Select option (1-2, default: 2): " SSL_INPUT
    SSL_OPTION=${SSL_INPUT:-2}
fi

# Create config directory
mkdir -p /etc/cloudflared

# Cloudflare Tunnel always uses HTTP to localhost (Cloudflare handles SSL)
print_info "Cloudflare Tunnel uses HTTP to localhost (SSL handled by Cloudflare)"

# config.yml — ไม่ใส่ *.domain (ทำให้ PyYAML ผิดพลาดและ ingress สับสน)
CREDENTIALS_FILE="/root/.cloudflared/${TUNNEL_ID}.json"
cat > /etc/cloudflared/config.yml << CONFIG_EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CREDENTIALS_FILE}

ingress:
  - hostname: ${DOMAIN_NAME}
    service: http://127.0.0.1:80
  - hostname: www.${DOMAIN_NAME}
    service: http://127.0.0.1:80
  - service: http_status:404
CONFIG_EOF
chmod 644 /etc/cloudflared/config.yml

print_info "Validating ingress..."
if cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate 2>/dev/null; then
    print_success "ingress validate ผ่าน"
else
    print_warning "ลอง: cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate"
fi

ADD_SUBS="${ADD_SUBS:-n}"
if [ "$NONINTERACTIVE" != "1" ]; then
    read -p "เพิ่ม subdomain (phpmyadmin/netdata/uptime) ใน config? (y/N): " ADD_SUBS
fi
if [[ "$ADD_SUBS" =~ ^[Yy]$ ]]; then
    cat > /etc/cloudflared/config.yml << CONFIG_EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CREDENTIALS_FILE}

ingress:
  - hostname: ${DOMAIN_NAME}
    service: http://127.0.0.1:80
  - hostname: www.${DOMAIN_NAME}
    service: http://127.0.0.1:80
  - hostname: phpmyadmin.${DOMAIN_NAME}
    service: http://127.0.0.1:8080
  - hostname: netdata.${DOMAIN_NAME}
    service: http://127.0.0.1:19999
  - hostname: uptime.${DOMAIN_NAME}
    service: http://127.0.0.1:3002
  - service: http_status:404
CONFIG_EOF
    cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate 2>/dev/null || true
fi

print_success "config.yml สร้างเรียบร้อย"
print_info "Main website: http://localhost:80 (SSL handled by Cloudflare)"
print_info "phpMyAdmin: http://localhost:8080 (via phpmyadmin.${DOMAIN_NAME})"
print_info "Netdata: http://localhost:19999 (via netdata.${DOMAIN_NAME})"
print_info "Uptime Kuma: http://localhost:3002 (via uptime.${DOMAIN_NAME})"

# ============================================
# STEP 5: Setup DNS Routing
# ============================================
echo ""
echo "=========================================="
echo "STEP 5: ตั้งค่า DNS Routing"
echo "=========================================="

# Function to setup DNS with error handling
setup_dns() {
    local hostname=$1
    local full_domain=$2

    echo "Setting up DNS for $full_domain..."
    print_info "Command: cloudflared tunnel route dns $TUNNEL_NAME $full_domain"
    
    # Add timeout and capture output with error handling
    DNS_OUTPUT=$(timeout 30 cloudflared tunnel route dns "$TUNNEL_NAME" "$full_domain" 2>&1)
    DNS_EXIT_CODE=$?
    
    # Check for timeout
    if [ $DNS_EXIT_CODE -eq 124 ]; then
        print_error "❌ DNS setup timed out after 30 seconds!"
        print_error "This might be due to network issues or Cloudflare API problems"
        echo ""
        print_info "วิธีแก้ไข:"
        echo "1. ตรวจสอบ internet connection: ping 1.1.1.1"
        echo "2. ลองอีกครั้ง: cloudflared tunnel route dns $TUNNEL_NAME $full_domain"
        echo "3. ตรวจสอบ tunnel list: cloudflared tunnel list"
        echo "4. ข้าม DNS setup และทำต่อทีหลังด้วย:"
        echo "   cloudflared tunnel route dns $TUNNEL_NAME $full_domain"
        return 1
    # Check for specific error patterns
    elif [ "$DNS_EXIT_CODE" -eq 0 ]; then
        print_success "DNS OK สำหรับ $full_domain"
        print_info "Output: $DNS_OUTPUT"
        return 0
    elif echo "$DNS_OUTPUT" | grep -qi "already exists\|already configured"; then
        print_warning "DNS สำหรับ $full_domain ตั้งค่าแล้ว — ข้าม"
        return 0
    elif echo "$DNS_OUTPUT" | grep -q "error parsing YAML"; then
        print_error "❌ YAML parsing error in config.yml!"
        print_error "DNS setup failed due to invalid YAML configuration"
        echo ""
        print_info "Error details:"
        echo "$DNS_OUTPUT"
        echo ""
        print_info "วิธีแก้ไข:"
        echo "1. ตรวจสอบ config file: cat /etc/cloudflared/config.yml"
        echo "2. ลบ config file และรัน script ใหม่:"
        echo "   rm -f /etc/cloudflared/config.yml"
        echo "   sudo bash setup-cloudflare-tunnel.sh"
        echo "3. หรือแก้ YAML ด้วยตนเอง:"
        echo "   nano /etc/cloudflared/config.yml"
        return 1
    elif echo "$DNS_OUTPUT" | grep -qi "failed to create DNS record\|ERR \|error:"; then
        print_error "Failed to create DNS record for $full_domain"
        print_info "Error details:"
        echo "$DNS_OUTPUT"
        echo ""
        print_info "Possible solutions:"
        echo "1. Check if domain exists in Cloudflare: cloudflared tunnel list"
        echo "2. Verify certificate: ls -la /root/.cloudflared/"
        echo "3. Try manual setup: cloudflared tunnel route dns $TUNNEL_NAME $full_domain"
        return 1
    else
        print_success "DNS record created for $full_domain"
        print_info "Output: $DNS_OUTPUT"
        return 0
    fi
}

# Setup DNS for main domain (ไม่หยุด script ถ้า DNS ล้มเหลว)
set +e
setup_dns "main" "$DOMAIN_NAME"
setup_dns "www" "www.$DOMAIN_NAME"
set -e

# Ask if user wants to setup DNS for monitoring services
echo ""
SETUP_MONITORING_DNS="${SETUP_MONITORING_DNS:-n}"
if [ "$NONINTERACTIVE" != "1" ]; then
    read -p "Setup DNS for monitoring services (phpmyadmin, netdata, uptime)? (y/N): " SETUP_MONITORING_DNS
fi

if [[ "$SETUP_MONITORING_DNS" =~ ^[Yy]$ ]]; then
    setup_dns "phpmyadmin" "phpmyadmin.$DOMAIN_NAME"
    setup_dns "netdata" "netdata.$DOMAIN_NAME"
    setup_dns "uptime" "uptime.$DOMAIN_NAME"
fi

print_success "DNS Routing ตั้งค่าเรียบร้อย (หรือมี record อยู่แล้ว)"

print_info "หมายเหตุ: Cloudflare จะสร้าง DNS Record แบบ Tunnel ให้อัตโนมัติ"
print_info "ไม่ต้องใส่ IP บ้านใน DNS เพราะ Tunnel จะเชื่อมเอง"

# ============================================
# STEP 5b: Nginx + Docker (ต้องมาก่อน cloudflared — origin :80 ต้องพร้อม)
# ============================================
echo ""
echo "=========================================="
echo "STEP 5b: Nginx + Docker (Origin)"
echo "=========================================="

ensure_production_env_hints

RUN_NGINX="Y"
RUN_DOCKER="Y"
if [ "$NONINTERACTIVE" != "1" ]; then
    read -p "ตั้งค่า Nginx สำหรับ Tunnel? (Y/n): " RUN_NGINX
    RUN_NGINX=${RUN_NGINX:-Y}
    read -p "เริ่ม Docker (frontend/backend)? (Y/n): " RUN_DOCKER
    RUN_DOCKER=${RUN_DOCKER:-Y}
fi

if [[ "$RUN_NGINX" =~ ^[Yy]$ ]]; then
    run_nginx_setup
else
    print_info "ข้าม Nginx — ต้องมี config ที่ :80 ไม่ redirect ไป HTTPS"
fi

if [[ "$RUN_DOCKER" =~ ^[Yy]$ ]]; then
    ensure_docker_stack
else
    print_info "ข้าม Docker — ต้องมี service บน :3000 และ :3001"
fi

# ============================================
# STEP 6: Install Tunnel as Service
# ============================================
echo ""
echo "=========================================="
echo "STEP 6: ติดตั้ง Tunnel เป็น Service"
echo "=========================================="

# Validate credentials file exists before installing service
print_info "ตรวจสอบ credentials file..."
if [ ! -f "/root/.cloudflared/${TUNNEL_ID}.json" ]; then
    print_error "❌ Credentials file ไม่พบ: /root/.cloudflared/${TUNNEL_ID}.json"
    print_info "สาเหตุที่เป็นไปได้:"
    echo "  - Tunnel ถูกสร้างแต่ credentials file ไม่ถูกสร้าง"
    echo "  - Credentials file ถูกลบหรือย้าย"
    echo ""
    print_info "กำลังแก้ไขอัตโนมัติ - สร้าง tunnel ใหม่..."

    # Check if tunnel exists in Cloudflare
    if cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
        print_info "พบ tunnel เก่าใน Cloudflare - กำลังลบ..."
        cloudflared tunnel delete "$TUNNEL_NAME" || true
        sleep 2
    fi

    # Verify certificate exists before creating new tunnel
    if [ ! -f "/root/.cloudflared/cert.pem" ]; then
        print_error "❌ Certificate หายไป - ต้อง authenticate ใหม่"
        print_info "กำลัง authenticate..."
        sudo cloudflared tunnel login
        if [ ! -f "/root/.cloudflared/cert.pem" ]; then
            print_error "❌ Authentication ล้มเหลว!"
            exit 1
        fi
    fi

    # Create new tunnel
    print_info "กำลังสร้าง tunnel ใหม่: $TUNNEL_NAME"
    TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1)
    TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)

    if [ -z "$TUNNEL_ID" ]; then
        print_error "❌ สร้าง tunnel ใหม่ล้มเหลว!"
        print_error "Output: $TUNNEL_OUTPUT"
        exit 1
    fi

    print_success "สร้าง tunnel ใหม่สำเร็จ: $TUNNEL_ID ($TUNNEL_NAME)"

    # Update config.yml with new tunnel ID
    print_info "กำลังอัปเดต config.yml ด้วย tunnel ID ใหม่..."
    CREDENTIALS_FILE="/root/.cloudflared/${TUNNEL_ID}.json"
    cat > /etc/cloudflared/config.yml << CONFIG_EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CREDENTIALS_FILE}

ingress:
  - hostname: ${DOMAIN_NAME}
    service: http://127.0.0.1:80
  - hostname: www.${DOMAIN_NAME}
    service: http://127.0.0.1:80
  - service: http_status:404
CONFIG_EOF
    chmod 644 /etc/cloudflared/config.yml

    # Re-setup DNS for new tunnel
    print_info "กำลังตั้งค่า DNS ใหม่..."
    set +e
    setup_dns "main" "$DOMAIN_NAME"
    setup_dns "www" "www.$DOMAIN_NAME"
    set -e

    print_success "Credentials file และ config อัปเดตเรียบร้อย"
fi
print_success "Credentials file พร้อมใช้งาน"

# Check permissions on .cloudflared directory
print_info "ตรวจสอบ permissions..."
CLOUDFLARED_PERMS=$(stat -c "%a" /root/.cloudflared 2>/dev/null || echo "000")
if [ "$CLOUDFLARED_PERMS" != "700" ]; then
    print_warning "Permissions ของ /root/.cloudflared ไม่ถูกต้อง: $CLOUDFLARED_PERMS"
    print_info "กำลังแก้ permissions เป็น 700..."
    chmod 700 /root/.cloudflared
    chmod 600 /root/.cloudflared/* 2>/dev/null || true
    print_success "Permissions แก้ไขเรียบร้อย"
fi

# Check permissions on config directory
CONFIG_PERMS=$(stat -c "%a" /etc/cloudflared 2>/dev/null || echo "000")
if [ "$CONFIG_PERMS" != "755" ]; then
    print_warning "Permissions ของ /etc/cloudflared ไม่ถูกต้อง: $CONFIG_PERMS"
    print_info "กำลังแก้ permissions เป็น 755..."
    chmod 755 /etc/cloudflared
    chmod 644 /etc/cloudflared/config.yml
    print_success "Permissions แก้ไขเรียบร้อย"
fi

# Check if origin service (localhost:80) is running
print_info "ตรวจสอบ origin service (localhost:80)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    print_success "Origin service ทำงานบน localhost:80 ✅"
else
    print_warning "⚠️ Origin service ไม่ตอบสนองบน localhost:80"
    print_info "สาเหตุที่เป็นไปได้:"
    echo "  - Nginx/Apache ไม่ได้รันอยู่"
    echo "  - Docker containers ไม่ได้รัน"
    echo "  - Port 80 ถูกใช้โดย service อื่น"
    echo ""
    print_info "วิธีแก้ไข:"
    echo "  1. ตรวจสอบ nginx: systemctl status nginx"
    echo "  2. ตรวจสอบ docker: docker ps"
    echo "  3. ตรวจสอบ port: ss -tulpn | grep :80"
    echo "  4. เริ่ม service: systemctl start nginx หรือ docker-compose up -d"
    echo ""
    read -p "ดำเนินการต่อโดยไม่มี origin service? (y/N): " CONTINUE_WITHOUT_ORIGIN
    if [[ ! "$CONTINUE_WITHOUT_ORIGIN" =~ ^[Yy]$ ]]; then
        print_info "กรุณาแก้ไข origin service ก่อน แล้วรัน script ใหม่"
        exit 1
    fi
fi

# ติดตั้ง + enable + start + ตรวจสอบ service
if ! install_cloudflared_systemd_service; then
    print_error "❌ ติดตั้ง/เริ่ม cloudflared service ไม่สำเร็จ"
    echo ""
    print_info "สาเหตุที่เป็นไปได้และวิธีแก้:"
    echo "  cat /etc/cloudflared/config.yml"
    echo "  ls -la /root/.cloudflared/${TUNNEL_ID}.json"
    echo "  cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate"
    echo "  cloudflared tunnel --config /etc/cloudflared/config.yml run ${TUNNEL_NAME}"
    exit 1
fi
print_success "Service ถูกตั้งค่าให้ start อัตโนมัติ (systemctl enable)"

# รีสตาร์ท nginx หลัง tunnel ขึ้น (กัน 502 ชั่วคราว)
if systemctl is-active --quiet nginx; then
    systemctl reload nginx 2>/dev/null || true
fi

# ============================================
# STEP 7: Check Service Status
# ============================================
echo ""
echo "=========================================="
echo "STEP 7: เช็คสถานะ Service"
echo "=========================================="

sudo systemctl status cloudflared

# ============================================
# STEP 8: ทดสอบ Origin + HTTPS
# ============================================
echo ""
echo "=========================================="
echo "STEP 8: ทดสอบ Origin + HTTPS"
echo "=========================================="

verify_tunnel_connectivity "$DOMAIN_NAME"

print_info "ทดสอบ API ผ่าน Nginx (same-origin)..."
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://127.0.0.1/api/v1/health" 2>/dev/null || echo "000")
print_info "   /api/v1/health → HTTP ${API_CODE}"
if [ "$API_CODE" = "200" ]; then
    print_success "API health ผ่าน Nginx ✅"
else
    print_warning "API health ไม่ได้ 200 — ตรวจ docker/backend และ nginx location /api/"
fi

# ถ้ายัง 530 ลองสคริปต์แก้ด่วน
if curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://${DOMAIN_NAME}/" 2>/dev/null | grep -q "530"; then
    if [ -f "$SCRIPT_DIR/fix-cloudflare-tunnel-530.sh" ]; then
        print_warning "ยังได้ 530 — รัน fix-cloudflare-tunnel-530.sh ..."
        set +e
        bash "$SCRIPT_DIR/fix-cloudflare-tunnel-530.sh"
        set -e
    fi
fi

# ============================================
# Summary
# ============================================
echo ""
echo "=========================================="
echo "สรุปการตั้งค่า"
echo "=========================================="

print_success "Cloudflare Tunnel ตั้งค่าเรียบร้อย"
echo ""
print_info "หลักการ:"
print_info "  - Ubuntu เชื่อมออกไปหา Cloudflare (ไม่ใช่ Cloudflare เจาะเข้ามา)"
print_info "  - ไม่ต้อง Public IP / Port Forward / แก้ Router / สน CGNAT"
print_info "  - DNS ชี้ไป Tunnel อัตโนมัติ (ไม่ต้องใส่ IP บ้าน)"
echo ""
print_info "ทดสอบเข้าเว็บ:"
if [ "$SSL_OPTION" = "2" ]; then
    echo "  https://${DOMAIN_NAME}"
    echo "  https://www.${DOMAIN_NAME}"
else
    echo "  http://${DOMAIN_NAME}"
    echo "  http://www.${DOMAIN_NAME}"
fi
echo ""
print_info "Services (ถ้าตั้งค่า DNS):"
echo "  phpMyAdmin: http://phpmyadmin.${DOMAIN_NAME}"
echo "  Netdata: http://netdata.${DOMAIN_NAME}"
echo "  Uptime Kuma: http://uptime.${DOMAIN_NAME}"
echo ""
print_info "คำสั่งที่ใช้:"
echo "  เริ่ม service: systemctl start cloudflared"
echo "  หยุด service: systemctl stop cloudflared"
echo "  เช็คสถานะ: systemctl status cloudflared"
echo "  เช็ค logs: journalctl -u cloudflared -f"
echo ""
print_info "Config file:"
echo "  /etc/cloudflared/config.yml"
echo ""
print_info "เพิ่ม DNS สำหรับ monitoring services:"
echo "  cloudflared tunnel route dns ${TUNNEL_NAME} phpmyadmin.${DOMAIN_NAME}"
echo "  cloudflared tunnel route dns ${TUNNEL_NAME} netdata.${DOMAIN_NAME}"
echo "  cloudflared tunnel route dns ${TUNNEL_NAME} uptime.${DOMAIN_NAME}"
echo ""
print_warning "ถ้าเว็บไม่เข้า:"
print_warning "  ตรวจสอบ nginx: systemctl status nginx"
print_warning "  ตรวจสอบ cloudflared: systemctl status cloudflared"
print_warning "  รอ DNS propagate (5-15 นาที)"
print_warning "  ตรวจสอบ config: cat /etc/cloudflared/config.yml"
echo ""
print_info "Rebuild frontend (ไม่ต้อง npm บน host):"
echo "  cd $SCRIPT_DIR && docker compose -f docker-compose.prod.yml build frontend --no-cache"
echo "  docker compose -f docker-compose.prod.yml up -d frontend"
echo ""
print_info "รันซ้ำแบบไม่ถาม (ใช้ tunnel เดิม):"
echo "  cd $SCRIPT_DIR && sudo NONINTERACTIVE=1 bash setup-cloudflare-tunnel.sh"

echo ""
echo "=========================================="
echo "🔧 การแก้ปัญหา Certificate"
echo "=========================================="

print_info "ปัญหาที่พบบ่อย:"
echo ""
print_info "❌ Error: Cannot determine default origin certificate path"
echo "   สาเหตุ: ไม่ได้ authenticate หรือ certificate ไม่ถูกสร้าง"
echo "   วิธีแก้: sudo cloudflared tunnel login"
echo ""
print_info "❌ Error: client didn't specify origincert path"
echo "   สาเหตุ: Certificate file หายหรือ permission ไม่ถูกต้อง"
echo "   วิธีแก้:"
echo "     1. ตรวจสอบไฟล์: ls -la /root/.cloudflared/"
echo "     2. ลบและ authenticate ใหม่:"
echo "        rm -rf /root/.cloudflared/"
echo "        sudo cloudflared tunnel login"
echo "     3. ตรวจสอบว่าใช้ Cloudflare account ที่ถูกต้อง"
echo ""
print_info "❌ Error: Permission denied"
echo "   สาเหตุ: ไม่ได้ใช้ sudo หรือ user ไม่มีสิทธิ์"
echo "   วิธีแก้: ใช้ sudo ทุกคำสั่ง cloudflared"
echo ""
print_info "❌ Error: Tunnel creation failed"
echo "   สาเหตุ: ไม่มีสิทธิ์จัดการโดเมนใน Cloudflare"
echo "   วิธีแก้:"
echo "     1. ตรวจสอบว่าโดเมน $DOMAIN_NAME อยู่ใน Cloudflare account"
echo "     2. ตรวจสอบสิทธิ์: เป็น Owner หรือ Administrator"
echo "     3. ลอง authenticate ใหม่ด้วย account ที่ถูกต้อง"
echo ""
print_info "❌ Error: error parsing YAML in config file"
echo "   สาเหตุ: config.yml มีรูปแบบ YAML ไม่ถูกต้อง"
echo "   วิธีแก้:"
echo "     1. ตรวจสอบ config: cat /etc/cloudflared/config.yml"
echo "     2. ลบและสร้างใหม่:"
echo "        rm -f /etc/cloudflared/config.yml"
echo "        sudo bash setup-cloudflare-tunnel.sh"
echo "     3. ตรวจสอบ YAML syntax:"
echo "        - ใช้ space 2 ช่อง (ไม่ใช้ tab)"
echo "        - ใส่ space หลัง colon (:)"
echo "        - ตรวจสอบ indentation"
echo ""
print_info "❌ Error: Job for cloudflared.service failed because a timeout was exceeded"
echo "   สาเหตุ: Service start ล้มเหลวเนื่องจาก config ไม่ถูกต้องหรือ timeout"
echo "   วิธีแก้:"
echo "     1. ตรวจสอบ logs: journalctl -xeu cloudflared.service --no-pager"
echo "     2. ตรวจสอบ config: cat /etc/cloudflared/config.yml"
echo "     3. ตรวจสอบ credentials: ls -la /root/.cloudflared/"
echo "     4. ตรวจสอบ permissions: ls -la /etc/cloudflared/"
echo "     5. ทดสอบ manual: cloudflared tunnel run $TUNNEL_NAME"
echo ""
print_info "❌ Error: Unable to find credentials file"
echo "   สาเหตุ: Credentials file ไม่พบหรือ path ไม่ถูกต้อง"
echo "   วิธีแก้:"
echo "     1. ตรวจสอบ: ls -la /root/.cloudflared/*.json"
echo "     2. สร้าง tunnel ใหม่ถ้าจำเป็น"
echo "     3. ตรวจสอบว่า credentials-file path ใน config.yml ถูกต้อง"
echo ""
print_info "❌ Error: Unable to reach origin service"
echo "   สาเหตุ: localhost:80 ไม่ตอบสนอง"
echo "   วิธีแก้:"
echo "     1. ตรวจสอบ: curl -I http://localhost"
echo "     2. เริ่ม nginx: systemctl start nginx"
echo "     3. ตรวจสอบ docker: docker ps"
echo "     4. ตรวจสอบ port: ss -tulpn | grep :80"
echo ""
print_info "❌ Error 530 บนเว็บ (Origin unreachable)"
echo "   วิธีแก้เร็ว: sudo bash fix-cloudflare-tunnel-530.sh"
echo "   ตรวจ: systemctl status cloudflared"
echo "   ตรวจ: cloudflared tunnel list (ต้อง HEALTHY)"
echo "   ตรวจ DNS: CNAME ชี้ ${TUNNEL_ID}.cfargotunnel.com"
echo "   nginx :80 ต้องไม่ redirect — ใช้ setup-nginx-cloudflare.sh"
echo ""
print_info "คำสั่งตรวจสอบที่เป็นประโยชน์:"
echo "  ls -la /root/.cloudflared/"
echo "  cat /root/.cloudflared/cert.pem"
echo "  cloudflared tunnel list"
echo "  cloudflared --version"
echo ""
print_info "Reset ทั้งหมด (ถ้าจำเป็น):"
echo "  rm -rf /root/.cloudflared/"
echo "  rm -rf /etc/cloudflared/"
echo "  sudo cloudflared tunnel login"
echo "  # แล้วรัน script ใหม่"
