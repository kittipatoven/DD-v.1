#!/bin/bash

# DD Computer - Ubuntu Server Setup Script (18 Steps)
# สำหรับตั้งค่า Ubuntu Server เพื่อเปิดเว็บจากบ้าน
# Usage: sudo bash setup-ubuntu-server.sh

set -e

echo "=========================================="
echo "DD Computer - Ubuntu Server Setup"
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
# STEP 1: Check Internet Connection
# ============================================
echo ""
echo "=========================================="
echo "STEP 1: เช็คว่า Ubuntu ต่อเน็ตได้ไหม"
echo "=========================================="

print_info "กำลัง ping google.com..."
if ping -c 3 google.com > /dev/null 2>&1; then
    print_success "เน็ตใช้ได้"
else
    print_error "เน็ตไม่ได้ กรุณาเช็คการเชื่อมต่อ"
    exit 1
fi

# ============================================
# STEP 2: Check Public IP
# ============================================
echo ""
echo "=========================================="
echo "STEP 2: เช็ค Public IP"
echo "=========================================="

if ! command -v curl &> /dev/null; then
    print_warning "curl ไม่มี กำลังติดตั้ง..."
    apt update -y
    apt install curl -y
fi

PUBLIC_IP=$(curl -s ifconfig.me)
print_success "Public IP: $PUBLIC_IP"
print_info "จดไว้: $PUBLIC_IP"

# ============================================
# STEP 3: Enter Router (Manual)
# ============================================
echo ""
echo "=========================================="
echo "STEP 3: เข้า Router"
echo "=========================================="

print_warning "กรุณาเปิดมือถือหรือคอม แล้วเข้า:"
print_info "  http://192.168.1.1"
print_info "  หรือ http://192.168.0.1"
print_info "  แล้วล็อกอิน Router"

read -p "เข้า Router เสร็จแล้วหรือยัง? (กด Enter เพื่อดำเนินการต่อ)"

# ============================================
# STEP 4: Find WAN IP (Manual)
# ============================================
echo ""
echo "=========================================="
echo "STEP 4: หา WAN IP ใน Router"
echo "=========================================="

print_info "หาเมนู: Status, Internet, WAN, หรือ Network"
print_info "มองหา: WAN IP"
read -p "WAN IP ใน Router คืออะไร? " WAN_IP

print_info "WAN IP ที่คุณบอก: $WAN_IP"

# ============================================
# STEP 5: Check CGNAT
# ============================================
echo ""
echo "=========================================="
echo "STEP 5: เช็ค CGNAT"
echo "=========================================="

print_info "Public IP (curl ifconfig.me): $PUBLIC_IP"
print_info "WAN IP (ใน Router): $WAN_IP"

if [ "$PUBLIC_IP" = "$WAN_IP" ]; then
    print_success "IP ตรงกัน ✅"
    print_info "ดีมาก เปิดเว็บจากบ้านได้"
else
    print_error "IP ไม่ตรง ❌"
    print_warning "ติด CGNAT"
    print_warning "จะเปิด Port ไม่ได้"
    print_warning "จะเปิดเว็บจากภายนอกไม่ได้"
    print_warning "ต้องโทรหา ISP ขอ Public IP"
    read -p "ยังต้องการดำเนินการต่อไหม? (y/N): " CONTINUE_CGNAT
    if [[ ! "$CONTINUE_CGNAT" =~ ^[Yy]$ ]]; then
        print_info "ยกเลิกการติดตั้ง"
        exit 0
    fi
fi

# ============================================
# STEP 6: Check Internal IP
# ============================================
echo ""
echo "=========================================="
echo "STEP 6: เช็ค IP ภายใน Ubuntu"
echo "=========================================="

INTERNAL_IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1 | head -1)
print_success "IP ภายในเครื่อง: $INTERNAL_IP"
print_info "จดไว้: $INTERNAL_IP"

# ============================================
# STEP 7: Find Interface Name
# ============================================
echo ""
echo "=========================================="
echo "STEP 7: หา Interface Name"
echo "=========================================="

INTERFACE=$(ip addr show | grep -E "^[0-9]+: " | awk '{print $2}' | cut -d: -f1 | grep -v "lo" | head -1)
print_success "Interface Name: $INTERFACE"
print_info "จดไว้: $INTERFACE"

