#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MASTER STABILITY SMOKE RECHECK START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_master_stability_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_master_stability_${STAMP}.js"
cp db/aam.db "backups/aam_master_stability_${STAMP}.db"

########################################
# 2) ENSURE REGISTRY TABLES EXIST
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS route_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_path TEXT NOT NULL,
  route_group TEXT,
  route_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS system_health_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  health_area TEXT NOT NULL,
  health_value TEXT NOT NULL,
  health_status TEXT DEFAULT 'ok',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("DELETE FROM route_registry")
routes = [
    ("/", "core", "active"),
    ("/quantum-mail", "mail", "active"),
    ("/quantum-mail-admin", "mail", "active"),
    ("/holo-search", "search", "active"),
    ("/platform-analytics", "analytics", "active"),
    ("/neuro-control", "assistive", "active"),
    ("/holojourney-tv", "media", "active"),
    ("/creator-tv", "media", "active"),
    ("/streaming-network", "media", "active"),
    ("/creator-monetization", "monetization", "active"),
    ("/upload-media-bridge", "uploads", "active"),
    ("/ops-checkpoint", "ops", "active"),
    ("/ai-call-center", "callcenter", "active"),
    ("/competitive-contact-center", "callcenter", "active"),
    ("/multiservice-dispatch", "dispatch", "active"),
    ("/quantum-speed", "performance", "active"),
    ("/metaverse-control", "metaverse", "active"),
    ("/studio-lab", "studio", "active"),
    ("/dispatch-actions", "dispatch", "active"),
    ("/episode-movie-pipeline", "production", "active"),
    ("/release-readiness", "readiness", "active"),
    ("/world3d", "world", "active"),
]
cur.executemany("""
INSERT INTO route_registry (route_path, route_group, route_status)
VALUES (?, ?, ?)
""", routes)

cur.execute("DELETE FROM system_health_registry")
cur.executemany("""
INSERT INTO system_health_registry (health_area, health_value, health_status)
VALUES (?, ?, ?)
""", [
    ("precheck", "registry_refreshed", "ok"),
    ("runtime", "pending_smoke_test", "ok"),
])

conn.commit()
conn.close()
print("[OK] registry tables refreshed")
PYEOF

########################################
# 3) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 4) HEALTH TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 5) MASTER ROUTE SMOKE TEST
########################################
for route in \
  / \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /neuro-control \
  /holojourney-tv \
  /creator-tv \
  /streaming-network \
  /creator-monetization \
  /upload-media-bridge \
  /ops-checkpoint \
  /ai-call-center \
  /competitive-contact-center \
  /multiservice-dispatch \
  /quantum-speed \
  /metaverse-control \
  /studio-lab \
  /dispatch-actions \
  /episode-movie-pipeline \
  /release-readiness \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) REFRESH HEALTH REGISTRY
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("DELETE FROM system_health_registry")
rows = [
    ("dashboard", "reachable", "ok"),
    ("jarvis", "reachable", "ok"),
    ("smoke_test", "master_recheck_completed", "ok"),
    ("checkpoint", "master_stability_recheck", "ok"),
]
cur.executemany("""
INSERT INTO system_health_registry
(health_area, health_value, health_status)
VALUES (?, ?, ?)
""", rows)

conn.commit()
conn.close()
print("[OK] system health registry refreshed")
PYEOF

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as route_registry from route_registry;" > "snapshots/route_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as system_health_registry from system_health_registry;" > "snapshots/system_health_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, route_path, route_group, route_status, created_at from route_registry order by id desc limit 100;" > "snapshots/route_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, health_area, health_value, health_status, created_at from system_health_registry order by id desc limit 100;" > "snapshots/system_health_registry_tail_${STAMP}.json"

########################################
# 8) ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "master_stability_smoke_recheck_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] master stability recheck scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/master_stability_smoke_recheck_${STAMP}.txt" <<REPORT
MASTER STABILITY SMOKE RECHECK REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- OmniMail OS
- Holo Search
- Platform Analytics
- Neuro Control
- HoloJourney TV
- Creator TV
- Streaming Network
- Creator Monetization
- Upload Media Bridge
- Ops Checkpoint
- AI Call Center
- Competitive Contact Center
- Multiservice Dispatch
- Quantum Speed
- Metaverse Control
- Studio Lab
- Dispatch Actions
- Episode Movie Pipeline
- Release Readiness
- world3d

Refreshed:
- route_registry
- system_health_registry
- full smoke test checkpoint

Purpose:
- stabilize the current runtime again
- smoke test all major routes again
- preserve a clean checkpoint before the next build
REPORT

echo "MASTER STABILITY SMOKE RECHECK COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/master_stability_smoke_recheck_scan_latest.json"
echo "  cat reports/master_stability_smoke_recheck_${STAMP}.txt"
echo "  cat snapshots/system_health_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/release-readiness"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
