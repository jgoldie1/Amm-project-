#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/marketplace || exit 1

CANDIDATES=(
  "app_server_working_now.py"
  "app_working_checkpoint.py"
  "app_final_checkpoint.py"
  "app_safe_minimal_working.py"
  "app_working_backup.py"
  "app_step1_working.py"
)

echo "Stopping old server..."
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "gunicorn.*app:app" 2>/dev/null || true

FOUND=""

for f in "${CANDIDATES[@]}"; do
  if [ -f "$f" ]; then
    echo
    echo "Trying candidate: $f"

    if python -m py_compile "$f" 2>/dev/null; then
      cp "$f" app.py
      nohup python -u app.py > server.log 2>&1 &
      sleep 4

      if curl -s http://127.0.0.1:8080/health >/dev/null 2>&1; then
        FOUND="$f"
        echo "Recovered with $f"
        break
      fi

      if curl -s http://127.0.0.1:8080/ >/dev/null 2>&1; then
        FOUND="$f"
        echo "Recovered with $f"
        break
      fi

      pkill -f "python.*app.py" 2>/dev/null || true
    else
      echo "Syntax failed: $f"
    fi
  fi
done

echo
if [ -n "$FOUND" ]; then
  echo "SUCCESS"
  echo "Recovered from: $FOUND"
  echo
  echo "Open:"
  echo "  http://127.0.0.1:8080"
  echo
  echo "Health check:"
  curl -I http://127.0.0.1:8080/health 2>/dev/null | head -5 || true
else
  echo "No candidate recovered automatically."
  echo "Last 80 lines of server.log:"
  tail -80 server.log || true
fi
