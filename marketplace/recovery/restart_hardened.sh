#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups logs
cp app.py "backups/app_autobackup_${STAMP}.py" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
nohup python -u app.py > server.log 2>&1 &
sleep 4
python scripts/build_inventory.py 2>/dev/null || true
python scripts/route_audit.py 2>/dev/null || true
echo "Hardened restart complete."
