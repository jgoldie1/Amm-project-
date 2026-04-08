#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BACKUP ==="
mkdir -p backups
cp apps/life_world.js "backups/life_world_fix_v2_$(date +%Y%m%d_%H%M%S).js"

echo
echo "=== PATCH LIFE WORLD ==="
python <<'PY'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "life_world.js"
text = p.read_text()

req_block = """const PORT = 4902;
const { renderMemoryArchive } = require('./memory_system');
const { renderTimeMachine } = require('./time_machine');"""

if "renderMemoryArchive" not in text:
    text = text.replace("const PORT = 4902;", req_block, 1)

insert_block = """
  ${renderMemoryArchive()}
  ${renderTimeMachine()}

  <script>
"""

if "${renderMemoryArchive()}" not in text and "${renderTimeMachine()}" not in text:
    text = text.replace("  <script>", insert_block, 1)

p.write_text(text)
print("life_world.js patched")
PY

echo
echo "=== VERIFY FILES ==="
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
curl -s http://127.0.0.1:4902/ | tail -n 180
