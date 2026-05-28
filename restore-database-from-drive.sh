#!/bin/bash

# ============================================
# DD Computer - Database Restore from Google Drive
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
echo "  Database Restore from Google Drive"
echo "=========================================="
echo ""

# Configuration
BACKUP_DIR="./backups"
DB_CONTAINER="ddcomputer-mysql-1"
DB_NAME="dd_computer"
DB_USER="root"
CREDENTIALS_FILE="${CREDENTIALS_FILE:-music-login-system-bff3757dc039.json}"

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

# Install rclone if not present
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

# List available backups
echo ""
echo "Available backups on Google Drive:"
echo ""
rclone ls gdrive:DD-Computer-Backups/ | awk '{print NR". "$2" ("$1" bytes)"}'

if [ $? -ne 0 ] || [ -z "$(rclone ls gdrive:DD-Computer-Backups/ 2>/dev/null)" ]; then
    print_error "No backups found on Google Drive"
    exit 1
fi

# Select backup to restore
echo ""
read -p "Enter backup number to restore: " BACKUP_NUM

# Get the filename
BACKUP_FILE=$(rclone ls gdrive:DD-Computer-Backups/ | awk -v num=$BACKUP_NUM 'NR==num {print $2}')

if [ -z "$BACKUP_FILE" ]; then
    print_error "Invalid backup number"
    exit 1
fi

echo ""
echo "Selected backup: $BACKUP_FILE"
read -p "Continue with restore? (y/n): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    print_warning "Restore cancelled"
    exit 0
fi

# Download backup
echo ""
echo "Downloading backup from Google Drive..."
rclone copy "gdrive:DD-Computer-Backups/$BACKUP_FILE" "$BACKUP_DIR/" --progress

if [ $? -ne 0 ]; then
    print_error "Download failed"
    exit 1
fi

print_success "Backup downloaded: $BACKUP_DIR/$BACKUP_FILE"

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo ""
    echo "Decompressing backup..."
    gunzip -f "$BACKUP_DIR/$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
    print_success "Backup decompressed"
fi

# Get MySQL password
echo ""
if [ -f ".env.production" ]; then
    source .env.production
    DB_PASSWORD="$MYSQL_ROOT_PASSWORD"
else
    read -sp "Enter MySQL root password: " DB_PASSWORD
    echo ""
fi

# Warning before restore
echo ""
print_warning "This will REPLACE the current database!"
read -p "Are you sure? (type 'yes' to confirm): " CONFIRM_FINAL

if [ "$CONFIRM_FINAL" != "yes" ]; then
    print_warning "Restore cancelled"
    exit 0
fi

# Restore database
echo ""
echo "Restoring database..."
docker exec -i "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    print_success "Database restored successfully"
else
    print_error "Database restore failed"
    exit 1
fi

# Restart containers
echo ""
echo "Restarting Docker containers..."
docker-compose -f docker-compose.prod.yml restart
print_success "Containers restarted"

echo ""
echo "=========================================="
echo -e "${GREEN}Restore Complete!${NC}"
echo "=========================================="
echo ""
echo "Database restored from: $BACKUP_FILE"
echo ""
