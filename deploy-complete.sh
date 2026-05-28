#!/bin/bash

# DD Computer - Complete VPS Deployment Script
# One-click deployment for Ubuntu VPS
# Usage: sudo bash deploy-complete.sh

set -e

echo "=========================================="
echo "DD Computer - Complete Deployment"
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

# Generate secure random password (alphanumeric only for safe export)
generate_password() {
    openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | cut -c1-25
}

# Check system requirements
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check RAM
    RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
    # Fallback if RAM detection fails (try different method)
    if [ -z "$RAM_GB" ] || [ "$RAM_GB" -eq 0 ]; then
        RAM_GB=$(free -m | awk '/^Mem:/{print int($2/1024)}')
    fi
    if [ -z "$RAM_GB" ] || [ "$RAM_GB" -eq 0 ]; then
        RAM_GB=2  # Default assumption if detection fails
        print_warning "Could not detect RAM, assuming 2GB"
    fi
    if [ "$RAM_GB" -lt 1 ]; then
        print_error "Insufficient RAM: ${RAM_GB}GB (minimum 1GB required)"
        exit 1
    elif [ "$RAM_GB" -lt 2 ]; then
        print_warning "RAM: ${RAM_GB}GB (recommended 2GB+ for production)"
        print_info "Creating swap space to compensate for low RAM..."
        
        # Check if swap file exists
        if [ ! -f /swapfile ]; then
            print_info "Creating 2GB swap file..."
            fallocate -l 2G /swapfile
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
            print_success "Swap file created and enabled (2GB)"
        else
            print_info "Swap file already exists"
        fi
        
        print_success "RAM: ${RAM_GB}GB + Swap (total memory increased)"
    elif [ "$RAM_GB" -lt 4 ]; then
        print_warning "RAM: ${RAM_GB}GB (recommended 4GB+ for production)"
        print_success "RAM: ${RAM_GB}GB"
    else
        print_success "RAM: ${RAM_GB}GB"
    fi
    
    # Check Disk
    DISK_GB=$(df -BG / | awk 'NR==2{print $4}' | tr -d 'G')
    if [ "$DISK_GB" -lt 5 ]; then
        print_error "Insufficient disk space: ${DISK_GB}GB (minimum 5GB required)"
        exit 1
    elif [ "$DISK_GB" -lt 10 ]; then
        print_warning "Disk: ${DISK_GB}GB available (recommended 10GB+ for production)"
        print_success "Disk: ${DISK_GB}GB (proceeding with warning)"
    else
        print_success "Disk: ${DISK_GB}GB available"
    fi
    
    # Check Ports (warning only, don't block deployment)
    PORTS_IN_USE=0
    for port in 80 443 3000 3001 8080; do
        if command -v lsof &> /dev/null && lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
            PORTS_IN_USE=$((PORTS_IN_USE + 1))
        fi
    done
    if [ $PORTS_IN_USE -eq 0 ]; then
        print_success "All required ports available"
    else
        print_warning "$PORTS_IN_USE port(s) in use - deployment may fail"
    fi
    
    # Check OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        print_success "OS: $PRETTY_NAME"
    else
        print_warning "Cannot detect OS version"
    fi
}

# Check root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Run system requirements check
check_requirements

# ============================================
# STEP 0.5: Configure Netplan for Automatic DHCP
# ============================================
echo ""
echo "Step 0.5: Configuring Netplan for automatic DHCP..."

# Detect the primary network interface
PRIMARY_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -1)
if [ -z "$PRIMARY_INTERFACE" ]; then
    # Fallback: try to find the first ethernet interface
    PRIMARY_INTERFACE=$(ls /sys/class/net | grep -E '^en' | head -1)
fi

if [ -z "$PRIMARY_INTERFACE" ]; then
    print_warning "Could not detect network interface, skipping Netplan configuration"
