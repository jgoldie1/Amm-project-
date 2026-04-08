#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups
cp app.py "backups/app_autobackup_termux_${STAMP}.py" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
nohup python -u app.py > server.log 2>&1 &
sleep 4
echo "=== smoke test ==="
curl -I http://127.0.0.1:8080/platform-home 2>/dev/null | head -5 || true
curl -I http://127.0.0.1:8080/master-dashboard 2>/dev/null | head -5 || true
curl -I http://127.0.0.1:8080/auth-login-fallback 2>/dev/null | head -5 || true
curl -I http://127.0.0.1:8080/startup-diagnostics 2>/dev/null | head -5 || true
echo
echo "=== server log tail ==="
tail -40 server.log
