#!/bin/bash

# Setup backup script for first time
# Run this on VPS after uploading credentials file

set -e

echo "=========================================="
echo "  Setting up Database Backup"
echo "=========================================="
echo ""

# Check if credentials file exists
if [ ! -f "music-login-system-bff3757dc039.json" ]; then
    echo "ERROR: Credentials file not found!"
    echo "Please upload music-login-system-bff3757dc039.json to this directory first"
    echo ""
    echo "Run this from your local machine:"
    echo "  scp music-login-system-bff3757dc039.json root@YOUR_VPS_IP:/var/www/ddcomputer/"
    exit 1
fi

# Install rclone
echo "Installing rclone..."
curl https://rclone.org/install.sh | bash

# Create backup script executable
chmod +x backup-database-to-drive.sh

# Create rclone config directory
mkdir -p /root/.config/rclone

# Create rclone config with service account
cat > /root/.config/rclone/rclone.conf << EOF
[gdrive]
type = drive
scope = drive
service_account_file = /var/www/ddcomputer/music-login-system-bff3757dc039.json
team_drive =
EOF

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Test backup now:"
echo "  ./backup-database-to-drive.sh"
echo ""
echo "Set up daily cron job:"
echo "  crontab -e"
echo "  # Add this line for daily backup at 2 AM:"
echo "  0 2 * * * cd /var/www/ddcomputer && ./backup-database-to-drive.sh >> /var/log/db-backup.log 2>&1"
echo ""
