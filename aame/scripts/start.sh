#!/data/data/com.termux/files/usr/bin/bash
cd ~/aame || exit 1
mkdir -p logs data instance
pkill -f "python app.py" 2>/dev/null
nohup python app.py > logs/aame.log 2>&1 &
sleep 2
echo "AAME started"
echo "Open: http://127.0.0.1:5000"
