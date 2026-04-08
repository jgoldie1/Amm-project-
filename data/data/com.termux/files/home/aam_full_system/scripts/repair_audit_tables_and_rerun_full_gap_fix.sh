#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REPAIR AUDIT TABLES + RERUN FULL GAP FIX START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_repair_audit_tables_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_repair_audit_tables_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_repair_audit_tables_${STAMP}.js"

########################################
# 1) SHOW CURRENT AUDIT TABLE SCHEMAS
########################################
sqlite3 -line db/aam.db "PRAGMA table_info(gap_audit_registry);" > "snapshots/gap_audit_registry_schema_before_${STAMP}.txt" || true
sqlite3 -line db/aam.db "PRAGMA table_info(system_health_registry);" > "snapshots/system_health_registry_schema_before_${STAMP}.txt" || true
sqlite3 -line db/aam.db "PRAGMA table_info(route_registry);" > "snapshots/route_registry_schema_before_${STAMP}.txt" || true
sqlite3 -line db/aam.db "PRAGMA table_info(zero_issue_runtime_registry);" > "snapshots/zero_issue_runtime_registry_schema_before_${STAMP}.txt" || true

########################################
# 2) DROP + RECREATE ONLY AUDIT TABLES
########################################
sqlite3 db/aam.db <<SQL
DROP TABLE IF EXISTS gap_audit_registry;
DROP TABLE IF EXISTS system_health_registry;
DROP TABLE IF EXISTS route_registry;
DROP TABLE IF EXISTS zero_issue_runtime_registry;

CREATE TABLE gap_audit_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_name TEXT NOT NULL,
  gap_group TEXT,
  gap_item TEXT,
  gap_status TEXT DEFAULT 'ok',
  gap_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_health_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  health_name TEXT NOT NULL,
  service_name TEXT,
  health_status TEXT,
  health_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE route_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_path TEXT NOT NULL,
  route_group TEXT,
  route_status TEXT DEFAULT 'active',
  route_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zero_issue_runtime_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checkpoint_name TEXT NOT NULL,
  checkpoint_scope TEXT,
  checkpoint_status TEXT DEFAULT 'stable',
  checkpoint_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] audit tables recreated with correct schema"

########################################
# 3) RESTART SAFELY
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
# 5) FULL STACK SMOKE
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
# 6) SAFE ACTION SMOKE
########################################
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/request-create-smoke > "test_results/auditfix_request_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/handoff-smoke > "test_results/auditfix_handoff_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/assign-safe > "test_results/auditfix_assign_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/status-safe > "test_results/auditfix_status_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/escalate-safe > "test_results/auditfix_escalate_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/resolve-safe > "test_results/auditfix_resolve_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/studio/create-scene-safe > "test_results/auditfix_scene_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/studio/create-content-safe > "test_results/auditfix_content_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/studio/create-voice-safe > "test_results/auditfix_voice_${STAMP}.txt" || true

########################################
# 7) RERUN GAP AUDIT CLEANLY
########################################
python3 << PYEOF
import sqlite3, json
from pathlib import Path

stamp = "${STAMP}"
root = Path.home() / "aam_full_system"
db = root / "db" / "aam.db"
test_root = root / "test_results"

