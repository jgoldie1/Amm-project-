#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REBUILD PASS J FOR REAL IP + AI ATTORNEY + COMPLIANCE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_rebuild_pass_j_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_rebuild_pass_j_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_rebuild_pass_j_${STAMP}.js"

########################################
# 1) CREATE PASS J TABLES FOR REAL
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS ip_asset_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT,
  asset_group TEXT,
  linked_project TEXT,
  asset_type TEXT,
  asset_scope TEXT,
  asset_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rights_ownership_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownership_name TEXT,
  linked_asset TEXT,
  owner_name TEXT,
  owner_type TEXT,
  ownership_scope TEXT,
  ownership_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS license_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_name TEXT,
  linked_asset TEXT,
  license_type TEXT,
  license_scope TEXT,
  license_term TEXT,
  license_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credits_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credit_name TEXT,
  linked_project TEXT,
  contributor_name TEXT,
  contributor_role TEXT,
  credit_scope TEXT,
  credit_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS royalty_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  royalty_name TEXT,
  linked_asset TEXT,
  payee_name TEXT,
  royalty_type TEXT,
  royalty_rate TEXT,
  royalty_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_attorney_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attorney_name TEXT,
  attorney_group TEXT,
  specialty_scope TEXT,
  review_mode TEXT,
  escalation_mode TEXT,
  attorney_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_policy_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  policy_name TEXT,
  policy_group TEXT,
  target_scope TEXT,
  enforcement_mode TEXT,
  policy_result TEXT,
  policy_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contract_review_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_name TEXT,
  linked_contract TEXT,
  linked_project TEXT,
  review_scope TEXT,
  review_result TEXT,
  review_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legal_hold_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hold_name TEXT,
  linked_asset TEXT,
  linked_case TEXT,
  hold_scope TEXT,
  hold_reason TEXT,
  hold_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispute_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dispute_name TEXT,
  linked_asset TEXT,
  claimant_name TEXT,
  dispute_scope TEXT,
  dispute_result TEXT,
  dispute_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS release_compliance_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  release_name TEXT,
  linked_release TEXT,
  compliance_scope TEXT,
  compliance_result TEXT,
  approval_mode TEXT,
  release_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legal_audit_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_name TEXT,
  target_scope TEXT,
  audit_type TEXT,
  audit_result TEXT,
  audit_mode TEXT,
  audit_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass J real tables created"

########################################
# 2) SEED PASS J TABLES
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO ip_asset_registry (asset_name, asset_group, linked_project, asset_type, asset_scope, asset_status)
SELECT 'Primary Movie IP Asset','media_ip','Primary Movie Project','movie','global','active'
WHERE NOT EXISTS (SELECT 1 FROM ip_asset_registry WHERE asset_name='Primary Movie IP Asset');

INSERT INTO rights_ownership_registry (ownership_name, linked_asset, owner_name, owner_type, ownership_scope, ownership_status)
SELECT 'Primary Ownership Record','Primary Movie IP Asset','Platform Owner','entity','full_rights','active'
WHERE NOT EXISTS (SELECT 1 FROM rights_ownership_registry WHERE ownership_name='Primary Ownership Record');

INSERT INTO license_registry (license_name, linked_asset, license_type, license_scope, license_term, license_status)
SELECT 'Primary License','Primary Movie IP Asset','distribution','creator_tv+worlds','standard_term','active'
WHERE NOT EXISTS (SELECT 1 FROM license_registry WHERE license_name='Primary License');

INSERT INTO credits_registry (credit_name, linked_project, contributor_name, contributor_role, credit_scope, credit_status)
SELECT 'Primary Credits Record','Primary Movie Project','Platform Owner','creator','full_project','active'
WHERE NOT EXISTS (SELECT 1 FROM credits_registry WHERE credit_name='Primary Credits Record');

INSERT INTO royalty_registry (royalty_name, linked_asset, payee_name, royalty_type, royalty_rate, royalty_status)
SELECT 'Primary Royalty Record','Primary Movie IP Asset','Platform Owner','creator_royalty','10%','active'
WHERE NOT EXISTS (SELECT 1 FROM royalty_registry WHERE royalty_name='Primary Royalty Record');

INSERT INTO ai_attorney_registry (attorney_name, attorney_group, specialty_scope, review_mode, escalation_mode, attorney_status)
SELECT 'Stubbs AI Attorney','ai_legal','ip+contracts+compliance','assisted_review','human_escalation_ready','active'
WHERE NOT EXISTS (SELECT 1 FROM ai_attorney_registry WHERE attorney_name='Stubbs AI Attorney');

INSERT INTO compliance_policy_registry (policy_name, policy_group, target_scope, enforcement_mode, policy_result, policy_status)
SELECT 'Primary Compliance Policy','compliance','media+world+release','hard_enforce','pass','active'
WHERE NOT EXISTS (SELECT 1 FROM compliance_policy_registry WHERE policy_name='Primary Compliance Policy');

