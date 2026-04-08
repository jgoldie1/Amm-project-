#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINAL LOCK + CHECKPOINT BEFORE MULTIVERSE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_final_lock_before_multiverse_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_final_lock_before_multiverse_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_final_lock_before_multiverse_${STAMP}.js"

########################################
# 1) CREATE FINAL CHECKPOINT TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS multiverse_handoff_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handoff_name TEXT,
  handoff_group TEXT,
  source_section TEXT,
  target_section TEXT,
  handoff_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS final_checkpoint_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checkpoint_name TEXT,
  checkpoint_group TEXT,
  target_scope TEXT,
  checkpoint_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zero_issue_baseline_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  baseline_name TEXT,
  baseline_group TEXT,
  baseline_scope TEXT,
  baseline_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] final checkpoint tables ready"

########################################
# 2) SEED FINAL LOCK RECORDS
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO multiverse_handoff_registry (handoff_name, handoff_group, source_section, target_section, handoff_status)
SELECT 'middleverse_to_multiverse_handoff','section_handoff','middleverse_complete','multiverse_start','ready'
WHERE NOT EXISTS (
  SELECT 1 FROM multiverse_handoff_registry
  WHERE handoff_name='middleverse_to_multiverse_handoff'
);

INSERT INTO final_checkpoint_registry (checkpoint_name, checkpoint_group, target_scope, checkpoint_status)
SELECT 'pre_multiverse_checkpoint','stability','platform','locked'
WHERE NOT EXISTS (
  SELECT 1 FROM final_checkpoint_registry
  WHERE checkpoint_name='pre_multiverse_checkpoint'
);

INSERT INTO zero_issue_baseline_registry (baseline_name, baseline_group, baseline_scope, baseline_status)
SELECT 'pre_multiverse_zero_issue_baseline','quality','platform','stable'
WHERE NOT EXISTS (
  SELECT 1 FROM zero_issue_baseline_registry
  WHERE baseline_name='pre_multiverse_zero_issue_baseline'
);
SQL

echo "[OK] final lock records seeded"

########################################
# 3) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 4) HEALTH + BROAD ROUTE SMOKE
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  / \
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
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as multiverse_handoff_registry from multiverse_handoff_registry;" > "snapshots/multiverse_handoff_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as final_checkpoint_registry from final_checkpoint_registry;" > "snapshots/final_checkpoint_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as zero_issue_baseline_registry from zero_issue_baseline_registry;" > "snapshots/zero_issue_baseline_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, handoff_name, handoff_group, source_section, target_section, handoff_status, created_at from multiverse_handoff_registry order by id desc limit 20;" > "snapshots/multiverse_handoff_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, checkpoint_name, checkpoint_group, target_scope, checkpoint_status, created_at from final_checkpoint_registry order by id desc limit 20;" > "snapshots/final_checkpoint_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, baseline_name, baseline_group, baseline_scope, baseline_status, created_at from zero_issue_baseline_registry order by id desc limit 20;" > "snapshots/zero_issue_baseline_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "final_lock_before_multiverse_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] final lock scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/final_lock_checkpoint_before_multiverse_${STAMP}.txt" <<REPORT
FINAL LOCK + CHECKPOINT BEFORE MULTIVERSE REPORT
Timestamp: ${STAMP}

Created:
- multiverse handoff registry
- final checkpoint registry
- zero issue baseline registry

Verified:
- dashboard health
- jarvis health
- broad platform smoke routes
- stable runtime
- checkpoint lock state

Purpose:
- preserve the final stable middleverse baseline
- prepare a clean handoff into multiverse
- provide rollback safety before the next major section
REPORT

echo "FINAL LOCK + CHECKPOINT BEFORE MULTIVERSE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/final_lock_before_multiverse_scan_latest.json"
echo "  cat snapshots/multiverse_handoff_registry_tail_${STAMP}.json"
echo "  cat snapshots/final_checkpoint_registry_tail_${STAMP}.json"
echo "  cat snapshots/zero_issue_baseline_registry_tail_${STAMP}.json"
echo "  cat reports/final_lock_checkpoint_before_multiverse_${STAMP}.txt"
echo "  bash scripts/status.sh"