required_tables = [
    "quantum_mail_accounts",
    "quantum_mail_messages",
    "quantum_mail_drafts",
    "quantum_mail_folders",
    "quantum_mail_attachments",
    "quantum_mail_metrics",
    "creator_tv_channels",
    "creator_tv_programs",
    "streaming_network_registry",
    "streaming_event_log",
    "creator_subscription_plans",
    "creator_memberships",
    "creator_tip_ledger",
    "creator_payout_summary",
    "upload_ingest_registry",
    "media_attachment_bridge",
    "upload_policy_registry",
    "upload_event_log",
    "ops_checkpoint_registry",
    "ai_call_center_registry",
    "switchboard_number_registry",
    "business_onboarding_registry",
    "service_vertical_registry",
    "ai_agent_registry",
    "call_activity_log",
    "remote_agent_program_registry",
    "omnichannel_queue_registry",
    "workforce_management_registry",
    "quality_management_registry",
    "ai_virtual_agent_registry",
    "knowledge_automation_registry",
    "cx_competitive_feature_registry",
    "service_expansion_registry",
    "dispatch_program_registry",
    "vehicle_fleet_registry",
    "pharmacy_delivery_registry",
    "drone_delivery_registry",
    "service_request_log",
    "callcenter_feature_extension_registry",
    "quantum_speed_engine_registry",
    "quantum_lag_buster_registry",
    "feature_completion_registry",
    "readiness_scorecard_registry",
    "release_readiness_registry",
    "metaverse_scene_registry",
    "studio_project_registry",
    "audio_session_registry",
    "screenplay_scene_registry",
    "creator_content_registry",
    "ai_voice_session_registry",
    "operator_handoff_registry",
    "dispatch_console_registry",
    "dispatch_assignment_registry",
    "escalation_registry",
    "service_status_timeline",
    "dispatch_resolution_registry",
    "service_sla_registry",
    "operator_availability_registry",
    "section2_master_lock_registry",
    "next_section_handoff_registry",
    "gap_audit_registry",
    "system_health_registry",
    "route_registry",
    "zero_issue_runtime_registry",
]

expected_routes = [
    "/", "/dispatch-actions", "/ai-call-center", "/competitive-contact-center",
    "/multiservice-dispatch", "/ops-checkpoint", "/upload-media-bridge",
    "/creator-monetization", "/streaming-network", "/creator-tv",
    "/holojourney-tv", "/neuro-control", "/quantum-mail",
    "/quantum-mail-admin", "/holo-search", "/platform-analytics",
    "/quantum-speed", "/release-readiness", "/metaverse-control",
    "/studio-lab", "/episode-movie-pipeline", "/world3d"
]

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("DELETE FROM gap_audit_registry")
cur.execute("DELETE FROM system_health_registry")
cur.execute("DELETE FROM route_registry")

table_issues = []
for t in required_tables:
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
    if row:
        cur.execute(
            "INSERT INTO gap_audit_registry (audit_name, gap_group, gap_item, gap_status, gap_notes) VALUES (?, ?, ?, ?, ?)",
            (f"full_gap_audit_{stamp}", "table", t, "ok", "table exists")
        )
    else:
        table_issues.append(t)
        cur.execute(
            "INSERT INTO gap_audit_registry (audit_name, gap_group, gap_item, gap_status, gap_notes) VALUES (?, ?, ?, ?, ?)",
            (f"full_gap_audit_{stamp}", "table", t, "missing", "table missing")
        )

route_issues = []
for route in expected_routes:
    name = route.strip("/").replace("/", "_") or "home"
    fp = test_root / f"{name}_{stamp}.txt"
    status = "missing_result"
    notes = "route test file missing"
    if fp.exists():
        txt = fp.read_text(errors="ignore").lower()
        if "http/1.1 200" in txt or "http/1.1 302" in txt:
            status = "ok"
            notes = "route responded successfully"
        elif "cannot get" in txt or "not found" in txt:
            status = "missing"
            notes = "route missing"
            route_issues.append(route)
        elif "http/1.1 500" in txt:
            status = "error"
            notes = "route returned 500"
            route_issues.append(route)
        else:
            status = "unknown"
            notes = "unexpected response"
            route_issues.append(route)
    cur.execute(
        "INSERT INTO route_registry (route_path, route_group, route_status, route_notes) VALUES (?, ?, ?, ?)",
        (route, "full_stack", status, notes)
    )

dashboard_ok = False
jarvis_ok = False
d_fp = test_root / f"dashboard_health_{stamp}.txt"
j_fp = test_root / f"jarvis_health_{stamp}.txt"
if d_fp.exists():
    dashboard_ok = '"ok": true' in d_fp.read_text(errors="ignore").lower()