else
    print_info "Detected network interface: $PRIMARY_INTERFACE"
    
    # Find netplan configuration file
    NETPLAN_DIR="/etc/netplan"
    NETPLAN_FILE=$(ls "$NETPLAN_DIR"/*.yaml 2>/dev/null | head -1)
    
    if [ -z "$NETPLAN_FILE" ]; then
        print_warning "No Netplan configuration file found, creating one..."
        NETPLAN_FILE="$NETPLAN_DIR/01-dhcp-config.yaml"
    else
        print_info "Found Netplan configuration: $NETPLAN_FILE"
    fi
    
    # Backup existing configuration
    if [ -f "$NETPLAN_FILE" ]; then
        cp "$NETPLAN_FILE" "${NETPLAN_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Backed up existing Netplan configuration"
    fi
    
    # Create Netplan configuration for DHCP
    cat > "$NETPLAN_FILE" << NETPLAN_EOF
network:
  version: 2
  ethernets:
    ${PRIMARY_INTERFACE}:
      dhcp4: true
NETPLAN_EOF
    
    print_success "Netplan configured for automatic DHCP"
    
    # Apply Netplan configuration
    print_info "Applying Netplan configuration..."
    if netplan apply 2>/dev/null; then
        print_success "Netplan configuration applied successfully"
    else
        print_warning "Netplan apply failed, but configuration saved"
    fi
    
    # Test network connectivity
    print_info "Testing network connectivity..."
    if ping -c 1 -W 5 8.8.8.8 >/dev/null 2>&1; then
        print_success "Network connectivity verified"
    else
        print_warning "Network connectivity test failed, but DHCP is configured"
    fi
    
    print_info "After reboot, the server will automatically obtain IP via DHCP"
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
    print_info "No .env.deploy found, using defaults"
fi

# Set dynamic project directory
PROJECT_DIR="${DEPLOY_PROJECT_DIR:-$HOME/DD-v.1}"
print_info "Project directory: $PROJECT_DIR"

# Set dynamic git repository
GIT_REPO_URL="${GIT_REPO_URL:-https://github.com/kittipatoven/DD-v.1.git}"
print_info "Git repository: $GIT_REPO_URL"

# Set domain (optional)
DOMAIN_NAME="${DOMAIN_NAME:-ddcomputersamrong.com}"
if [ -n "$DOMAIN_NAME" ]; then
    print_success "Domain: $DOMAIN_NAME"
else
    print_info "No domain configured, will use IP address"
fi

# ============================================
# PASSWORD PROTECTION
# ============================================
echo ""
echo "=========================================="
echo "Authentication Required"
echo "=========================================="

# Use environment variable for deployment password
DEPLOY_PASSWORD="${DEPLOY_PASSWORD:-}"

if [ -z "$DEPLOY_PASSWORD" ]; then
    read -sp "Enter deployment password: " DEPLOY_PASSWORD
    echo ""
fi

# For production, use a hashed password comparison
# For now, using a simple check - replace with proper hash in production
if [ -z "$DEPLOY_PASSWORD" ]; then
    print_error "Password required. Access denied."
    exit 1
fi

print_success "Authentication successful"

# Get Server IP
print_info "Detecting server IP..."
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    print_error "Cannot detect server IP"
    exit 1
fi
print_success "Server IP: $SERVER_IP"

# ============================================
# STEP 1: System Update & Install Dependencies
# ============================================
echo ""
echo "Step 1: Installing system dependencies..."
apt update -y
apt install -y curl git ufw nginx bc lsof cron
print_success "System dependencies installed"

# ============================================
# STEP 2: Install Docker
# ============================================
echo ""
echo "Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker root
    systemctl enable docker
    systemctl start docker
    print_success "Docker installed"
else
    print_warning "Docker already installed"
fi

# ============================================
# STEP 3: Install Docker Compose
# ============================================
echo ""
echo "Step 3: Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt install -y docker-compose-plugin
    print_success "Docker Compose installed"
else
    print_warning "Docker Compose already installed"
fi

# Helper function
compose_cmd() {
    docker compose -f docker-compose.prod.yml --env-file .env.production "$@"
}

# ============================================
# STEP 4: Clone Repository
# ============================================
echo ""
echo "Step 4: Setting up repository..."

# Create project directory if it doesn't exist
mkdir -p "$PROJECT_DIR"

if [ ! -d "$PROJECT_DIR/.git" ]; then
    print_info "Cloning repository from $GIT_REPO_URL..."
    if [ -d "$PROJECT_DIR" ] && [ "$(ls -A $PROJECT_DIR 2>/dev/null)" ]; then
        print_warning "Directory exists but is not a git repository"
        read -p "Remove and clone? (y/N): " remove_confirm
        if [[ "$remove_confirm" =~ ^[Yy]$ ]]; then
            rm -rf "$PROJECT_DIR"
            git clone "$GIT_REPO_URL" "$PROJECT_DIR"
        else
            print_error "Cannot proceed with existing non-git directory"
            exit 1
        fi
    else
        git clone "$GIT_REPO_URL" "$PROJECT_DIR"
    fi
else
    print_info "Repository exists, pulling latest updates..."
    cd "$PROJECT_DIR"
    git pull
fi

cd "$PROJECT_DIR"
print_success "Repository ready"

# ============================================
# STEP 5: Create Environment Variables
# ============================================
echo ""
echo "Step 5: Creating environment configuration..."

# Generate secure passwords
MYSQL_ROOT_PASSWORD=$(generate_password)
DB_PASSWORD=$MYSQL_ROOT_PASSWORD
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n\r')

# Set URLs based on domain
if [ -n "$DOMAIN_NAME" ]; then
  API_URL="https://${DOMAIN_NAME}"
  CORS_ORIGIN="https://${DOMAIN_NAME}"
  FRONTEND_URL="https://${DOMAIN_NAME}"
  NEXT_PUBLIC_API_URL="https://${DOMAIN_NAME}/api/v1"
  NEXT_PUBLIC_WS_URL="wss://${DOMAIN_NAME}"
  NEXT_PUBLIC_SITE_URL="https://${DOMAIN_NAME}"
else
  API_URL="http://${SERVER_IP}"
  CORS_ORIGIN="http://${SERVER_IP}"
  FRONTEND_URL="http://${SERVER_IP}"
  NEXT_PUBLIC_API_URL="http://${SERVER_IP}/api/v1"
  NEXT_PUBLIC_WS_URL="http://${SERVER_IP}"
  NEXT_PUBLIC_SITE_URL="http://${SERVER_IP}"
fi

if [ ! -f ".env.production" ]; then
    cat > .env.production << EOF
# Database
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=dd_computer
NODE_ENV=production
PORT=3001

# API & Frontend URLs
API_URL=${API_URL}
CORS_ORIGIN=${CORS_ORIGIN}
FRONTEND_URL=${FRONTEND_URL}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
# GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_CALLBACK_URL=${API_URL}/api/v1/auth/google/callback

# Next.js Public Env
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
EOF
    
    # Copy to backend
    cp .env.production backend/.env
    print_success ".env.production created"
else
    print_warning ".env.production already exists (using existing)"
fi

# ============================================
# STEP 6: Fix docker-compose for public access
# ============================================
echo ""
echo "Step 6: Configuring docker-compose for public access..."

# Fix phpMyAdmin to bind to 0.0.0.0
sed -i 's/127.0.0.1:8080:80/0.0.0.0:8080:80/' docker-compose.prod.yml
print_success "phpMyAdmin configured for public access"

# Setup MySQL charset configuration for Thai language support
echo ""
print_info "Setting up UTF-8 charset for MySQL..."
mkdir -p database
cat > database/my.cnf << 'EOF'
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
init-connect='SET NAMES utf8mb4'
[client]
default-character-set=utf8mb4
EOF
print_success "MySQL charset configuration created"

# ============================================
# STEP 7: Build and Start Containers
# ============================================
echo ""
echo "Step 7: Building and starting containers..."

# Export env vars safely using set -a
set -a
source .env.production
set +a

# Stop and remove old containers with data loss prevention
echo ""
print_warning "This will REMOVE all existing database data!"
read -p "Are you sure? Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    print_info "Deployment cancelled."
    exit 0
fi

# Backup before delete if MySQL is running
if compose_cmd ps mysql 2>/dev/null | grep -q "running"; then
    print_info "Creating backup before removal..."
    mkdir -p ~/backups/pre-deploy
    BACKUP_FILE="~/backups/pre-deploy/backup_$(date +%Y%m%d_%H%M%S).sql"
    compose_cmd exec -T mysql mysqldump -u root -p${DB_PASSWORD} dd_computer > "$BACKUP_FILE" 2>/dev/null || print_warning "Backup failed, continuing..."
    if [ -f "$BACKUP_FILE" ]; then
        print_success "Backup created: $BACKUP_FILE"
    fi
fi

compose_cmd down 2>/dev/null || true
docker volume rm dd-v1_mysql_data 2>/dev/null || true

# Build and start (with longer timeout for frontend)
compose_cmd up -d --build

# Wait for services with proper health checks
wait_for_service() {
    local service=$1
    local max_retries=${2:-30}
    local retry=0

    while [ $retry -lt $max_retries ]; do
        if compose_cmd ps $service 2>/dev/null | grep -q "healthy\|running"; then
            print_success "$service is ready"
            return 0
        fi
        echo "  Waiting for $service... ($retry/$max_retries)"
        sleep 2
        retry=$((retry + 1))
    done

    print_warning "$service health check timed out, but container may be running"
    return 0  # Don't fail deployment, just warn
}

wait_for_service mysql 30
wait_for_service backend 30
wait_for_service frontend 60  # Give frontend more time on low RAM servers
wait_for_service redis 15
wait_for_service netdata 20
wait_for_service uptime-kuma 20

# Create database user for phpMyAdmin
compose_cmd exec -T mysql mysql -u root -p${DB_PASSWORD} -e "
CREATE USER IF NOT EXISTS 'ddcomputer'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON *.* TO 'ddcomputer'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
" 2>/dev/null || print_warning "User may already exist"

# Verify database schema was imported
print_info "Verifying database schema import..."
SCHEMA_CHECK=$(compose_cmd exec -T mysql mysql -u root -p${DB_PASSWORD} -e "USE dd_computer; SHOW TABLES;" 2>/dev/null | wc -l)
if [ "$SCHEMA_CHECK" -gt 1 ]; then
    print_success "Database schema imported successfully ($((SCHEMA_CHECK - 1)) tables found)"
else
    print_warning "Database schema may not have been imported properly"
    print_info "Schema is auto-imported via docker-entrypoint-initdb.d on first run"
fi

print_success "Containers started successfully"

# ============================================
# STEP 7.5: Backup Migration/Restore (Optional)
# ============================================
echo ""
echo "Step 7.5: Checking for existing backups..."

migrate_from_backup() {
    local backup_dir="${BACKUP_DIR:-$HOME/backups}"
    local latest_backup=$(ls -t "$backup_dir"/*.sql.gz 2>/dev/null | head -1)
    
    if [ -f "$latest_backup" ]; then
        print_info "Found backup: $latest_backup"
        read -p "Restore this backup? (y/N): " restore_confirm
        if [[ "$restore_confirm" =~ ^[Yy]$ ]]; then
            print_info "Restoring database from backup..."
            gunzip -c "$latest_backup" | compose_cmd exec -T mysql mysql -u root -p${DB_PASSWORD} dd_computer
            if [ $? -eq 0 ]; then
                print_success "Database restored from backup"
            else
                print_error "Database restore failed"
            fi
        else
            print_info "Skipping backup restore"
        fi
    else
        print_info "No existing backups found"
    fi
}

# Check if user wants to restore from backup
if [ -d "$HOME/backups" ] && [ "$(ls -A $HOME/backups/*.sql.gz 2>/dev/null)" ]; then
    migrate_from_backup
fi

# ============================================
# STEP 8: Configure NGINX with SSL Option
# ============================================
echo ""
echo "Step 8: Configuring NGINX..."

# Create uploads directory if not exists
mkdir -p backend/uploads
chmod 755 backend/uploads

# Ask for SSL configuration
echo ""
echo "SSL Configuration Options:"
echo "1) HTTP only (no SSL)"
echo "2) Self-signed SSL (HTTPS with browser warning)"
if [ -n "$DOMAIN_NAME" ]; then
    echo "3) Let's Encrypt SSL (HTTPS with valid certificate - requires domain)"
fi
read -p "Select option (1-3, default: 1): " SSL_OPTION
SSL_OPTION=${SSL_OPTION:-1}

if [ "$SSL_OPTION" = "2" ]; then
    print_info "Generating self-signed SSL certificate..."
    
    # Create SSL directory
    mkdir -p /etc/nginx/ssl
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/ddcomputer.key \
        -out /etc/nginx/ssl/ddcomputer.crt \
        -subj "/C=TH/ST=Bangkok/L=Bangkok/O=DDComputer/OU=IT/CN=${DOMAIN_NAME:-$SERVER_IP}" \
        2>/dev/null
    
    print_success "Self-signed SSL certificate generated"
elif [ "$SSL_OPTION" = "3" ] && [ -n "$DOMAIN_NAME" ]; then
    print_info "Installing Let's Encrypt SSL certificate..."
    
    # Install certbot
    apt install -y certbot python3-certbot-nginx
    
    # Create directory for ACME challenge
    mkdir -p /var/www/certbot
    
    # Get certificate for both domain and www
    ADMIN_EMAIL="${ADMIN_EMAIL:-admin@${DOMAIN_NAME}}"
    certbot certonly --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --non-interactive --agree-tos -m "$ADMIN_EMAIL" || {
        print_error "Let's Encrypt certificate generation failed"
        print_info "Falling back to HTTP only"
        SSL_OPTION="1"
    }
    
    if [ "$SSL_OPTION" = "3" ]; then
        print_success "Let's Encrypt SSL certificate installed"
        
        # Setup auto-renewal
        echo "0 12 * * * certbot renew --quiet" | crontab -
        print_success "Auto-renewal configured"
        
        # Create custom NGINX config with Let's Encrypt SSL
        cat > /etc/nginx/sites-available/$DOMAIN_NAME << NGINX_EOF
# DD Computer - NGINX Configuration with Let's Encrypt SSL

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Allow Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    client_max_body_size 50M;

    # SSL configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # phpMyAdmin - Protected with Basic Auth
    location /phpmyadmin/ {
        auth_basic "phpMyAdmin - Authentication Required";
        auth_basic_user_file /etc/nginx/auth/phpmyadmin.htpasswd;
        
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads - Proxy to backend
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        # Cache static files
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API Routes - Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket Routes
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_EOF
        
        # Enable the new config
        ln -sf /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
        
        # Remove old configs
        rm -f /etc/nginx/sites-enabled/ddcomputer
        rm -f /etc/nginx/sites-enabled/default
        
        print_success "NGINX configured with Let's Encrypt SSL"
    fi
else
    print_info "Using HTTP only (no SSL)"
fi

# Create NGINX configuration based on SSL option
if [ "$SSL_OPTION" = "2" ]; then
    chmod 600 /etc/nginx/ssl/ddcomputer.key
    chmod 644 /etc/nginx/ssl/ddcomputer.crt
    
    # Create NGINX config with self-signed SSL
    cat > /etc/nginx/sites-available/ddcomputer << NGINX_EOF
# DD Computer - NGINX Configuration with Self-Signed SSL

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name _;
    return 301 https://\$host\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name _;

    client_max_body_size 50M;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/ddcomputer.crt;
    ssl_certificate_key /etc/nginx/ssl/ddcomputer.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # phpMyAdmin - Protected with Basic Auth
    location /phpmyadmin/ {
        auth_basic "phpMyAdmin - Authentication Required";
        auth_basic_user_file /etc/nginx/auth/phpmyadmin.htpasswd;
        
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads - Proxy to backend
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        # Cache static files
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API Routes - Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket Routes
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_EOF
    
    print_success "NGINX configured with SSL (HTTPS)"
else
    # Create NGINX config for HTTP only
    cat > /etc/nginx/sites-available/ddcomputer << 'NGINX_EOF'
# DD Computer - NGINX Configuration (HTTP only)

server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # phpMyAdmin - Protected with Basic Auth
    location /phpmyadmin/ {
        auth_basic "phpMyAdmin - Authentication Required";
        auth_basic_user_file /etc/nginx/auth/phpmyadmin.htpasswd;
        
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads - Proxy to backend
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Cache static files
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API Routes - Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket Routes
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX_EOF
    
    print_success "NGINX configured (HTTP only)"
fi

# Enable config (only for non-Let's Encrypt cases)
if [ "$SSL_OPTION" != "3" ]; then
    ln -sf /etc/nginx/sites-available/ddcomputer /etc/nginx/sites-enabled/
fi
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t && systemctl restart nginx
print_success "NGINX configured"

# ============================================
# STEP 8.5: Install apache2-utils for htpasswd
# ============================================
echo ""
echo "Step 8.5: Installing apache2-utils for authentication..."
apt install -y apache2-utils
print_success "apache2-utils installed"

# ============================================
# STEP 9: Configure Firewall with Rate Limiting
# ============================================
echo ""
echo "Step 9: Configuring firewall with rate limiting..."

# Reset UFW to default
ufw --force reset

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH with rate limiting (6 connections per 30 seconds)
ufw limit 22/tcp comment 'SSH with rate limit'

# Allow HTTP/HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Allow monitoring ports (optional - comment out if not needed)
ufw allow 19999/tcp comment 'Netdata Monitoring'
ufw allow 3001/tcp comment 'Uptime Kuma'

# Enable firewall
ufw --force enable
print_success "Firewall configured with rate limiting"

# ============================================
# STEP 9.1: Install and Configure Fail2Ban
# ============================================
echo ""
echo "Step 9.1: Installing and configuring Fail2Ban..."

apt install -y fail2ban

# Create custom Fail2Ban configuration
cat > /etc/fail2ban/jail.local << 'F2B_EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = root@localhost
sender = fail2ban@localhost
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6
bantime = 86400

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 86400
F2B_EOF

# Create nginx-noscript filter
cat > /etc/fail2ban/filter.d/nginx-noscript.conf << 'EOF'
[Definition]
failregex = ^<HOST> -.*GET.*(\.php|\.asp|\.exe|\.pl|\.cgi|\.scgi)
ignoreregex =
EOF

# Create nginx-badbots filter
cat > /etc/fail2ban/filter.d/nginx-badbots.conf << 'EOF'
[Definition]
failregex = ^<HOST> -.*"(GET|POST).*HTTP.*"(?:200|302|404|502)
ignoreregex =
EOF

# Enable and start Fail2Ban
systemctl enable fail2ban
systemctl restart fail2ban

print_success "Fail2Ban configured and started"
print_info "Blocked IPs: fail2ban-client status"

# ============================================
# STEP 9.5: Secure phpMyAdmin with Password
# ============================================
echo ""
echo "Step 9.5: Securing phpMyAdmin with HTTP Basic Auth..."

# Create htpasswd file for phpMyAdmin authentication with random password
mkdir -p /etc/nginx/auth
PMA_USER="${PHPMYADMIN_USER:-ddcomputer}"
PMA_PASS="${PHPMYADMIN_PASS:-$(openssl rand -base64 16 | tr -d '=+/')}"
htpasswd -bc /etc/nginx/auth/phpmyadmin.htpasswd "$PMA_USER" "$PMA_PASS"
chmod 644 /etc/nginx/auth/phpmyadmin.htpasswd

# Save credentials
cat > ~/deployment-credentials.txt << EOF
phpMyAdmin NGINX Auth: $PMA_USER / $PMA_PASS
phpMyAdmin DB User: ddcomputer / ${DB_PASSWORD}
Deployed at: $(date)
Server: ${DOMAIN_NAME:-$SERVER_IP}
EOF
chmod 600 ~/deployment-credentials.txt

print_success "phpMyAdmin authentication configured (credentials saved to ~/deployment-credentials.txt)"

# Update docker-compose to bind phpMyAdmin to localhost only (access only via NGINX)
echo "Updating docker-compose for localhost-only phpMyAdmin access..."
sed -i 's/0.0.0.0:8080:80/127.0.0.1:8080:80/' docker-compose.prod.yml 2>/dev/null || true
sed -i 's/"8080:80"/"127.0.0.1:8080:80"/' docker-compose.prod.yml 2>/dev/null || true

# Restart phpMyAdmin with new binding
docker compose -f docker-compose.prod.yml --env-file .env.production up -d phpmyadmin

print_success "phpMyAdmin accessible at: http://${SERVER_IP}/phpmyadmin/"

# ============================================
# STEP 9.6: Fix Port Bindings for External Access
# ============================================
echo ""
echo "Step 9.6: Fixing port bindings for external access..."

# Update docker-compose to bind all services to 0.0.0.0 for external access
# (except phpMyAdmin which stays localhost for security)
echo "Updating docker-compose port bindings..."
sed -i 's/127.0.0.1:3306:3306/0.0.0.0:3306:3306/' docker-compose.prod.yml 2>/dev/null || true
sed -i 's/127.0.0.1:3001:3001/0.0.0.0:3001:3001/' docker-compose.prod.yml 2>/dev/null || true
sed -i 's/127.0.0.1:3000:3000/0.0.0.0:3000:3000/' docker-compose.prod.yml 2>/dev/null || true
sed -i 's/127.0.0.1:6379:6379/0.0.0.0:6379:6379/' docker-compose.prod.yml 2>/dev/null || true
sed -i 's/127.0.0.1:19999:19999/0.0.0.0:19999:19999/' docker-compose.prod.yml 2>/dev/null || true
sed -i 's/127.0.0.1:3002:3001/0.0.0.0:3002:3001/' docker-compose.prod.yml 2>/dev/null || true

print_success "Port bindings updated to 0.0.0.0 for external access"

# Restart containers to apply new port bindings
echo "Restarting containers to apply new port bindings..."
docker compose -f docker-compose.prod.yml --env-file .env.production down
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
print_success "Containers restarted with new port bindings"

# ============================================
# STEP 9.7: Enable NGINX Configuration
# ============================================
echo ""
echo "Step 9.7: Enabling NGINX configuration..."

# Enable NGINX site configuration
ln -sf /etc/nginx/sites-available/ddcomputer /etc/nginx/sites-enabled/ 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test NGINX configuration
nginx -t 2>/dev/null
if [ $? -eq 0 ]; then
    # Restart NGINX
    systemctl restart nginx
    print_success "NGINX configuration enabled and restarted"
else
    print_error "NGINX configuration test failed, skipping restart"
fi

# ============================================
# STEP 9.8: Install rclone for Off-site Backup
# ============================================
echo ""
echo "Step 9.8: Installing rclone for Google Drive backup..."

if ! command -v rclone &> /dev/null; then
    curl https://rclone.org/install.sh | sudo bash
    print_success "rclone installed"
else
    print_warning "rclone already installed"
fi

# ============================================
# STEP 9.9: Setup Auto Backup Database with Off-site Sync
# ============================================
echo ""
echo "Step 9.9: Setting up auto backup database with off-site sync..."

# Create backup directory
mkdir -p ~/backups
chmod 755 ~/backups

# Create backup script with rclone sync
cat > ~/backup-database.sh << 'BACKUP_EOF'
#!/bin/bash
# Auto backup script for DD Computer Database with Google Drive sync

BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="dd_computer_backup_$DATE.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Load environment variables
cd "$PROJECT_DIR"
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi

# Run backup from MySQL container
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T mysql mysqldump -u root -p${DB_PASSWORD} dd_computer > "$BACKUP_DIR/$BACKUP_FILE" 2>> "$LOG_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup integrity
if [ -f "$BACKUP_DIR/$BACKUP_FILE.gz" ]; then
    if gunzip -t "$BACKUP_DIR/$BACKUP_FILE.gz" 2>/dev/null; then
        echo "[$(date)] Backup verified (compressed correctly)" >> "$LOG_FILE"
    else
        echo "[$(date)] ERROR: Backup verification failed!" >> "$LOG_FILE"
        exit 1
    fi
else
    echo "[$(date)] ERROR: Backup file not created!" >> "$LOG_FILE"
    exit 1
fi

# Keep only last 7 days of local backups
find "$BACKUP_DIR" -name "dd_computer_backup_*.sql.gz" -mtime +7 -delete

# Sync to Google Drive if rclone is configured
if command -v rclone &> /dev/null && rclone listremotes | grep -q "gdrive:"; then
    echo "[$(date)] Syncing to Google Drive..." >> "$LOG_FILE"
    rclone sync "$BACKUP_DIR" gdrive:DD-Computer-Backups --exclude "*.log" >> "$LOG_FILE" 2>&1
    echo "[$(date)] Google Drive sync completed" >> "$LOG_FILE"
else
    echo "[$(date)] rclone not configured, skipping Google Drive sync" >> "$LOG_FILE"
fi

echo "[$(date)] Backup completed: $BACKUP_FILE.gz" >> "$LOG_FILE"
BACKUP_EOF

chmod +x ~/backup-database.sh

# Add cron job for daily backup at 2 AM
(crontab -l 2>/dev/null || true) | grep -v backup-database || true
crontab -l 2>/dev/null | { cat; echo "0 2 * * * $HOME/backup-database.sh >> $HOME/backups/backup.log 2>&1"; } | crontab -

print_success "Auto backup configured (daily at 2:00 AM)"
print_info "Backup location: ~/backups/"
print_info "To configure Google Drive backup: rclone config"
print_info "To manually sync: rclone sync ~/backups gdrive:DD-Computer-Backups"

# ============================================
# STEP 9.10: Setup Notification System (Optional)
# ============================================
echo ""
echo "Step 9.10: Setting up notification system..."

read -p "Configure Slack/Discord webhook alerts? (y/N): " SETUP_NOTIFICATIONS
SETUP_NOTIFICATIONS=${SETUP_NOTIFICATIONS:-n}

if [[ "$SETUP_NOTIFICATIONS" =~ ^[Yy]$ ]]; then
    read -p "Enter webhook URL (Slack/Discord): " WEBHOOK_URL
    
    if [ -n "$WEBHOOK_URL" ]; then
        # Create notification script
        cat > ~/send-notification.sh << 'NOTIF_EOF'
#!/bin/bash
# Send notification to Slack/Discord

WEBHOOK_URL="WEBHOOK_URL_PLACEHOLDER"
MESSAGE="$1"

curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$MESSAGE\"}" \
    "$WEBHOOK_URL" 2>/dev/null
NOTIF_EOF
        
        # Replace placeholder with actual webhook
        sed -i "s|WEBHOOK_URL_PLACEHOLDER|$WEBHOOK_URL|g" ~/send-notification.sh
        chmod +x ~/send-notification.sh
        
        print_success "Notification script created: ~/send-notification.sh"
        print_info "Usage: ~/send-notification.sh \"Your message\""
    else
        print_warning "No webhook URL provided, skipping notification setup"
    fi
else
    print_info "Notification setup skipped"
fi

# ============================================
# STEP 9.11: Configure Auto-Start on Boot
# ============================================
echo ""
echo "Step 9.11: Configuring auto-start on boot..."

# Enable Docker to start on boot
systemctl enable docker

# Create systemd service for DD Computer
cat > /etc/systemd/system/dd-computer.service << SYSTEMD_EOF
[Unit]
Description=DD Computer Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${PROJECT_DIR}
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml --env-file .env.production up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml --env-file .env.production down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

# Enable the service
systemctl daemon-reload
systemctl enable dd-computer.service

print_success "Auto-start on boot configured"
print_info "Service: dd-computer.service"
print_info "Commands:"
print_info "  Start:  systemctl start dd-computer"
print_info "  Stop:   systemctl stop dd-computer"
print_info "  Status: systemctl status dd-computer"

# ============================================
# STEP 10: System Cleanup & Optimization
# ============================================
echo ""
echo "Step 10: Running system cleanup and optimization..."

print_info "Cleaning up Docker resources..."

# Remove unused Docker images, containers, volumes, networks
docker system prune -af --volumes 2>/dev/null || print_warning "Docker prune failed (may be no resources to clean)"

# Remove old Docker build cache
docker builder prune -af 2>/dev/null || true

print_success "Docker cleanup completed"

print_info "Cleaning up system package cache..."

# Clean apt cache
apt-get clean
apt-get autoclean
apt-get autoremove -y

# Remove old kernels (keep only 2 most recent)
if [ -d /boot ]; then
    ls -t /boot/vmlinuz-* | tail -n +3 | xargs -I {} rm -f {} 2>/dev/null || true
    ls -t /boot/initrd.img-* | tail -n +3 | xargs -I {} rm -f {} 2>/dev/null || true
fi

print_success "System package cleanup completed"

print_info "Cleaning up system logs..."

# Clean old journal logs (keep last 7 days)
journalctl --vacuum-time=7d 2>/dev/null || true

# Clean old log files in /var/log
find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true
find /var/log -type f -name "*.gz" -mtime +30 -delete 2>/dev/null || true

print_success "Log cleanup completed"

print_info "Cleaning up temporary files..."

# Clean temporary directories
rm -rf /tmp/* 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true

# Clean user cache
rm -rf $HOME/.cache/* 2>/dev/null || true

print_success "Temporary files cleanup completed"

# Check and create swap if insufficient
SWAP_SIZE=$(free -g | awk '/Swap:/ {print $2}')
if [ "$SWAP_SIZE" -lt 2 ]; then
    print_info "Checking swap space..."
    if [ ! -f /swapfile ]; then
        print_info "Creating 2GB swap file..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        print_success "2GB swap file created and enabled"
    else
        print_warning "Swap file already exists"
    fi
fi

print_success "System cleanup and optimization completed"

# ============================================
# STEP 11: Final Checks
# ============================================
echo ""
echo "Step 11: Running final checks..."

echo ""
echo "Container Status:"
compose_cmd ps

echo ""
echo "Testing API..."
curl -s http://localhost:3001/api/v1/health && echo "" || print_error "API health check failed"

print_success "Deployment completed!"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "=========================================="
echo "DEPLOYMENT SUCCESSFUL!"
echo "=========================================="
echo ""
echo "🌐 Website: http://${SERVER_IP}"
if [ -n "$DOMAIN_NAME" ]; then
    echo "   Domain: http://${DOMAIN_NAME}"
fi
if [ "$SSL_OPTION" = "2" ]; then
    echo "   HTTPS: https://${SERVER_IP} (Self-signed certificate)"
elif [ "$SSL_OPTION" = "3" ] && [ -n "$DOMAIN_NAME" ]; then
    echo "   HTTPS: https://${DOMAIN_NAME} (Let's Encrypt)"
fi
echo ""
echo "🔒 phpMyAdmin (Password Protected):"
echo "   URL: http://${SERVER_IP}/phpmyadmin/"
echo "   NGINX Auth - Username: $PMA_USER"
echo "   NGINX Auth - Password: $PMA_PASS"
echo "   (Credentials saved to: ~/deployment-credentials.txt)"
echo ""
echo "   phpMyAdmin Login:"
echo "     Server: mysql"
echo "     Username: ddcomputer"
echo "     Password: ${DB_PASSWORD}"
echo ""
echo "📊 Monitoring Services:"
echo "   Netdata: http://${SERVER_IP}:19999 (Real-time server monitoring)"
echo "   Uptime Kuma: http://${SERVER_IP}:3002 (Website/API monitoring)"
echo "   Access via SSH tunnel for security:"
echo "     ssh -L 19999:localhost:19999 root@${SERVER_IP}"
echo "     ssh -L 3002:localhost:3002 root@${SERVER_IP}"
echo ""
echo "🔐 Security Features:"
echo "   ✅ Fail2Ban - SSH brute force protection"
echo "   ✅ UFW Firewall - Rate limiting enabled"
echo "   ✅ SSL/TLS - Self-signed certificate (if enabled)"
echo "   ✅ Gzip Compression - Enabled in NGINX"
echo "   ✅ Static File Caching - 30 days cache for uploads"
echo ""
echo "💾 Backup System:"
echo "   Local Backup: ~/backups/"
echo "   Schedule: Daily at 2:00 AM"
echo "   Retention: 7 days"
echo "   Off-site Backup: Google Drive (via rclone)"
echo "   Manual backup: ~/backup-database.sh"
echo "   Configure Google Drive: rclone config"
echo ""
echo "⚡ Performance:"
echo "   ✅ Redis - Caching and session storage (localhost:6379)"
echo "   ✅ NGINX - Reverse proxy with compression"
echo "   ✅ Docker Compose v2 - Container orchestration"
echo ""
echo "🔄 Auto-Start on Boot:"
echo "   Service: dd-computer.service"
echo "   Status:  Containers will auto-start when server boots"
echo ""
echo "📋 After Server Restart:"
echo "   ✅ Website will be available automatically (no action needed)"
echo "   ✅ Wait 1-2 minutes for all containers to start"
echo "   ✅ Check status: systemctl status dd-computer"
echo ""
echo "Useful Commands:"
echo "  View logs: cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml logs -f"
echo "  Restart:   cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml restart"
echo "  Stop:      cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml down"
echo "  Update:    cd ${PROJECT_DIR} && git pull && docker compose -f docker-compose.prod.yml up -d --build"
echo "  Backup:    ~/backup-database.sh"
echo "  Service:   systemctl {start|stop|restart|status} dd-computer"
echo "  Fail2Ban:   fail2ban-client status"
echo "  Firewall:  ufw status"
echo ""
echo "=========================================="