# ============================================
# STEP 8: Open Netplan Config
# ============================================
echo ""
echo "=========================================="
echo "STEP 8: ตั้ง Static IP"
echo "=========================================="

NETPLAN_FILE=$(ls /etc/netplan/*.yaml 2>/dev/null | head -1)
if [ -z "$NETPLAN_FILE" ]; then
    print_error "ไม่พบ netplan config file"
    exit 1
fi

print_info "Config file: $NETPLAN_FILE"
print_info "Current config:"
cat "$NETPLAN_FILE"

read -p "กด Enter เพื่อแก้ config..."

# ============================================
# STEP 9: Edit to Static IP
# ============================================
echo ""
echo "=========================================="
echo "STEP 9: แก้เป็น Static IP"
echo "=========================================="

read -p "ตั้ง Static IP อะไร? (เช่น 192.168.1.50): " DESIRED_IP
read -p "Gateway IP คืออะไร? (default: 192.168.1.1): " GATEWAY_IP
GATEWAY_IP=${GATEWAY_IP:-192.168.1.1}

# Validate gateway is not a subnet mask
if [[ "$GATEWAY_IP" == 255.* ]]; then
    print_error "Gateway IP ไม่ถูกต้อง: $GATEWAY_IP (ดูเหมือน subnet mask)"
    print_info "Gateway IP ควรเป็น IP ของ router เช่น 192.168.1.1"
    read -p "กรอก Gateway IP ใหม่: " GATEWAY_IP
fi

# Backup
cp "$NETPLAN_FILE" "${NETPLAN_FILE}.backup"

# Create new config
cat > "$NETPLAN_FILE" << EOF
network:
  version: 2
  ethernets:
    $INTERFACE:
      dhcp4: no
      addresses:
        - $DESIRED_IP/24
      routes:
        - to: default
          via: $GATEWAY_IP
      nameservers:
        addresses:
          - 1.1.1.1
          - 8.8.8.8
EOF

print_success "Config ถูกแก้แล้ว"
print_info "  Interface: $INTERFACE"
print_info "  Static IP: $DESIRED_IP"
print_info "  Gateway: $GATEWAY_IP"

# ============================================
# STEP 10: Apply Netplan
# ============================================
echo ""
echo "=========================================="
echo "STEP 10: Apply Netplan"
echo "=========================================="

print_info "กำลัง apply netplan..."
netplan apply
print_success "Apply เสร็จสิ้น"

# ============================================
# STEP 11: Check IP Change
# ============================================
echo ""
echo "=========================================="
echo "STEP 11: เช็คว่าเปลี่ยนสำเร็จไหม"
echo "=========================================="

NEW_IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1 | head -1)
print_info "IP ใหม่: $NEW_IP"

if [ "$NEW_IP" = "$DESIRED_IP" ]; then
    print_success "เปลี่ยน IP สำเร็จ ✅"
else
    print_error "เปลี่ยน IP ไม่สำเร็จ ❌"
    print_info "กำลัง restore config..."
    cp "${NETPLAN_FILE}.backup" "$NETPLAN_FILE"
    netplan apply
    print_warning "กู้คืน config เดิมแล้ว"
    exit 1
fi

# ============================================
# STEP 12: Install Nginx
# ============================================
echo ""
echo "=========================================="
echo "STEP 12: ติดตั้ง Nginx"
echo "=========================================="

print_info "กำลังอัปเดตและติดตั้ง Nginx..."
apt update -y
apt install nginx -y
print_success "ติดตั้ง Nginx สำเร็จ"

# ============================================
# STEP 13: Start Nginx
# ============================================
echo ""
echo "=========================================="
echo "STEP 13: เปิด Nginx"
echo "=========================================="

systemctl enable nginx
systemctl start nginx
print_success "เปิด Nginx สำเร็จ"

# ============================================
# STEP 14: Check Nginx Status
# ============================================
echo ""
echo "=========================================="
echo "STEP 14: เช็คสถานะ Nginx"
echo "=========================================="

if systemctl status nginx | grep -q "active (running)"; then
    print_success "Nginx ทำงานอยู่ ✅"
else
    print_error "Nginx ไม่ทำงาน ❌"
    exit 1
fi

# ============================================
# STEP 15: Open Firewall
# ============================================
echo ""
echo "=========================================="
echo "STEP 15: เปิด Firewall"
echo "=========================================="

print_info "อนุญาต Port 80..."
ufw allow 80/tcp
print_success "Port 80 เปิดแล้ว"

print_info "อนุญาต Port 443..."
ufw allow 443/tcp
print_success "Port 443 เปิดแล้ว"

print_info "อนุญาต SSH (Port 22)..."
ufw allow 22/tcp
print_success "Port 22 เปิดแล้ว"

print_info "เปิด Firewall..."
ufw --force enable
print_success "Firewall เปิดแล้ว"

print_info "สถานะ Firewall:"
ufw status

# ============================================
# STEP 16: Test Inside Home
# ============================================
echo ""
echo "=========================================="
echo "STEP 16: ทดสอบในบ้าน"
echo "=========================================="

print_warning "กรุณาเปิดมือถือหรือคอมในบ้าน"
print_info "เข้า: http://$NEW_IP"
print_info "ควรจะเห็นหน้า: Welcome to nginx"
read -p "เห็นหน้า Welcome to nginx ไหม? (y/N): " TEST_INSIDE

if [[ "$TEST_INSIDE" =~ ^[Yy]$ ]]; then
    print_success "ทดสอบในบ้านสำเร็จ ✅"
else
    print_error "ทดสอบในบ้านไม่สำเร็จ ❌"
    print_info "เช็ค Nginx: sudo systemctl status nginx"
    print_info "เช็ค Firewall: sudo ufw status"
    exit 1
fi

# ============================================
# STEP 17: Open Port Forwarding (Manual)
# ============================================
echo ""
echo "=========================================="
echo "STEP 17: เปิด Port Forwarding"
echo "=========================================="

print_warning "กรุณาเข้า Router อีกครั้ง"
print_info "หาเมนู: Port Forward, Virtual Server, หรือ NAT"
print_info "เพิ่ม:"
print_info "  WAN Port: 80 → LAN IP: $NEW_IP → LAN Port: 80"
print_info "  WAN Port: 443 → LAN IP: $NEW_IP → LAN Port: 443"
print_info ""
print_info "ตัวอย่าง:"
print_info "  WAN Port: 80"
print_info "  LAN IP: $NEW_IP"
print_info "  LAN Port: 80"

read -p "ตั้งค่า Port Forwarding เสร็จแล้วหรือยัง? (กด Enter เพื่อดำเนินการต่อ)"

# ============================================
# STEP 18: Test from Real Internet
# ============================================
echo ""
echo "=========================================="
echo "STEP 18: ทดสอบจากอินเทอร์เน็ตจริง"
echo "=========================================="

print_warning "กรุณาใช้มือถือ:"
print_info "  1. ปิด Wi-Fi"
print_info "  2. ใช้ 4G/5G"
print_info "  3. เปิด: http://$PUBLIC_IP"
print_info "  4. ควรจะเห็นหน้า: Welcome to nginx"

read -p "เข้าได้ไหม? (y/N): " TEST_OUTSIDE

if [[ "$TEST_OUTSIDE" =~ ^[Yy]$ ]]; then
    print_success "Ubuntu Server เปิดเว็บจากอินเทอร์เน็ตสำเร็จ ✅"
    print_info "พร้อมต่อ:"
    print_info "  - Domain"
    print_info "  - HTTPS"
    print_info "  - Cloudflare"
    print_info "  - SSH จากนอกบ้าน"
    print_info "  - Game Server"
else
    print_error "เข้าไม่ได้ ❌"
    print_info "เช็ค:"
    print_info "  1. Nginx ทำงานไหม: sudo systemctl status nginx"
    print_info "  2. เปิด port จริงไหม: sudo ss -tuln"
    print_info "  3. Firewall: sudo ufw status"
    print_info "  4. CGNAT: ถ้า Port Forward ถูกแต่ยังเข้าไม่ได้ มักติด CGNAT"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "=========================================="
echo "SUMMARY"
echo "=========================================="

print_info "Public IP: $PUBLIC_IP"
print_info "WAN IP: $WAN_IP"
print_info "Internal IP: $NEW_IP"
print_info "Interface: $INTERFACE"
print_info "Static IP: $DESIRED_IP"
print_info "Gateway: $GATEWAY_IP"

echo ""
print_success "Setup เสร็จสิ้น!"