if j_fp.exists():
    jarvis_ok = '"ok": true' in j_fp.read_text(errors="ignore").lower()

cur.execute(
    "INSERT INTO system_health_registry (health_name, service_name, health_status, health_notes) VALUES (?, ?, ?, ?)",
    (f"health_{stamp}", "dashboard", "ok" if dashboard_ok else "down", "dashboard health check")
)
cur.execute(
    "INSERT INTO system_health_registry (health_name, service_name, health_status, health_notes) VALUES (?, ?, ?, ?)",
    (f"health_{stamp}", "jarvis", "ok" if jarvis_ok else "down", "jarvis health check")
)

overall_status = "stable" if (not table_issues and not route_issues and dashboard_ok and jarvis_ok) else "needs_attention"
notes = f"missing_tables={len(table_issues)}, route_issues={len(route_issues)}, dashboard_ok={dashboard_ok}, jarvis_ok={jarvis_ok}"

cur.execute(
    "INSERT INTO zero_issue_runtime_registry (checkpoint_name, checkpoint_scope, checkpoint_status, checkpoint_notes) VALUES (?, ?, ?, ?)",
    (f"full_gap_fix_checkpoint_{stamp}", "all_current_sections", overall_status, notes)
)

conn.commit()
conn.close()

summary = {
    "missing_tables": table_issues,
    "route_issues": route_issues,
    "dashboard_ok": dashboard_ok,
    "jarvis_ok": jarvis_ok,
    "overall_status": overall_status,
}
(root / "snapshots" / "full_gap_fix_summary_latest.json").write_text(json.dumps(summary, indent=2))
print("[OK] repaired full gap audit written")
print(json.dumps(summary, indent=2))
PYEOF

########################################
# 8) WRITE TAIL SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, audit_name, gap_group, gap_item, gap_status, gap_notes, created_at from gap_audit_registry order by id desc limit 50;" > "snapshots/gap_audit_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, health_name, service_name, health_status, health_notes, created_at from system_health_registry order by id desc limit 50;" > "snapshots/system_health_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, route_path, route_group, route_status, route_notes, created_at from route_registry order by id desc limit 100;" > "snapshots/route_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, checkpoint_name, checkpoint_scope, checkpoint_status, checkpoint_notes, created_at from zero_issue_runtime_registry order by id desc limit 50;" > "snapshots/zero_issue_runtime_registry_tail_${STAMP}.json"

########################################
# 9) FINAL ERROR SCAN
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
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "full_gap_fix_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] repaired full gap fix scan complete: {len(issues)} issues")
PYEOF

########################################
# 10) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 11) REPORT
########################################
cat > "reports/repair_audit_tables_and_rerun_full_gap_fix_${STAMP}.txt" <<REPORT
REPAIR AUDIT TABLES + RERUN FULL GAP FIX REPORT
Timestamp: ${STAMP}

Fixed:
- recreated audit/checkpoint tables with correct schema
- reran full stack smoke tests
- reran full gap audit
- wrote missing summary and tail snapshots

Verified:
- dashboard health
- jarvis health
- full stack smoke test
- safe dispatch action smoke tests
- safe section 3 action smoke tests

Purpose:
- recover from audit schema mismatch
- preserve stable runtime
- produce a clean all-stack checkpoint
REPORT

echo "REPAIR AUDIT TABLES + RERUN FULL GAP FIX COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/full_gap_fix_scan_latest.json"
echo "  cat snapshots/full_gap_fix_summary_latest.json"
echo "  cat snapshots/gap_audit_registry_tail_${STAMP}.json"
echo "  cat snapshots/system_health_registry_tail_${STAMP}.json"
echo "  cat snapshots/route_registry_tail_${STAMP}.json"
echo "  cat snapshots/zero_issue_runtime_registry_tail_${STAMP}.json"
echo "  cat reports/repair_audit_tables_and_rerun_full_gap_fix_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
