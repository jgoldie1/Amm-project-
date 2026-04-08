#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd ~/marketplace

APP="$HOME/marketplace/app.py"
STAMP="$(date +%Y%m%d_%H%M%S)"
cp "$APP" "$HOME/marketplace/backups/app_before_route_order_fix_${STAMP}.py"

python3 <<'PY'
from pathlib import Path
import re

app_path = Path.home() / "marketplace" / "app.py"
text = app_path.read_text(encoding="utf-8")

start_marker = "# === GIGA_V2_ROUTE_REPAIR_20260318 ==="
end_marker = "# === END_GIGA_V2_ROUTE_REPAIR_20260318 ==="

if start_marker not in text or end_marker not in text:
    print("Route repair block not found.")
    raise SystemExit(1)

start = text.index(start_marker)
end = text.index(end_marker) + len(end_marker)
block = text[start:end]

text_wo_block = text[:start] + text[end:]

run_patterns = [
    r'if __name__ == ["\\\']__main__["\\\']:\s*\n(?:[ \t]+.*\n)+',
    r'app\.run\s*\([^\n]*\)\s*\n'
]

insert_pos = None

m = re.search(run_patterns[0], text_wo_block)
if m:
    insert_pos = m.start()
else:
    m2 = re.search(run_patterns[1], text_wo_block)
    if m2:
        insert_pos = m2.start()

if insert_pos is None:
    print("Could not find app.run block.")
    raise SystemExit(1)

new_text = text_wo_block[:insert_pos].rstrip() + "\n\n" + block + "\n\n" + text_wo_block[insert_pos:].lstrip()
app_path.write_text(new_text, encoding="utf-8")
print("Moved route block above app.run.")
PY

echo
echo "Restarting locked app..."
./recovery/start_giga_locked.sh

echo
echo "Testing repaired routes..."
curl -s http://127.0.0.1:8080/api/v2/giga-phase1-health
echo
curl -s http://127.0.0.1:8080/api/v2/omni-cinema/episodes
echo
curl -s http://127.0.0.1:8080/api/v2/attached-media
echo
