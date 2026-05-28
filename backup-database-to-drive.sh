#!/bin/bash

# ============================================
# DD Computer - Database Backup to Google Drive
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo "=========================================="
echo "  Database Backup to Google Drive"
echo "=========================================="
echo ""

# Configuration
BACKUP_DIR="./backups"
DB_CONTAINER="ddcomputer-mysql-1"
DB_NAME="dd_computer"
DB_USER="root"
DB_PASSWORD="${MYSQL_ROOT_PASSWORD:-rootpassword}"
CREDENTIALS_FILE="${CREDENTIALS_FILE:-music-login-system-bff3757dc039.json}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

# Check if credentials file exists
if [ ! -f "$CREDENTIALS_FILE" ]; then
    print_error "Credentials file not found: $CREDENTIALS_FILE"
    echo "Please provide the path to your Google Service Account credentials:"
    read -p "Credentials file path: " CREDENTIALS_FILE
    
    if [ ! -f "$CREDENTIALS_FILE" ]; then
        print_error "Credentials file still not found"
        exit 1
    fi
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
print_success "Backup directory created: $BACKUP_DIR"

# Get MySQL password from environment or docker-compose
if [ -f ".env.production" ]; then
    source .env.production
    DB_PASSWORD="$MYSQL_ROOT_PASSWORD"
fi

# Backup database using Docker
echo ""
echo "Backing up database..."
docker exec "$DB_CONTAINER" mysqldump -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    print_success "Database backup created: $BACKUP_DIR/$BACKUP_FILE"
else
    print_error "Database backup failed"
    exit 1
fi

# Compress backup
echo ""
echo "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"
print_success "Backup compressed: $BACKUP_DIR/$BACKUP_FILE"

# Install gdrive CLI if not present
if ! command -v gdrive &> /dev/null; then
    echo ""
    echo "Installing gdrive CLI..."
    wget -O /tmp/gdrive "https://github.com/prasmussen/gdrive/releases/download/3.0.0/gdrive_$(uname -s)_$(uname -m)"
    chmod +x /tmp/gdrive
    sudo mv /tmp/gdrive /usr/local/bin/gdrive
    print_success "gdrive CLI installed"
fi

# Alternative: Use rclone (recommended)
if ! command -v rclone &> /dev/null; then
    echo ""
    echo "Installing rclone..."
    curl https://rclone.org/install.sh | sudo bash
    print_success "rclone installed"
fi

# Setup rclone with Google Drive
echo ""
echo "Setting up rclone with Google Drive..."
RCLONE_CONFIG="/root/.config/rclone/rclone.conf"
mkdir -p "$(dirname "$RCLONE_CONFIG")"

# Configure rclone with service account
if [ ! -f "$RCLONE_CONFIG" ] || ! grep -q "gdrive" "$RCLONE_CONFIG"; then
    echo ""
    echo "Configuring rclone with Google Drive..."
    cat > "$RCLONE_CONFIG" << EOF
[gdrive]
type = drive
scope = drive
service_account_file = $(realpath "$CREDENTIALS_FILE")
team_drive =
EOF
    print_success "rclone configured with Google Drive"
else
    print_warning "rclone already configured"
fi

# Create backup folder on Google Drive
echo ""
echo "Creating backup folder on Google Drive..."
rclone mkdir gdrive:DD-Computer-Backups 2>/dev/null || true
print_success "Backup folder ready"

# Upload backup to Google Drive
echo ""
echo "Uploading backup to Google Drive..."
rclone copy "$BACKUP_DIR/$BACKUP_FILE" gdrive:DD-Computer-Backups/ --progress

if [ $? -eq 0 ]; then
    print_success "Backup uploaded to Google Drive"
else
    print_error "Upload failed"
    exit 1
fi

# Clean up old backups (keep last 7 days)
echo ""
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
print_success "Old local backups cleaned"

# Clean up old backups on Google Drive (keep last 10)
echo ""
echo "Cleaning up old backups on Google Drive..."
rclone delete gdrive:DD-Computer-Backups/ --min-age 30d --dry-run 2>/dev/null || true

echo ""
echo "=========================================="
echo -e "${GREEN}Backup Complete!${NC}"
echo "=========================================="
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Location: Google Drive > DD-Computer-Backups"
echo ""
echo "To restore:"
echo "  1. Download backup from Google Drive"
echo "  2. gunzip backup_xxx.sql.gz"
echo "  3. docker exec -i mysql mysql -u root -p dd_computer < backup_xxx.sql"
echo ""
