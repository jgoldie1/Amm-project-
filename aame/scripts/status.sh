#!/data/data/com.termux/files/usr/bin/bash
if pgrep -f "python app.py" >/dev/null; then
  echo "AAME is running"
  echo "URL: http://127.0.0.1:5000"
else
  echo "AAME is not running"
fi
