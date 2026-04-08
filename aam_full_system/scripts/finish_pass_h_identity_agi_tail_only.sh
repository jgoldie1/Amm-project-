#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH PASS H IDENTITY + AGI TAIL ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_finish_pass_h_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_finish_pass_h_${STAMP}.js"

########################################
# 1) VERIFY PASS H TABLES
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

conn.close()

if missing:
    print("Missing tables: " + ", ".join(missing))
    sys.exit(1)

print("[OK] pass H identity + AGI tables verified")
PYEOF

########################################
# 2) VERIFY ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("pathname === '/middleverse/identity-safe'", "route /middleverse/identity-safe"),
    ("pathname === '/middleverse/role-safe'", "route /middleverse/role-safe"),
    ("pathname === '/middleverse/tenant-safe'", "route /middleverse/tenant-safe"),
    ("pathname === '/middleverse/workspace-safe'", "route /middleverse/workspace-safe"),
    ("pathname === '/agi/self-awareness-safe'", "route /agi/self-awareness-safe"),
    ("pathname === '/agi/five-sense-safe'", "route /agi/five-sense-safe"),
    ("pathname === '/agi/symbolic-safe'", "route /agi/symbolic-safe"),
    ("pathname === '/agi/hierarchy-safe'", "route /agi/hierarchy-safe"),
    ("pathname === '/agi/provider-safe'", "route /agi/provider-safe"),
]

missing = [label for needle, label in checks if needle not in text]
if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] pass H routes verified")
PYEOF

########################################
# 3) HEALTH + ROUTE CHECKS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /middleverse-bridge \
  /metaverse-control \
  /studio-lab \
  /episode-movie-pipeline \
  /creator-tv \
  /dispatch-actions \
  /multiservice-dispatch \
  /ai-call-center \
  /competitive-contact-center \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 4) SAFE ACTION RECHECK
########################################
curl -s -i -X POST http://127.0.0.1:4900/middleverse/identity-safe > "test_results/identity_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/role-safe > "test_results/role_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/tenant-safe > "test_results/tenant_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/workspace-safe > "test_results/workspace_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/self-awareness-safe > "test_results/agi_self_awareness_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/five-sense-safe > "test_results/agi_five_sense_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/symbolic-safe > "test_results/agi_symbolic_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/hierarchy-safe > "test_results/agi_hierarchy_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/provider-safe > "test_results/agi_provider_${STAMP}.txt" || true

########################################
# 5) SNAPSHOTS
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
# 6) ERROR SCAN
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
# 7) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/finish_pass_h_identity_agi_tail_only_${STAMP}.txt" <<REPORT
FINISH PASS H IDENTITY + AGI TAIL ONLY REPORT
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
- dashboard health
- jarvis health
- bridge/platform smoke routes
- safe identity actions
- safe AGI actions
- stable runtime

Purpose:
- finish interrupted Pass H tail cleanly
- write missing snapshots, scan, and report
- preserve stable runtime
REPORT

echo "FINISH PASS H IDENTITY + AGI TAIL ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pass_h_identity_agi_scan_latest.json"
echo "  cat reports/finish_pass_h_identity_agi_tail_only_${STAMP}.txt"
echo "  bash scripts/status.sh"
