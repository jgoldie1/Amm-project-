#!/data/data/com.termux/files/usr/bin/bash
pkill -f "flask --app app run" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "python -u app.py" 2>/dev/null || true
echo "APP_STOPPED"
