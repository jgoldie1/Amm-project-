#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1

export DATABASE_URL="sqlite:///instance/platform.db"
export SECRET_KEY="dev-secret-key-change-me"

pkill -f "python.*app.py" 2>/dev/null || true
sleep 2

nohup python -u app.py > server.log 2>&1 &
sleep 8

echo "=== STARTED FINAL SAFE MODE ==="
./diagnostics/final_health_check.sh
echo
echo "=== SERVER LOG TAIL ==="
tail -40 server.log
