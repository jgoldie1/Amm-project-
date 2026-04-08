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

for svc in api-gateway auth-service booking-service payment-service dispatch-service rewards-service marketplace-service driver-service admin-service frontend-service storehouse-service finbank-service crossborder-service university-service creator-service staffing-service logistics-service; do
  pkill -f "services/${svc}/src/server.js" 2>/dev/null || true
done

echo "All selected services stopped."
