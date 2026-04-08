#!/data/data/com.termux/files/usr/bin/bash
set +e
cd "$(dirname "$0")/.."

check_port() {
  local port="$1"
  local name="$2"
  local out
  out=$(curl -s "http://127.0.0.1:${port}/health")
  if [ $? -eq 0 ] && [ -n "$out" ]; then
    echo "[OK] ${name} (${port})"
    echo "$out"
  else
    echo "[DOWN] ${name} (${port})"
  fi
  echo
}

echo "=== Service Status ==="
check_port 4000 "api-gateway"
check_port 4100 "auth-service"
check_port 4200 "booking-service"
check_port 4300 "payment-service"
check_port 4400 "dispatch-service"
check_port 4500 "rewards-service"
check_port 4600 "marketplace-service"
check_port 4700 "driver-service"
check_port 4800 "admin-service"
check_port 4900 "frontend-service"
check_port 5000 "storehouse-service"
check_port 5100 "finbank-service"
check_port 5200 "crossborder-service"
check_port 5300 "university-service"
check_port 5400 "creator-service"
check_port 5500 "staffing-service"
check_port 5600 "logistics-service"
