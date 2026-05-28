#!/bin/bash

# DD Computer - Home Network Setup Script
# สำหรับติดตั้งบน home WiFi พร้อมเปิดเว็บสู่สาธารณะ
# Usage: sudo bash setup-home-network.sh

set -e

echo "=========================================="
echo "DD Computer - Home Network Setup"
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
# STEP 1: Set Static IP
# ============================================
echo ""
echo "=========================================="
echo "Step 1: Configuring Static Local IP"
echo "=========================================="

read -p "Enter desired static IP (e.g., 192.168.1.100): " STATIC_IP
read -p "Enter router gateway (e.g., 192.168.1.1): " GATEWAY
read -p "Enter network interface (e.g., eth0 or wlan0): " INTERFACE

# Backup original config
cp /etc/netplan/00-installer-config.yaml /etc/netplan/00-installer-config.yaml.backup

# Create new netplan config
cat > /etc/netplan/00-installer-config.yaml << EOF
network:
  version: 2
  ethernets:
    $INTERFACE:
      addresses:
        - $STATIC_IP/24
      routes:
        - to: default
          via: $GATEWAY
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4, 1.1.1.1]
EOF

print_success "Static IP configuration saved"
print_info "Applying netplan configuration..."
netplan apply
print_success "Static IP configured: $STATIC_IP"

# ============================================
# STEP 2: Install DDNS Client
# ============================================
echo ""
echo "=========================================="
echo "Step 2: Setting up Dynamic DNS"
echo "=========================================="

print_info "Installing ddclient..."
apt install -y ddclient

print_warning "ddclient installed. Please configure it manually:"
print_info "Run: sudo dpkg-reconfigure ddclient"
print_info "Or edit: /etc/ddclient.conf"

# ============================================
# STEP 3: Cloudflare DDNS Option
# ============================================
echo ""
echo "=========================================="
echo "Step 3: Cloudflare DDNS Setup (Optional)"
echo "=========================================="

read -p "Use Cloudflare DDNS? (y/N): " USE_CLOUDFLARE

if [[ "$USE_CLOUDFLARE" =~ ^[Yy]$ ]]; then
    read -p "Enter Cloudflare Zone ID: " ZONE_ID
    read -p "Enter Cloudflare Record ID: " RECORD_ID
    read -p "Enter Cloudflare API Token: " API_TOKEN
    read -p "Enter domain (e.g., ddcomputersamrong.com): " DOMAIN
    
    # Create Cloudflare DDNS script
    cat > /usr/local/bin/cf-ddns.sh << EOF
#!/bin/bash
ZONE_ID="$ZONE_ID"
RECORD_ID="$RECORD_ID"
API_TOKEN="$API_TOKEN"
DOMAIN="$DOMAIN"

IP=\$(curl -s ifconfig.me)
curl -X PUT "https://api.cloudflare.com/client/v4/zones/\$ZONE_ID/dns_records/\$RECORD_ID" \\
  -H "Authorization: Bearer \$API_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data "{\"type\":\"A\",\"name\":\"\$DOMAIN\",\"content\":\"\$IP\",\"ttl\":1}"

echo "Updated \$DOMAIN to \$IP"
EOF
    
    chmod +x /usr/local/bin/cf-ddns.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/cf-ddns.sh >> /var/log/cf-ddns.log 2>&1") | crontab -
    
    print_success "Cloudflare DDNS configured"
    print_info "Script will run every 5 minutes"
    print_info "Logs: /var/log/cf-ddns.log"
fi

# ============================================
# STEP 4: Display Port Forwarding Instructions
# ============================================
echo ""
echo "=========================================="
echo "Step 4: Port Forwarding Instructions"
echo "=========================================="

print_warning "IMPORTANT: You must configure port forwarding on your router"
print_info ""
print_info "Router Admin Page: Usually 192.168.1.1 or 192.168.0.1"
print_info ""
print_info "Forward these ports to $STATIC_IP:"
print_info "  - Port 80 (HTTP) → $STATIC_IP:80"
print_info "  - Port 443 (HTTPS) → $STATIC_IP:443"
print_info "  - Port 22 (SSH - optional) → $STATIC_IP:22"
print_info ""
print_info "Common router brands:"
print_info "  - ASUS: http://192.168.1.1"
print_info "  - TP-Link: http://192.168.1.1"
print_info "  - D-Link: http://192.168.0.1"
print_info "  - True/AIS: http://192.168.1.1"

# ============================================
# STEP 5: Test Public IP
# ============================================
echo ""
echo "=========================================="
echo "Step 5: Testing Public IP"
echo "=========================================="

PUBLIC_IP=$(curl -s ifconfig.me)
print_success "Public IP detected: $PUBLIC_IP"
print_info "Make sure your domain points to this IP"

# ============================================
# STEP 6: Security Recommendations
# ============================================
echo ""
echo "=========================================="
echo "Step 6: Security Recommendations"
echo "=========================================="

print_warning "Home network exposure security tips:"
print_info "1. Use strong SSH passwords or SSH keys only"
print_info "2. Disable root SSH login: sudo nano /etc/ssh/sshd_config"
print_info "   Set: PermitRootLogin no"
print_info "3. Install fail2ban: sudo apt install fail2ban"
print_info "4. Keep system updated: sudo apt update && sudo apt upgrade"
print_info "5. Use UFW firewall (deploy-complete.sh will configure this)"

# ============================================
# STEP 7: Next Steps
# ============================================
echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="

print_info "1. Configure port forwarding on your router"
print_info "2. Wait for DNS propagation (if using domain)"
print_info "3. Run deploy-complete.sh for full deployment"
print_info "4. Test access: curl http://$PUBLIC_IP"

echo ""
print_success "Home network setup complete!"
print_info "Static IP: $STATIC_IP"
print_info "Public IP: $PUBLIC_IP"
