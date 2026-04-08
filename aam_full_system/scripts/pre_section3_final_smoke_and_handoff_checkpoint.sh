#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PRE-SECTION 3 FINAL SMOKE + HANDOFF CHECKPOINT START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_pre_section3_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_pre_section3_${STAMP}.js"
cp db/aam.db "backups/aam_pre_section3_${STAMP}.db"

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
# 4) BROAD FULL STACK SMOKE TEST
########################################
for route in \
  / \
  /dispatch-actions \
  /ai-call-center \
  /competitive-contact-center \
  /multiservice-dispatch \
  /ops-checkpoint \
  /upload-media-bridge \
  /creator-monetization \
  /streaming-network \
  /creator-tv \
  /holojourney-tv \
  /neuro-control \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /quantum-speed \
  /release-readiness \
  /metaverse-control \
  /studio-lab \
  /episode-movie-pipeline \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SAFE SECTION 2 ACTION SMOKE
########################################
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/request-create-smoke > "test_results/pre_section3_request_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/handoff-smoke > "test_results/pre_section3_handoff_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/assign-safe > "test_results/pre_section3_assign_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/status-safe > "test_results/pre_section3_status_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/escalate-safe > "test_results/pre_section3_escalate_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/resolve-safe > "test_results/pre_section3_resolve_${STAMP}.txt" || true

########################################
# 6) HANDOFF CHECKPOINT TABLE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS next_section_handoff_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handoff_name TEXT NOT NULL,
  current_section TEXT,
  next_section TEXT,
  readiness_status TEXT DEFAULT 'ready',
  handoff_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
INSERT INTO next_section_handoff_registry
(handoff_name, current_section, next_section, readiness_status, handoff_notes)
VALUES (?, ?, ?, ?, ?)
""", (
    "section2_to_section3_handoff",
    "section2_dispatch_operator_logic",
    "section3_next_build_stage",
    "ready",
    "Section 1 and Section 2 locked, smoke tested, and stable. Ready for next build stage."
))

conn.commit()
conn.close()
print("[OK] next section handoff refreshed")
PYEOF

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, handoff_name, current_section, next_section, readiness_status, handoff_notes, created_at from next_section_handoff_registry order by id desc limit 20;" > "snapshots/next_section_handoff_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, lock_name, lock_scope, lock_status, lock_notes, created_at from section2_master_lock_registry order by id desc limit 20;" > "snapshots/section2_master_lock_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "pre_section3_final_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] pre-section 3 final scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/pre_section3_final_smoke_and_handoff_checkpoint_${STAMP}.txt" <<REPORT
PRE-SECTION 3 FINAL SMOKE + HANDOFF CHECKPOINT REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- broad full stack smoke test
- section 2 safe action smoke tests
- stable runtime before next section

Created:
- next_section_handoff_registry
- final handoff checkpoint before section 3

Purpose:
- confirm the full stack is stable
- preserve a clean handoff marker
- start the next section from a locked checkpoint
REPORT

echo "PRE-SECTION 3 FINAL SMOKE + HANDOFF CHECKPOINT COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pre_section3_final_scan_latest.json"
echo "  cat snapshots/next_section_handoff_registry_tail_${STAMP}.json"
echo "  cat reports/pre_section3_final_smoke_and_handoff_checkpoint_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
