#!/data/data/com.termux/files/usr/bin/bash
set -e

APP="$HOME/marketplace/app.py"
BACKUP="$HOME/marketplace/backups/app_fix_routes_$(date +%s).py"

cp "$APP" "$BACKUP"
echo "Backup saved: $BACKUP"

python3 <<'PY'
from pathlib import Path

app_path = Path.home() / "marketplace" / "app.py"
text = app_path.read_text()

start_marker = "# === GIGA_PHASE2_UI_SIMPLE ==="
end_marker = "# === END_GIGA_PHASE2_UI_SIMPLE ==="

start = text.find(start_marker)
end = text.find(end_marker) + len(end_marker)

block = text[start:end]
text = text[:start] + text[end:]

run_pos = text.find("if __name__ == \"__main__\"")

new_text = text[:run_pos] + block + "\n\n" + text[run_pos:]
app_path.write_text(new_text)

print("Routes moved ABOVE app.run successfully")
PY

./recovery/start_giga_locked.sh

echo
echo "REAL TEST:"
curl -s http://127.0.0.1:8080/world-map-v5 | head -10
