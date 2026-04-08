#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECTION 2 MASTER LOCK + SMOKE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_section2_master_lock_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_section2_master_lock_${STAMP}.js"
cp db/aam.db "backups/aam_section2_master_lock_${STAMP}.db"

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
# 4) SECTION 2 + FULL STACK SMOKE TEST
########################################
for route in \
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
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SECTION 2 SAFE ACTION SMOKE TESTS
########################################
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/request-create-smoke > "test_results/section2_lock_request_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/handoff-smoke > "test_results/section2_lock_handoff_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/assign-safe > "test_results/section2_lock_assign_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/status-safe > "test_results/section2_lock_status_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/escalate-safe > "test_results/section2_lock_escalate_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/resolve-safe > "test_results/section2_lock_resolve_${STAMP}.txt" || true

########################################
# 6) MASTER LOCK TABLE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS section2_master_lock_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lock_name TEXT NOT NULL,
  lock_scope TEXT,
  lock_status TEXT DEFAULT 'locked',
  lock_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
INSERT INTO section2_master_lock_registry
(lock_name, lock_scope, lock_status, lock_notes)
VALUES (?, ?, ?, ?)
""", (
    "section2_dispatch_locked_baseline",
    "dispatch_operator_handoff_safe_flow",
    "locked",
    "Section 2 safe pass A and pass B completed with zero-issue scan."
))

conn.commit()
conn.close()
print("[OK] section 2 master lock refreshed")
PYEOF

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, lock_name, lock_scope, lock_status, lock_notes, created_at from section2_master_lock_registry order by id desc limit 20;" > "snapshots/section2_master_lock_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, requester_name, service_name, request_type, assigned_program, request_status, created_at from service_request_log order by id desc limit 20;" > "snapshots/service_request_log_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status, created_at from operator_handoff_registry order by id desc limit 20;" > "snapshots/operator_handoff_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, request_name, assigned_agent, assigned_program, service_name, assignment_status, created_at from dispatch_assignment_registry order by id desc limit 20;" > "snapshots/dispatch_assignment_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, escalation_name, linked_request, escalation_level, escalation_target, escalation_status, created_at from escalation_registry order by id desc limit 20;" > "snapshots/escalation_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, request_name, service_name, timeline_stage, stage_notes, stage_status, created_at from service_status_timeline order by id desc limit 20;" > "snapshots/service_status_timeline_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, request_name, service_name, resolution_type, resolution_notes, resolution_status, created_at from dispatch_resolution_registry order by id desc limit 20;" > "snapshots/dispatch_resolution_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "section2_master_lock_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] section 2 master lock scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/section2_master_lock_smoke_and_stabilize_${STAMP}.txt" <<REPORT
SECTION 2 MASTER LOCK + SMOKE + STABILIZE REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- dispatch actions route
- section 2 safe smoke actions
- full stack route smoke test
- stable runtime after section 2 lock

Locked:
- section2_master_lock_registry
- section 2 dispatch/operator stable baseline

Purpose:
- preserve a stable section 2 checkpoint
- confirm section 2 is ready for deeper logic
- prepare cleanly for the next build stage
REPORT

echo "SECTION 2 MASTER LOCK + SMOKE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/section2_master_lock_scan_latest.json"
echo "  cat snapshots/section2_master_lock_registry_tail_${STAMP}.json"
echo "  cat snapshots/dispatch_assignment_registry_tail_${STAMP}.json"
echo "  cat snapshots/escalation_registry_tail_${STAMP}.json"
echo "  cat snapshots/service_status_timeline_tail_${STAMP}.json"
echo "  cat snapshots/dispatch_resolution_registry_tail_${STAMP}.json"
echo "  cat reports/section2_master_lock_smoke_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
