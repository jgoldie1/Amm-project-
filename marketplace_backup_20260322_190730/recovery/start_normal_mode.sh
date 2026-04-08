#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
export PLATFORM_BOOT_MODE=normal
pkill -f "python.*app.py" 2>/dev/null || true
nohup env PLATFORM_BOOT_MODE=normal DATABASE_URL="sqlite:///instance/platform.db" python -u app.py > server.log 2>&1 &
sleep 6
curl -I http://127.0.0.1:8080/boot-status 2>/dev/null | head -5 || true
tail -40 server.log
