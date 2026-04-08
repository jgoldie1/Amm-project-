#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PROJECT_ROOT="$HOME/marketplace/all-american-marketplace"
cd "$PROJECT_ROOT"

mkdir -p scripts logs backups .pids data

cat > scripts/ensure_dirs.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."
mkdir -p logs backups .pids data
echo "Directories ensured."
EOT
chmod +x scripts/ensure_dirs.sh

cat > scripts/stop_all.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set +e
cd "$(dirname "$0")/.."

if [ -d .pids ]; then
  for pidfile in .pids/*.pid; do
    [ -e "$pidfile" ] || continue
    pid=$(cat "$pidfile")
    kill "$pid" 2>/dev/null || true
    rm -f "$pidfile"
  done
fi

pkill -f "services/api-gateway/src/server.js" 2>/dev/null || true
pkill -f "services/auth-service/src/server.js" 2>/dev/null || true
pkill -f "services/booking-service/src/server.js" 2>/dev/null || true
pkill -f "services/payment-service/src/server.js" 2>/dev/null || true
pkill -f "services/dispatch-service/src/server.js" 2>/dev/null || true
pkill -f "services/rewards-service/src/server.js" 2>/dev/null || true
pkill -f "services/marketplace-service/src/server.js" 2>/dev/null || true
pkill -f "services/driver-service/src/server.js" 2>/dev/null || true
pkill -f "services/admin-service/src/server.js" 2>/dev/null || true
pkill -f "services/frontend-service/src/server.js" 2>/dev/null || true

echo "All services stopped."
EOT
chmod +x scripts/stop_all.sh

cat > scripts/start_all.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

bash scripts/ensure_dirs.sh >/dev/null

start_service() {
  local dir="$1"
  local name="$2"
  echo "Starting $name..."
  (
    cd "$dir"
    nohup npm run dev > "../../logs/${name}.log" 2>&1 &
    echo $! > "../../.pids/${name}.pid"
  )
}

start_service "services/auth-service" "auth-service"
start_service "services/booking-service" "booking-service"
start_service "services/payment-service" "payment-service"
start_service "services/dispatch-service" "dispatch-service"
start_service "services/rewards-service" "rewards-service"
start_service "services/marketplace-service" "marketplace-service"
start_service "services/driver-service" "driver-service"
start_service "services/admin-service" "admin-service"

sleep 2

start_service "services/frontend-service" "frontend-service"
start_service "services/api-gateway" "api-gateway"

echo "All services started."
echo "Gateway:  http://127.0.0.1:4000"
echo "Frontend: http://127.0.0.1:4900"
echo "System health: http://127.0.0.1:4000/system/health"
EOT
chmod +x scripts/start_all.sh

cat > scripts/status.sh <<'EOT'
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
EOT
chmod +x scripts/status.sh

cat > scripts/smoke_test.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set -e
BASE="http://127.0.0.1:4000"

echo "Gateway:"
curl -s "$BASE/" ; echo
echo "System health:"
curl -s "$BASE/system/health" ; echo
echo "Features:"
curl -s "$BASE/features" ; echo

echo
echo "Direct service tests:"
for port in 4100 4200 4300 4400 4500 4600 4700 4800 4900; do
  curl -s "http://127.0.0.1:${port}/health" ; echo
done
EOT
chmod +x scripts/smoke_test.sh

cat > scripts/health_wait.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set +e

wait_for() {
  local port="$1"
  local tries=20
  local count=0
  while [ $count -lt $tries ]; do
    curl -s "http://127.0.0.1:${port}/health" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "Port ${port} is ready."
      return 0
    fi
    sleep 1
    count=$((count+1))
  done
  echo "Port ${port} failed to become ready."
  return 1
}

wait_for 4100
wait_for 4200
wait_for 4300
wait_for 4400
wait_for 4500
wait_for 4600
wait_for 4700
wait_for 4800
wait_for 4900
wait_for 4000
EOT
chmod +x scripts/health_wait.sh

cat > scripts/backup_data.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."
STAMP=$(date +%Y%m%d_%H%M%S)
DEST="backups/data_${STAMP}"
mkdir -p "$DEST"
cp -r data/* "$DEST"/
echo "Backup created at $DEST"
EOT
chmod +x scripts/backup_data.sh

cat > scripts/reset_data.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

cat > data/users.json <<'J'
[]
J
cat > data/bookings.json <<'J'
[]
J
cat > data/payments.json <<'J'
[]
J
cat > data/rewards.json <<'J'
[]
J
cat > data/products.json <<'J'
[]
J
cat > data/sellers.json <<'J'
[]
J
cat > data/driver_applications.json <<'J'
[]
J
cat > data/payouts.json <<'J'
[]
J
cat > data/admin_events.json <<'J'
[]
J
cat > data/drivers.json <<'J'
[
  {
    "id": 1,
    "name": "Demo Driver One",
    "email": "driver1@example.com",
    "vehicleType": "standard",
    "status": "available",
    "rating": 4.9
  },
  {
    "id": 2,
    "name": "Demo Driver Black",
    "email": "driverblack@example.com",
    "vehicleType": "premium",
    "status": "available",
    "rating": 5.0
  }
]
J

echo "Data reset complete."
EOT
chmod +x scripts/reset_data.sh

cat > scripts/verify_stack.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=== VERIFY STACK ==="
bash scripts/status.sh
echo "=== VERIFY SMOKE ==="
bash scripts/smoke_test.sh
echo "=== VERIFY LOGS ==="
for f in logs/*.log; do
  [ -e "$f" ] || continue
  echo "--- $f ---"
  tail -n 10 "$f"
done
EOT
chmod +x scripts/verify_stack.sh

cat > scripts/show_logs.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set +e
cd "$(dirname "$0")/.."
for f in logs/*.log; do
  [ -e "$f" ] || continue
  echo "===== $f ====="
  tail -n 40 "$f"
  echo
done
EOT
chmod +x scripts/show_logs.sh

cat > scripts/deep_flow_repeat.sh <<'EOT'
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

COUNT="${1:-2}"
i=1
while [ "$i" -le "$COUNT" ]; do
  echo "========== RUN $i =========="
  bash ./deep_test_and_stabilize.sh
  echo
  i=$((i+1))
done
EOT
chmod +x scripts/deep_flow_repeat.sh

bash scripts/stop_all.sh || true
sleep 2
bash scripts/start_all.sh
bash scripts/health_wait.sh
bash scripts/verify_stack.sh

echo
echo "STABILIZE LAYER 2 COMPLETE"
