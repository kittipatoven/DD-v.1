#!/bin/bash

# DD Computer - VPS Deployment Script
# Run this script on your Ubuntu VPS to deploy the application
# Compatible with any Ubuntu server

set -e

echo "=========================================="
echo "DD Computer - VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Array to store issues found
ISSUES=()
WARNINGS=()

# Function to add issue
add_issue() {
    ISSUES+=("$1")
}

# Function to add warning
add_warning() {
    WARNINGS+=("$1")
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# ============================================
# PRE-DEPLOYMENT CHECKS
# ============================================
echo ""
echo "=========================================="
echo "Step 0: Pre-Deployment System Checks"
echo "=========================================="

# Check 1: Ubuntu Version
echo ""
print_info "Checking Ubuntu version..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    UBUNTU_VERSION=$VERSION_ID
    print_success "Ubuntu version: $UBUNTU_VERSION"
    
    # Check if Ubuntu is 20.04 or higher
    if (( $(echo "$UBUNTU_VERSION < 20.04" | bc -l) )); then
        add_issue "Ubuntu version $UBUNTU_VERSION is too old. Minimum required: 20.04"
    fi
else
    add_issue "Cannot detect Ubuntu version"
fi

# Check 2: System Resources
print_info "Checking system resources..."
TOTAL_RAM=$(free -m | awk '/Mem:/ {print $2}')
TOTAL_DISK=$(df -BG / | awk 'NR==2 {print $2}' | tr -d 'G')
AVAILABLE_DISK=$(df -BG / | awk 'NR==2 {print $4}' | tr -d 'G')

print_success "Total RAM: ${TOTAL_RAM}MB"
print_success "Total Disk: ${TOTAL_DISK}GB"
print_success "Available Disk: ${AVAILABLE_DISK}GB"

if [ "$TOTAL_RAM" -lt 1024 ]; then
    add_warning "Low RAM: ${TOTAL_RAM}MB (Recommended: 2GB+)"
fi

if [ "$AVAILABLE_DISK" -lt 10 ]; then
    add_issue "Insufficient disk space: ${AVAILABLE_DISK}GB (Required: 10GB+)"
fi

# Check 3: Required Ports
print_info "Checking required ports..."
PORTS=(22 80 443 3000 3001 3306 8081)
for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        if [ "$port" = "22" ]; then
            print_success "Port $port: In use (SSH - OK)"
        else
            add_warning "Port $port is already in use. This may cause conflicts."
        fi
    else
        print_success "Port $port: Available"
    fi
done

# Check 4: Docker Installation
print_info "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | tr -d ',')
    print_success "Docker installed: $DOCKER_VERSION"
else
    print_warning "Docker not installed (will be installed)"
fi

# Check 5: Docker Compose Installation
print_info "Checking Docker Compose installation..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version | awk '{print $4}')
    print_success "Docker Compose v2 installed: $COMPOSE_VERSION"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | awk '{print $3}' | tr -d ',')
    print_warning "Docker Compose v1 installed: $COMPOSE_VERSION (v2 recommended)"
else
    print_warning "Docker Compose not installed (will be installed)"
fi

# Check 6: NGINX Installation
print_info "Checking NGINX installation..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | awk -F'/' '{print $2}')
    print_success "NGINX installed: $NGINX_VERSION"
else
    print_warning "NGINX not installed (will be installed)"
fi

# Check 7: Required Files
print_info "Checking required project files..."
REQUIRED_FILES=("docker-compose.prod.yml" "backend/Dockerfile" "frontend/Dockerfile" "nginx/ddcomputer.conf" "nginx/ddcomputer-ip.conf")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        add_issue "Missing required file: $file"
    fi
done

# Check 8: Environment File
print_info "Checking environment configuration..."
if [ -f ".env.production" ]; then
    print_success ".env.production exists"
    print_warning "Will use existing .env.production (review before deployment)"
else
    print_warning ".env.production not found (will be created)"
fi

# Check 9: Network Connectivity
print_info "Checking network connectivity..."
if ping -c 1 -W 2 8.8.8.8 >/dev/null 2>&1; then
    print_success "Internet connectivity: OK"
else
    add_issue "No internet connectivity. Required for package installation."
fi

# Check 10: Get Server IP
print_info "Detecting server IP..."
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || hostname -I | awk '{print $1}')
if [ -n "$SERVER_IP" ]; then
    print_success "Server IP: $SERVER_IP"
else
    add_warning "Could not detect server IP automatically"
fi

# ============================================
# REPORT ISSUES AND WARNINGS
# ============================================
echo ""
echo "=========================================="
echo "Pre-Deployment Check Report"
echo "=========================================="

