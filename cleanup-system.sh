#!/bin/bash

# DD Computer - System Cleanup Script
# Run this script to free up disk space and optimize system performance
# Usage: sudo bash cleanup-system.sh

set -e

echo "=========================================="
echo "DD Computer - System Cleanup"
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

# Show current disk usage
echo ""
echo "Current Disk Usage:"
df -h | grep -E "Filesystem|/dev/sda"

echo ""
echo "Current Memory Usage:"
free -h

echo ""
echo "=========================================="
echo "Starting Cleanup Process"
echo "=========================================="

# ============================================
# STEP 1: Docker Cleanup
# ============================================
echo ""
print_info "Step 1: Cleaning up Docker resources..."

echo "Before cleanup:"
docker system df 2>/dev/null || print_warning "Docker not running or not installed"

# Remove stopped containers
print_info "Removing stopped containers..."
docker container prune -f 2>/dev/null || print_warning "No containers to remove"

# Remove unused images
print_info "Removing unused Docker images..."
docker image prune -af 2>/dev/null || print_warning "No images to remove"

# Remove unused volumes
print_info "Removing unused volumes..."
docker volume prune -f 2>/dev/null || print_warning "No volumes to remove"

# Remove unused networks
print_info "Removing unused networks..."
docker network prune -f 2>/dev/null || print_warning "No networks to remove"

# Remove build cache
print_info "Removing Docker build cache..."
docker builder prune -af 2>/dev/null || print_warning "No build cache to remove"

# Full system prune (including volumes)
print_info "Running full Docker system prune..."
docker system prune -af --volumes 2>/dev/null || print_warning "Docker prune failed"

echo "After cleanup:"
docker system df 2>/dev/null || print_warning "Docker not running"

print_success "Docker cleanup completed"

# ============================================
# STEP 2: System Package Cleanup
# ============================================
echo ""
print_info "Step 2: Cleaning up system packages..."

# Update package lists
print_info "Updating package lists..."
apt update -y

# Clean apt cache
print_info "Cleaning apt cache..."
apt-get clean
apt-get autoclean
apt-get autoremove -y

print_success "System package cleanup completed"

# ============================================
# STEP 3: Old Kernel Cleanup
# ============================================
echo ""
print_info "Step 3: Removing old kernels..."

if [ -d /boot ]; then
    KERNEL_COUNT=$(ls /boot/vmlinuz-* 2>/dev/null | wc -l)
    print_info "Found $KERNEL_COUNT kernels installed"
    
    if [ "$KERNEL_COUNT" -gt 2 ]; then
        print_info "Keeping only 2 most recent kernels..."
        ls -t /boot/vmlinuz-* | tail -n +3 | xargs -I {} rm -f {} 2>/dev/null || print_warning "Failed to remove old kernels"
        ls -t /boot/initrd.img-* | tail -n +3 | xargs -I {} rm -f {} 2>/dev/null || print_warning "Failed to remove old initrd images"
        print_success "Old kernels removed"
    else
        print_info "Only 2 kernels found, skipping cleanup"
    fi
else
    print_warning "/boot directory not found, skipping kernel cleanup"
fi

# ============================================
# STEP 4: Log Cleanup
# ============================================
echo ""
print_info "Step 4: Cleaning up system logs..."

# Clean journal logs (keep last 7 days)
print_info "Vacuuming journal logs (keeping last 7 days)..."
journalctl --vacuum-time=7d 2>/dev/null || print_warning "Failed to vacuum journal logs"

# Clean old log files
print_info "Removing old log files (>7 days)..."
find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || print_warning "No old log files to remove"
find /var/log -type f -name "*.gz" -mtime +30 -delete 2>/dev/null || print_warning "No old compressed logs to remove"

# Truncate large log files
print_info "Truncating large log files..."
for logfile in /var/log/*.log; do
    if [ -f "$logfile" ] && [ $(stat -f%z "$logfile" 2>/dev/null || stat -c%s "$logfile" 2>/dev/null || echo 0) -gt 104857600 ]; then
        print_info "Truncating $logfile (>100MB)..."
        > "$logfile"
    fi
done 2>/dev/null || true

print_success "Log cleanup completed"

# ============================================
# STEP 5: Temporary Files Cleanup
# ============================================
echo ""
print_info "Step 5: Cleaning up temporary files..."

# Clean /tmp
print_info "Cleaning /tmp directory..."
rm -rf /tmp/* 2>/dev/null || print_warning "Failed to clean /tmp"

# Clean /var/tmp
print_info "Cleaning /var/tmp directory..."
rm -rf /var/tmp/* 2>/dev/null || print_warning "Failed to clean /var/tmp"

# Clean user cache
print_info "Cleaning user cache directories..."
rm -rf /root/.cache/* 2>/dev/null || print_warning "Failed to clean root cache"
rm -rf /home/*/.cache/* 2>/dev/null || print_warning "Failed to clean user caches"

# Clean thumbnail cache
print_info "Cleaning thumbnail cache..."
rm -rf /root/.thumbnails/* 2>/dev/null || true
rm -rf /home/*/.thumbnails/* 2>/dev/null || true

print_success "Temporary files cleanup completed"

# ============================================
# STEP 6: Docker Overlay Cleanup
# ============================================
echo ""
print_info "Step 6: Checking Docker overlay filesystems..."

# Check for dangling overlay filesystems
print_info "Checking for dangling Docker overlays..."
docker ps -a --filter "status=exited" --format "{{.ID}}" | xargs -r docker rm 2>/dev/null || print_warning "No exited containers to remove"

print_success "Docker overlay check completed"

# ============================================
# STEP 7: Swap Optimization
# ============================================
echo ""
print_info "Step 7: Checking swap space..."

SWAP_SIZE=$(free -g | awk '/Swap:/ {print $2}')
SWAP_USED=$(free -g | awk '/Swap:/ {print $3}')

print_info "Current swap: ${SWAP_SIZE}GB total, ${SWAP_USED}GB used"

if [ "$SWAP_SIZE" -lt 2 ]; then
    if [ ! -f /swapfile ]; then
        print_info "Creating 2GB swap file..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        print_success "2GB swap file created and enabled"
    else
        print_warning "Swap file already exists at /swapfile"
    fi
else
    print_info "Swap space is sufficient (>=2GB)"
fi

# ============================================
# STEP 8: Final Report
# ============================================
echo ""
echo "=========================================="
echo "Cleanup Completed!"
echo "=========================================="

echo ""
echo "Disk Usage After Cleanup:"
df -h | grep -E "Filesystem|/dev/sda"

echo ""
echo "Memory Usage After Cleanup:"
free -h

echo ""
echo "Docker Space Usage:"
docker system df 2>/dev/null || echo "Docker not running"

echo ""
print_success "System cleanup completed successfully!"
echo ""
print_info "Tips to maintain disk space:"
echo "  - Run this script weekly: sudo bash cleanup-system.sh"
echo "  - Monitor Docker: docker system df"
echo "  - Check logs: journalctl --disk-usage"
echo "  - Remove unused Docker images: docker image prune -a"
echo ""
