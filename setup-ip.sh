#!/bin/bash

# ============================================
# DD Computer - IP Configuration Script
# For Ubuntu Server Deployment
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "  DD Computer - IP Configuration Script"
echo "============================================"
echo ""

# Check if running on Ubuntu
if [ ! -f /etc/os-release ] || ! grep -q "ubuntu" /etc/os-release; then
    echo -e "${YELLOW}Warning: This script is designed for Ubuntu server.${NC}"
    echo "Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if running as root (allow for VPS deployment)
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}Running as root user${NC}"
    echo "This is acceptable for VPS deployment."
else
    echo -e "${YELLOW}Not running as root - some operations may require sudo${NC}"
fi

# Get server IP
echo "Please enter your server IP address:"
echo "Examples: 192.168.1.100, 10.0.0.5, 203.0.113.50"
read -p "Server IP: " SERVER_IP

# Validate IP format
if [[ ! $SERVER_IP =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    echo -e "${RED}Error: Invalid IP address format.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Configuring for IP: $SERVER_IP${NC}"
echo ""

# Backup files
echo "Creating backups..."
BACKUP_DIR="./backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

backup_file() {
    if [ -f "$1" ]; then
        cp "$1" "$BACKUP_DIR/"
        echo "  Backed up: $1"
    fi
}

backup_file "docker-compose.yml"
backup_file "backend/.env"
backup_file "frontend/.env"
backup_file ".env.production.example"

echo ""

# Update docker-compose.yml
echo "Updating docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    sed -i.bak "s|http://localhost:3001|http://$SERVER_IP:3001|g" docker-compose.yml
    sed -i "s|http://localhost:3000|http://$SERVER_IP:3000|g" docker-compose.yml
    sed -i "s|http://127.0.0.1:3000|http://$SERVER_IP:3000|g" docker-compose.yml
    sed -i "s|API_URL: http://localhost:3001|API_URL: http://$SERVER_IP:3001|g" docker-compose.yml
    sed -i "s|FRONTEND_URL: http://localhost:3000|FRONTEND_URL: http://$SERVER_IP:3000|g" docker-compose.yml
    sed -i "s|GOOGLE_CALLBACK_URL: http://localhost:3001|GOOGLE_CALLBACK_URL: http://$SERVER_IP:3001|g" docker-compose.yml
    sed -i "s|NEXT_PUBLIC_API_URL: http://localhost:3001|NEXT_PUBLIC_API_URL: http://$SERVER_IP:3001|g" docker-compose.yml
    sed -i "s|NEXT_PUBLIC_WS_URL: http://localhost:3001|NEXT_PUBLIC_WS_URL: http://$SERVER_IP:3001|g" docker-compose.yml
    sed -i "s|NEXT_PUBLIC_SITE_URL: http://localhost:3000|NEXT_PUBLIC_SITE_URL: http://$SERVER_IP:3000|g" docker-compose.yml
    echo -e "${GREEN}✓ docker-compose.yml updated${NC}"
else
    echo -e "${YELLOW}⚠ docker-compose.yml not found${NC}"
fi

# Update backend/.env
echo "Updating backend/.env..."
if [ -f "backend/.env" ]; then
    sed -i.bak "s|DB_HOST=localhost|DB_HOST=mysql|g" backend/.env
    sed -i "s|http://localhost:3001|http://$SERVER_IP:3001|g" backend/.env
    sed -i "s|http://localhost:3000|http://$SERVER_IP:3000|g" backend/.env
    sed -i "s|CORS_ORIGIN=http://localhost:3000|CORS_ORIGIN=http://$SERVER_IP:3000|g" backend/.env
    sed -i "s|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=http://$SERVER_IP:3000|g" backend/.env
    echo -e "${GREEN}✓ backend/.env updated${NC}"
else
    echo -e "${YELLOW}⚠ backend/.env not found${NC}"
fi

# Update frontend/.env
echo "Updating frontend/.env..."
if [ -f "frontend/.env" ]; then
    sed -i.bak "s|http://localhost:3001|http://$SERVER_IP:3001|g" frontend/.env
    echo -e "${GREEN}✓ frontend/.env updated${NC}"
else
    echo -e "${YELLOW}⚠ frontend/.env not found${NC}"
fi

# Create .env.production from example
echo "Creating .env.production..."
if [ -f ".env.production.example" ]; then
    cp .env.production.example .env.production
    sed -i.bak "s|https://ddcomputer.com|http://$SERVER_IP|g" .env.production
    sed -i "s|https://www.ddcomputer.com|http://$SERVER_IP|g" .env.production
    echo -e "${GREEN}✓ .env.production created${NC}"
else
    echo -e "${YELLOW}⚠ .env.production.example not found${NC}"
fi

# Update NGINX config if exists
echo "Checking NGINX configuration..."
if [ -f "nginx/ddcomputer.conf" ]; then
    sed -i.bak "s|server_name ddcomputer.com|server_name $SERVER_IP|g" nginx/ddcomputer.conf
    echo -e "${GREEN}✓ nginx/ddcomputer.conf updated${NC}"
fi

# Clean up .bak files
echo "Cleaning up backup files..."
find . -name "*.bak" -type f -delete 2>/dev/null || true

echo ""
echo "============================================"
echo -e "${GREEN}Configuration Complete!${NC}"
echo "============================================"
echo ""
echo "Summary:"
echo "  Server IP: $SERVER_IP"
echo "  Backup location: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "  1. Review the changes in: $BACKUP_DIR"
echo "  2. Update .env.production with your actual values:"
echo "     - MYSQL_ROOT_PASSWORD"
echo "     - JWT_SECRET"
echo "     - GOOGLE_CLIENT_ID"
echo "     - GOOGLE_CLIENT_SECRET"
echo "  3. Run: docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "To restore backups if needed:"
echo "  cp $BACKUP_DIR/* ."
echo ""
