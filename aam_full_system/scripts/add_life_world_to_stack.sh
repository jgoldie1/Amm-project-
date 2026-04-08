#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

mkdir -p backups
cp scripts/safe_restart.sh "backups/safe_restart_$(date +%Y%m%d_%H%M%S).sh"
cp scripts/status.sh "backups/status_$(date +%Y%m%d_%H%M%S).sh"
cp scripts/smoke_test.sh "backups/smoke_test_$(date +%Y%m%d_%H%M%S).sh"

python <<'PY'
from pathlib import Path

home = Path.home() / "aam_full_system"
safe = home / "scripts" / "safe_restart.sh"
status = home / "scripts" / "status.sh"
smoke = home / "scripts" / "smoke_test.sh"

safe_text = safe.read_text()
status_text = status.read_text()
smoke_text = smoke.read_text()

if "life_world.pid" not in safe_text:
    safe_text += """

if [ -f life_world.pid ]; then
  kill "$(cat life_world.pid)" 2>/dev/null || true
  rm -f life_world.pid
fi

nohup node apps/life_world.js > life_world.log 2>&1 & echo $! > life_world.pid
"""

if "Life World health:" not in status_text:
    status_text += """

echo
printf "Life World health: "
curl -s http://127.0.0.1:4902/health || echo "DOWN"

echo "life_world.pid: $(cat life_world.pid 2>/dev/null || echo missing)"
"""

if "4902" not in smoke_text:
    smoke_text += """

echo
echo "[6] Life World"
echo -n "http://127.0.0.1:4902/health -> "
curl -s http://127.0.0.1:4902/health >/dev/null && echo OK || echo DOWN
"""

safe.write_text(safe_text)
status.write_text(status_text)
smoke.write_text(smoke_text)
print("patched safe_restart.sh, status.sh, smoke_test.sh")
PY

chmod +x scripts/safe_restart.sh scripts/status.sh scripts/smoke_test.sh
bash scripts/safe_restart.sh

echo
echo "=== VERIFY LIFE WORLD IN STACK ==="
bash scripts/status.sh
bash scripts/smoke_test.sh
curl -s http://127.0.0.1:4902/health ; echo
