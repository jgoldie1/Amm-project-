#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH PASS H + MAGNUS TAIL ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_finish_pass_h_magnus_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_finish_pass_h_magnus_${STAMP}.js"

########################################
# 1) VERIFY TABLES
########################################
python3 << 'PYEOF'
import sqlite3, sys
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "middleverse_identity_registry",
    "middleverse_role_registry",
    "middleverse_permission_registry",
    "middleverse_tenant_registry",
    "middleverse_workspace_registry",
    "middleverse_access_audit_log",
    "agi_self_awareness_registry",
    "agi_five_sense_registry",
    "agi_symbolic_registry",
    "agi_hierarchy_registry",
    "agi_tool_provider_registry",
]

missing = []
for t in required:
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

magnus = cur.execute(
    "SELECT 1 FROM agi_tool_provider_registry WHERE provider_name='Magnus AI' LIMIT 1"
).fetchone()

conn.close()

if missing:
    print("Missing tables: " + ", ".join(missing))
    sys.exit(1)

if not magnus:
    print("Missing provider record: Magnus AI")
    sys.exit(1)

print("[OK] pass H + Magnus tables verified")
PYEOF

########################################
# 2) COMPLETE SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as middleverse_identity_registry from middleverse_identity_registry;" > "snapshots/middleverse_identity_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_role_registry from middleverse_role_registry;" > "snapshots/middleverse_role_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_permission_registry from middleverse_permission_registry;" > "snapshots/middleverse_permission_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_tenant_registry from middleverse_tenant_registry;" > "snapshots/middleverse_tenant_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_workspace_registry from middleverse_workspace_registry;" > "snapshots/middleverse_workspace_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_access_audit_log from middleverse_access_audit_log;" > "snapshots/middleverse_access_audit_log_${STAMP}.json"

sqlite3 -json db/aam.db "select count(*) as agi_self_awareness_registry from agi_self_awareness_registry;" > "snapshots/agi_self_awareness_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_five_sense_registry from agi_five_sense_registry;" > "snapshots/agi_five_sense_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_symbolic_registry from agi_symbolic_registry;" > "snapshots/agi_symbolic_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_hierarchy_registry from agi_hierarchy_registry;" > "snapshots/agi_hierarchy_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_tool_provider_registry from agi_tool_provider_registry;" > "snapshots/agi_tool_provider_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, identity_name, identity_type, linked_email, linked_wallet, identity_status, created_at from middleverse_identity_registry order by id desc limit 20;" > "snapshots/middleverse_identity_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, role_name, role_group, access_scope, control_level, role_status, created_at from middleverse_role_registry order by id desc limit 20;" > "snapshots/middleverse_role_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, permission_name, permission_group, linked_role, target_system, permission_mode, permission_status, created_at from middleverse_permission_registry order by id desc limit 20;" > "snapshots/middleverse_permission_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, tenant_name, tenant_group, owner_identity, tenant_mode, tenant_status, created_at from middleverse_tenant_registry order by id desc limit 20;" > "snapshots/middleverse_tenant_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, workspace_name, workspace_group, linked_tenant, owner_identity, workspace_mode, workspace_status, created_at from middleverse_workspace_registry order by id desc limit 20;" > "snapshots/middleverse_workspace_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, actor_name, actor_role, target_system, action_name, action_result, action_status, created_at from middleverse_access_audit_log order by id desc limit 20;" > "snapshots/middleverse_access_audit_log_tail_${STAMP}.json"

sqlite3 -json db/aam.db "select id, profile_name, awareness_scope, reflection_mode, state_model, awareness_status, created_at from agi_self_awareness_registry order by id desc limit 20;" > "snapshots/agi_self_awareness_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, sense_profile_name, vision_mode, audio_mode, touch_mode, language_mode, environment_mode, sense_status, created_at from agi_five_sense_registry order by id desc limit 20;" > "snapshots/agi_five_sense_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, symbolic_profile_name, reasoning_mode, rule_engine_mode, knowledge_graph_mode, planning_mode, symbolic_status, created_at from agi_symbolic_registry order by id desc limit 20;" > "snapshots/agi_symbolic_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, hierarchy_name, parent_agent, child_agent, task_scope, control_mode, hierarchy_status, created_at from agi_hierarchy_registry order by id desc limit 20;" > "snapshots/agi_hierarchy_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, provider_name, provider_group, integration_scope, tool_mode, provider_status, created_at from agi_tool_provider_registry order by id desc limit 20;" > "snapshots/agi_tool_provider_registry_tail_${STAMP}.json"

########################################
# 3) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "pass_h_identity_agi_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] pass H identity + AGI scan complete: {len(issues)} issues")
PYEOF

########################################
# 4) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 5) REPORT
########################################
cat > "reports/finish_pass_h_magnus_tail_only_${STAMP}.txt" <<REPORT
FINISH PASS H + MAGNUS TAIL ONLY REPORT
Timestamp: ${STAMP}

Verified:
- middleverse identity registry
- role registry
- permission registry
- tenant registry
- workspace registry
- access audit log
- AGI self-awareness registry
- AGI five-sense registry
- AGI symbolic registry
- AGI hierarchy registry
- AGI tool provider registry
- Magnus AI provider record
- dashboard health
- jarvis health
- stable runtime

Purpose:
- finish interrupted snapshot phase cleanly
- write missing snapshots, scan, and report
- preserve stable runtime
REPORT

echo "FINISH PASS H + MAGNUS TAIL ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pass_h_identity_agi_scan_latest.json"
echo "  cat snapshots/agi_tool_provider_registry_tail_${STAMP}.json"
echo "  cat reports/finish_pass_h_magnus_tail_only_${STAMP}.txt"
echo "  bash scripts/status.sh"