if [ ${#ISSUES[@]} -gt 0 ]; then
    echo ""
    print_error "CRITICAL ISSUES FOUND (${#ISSUES[@]}):"
    for issue in "${ISSUES[@]}"; do
        echo "  - $issue"
    done
    echo ""
    read -p "Critical issues found. Continue anyway? (y/N): " CONTINUE_ANYWAY
    if [[ ! "$CONTINUE_ANYWAY" =~ ^[Yy]$ ]]; then
        print_error "Deployment aborted by user"
        exit 1
    fi
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo ""
    print_warning "WARNINGS (${#WARNINGS[@]}):"
    for warning in "${WARNINGS[@]}"; do
        echo "  - $warning"
    done
    echo ""
    read -p "Warnings found. Continue? (Y/n): " CONTINUE_WITH_WARNINGS
    if [[ "$CONTINUE_WITH_WARNINGS" =~ ^[Nn]$ ]]; then
        print_error "Deployment aborted by user"
        exit 1
    fi
fi

if [ ${#ISSUES[@]} -eq 0 ] && [ ${#WARNINGS[@]} -eq 0 ]; then
    print_success "All checks passed! No issues found."
fi

echo ""
read -p "Press Enter to continue with deployment..."

# Step 1: Update System
echo ""
echo "Step 1: Updating system..."
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Set Hostname
echo ""
echo "Step 2: Setting hostname..."
read -p "Enter hostname (default: ddcomputer): " HOSTNAME
HOSTNAME=${HOSTNAME:-ddcomputer}
hostnamectl set-hostname $HOSTNAME
echo "127.0.0.1 $HOSTNAME" >> /etc/hosts
print_success "Hostname set to $HOSTNAME"

# Step 3: Install Required Packages
echo ""
echo "Step 3: Installing required packages..."
apt install -y curl git ufw fail2ban nginx
print_success "Required packages installed"

# Step 4: Configure Firewall
echo ""
echo "Step 4: Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall configured"

# Step 5: Install Docker
echo ""
echo "Step 5: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $SUDO_USER
    print_success "Docker installed"
else
    print_warning "Docker already installed"
fi

# Step 6: Install Docker Compose v2
echo ""
echo "Step 6: Installing Docker Compose v2..."
if ! docker compose version &> /dev/null; then
    apt install -y docker-compose-plugin
    print_success "Docker Compose v2 installed"
else
    print_warning "Docker Compose v2 already installed"
fi

# Helper function for docker compose
compose_cmd() {
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.prod.yml "$@"
    else
        docker-compose -f docker-compose.prod.yml "$@"
    fi
}

# Step 6.5: Install rclone for Google Drive Backup
echo ""
echo "Step 6.5: Installing rclone for Google Drive backup..."
if ! command -v rclone &> /dev/null; then
    curl https://rclone.org/install.sh | sudo bash
    print_success "rclone installed"
else
    print_warning "rclone already installed"
fi

# Step 7: Check Application Directory
echo ""
echo "Step 7: Checking application directory..."

# Check if we're already in a project directory with docker-compose.prod.yml
if [ -f "docker-compose.prod.yml" ]; then
    print_success "Found project in current directory: $(pwd)"
else
    # Try to find project directory
    if [ -d "/var/www/ddcomputer" ] && [ -f "/var/www/ddcomputer/docker-compose.prod.yml" ]; then
        cd /var/www/ddcomputer
        print_success "Found project in /var/www/ddcomputer"
    else
        print_error "Project not found. Please run this script from the project directory."
        exit 1
    fi
fi

# Step 8: Choose Deployment Mode (Always ask this first)
echo ""
echo "Step 8: Choose deployment mode..."
echo "1) IP Address (http://$SERVER_IP) - No SSL"
echo "2) Domain Name (https://example.com) - With SSL"
read -p "Select option (1 or 2, default: 1): " DEPLOY_MODE
DEPLOY_MODE=${DEPLOY_MODE:-1}

# Set DOMAIN based on deployment mode
if [ "$DEPLOY_MODE" = "2" ]; then
    DOMAIN_TYPE="domain"
else
    DOMAIN="$SERVER_IP"
    DOMAIN_TYPE="ip"
fi

# Step 9: Setup Environment Variables
echo ""
echo "Step 9: Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    print_warning "Creating .env.production file..."
    
    read -sp "Enter MySQL root password: " MYSQL_PASSWORD
    echo ""
    read -sp "Enter JWT secret: " JWT_SECRET
    echo ""
    read -p "Enter Google Client ID: " GOOGLE_CLIENT_ID
    read -sp "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
    echo ""
    
    if [ "$DEPLOY_MODE" = "2" ]; then
        # Domain mode with SSL
        read -p "Enter domain name (e.g., ddcomputer.com): " DOMAIN
        
        cat > .env.production << EOF
MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD
API_URL=https://$DOMAIN
CORS_ORIGIN=https://$DOMAIN,https://www.$DOMAIN
FRONTEND_URL=https://$DOMAIN
JWT_SECRET=$JWT_SECRET
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://$DOMAIN/api/v1/auth/google/callback
NEXT_PUBLIC_API_URL=https://$DOMAIN/api/v1
NEXT_PUBLIC_WS_URL=https://$DOMAIN
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
EOF
    else
        # IP mode without SSL
        DOMAIN="$SERVER_IP"
        
        cat > .env.production << EOF
MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD
API_URL=http://$DOMAIN
CORS_ORIGIN=http://$DOMAIN
FRONTEND_URL=http://$DOMAIN
JWT_SECRET=$JWT_SECRET
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://$DOMAIN/api/v1/auth/google/callback
NEXT_PUBLIC_API_URL=http://$DOMAIN/api/v1
NEXT_PUBLIC_WS_URL=http://$DOMAIN
NEXT_PUBLIC_SITE_URL=http://$DOMAIN
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
EOF
    fi
    
    # Copy to backend
    cp .env.production backend/.env
    
    print_success "Environment variables configured"
else
    print_warning ".env.production already exists (skipping creation)"
    print_warning "Using deployment mode: $DOMAIN_TYPE (DOMAIN=$DOMAIN)"
fi

# Step 10: Build and Start Docker Containers
echo ""
echo "Step 10: Building and starting Docker containers..."

# Export environment variables from .env.production
if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | grep -v '^$' | xargs)
fi

# Cleanup existing containers
compose_cmd down 2>/dev/null || true
docker rm -f dd-v1_mysql_1 dd-v1_backend_1 dd-v1_frontend_1 2>/dev/null || true

# Build and start
compose_cmd up -d --build
print_success "Docker containers started"

# Step 11: Setup NGINX
echo ""
echo "Step 11: Setting up NGINX..."

# Choose appropriate nginx config based on deployment mode
if [ "$DEPLOY_MODE" = "2" ]; then
    NGINX_CONFIG="nginx/ddcomputer.conf"
else
    NGINX_CONFIG="nginx/ddcomputer-ip.conf"
    print_warning "Using IP-based nginx config (HTTP only)"
fi

if [ -f "$NGINX_CONFIG" ]; then
    cp $NGINX_CONFIG /etc/nginx/sites-available/ddcomputer
    ln -sf /etc/nginx/sites-available/ddcomputer /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
    print_success "NGINX configured"
else
    print_error "NGINX configuration file not found: $NGINX_CONFIG"
fi

# Step 12: Setup SSL (Skip if using IP mode)
if [ "$DEPLOY_MODE" = "2" ]; then
    echo ""
    echo "Step 12: Setting up SSL certificate..."
    read -p "Enter domain name for SSL (e.g., ddcomputer.com): " SSL_DOMAIN
    read -p "Enter email for Let's Encrypt: " SSL_EMAIL

    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d $SSL_DOMAIN -d www.$SSL_DOMAIN --email $SSL_EMAIL --agree-tos --non-interactive
    print_success "SSL certificate installed"

    # Step 13: Setup Auto-renewal
    echo ""
    echo "Step 13: Setting up SSL auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
    print_success "SSL auto-renewal configured"
else
    echo ""
    echo "Step 12-13: Skipping SSL setup (IP mode selected)..."
    print_warning "Running on HTTP only - SSL not configured"
fi

# Step 14: Setup Fail2Ban
echo ""
echo "Step 14: Configuring Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
print_success "Fail2Ban configured"

# Step 15: Final Checks
echo ""
echo "Step 15: Running final checks..."
compose_cmd ps
print_success "Deployment completed!"

echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo "Server IP: $SERVER_IP"
if [ "$DEPLOY_MODE" = "2" ]; then
    echo "Application URL: https://$DOMAIN"
else
    echo "Application URL: http://$DOMAIN"
fi
echo "phpMyAdmin: Access via SSH tunnel (localhost:8080)"
echo ""
echo "Useful Commands:"
echo "  View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  Restart: docker compose -f docker-compose.prod.yml restart"
echo "  Update: git pull && docker compose -f docker-compose.prod.yml up -d --build"
echo "  Stop: docker compose -f docker-compose.prod.yml down"
echo ""
print_success "DD Computer deployed successfully!"
