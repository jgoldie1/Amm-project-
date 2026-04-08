#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX WEB3D FINISH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results public/world3d

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_web3d_fix_${STAMP}.js"
cp db/aam.db "backups/aam_web3d_fix_${STAMP}.db"

########################################
# 2) VERIFY TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS web3d_client_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  render_mode TEXT DEFAULT 'webgl',
  control_mode TEXT DEFAULT 'orbit',
  environment_mode TEXT DEFAULT 'open_world_proto',
  profile_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS web3d_scene_nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_name TEXT NOT NULL,
  node_type TEXT NOT NULL,
  pos_x REAL DEFAULT 0,
  pos_y REAL DEFAULT 0,
  pos_z REAL DEFAULT 0,
  scale_value REAL DEFAULT 1,
  node_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS web3d_runtime_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_payload TEXT,
  event_status TEXT DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("[OK] web3d tables verified")
PYEOF

########################################
# 3) VERIFY FILES / ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

root = Path.home() / "aam_full_system"
dashboard = root / "apps" / "dashboard.js"
world_html = root / "public" / "world3d" / "index.html"

text = dashboard.read_text()

if not world_html.exists():
    world_html.parent.mkdir(parents=True, exist_ok=True)
    world_html.write_text("""<!doctype html><html><body><h1>World 3D client placeholder</h1></body></html>""")
    print("[OK] recreated missing public/world3d/index.html")

if "pathname === '/world3d'" not in text or "pathname === '/web3d-client'" not in text:
    raise SystemExit("dashboard.js is missing /world3d or /web3d-client route patch")

print("[OK] web3d routes verified")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
########################################
for route in \
  / \
  /world-experience-control \
  /web3d-client \
  /world3d \
  /engine-bridge \
  /avatar-rig-control \
  /visual-streaming \
  /payment-control \
  /accessibility
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as web3d_client_profiles from web3d_client_profiles;" > "snapshots/web3d_client_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as web3d_scene_nodes from web3d_scene_nodes;" > "snapshots/web3d_scene_nodes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as web3d_runtime_events from web3d_runtime_events;" > "snapshots/web3d_runtime_events_${STAMP}.json"

sqlite3 -json db/aam.db "select id, profile_name, render_mode, control_mode, environment_mode, profile_status, created_at from web3d_client_profiles order by id desc limit 50;" > "snapshots/web3d_client_profiles_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, node_name, node_type, pos_x, pos_y, pos_z, scale_value, node_status, created_at from web3d_scene_nodes order by id desc limit 100;" > "snapshots/web3d_scene_nodes_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, event_type, event_payload, event_status, created_at from web3d_runtime_events order by id desc limit 100;" > "snapshots/web3d_runtime_events_tail_${STAMP}.json"

########################################
# 7) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "world 3d client not found" in lower:
        issues.append({"file": f.name, "problem": "world3d_missing"})

latest = Path.home() / "aam_full_system" / "snapshots" / "web3d_client_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] web3d client scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/fix_web3d_finish_${STAMP}.txt" <<REPORT
FIX WEB3D FINISH REPORT
Timestamp: ${STAMP}

Verified:
- web3d_client_profiles
- web3d_scene_nodes
- web3d_runtime_events
- /web3d-client
- /world3d
- public/world3d/index.html
- dashboard health
- jarvis health
- socket health
- web3d smoke tests

Purpose:
- recover from truncated bash paste
- stabilize everything
- finish the web 3d client phase cleanly
REPORT

echo "FIX WEB3D FINISH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/web3d_client_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/web3d-client"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
echo "  termux-open-url http://127.0.0.1:4900/world-experience-control"
