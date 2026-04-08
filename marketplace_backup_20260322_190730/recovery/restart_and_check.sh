#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups
cp app.py "backups/app_autobackup_restart_${STAMP}.py" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
nohup env DATABASE_URL="sqlite:///instance/platform.db" python -u app.py > server.log 2>&1 &
sleep 8
./scripts/full_smoke_check.sh
echo
echo "=== boot log tail ==="
tail -40 server.log
