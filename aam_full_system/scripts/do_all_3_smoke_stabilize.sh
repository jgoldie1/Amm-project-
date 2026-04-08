#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== DO ALL 3: SMOKE TEST + STABILIZE ==="

echo
echo "[1] CORE STABILIZE"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[2] LIFE WORLD / MEMORY / TIME MACHINE"
curl -s http://127.0.0.1:4902/health ; echo
curl -s http://127.0.0.1:4902/ | grep -nE "Bethlehem|Nazareth|Jerusalem|Throne Corridor|Memory Archive|Time Machine|Moon Base Alpha|Activate Rings" || true

echo
echo "[3] GROWTH + DISCORD + ZAPIER + AI"
python -m json.tool data/feedback/beta_reports.json >/dev/null && echo "beta_reports.json: OK"
python -m json.tool data/content/debates.json >/dev/null && echo "debates.json: OK"
python -m json.tool data/content/episodes.json >/dev/null && echo "episodes.json: OK"
python -m json.tool data/integrations/discord_zapier_config.json >/dev/null && echo "discord_zapier_config.json: OK"
python -m json.tool data/memory/memory_archive.json >/dev/null && echo "memory_archive.json: OK"

test -f services/ai/feedback_analyzer.js && echo "feedback_analyzer.js: OK" || echo "feedback_analyzer.js: MISSING"
test -f services/integrations/discord_zapier_relay.js && echo "discord_zapier_relay.js: OK" || echo "discord_zapier_relay.js: MISSING"
test -f services/integrations/log_growth_event.js && echo "log_growth_event.js: OK" || echo "log_growth_event.js: MISSING"
test -f data/integrations/growth_events.json && echo "growth_events.json: OK" || echo "growth_events.json: MISSING"

node -c services/ai/feedback_analyzer.js
node services/ai/feedback_analyzer.js || true

echo
echo "[4] DATABASE CHECK"
python <<'PY'
import sqlite3
from pathlib import Path

root = Path.home() / "aam_full_system"
for rel in ["db/aam.db", "db/aam_growth.db"]:
    db = root / rel
    print(f"DB: {db}")
    if not db.exists():
        print("  missing")
        continue
    conn = sqlite3.connect(db)
    cur = conn.cursor()
    cur.execute("select name from sqlite_master where type='table' order by name")
    tables = [r[0] for r in cur.fetchall()]
    print("  tables:", tables)
    conn.close()
PY

echo
echo "[5] WORLD STARTER FILES"
test -f apps/worlds/moon.js && echo "moon.js: OK" || echo "moon.js: MISSING"
test -f apps/worlds/mars.js && echo "mars.js: OK" || echo "mars.js: MISSING"
test -f apps/worlds/twin_earth.js && echo "twin_earth.js: OK" || echo "twin_earth.js: MISSING"
test -f public/audio/genesis_soundtrack.mp3 && echo "genesis_soundtrack.mp3: OK" || echo "genesis_soundtrack.mp3: MISSING"
test -f public/audio/creator_intro.mp3 && echo "creator_intro.mp3: OK" || echo "creator_intro.mp3: MISSING"

echo
echo "[6] GATEWAY"
cd "$HOME/aam_super_app"
bash scripts/wait_for_health.sh
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo
echo "[7] SNAPSHOT"
cd "$HOME/aam_full_system"
mkdir -p snapshots
STAMP=$(date +%Y%m%d_%H%M%S)
curl -s http://127.0.0.1:4900/ -L | head -n 30 > snapshots/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ | head -n 120 > snapshots/life_world_${STAMP}.html
cp data/feedback/beta_reports.json snapshots/beta_reports_${STAMP}.json
echo "checkpoint: $STAMP"

echo
echo "=== FINAL STATUS ==="
echo "core_stack: STABLE"
echo "life_world: CHECKED"
echo "growth_ai_discord_zapier: CHECKED"
echo "gateway: STABLE"
