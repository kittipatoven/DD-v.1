#!/bin/bash

# DD Computer - Cloudflare Tunnel Setup Script
# สำหรับตั้งค่า Cloudflare Tunnel เพื่อเปิดเว็บจากบ้านโดยไม่ต้อง Port Forwarding
# หลักการ: Ubuntu เชื่อมออกไปหา Cloudflare → ไม่ต้อง Public IP / Port Forward / CGNAT
# Usage: sudo bash setup-cloudflare-tunnel.sh

set -e

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

# Check root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# ============================================
# LOAD CONFIGURATION
# ============================================
echo ""
echo "=========================================="
echo "Loading Configuration"
echo "=========================================="

# Load external configuration if exists
if [ -f ".env.deploy" ]; then
    print_info "Loading configuration from .env.deploy"
    set -a
    source .env.deploy
    set +a
    print_success "Configuration loaded"
else
    print_info "No .env.deploy found, using defaults or prompts"
fi

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

print_info "รันคำสั่งนี้เพื่อ authenticate:"
echo "sudo cloudflared tunnel login"
echo ""
print_info "จะเปิด browser ขึ้นมาให้คุณ authorize"
echo ""

read -p "Authenticate เสร็จแล้วหรือยัง? (กด Enter เพื่อดำเนินการต่อ)"

# ============================================
# STEP 3: Create Tunnel
# ============================================
echo ""
echo "=========================================="
echo "STEP 3: สร้าง Tunnel"
echo "=========================================="

# Clean up existing config files to prevent YAML parsing errors
print_info "ลบ config.yml เก่า (ถ้ามี)..."
rm -f /etc/cloudflared/config.yml

read -p "ตั้งชื่อ Tunnel (ddcomputer-tunnel): " TUNNEL_NAME
TUNNEL_NAME=${TUNNEL_NAME:-ddcomputer-tunnel}

# Delete existing tunnel if it exists
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo "Tunnel '$TUNNEL_NAME' already exists. Deleting..."
    cloudflared tunnel delete "$TUNNEL_NAME"
fi

echo "Creating tunnel..."
TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME")
TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)

if [ -z "$TUNNEL_ID" ]; then
    print_error "ไม่สามารถสร้าง Tunnel ได้"
    print_error "Output: $TUNNEL_OUTPUT"
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
read -p "Select option (1-2, default: 2): " SSL_OPTION
SSL_OPTION=${SSL_OPTION:-2}

# Create config directory
mkdir -p /etc/cloudflared

# Cloudflare Tunnel always uses HTTP to localhost (Cloudflare handles SSL)
print_info "Cloudflare Tunnel uses HTTP to localhost (SSL handled by Cloudflare)"

# Create config.yml with multiple services
cat > /etc/cloudflared/config.yml << CONFIG_EOF
tunnel: ${TUNNEL_ID}
credentials-file: /root/.cloudflared/${TUNNEL_ID}.json

ingress:
  # Main website
  - hostname: ${DOMAIN_NAME}
    service: http://localhost:80
  - hostname: www.${DOMAIN_NAME}
    service: http://localhost:80

  # phpMyAdmin (optional - comment out if not needed)
  - hostname: phpmyadmin.${DOMAIN_NAME}
    service: http://localhost:8080

  # Netdata monitoring (optional - comment out if not needed)
  - hostname: netdata.${DOMAIN_NAME}
    service: http://localhost:19999

  # Uptime Kuma monitoring (optional - comment out if not needed)
  - hostname: uptime.${DOMAIN_NAME}
    service: http://localhost:3002

  # Catch-all for other subdomains (optional)
  - hostname: *.${DOMAIN_NAME}
    service: http://localhost:80

  # Final catch-all
  - service: http_status:404
CONFIG_EOF

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
    if cloudflared tunnel route dns "$TUNNEL_NAME" "$full_domain" 2>&1 | grep -q "already exists"; then
        print_warning "DNS record for $full_domain already exists. Skipping..."
        return 0
    else
        if cloudflared tunnel route dns "$TUNNEL_NAME" "$full_domain" 2>&1; then
            print_success "DNS record created for $full_domain"
            return 0
        else
            print_error "Failed to create DNS record for $full_domain"
            return 1
        fi
    fi
}

# Setup DNS for main domain
setup_dns "main" "$DOMAIN_NAME"
setup_dns "www" "www.$DOMAIN_NAME"

# Ask if user wants to setup DNS for monitoring services
echo ""
read -p "Setup DNS for monitoring services (phpmyadmin, netdata, uptime)? (y/N): " SETUP_MONITORING_DNS
SETUP_MONITORING_DNS=${SETUP_MONITORING_DNS:-n}

if [[ "$SETUP_MONITORING_DNS" =~ ^[Yy]$ ]]; then
    setup_dns "phpmyadmin" "phpmyadmin.$DOMAIN_NAME"
    setup_dns "netdata" "netdata.$DOMAIN_NAME"
    setup_dns "uptime" "uptime.$DOMAIN_NAME"
fi

print_success "DNS Routing ตั้งค่าเรียบร้อย"

print_info "หมายเหตุ: Cloudflare จะสร้าง DNS Record แบบ Tunnel ให้อัตโนมัติ"
print_info "ไม่ต้องใส่ IP บ้านใน DNS เพราะ Tunnel จะเชื่อมเอง"

# ============================================
# STEP 6: Install Tunnel as Service
# ============================================
echo ""
echo "=========================================="
echo "STEP 6: ติดตั้ง Tunnel เป็น Service"
echo "=========================================="

# Install as service using the config file
cloudflared service install

print_success "Service ติดตั้งเรียบร้อย"

# Start service
print_info "กำลังเริ่ม service..."
systemctl start cloudflared

# Enable service
systemctl enable cloudflared

print_success "Service เริ่มทำงานแล้ว"

# ============================================
# STEP 7: Check Service Status
# ============================================
echo ""
echo "=========================================="
echo "STEP 7: เช็คสถานะ Service"
echo "=========================================="

sudo systemctl status cloudflared

# ============================================
# STEP 8: Test Connection
# ============================================
echo ""
echo "=========================================="
echo "STEP 8: ทดสอบการเชื่อมต่อ"
echo "=========================================="

print_info "รอสักครู่ให้ tunnel เริ่มทำงาน..."
sleep 5

print_info "ทดสอบเข้า localhost..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200"; then
    print_success "Nginx ทำงานบน localhost:80 ✅"
else
    print_error "Nginx ไม่ทำงานบน localhost:80 ❌"
    print_info "ตรวจสอบ: sudo systemctl status nginx"
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
