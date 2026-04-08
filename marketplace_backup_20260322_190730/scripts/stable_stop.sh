#!/data/data/com.termux/files/usr/bin/bash
pkill -f "python.*app.py" 2>/dev/null && echo "Marketplace stopped" || echo "Marketplace was not running"
