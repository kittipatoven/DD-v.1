#!/bin/bash
# แก้ Cloudflare Error 530 (Origin unreachable) สำหรับ DD Computer
# รันบน Ubuntu server: sudo bash fix-cloudflare-tunnel-530.sh
#
# สาเหตุ 530 ที่พบบ่อย:
#   1) cloudflared service ไม่รัน / config ผิด
#   2) DNS ไม่ชี้ไป tunnel ที่ถูกต้อง
#   3) nginx บน :80 redirect ไป HTTPS แทนการตอบเนื้อหา (ต้องใช้ config สำหรับ Tunnel)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
ok() { echo -e "${GREEN}✓ $1${NC}"; }
err() { echo -e "${RED}✗ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
info() { echo -e "${BLUE}ℹ $1${NC}"; }

if [ "$EUID" -ne 0 ]; then
  err "ใช้ sudo: sudo bash fix-cloudflare-tunnel-530.sh"
  exit 1
fi

DOMAIN_NAME="${DOMAIN_NAME:-ddcomputersamrong.com}"
TUNNEL_NAME="${TUNNEL_NAME:-ddcomputer-tunnel}"
CONFIG_FILE="/etc/cloudflared/config.yml"

echo "=========================================="
echo "แก้ Cloudflare 530 — $DOMAIN_NAME"
echo "=========================================="

# --- 1) Tunnel list ---
info "Tunnel ที่มีอยู่:"
if ! cloudflared tunnel list 2>/dev/null; then
  err "cloudflared ไม่พร้อม — รัน: sudo cloudflared tunnel login"
  exit 1
fi

TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | awk -v name="$TUNNEL_NAME" '$0 ~ name {print $1}' | head -1)
if [ -z "$TUNNEL_ID" ]; then
  read -p "ไม่พบ tunnel '$TUNNEL_NAME' — ใส่ Tunnel ID (uuid): " TUNNEL_ID
fi
ok "ใช้ Tunnel: $TUNNEL_NAME ($TUNNEL_ID)"

CRED="/root/.cloudflared/${TUNNEL_ID}.json"
if [ ! -f "$CRED" ]; then
  err "ไม่พบ credentials: $CRED"
  info "ลอง: ls -la /root/.cloudflared/"
  exit 1
fi
ok "พบ credentials"

# --- 2) config.yml (ไม่มี wildcard — ป้องกัน YAML error) ---
mkdir -p /etc/cloudflared
cat > "$CONFIG_FILE" << EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CRED}

ingress:
  - hostname: ${DOMAIN_NAME}
    service: http://127.0.0.1:80
  - hostname: www.${DOMAIN_NAME}
    service: http://127.0.0.1:80
  - service: http_status:404
EOF
chmod 644 "$CONFIG_FILE"
ok "เขียน $CONFIG_FILE"

if cloudflared tunnel ingress validate 2>/dev/null; then
  ok "ingress validate ผ่าน"
else
  warn "รัน: cloudflared tunnel --config $CONFIG_FILE ingress validate"
fi

# --- 3) DNS route ---
for host in "$DOMAIN_NAME" "www.$DOMAIN_NAME"; do
  info "DNS route: $host"
  if cloudflared tunnel route dns "$TUNNEL_NAME" "$host" 2>&1 | tee /tmp/cf-dns.log; then
    ok "DNS: $host"
  elif grep -qi "already exists" /tmp/cf-dns.log; then
    warn "DNS มีอยู่แล้ว: $host"
  else
    warn "DNS อาจล้มเหลว — ตรวจใน Cloudflare Dashboard → DNS"
  fi
done

# --- 4) nginx localhost:80 ---
info "ทดสอบ origin http://127.0.0.1:80 ..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:80/ || echo "000")
info "HTTP status จาก localhost:80 = $HTTP_CODE"

if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  warn "nginx บน port 80 redirect ไป HTTPS — Tunnel ต้องการให้ตอบเนื้อหาที่ :80"
  echo ""
  info "แก้: รันสคริปต nginx สำหรับ Cloudflare (ในโฟลเดอร์โปรเจกต์):"
  echo "  cd ~/DD-v.1 && sudo bash setup-nginx-cloudflare.sh"
  echo ""
  read -p "รัน setup-nginx-cloudflare.sh ตอนนี้? (y/N): " FIX_NGINX
  if [[ "$FIX_NGINX" =~ ^[Yy]$ ]]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/setup-nginx-cloudflare.sh" ]; then
      bash "$SCRIPT_DIR/setup-nginx-cloudflare.sh"
    else
      err "ไม่พบ setup-nginx-cloudflare.sh — copy จาก repo มาก่อน"
    fi
  fi
elif [ "$HTTP_CODE" = "000" ] || [ "$HTTP_CODE" = "502" ] || [ "$HTTP_CODE" = "503" ]; then
  warn "origin ไม่ตอบ — ตรวจ docker/nginx:"
  echo "  docker ps"
  echo "  systemctl status nginx"
  echo "  ss -tulpn | grep ':80'"
else
  ok "origin ตอบสนอง (code $HTTP_CODE)"
fi

# --- 5) cloudflared service ---
info "ติดตั้ง/รีสตาร์ท cloudflared service..."
cloudflared service install 2>/dev/null || true
systemctl daemon-reload
systemctl enable cloudflared 2>/dev/null || true
systemctl restart cloudflared
sleep 5

if systemctl is-active --quiet cloudflared; then
  ok "cloudflared active"
else
  err "cloudflared ไม่ active"
  journalctl -u cloudflared -n 40 --no-pager
  exit 1
fi

# --- 6) สรุป ---
echo ""
echo "=========================================="
info "ตรวจใน Cloudflare Dashboard:"
echo "  • Zero Trust / Tunnels → $TUNNEL_NAME → Status: HEALTHY"
echo "  • DNS → CNAME $DOMAIN_NAME → ${TUNNEL_ID}.cfargotunnel.com (proxied)"
echo "  • SSL/TLS → Overview → Flexible หรือ Full (origin เป็น HTTP :80)"
echo ""
info "ทดสอบ (รอ 1–2 นาที):"
echo "  curl -I https://${DOMAIN_NAME}/"
echo "  journalctl -u cloudflared -f"
echo "=========================================="