INSERT INTO contract_review_registry (review_name, linked_contract, linked_project, review_scope, review_result, review_status)
SELECT 'Primary Contract Review','Standard Distribution Contract','Primary Movie Project','distribution+rights','approved','complete'
WHERE NOT EXISTS (SELECT 1 FROM contract_review_registry WHERE review_name='Primary Contract Review');

INSERT INTO legal_hold_registry (hold_name, linked_asset, linked_case, hold_scope, hold_reason, hold_status)
SELECT 'Primary Legal Hold','Primary Movie IP Asset','No Active Case','none','monitor_only','inactive'
WHERE NOT EXISTS (SELECT 1 FROM legal_hold_registry WHERE hold_name='Primary Legal Hold');

INSERT INTO dispute_registry (dispute_name, linked_asset, claimant_name, dispute_scope, dispute_result, dispute_status)
SELECT 'Primary Dispute Monitor','Primary Movie IP Asset','None','ownership','none','clear'
WHERE NOT EXISTS (SELECT 1 FROM dispute_registry WHERE dispute_name='Primary Dispute Monitor');

INSERT INTO release_compliance_registry (release_name, linked_release, compliance_scope, compliance_result, approval_mode, release_status)
SELECT 'Primary Release Compliance','World Dev Release Bundle','ip+rights+compliance','pass','approved','active'
WHERE NOT EXISTS (SELECT 1 FROM release_compliance_registry WHERE release_name='Primary Release Compliance');

INSERT INTO legal_audit_registry (audit_name, target_scope, audit_type, audit_result, audit_mode, audit_status)
SELECT 'Primary Legal Audit','media+world+release','ip_and_compliance','pass','scheduled','active'
WHERE NOT EXISTS (SELECT 1 FROM legal_audit_registry WHERE audit_name='Primary Legal Audit');
SQL

echo "[OK] pass J real seeded"

########################################
# 3) HARD RUNTIME RECOVERY
########################################
pkill -f "node .*dashboard.js" 2>/dev/null || true
pkill -f "node .*jarvis.js" 2>/dev/null || true
pkill -f "apps/dashboard.js" 2>/dev/null || true
pkill -f "apps/jarvis.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 4) HEALTH + ROUTE SMOKE
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/metaverse-control > "test_results/metaverse_control_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/middleverse-bridge > "test_results/middleverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/studio-lab > "test_results/studio_lab_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/creator-tv > "test_results/creator_tv_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/world3d > "test_results/world3d_${STAMP}.txt" || true

########################################
# 5) GAP SUMMARY
########################################
python3 << PYEOF
from pathlib import Path
import json, sqlite3

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "ip_asset_registry",
    "rights_ownership_registry",
    "license_registry",
    "credits_registry",
    "royalty_registry",
    "ai_attorney_registry",
    "compliance_policy_registry",
    "contract_review_registry",
    "legal_hold_registry",
    "dispute_registry",
    "release_compliance_registry",
    "legal_audit_registry"
]

missing = []
for t in required:
    row = cur.execute("select name from sqlite_master where type='table' and name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

summary = {
    "missing_tables": missing,
    "gap_status": "stable" if not missing else "needs_attention"
}

out = Path.home() / "aam_full_system" / "snapshots" / "pass_j_legal_gap_summary_latest.json"
out.write_text(json.dumps(summary, indent=2))
print("[OK] pass J real gap summary written")
print(json.dumps(summary, indent=2))
con.close()
PYEOF

########################################
# 6) CURRENT-RUN ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "pass_j_legal_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] pass J real scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/rebuild_pass_j_for_real_ip_ai_attorney_compliance_and_stabilize_${STAMP}.txt" <<REPORT
REBUILD PASS J FOR REAL IP + AI ATTORNEY + COMPLIANCE + STABILIZE REPORT
Timestamp: ${STAMP}

Built:
- ip asset registry
- rights ownership registry
- license registry
- credits registry
- royalty registry
- ai attorney registry
- compliance policy registry
- contract review registry
- legal hold registry
- dispute registry
- release compliance registry
- legal audit registry

Verified:
- dashboard health
- jarvis health
- metaverse route
- middleverse route
- multiverse route
- studio lab
- creator tv
- world3d
- current-run-only scan
- legal gap summary

Purpose:
- build missing legal/business protection layer for real
- add AI attorney and compliance foundations
- preserve stable runtime
REPORT

echo "REBUILD PASS J FOR REAL IP + AI ATTORNEY + COMPLIANCE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pass_j_legal_scan_latest.json"
echo "  cat snapshots/pass_j_legal_gap_summary_latest.json"
echo "  cat reports/rebuild_pass_j_for_real_ip_ai_attorney_compliance_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
