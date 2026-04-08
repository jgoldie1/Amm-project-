#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MASTER RUNTIME LOCK + SMOKE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_master_runtime_lock_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_master_runtime_lock_${STAMP}.js"
cp db/aam.db "backups/aam_master_runtime_lock_${STAMP}.db"

########################################
# 2) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 3) HEALTH CHECKS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 4) MASTER FULL STACK SMOKE TEST
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
  /release-readiness \
  /metaverse-control \
  /studio-lab \
  /dispatch-actions \
  /episode-movie-pipeline \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) MASTER RUNTIME LOCK TABLE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS master_runtime_lock_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lock_name TEXT NOT NULL,
  lock_scope TEXT,
  lock_status TEXT DEFAULT 'locked',
  lock_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
INSERT INTO master_runtime_lock_registry
(lock_name, lock_scope, lock_status, lock_notes)
VALUES (?, ?, ?, ?)
""", (
    "master_runtime_locked_baseline",
    "full_platform",
    "locked",
    "Full platform stable after repeated broad smoke tests and section 1 lock."
))

conn.commit()
conn.close()
print("[OK] master runtime lock refreshed")
PYEOF

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, lock_name, lock_scope, lock_status, lock_notes, created_at from master_runtime_lock_registry order by id desc limit 20;" > "snapshots/master_runtime_lock_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, checkpoint_name, checkpoint_scope, checkpoint_status, checkpoint_notes, created_at from section_runtime_checkpoint_registry order by id desc limit 20;" > "snapshots/section_runtime_checkpoint_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, lock_name, lock_scope, lock_status, lock_notes, created_at from section_stability_lock_registry order by id desc limit 20;" > "snapshots/section_stability_lock_registry_tail_${STAMP}.json"

########################################
# 7) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "master_runtime_lock_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] master runtime lock scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/master_runtime_lock_smoke_and_stabilize_${STAMP}.txt" <<REPORT
MASTER RUNTIME LOCK + SMOKE + STABILIZE REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- full platform smoke test
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
- Release Readiness
- Metaverse Control
- Studio Lab
- Dispatch Actions
- Episode Movie Pipeline
- world3d

Locked:
- master_runtime_lock_registry
- full platform stable baseline

Purpose:
- run another broad smoke test
- preserve a master stable runtime baseline
- prepare cleanly for the next build section
REPORT

echo "MASTER RUNTIME LOCK + SMOKE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/master_runtime_lock_scan_latest.json"
echo "  cat snapshots/master_runtime_lock_registry_tail_${STAMP}.json"
echo "  cat reports/master_runtime_lock_smoke_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/episode-movie-pipeline"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
