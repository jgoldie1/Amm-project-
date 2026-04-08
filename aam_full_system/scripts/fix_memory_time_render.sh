#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BACKUP LIFE WORLD ==="
cp apps/life_world.js "backups/life_world_render_fix_$(date +%Y%m%d_%H%M%S).js"

echo
echo "=== PATCH RENDER BLOCK ==="
python <<'PY'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "life_world.js"
text = p.read_text()

if "const { renderMemoryArchive } = require('./memory_system');" not in text:
    text = text.replace(
        "const PORT = 4902;",
        "const PORT = 4902;\nconst { renderMemoryArchive } = require('./memory_system');\nconst { renderTimeMachine } = require('./time_machine');",
        1
    )

needle = "  <script>"
insert = """${renderMemoryArchive()}
${renderTimeMachine()}

  <script>"""

if "renderTimeMachine()" not in text or "renderMemoryArchive()" not in text:
    text = text.replace(needle, insert, 1)

p.write_text(text)
print("life_world.js render block patched")
PY

echo
echo "=== VERIFY ==="
node -c apps/life_world.js
node -c apps/memory_system.js
node -c apps/time_machine.js

echo
echo "=== RESTART ==="
bash scripts/safe_restart.sh
bash scripts/status.sh

echo
echo "=== VERIFY PAGE ==="
curl -s http://127.0.0.1:4902/ | grep -nE "Memory Archive|Time Machine|Bethlehem Arrival|Moon Base Alpha|Activate Rings" || true

echo
echo "=== PAGE TAIL ==="
curl -s http://127.0.0.1:4902/ | tail -n 160
