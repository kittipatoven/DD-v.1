#!/bin/bash

# DD Computer - Fix Thai Encoding
# This script resets the database and reimports with correct UTF-8 encoding

set -e

echo "=========================================="
echo "DD Computer - Fix Thai Encoding"
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

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production not found!"
    exit 1
fi

# Load environment variables
set -a
source .env.production
set +a

print_info "Database: $DB_DATABASE"
print_info "MySQL Host: $DB_HOST"

# Warning
echo ""
print_warning "This will DELETE all data in the database!"
read -p "Are you sure? Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    print_info "Operation cancelled."
    exit 0
fi

# Stop containers
echo ""
print_info "Stopping containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Remove MySQL volume to clear old data
print_info "Removing old MySQL data..."
docker volume rm dd-v1_mysql_data 2>/dev/null || true

# Start MySQL only
print_info "Starting MySQL container..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d mysql

# Wait for MySQL to be ready
print_info "Waiting for MySQL to be ready..."
for i in {1..30}; do
    if docker compose -f docker-compose.prod.yml --env-file .env.production exec -T mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} &>/dev/null; then
        print_success "MySQL is ready"
        break
    fi
    echo "  Waiting... ($i/30)"
    sleep 2
done

# Verify encoding by checking character set
print_info "Verifying MySQL character set..."
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SHOW VARIABLES LIKE 'character_set_%';" || true

# The database.sql will be auto-imported by MySQL on first start
# Since we removed the volume, it will run the init script
print_success "Database will be initialized with correct encoding on container start"

# Start all containers
print_info "Starting all containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for services
print_info "Waiting for services to start..."
sleep 10

# Check categories to verify Thai encoding
print_info "Checking categories for Thai encoding..."
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} dd_computer -e "SELECT id, name, HEX(name) as hex_name FROM categories WHERE name LIKE '%PC%' OR name LIKE '%อุปกรณ์%';" || print_warning "Could not verify categories"

print_success "Encoding fix completed!"
print_info "Please check the website to verify Thai characters display correctly"
