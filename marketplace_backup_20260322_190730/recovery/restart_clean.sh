#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
pkill -f "python.*app.py" 2>/dev/null || true
nohup python -u app.py > server.log 2>&1 &
sleep 4
python scripts/build_inventory.py
python scripts/route_audit.py
echo "Recovery restart complete."
