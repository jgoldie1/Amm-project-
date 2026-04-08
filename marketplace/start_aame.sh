#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
pkill -f "python3 aame_api.py" 2>/dev/null || true
nohup python3 aame_api.py > aame_api.log 2>&1 &
sleep 2
echo "AAME API started on http://127.0.0.1:5050"
curl -s http://127.0.0.1:5050/status/all
echo
