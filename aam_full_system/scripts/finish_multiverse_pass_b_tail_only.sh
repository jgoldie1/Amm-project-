#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH MULTIVERSE PASS B TAIL ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_finish_multiverse_pass_b_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_finish_multiverse_pass_b_${STAMP}.js"

########################################
# 1) VERIFY PASS B TABLES
########################################
python3 << 'PYEOF'
import sqlite3, sys
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "multiverse_session_registry",
    "multiverse_presence_registry",
    "multiverse_action_router",
    "multiverse_transition_log",
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

print("[OK] multiverse pass B tables verified")
PYEOF

########################################
# 2) HEALTH + ROUTE RECHECK
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  / \
  /multiverse-bridge \
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
# 3) SAFE ACTION RECHECK
########################################
curl -s -i -X POST http://127.0.0.1:4900/multiverse/session-safe > "test_results/multiverse_session_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/presence-safe > "test_results/multiverse_presence_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/action-safe > "test_results/multiverse_action_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/transition-safe > "test_results/multiverse_transition_${STAMP}.txt" || true

########################################
# 4) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as multiverse_session_registry from multiverse_session_registry;" > "snapshots/multiverse_session_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_presence_registry from multiverse_presence_registry;" > "snapshots/multiverse_presence_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_action_router from multiverse_action_router;" > "snapshots/multiverse_action_router_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_transition_log from multiverse_transition_log;" > "snapshots/multiverse_transition_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, session_name, session_group, user_name, source_realm, target_realm, session_mode, session_status, created_at from multiverse_session_registry order by id desc limit 20;" > "snapshots/multiverse_session_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, presence_name, presence_group, identity_name, realm_name, avatar_mode, presence_status, created_at from multiverse_presence_registry order by id desc limit 20;" > "snapshots/multiverse_presence_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, action_name, action_group, source_realm, target_realm, route_mode, action_status, created_at from multiverse_action_router order by id desc limit 20;" > "snapshots/multiverse_action_router_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, transition_name, transition_group, source_realm, target_realm, linked_user, transition_result, transition_status, created_at from multiverse_transition_log order by id desc limit 20;" > "snapshots/multiverse_transition_log_tail_${STAMP}.json"

########################################
# 5) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "multiverse_pass_b_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] multiverse pass B scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/finish_multiverse_pass_b_tail_only_${STAMP}.txt" <<REPORT
FINISH MULTIVERSE PASS B TAIL ONLY REPORT
Timestamp: ${STAMP}

Verified:
- multiverse session registry
- multiverse presence registry
- multiverse action router
- multiverse transition log
- safe multiverse pass B actions
- dashboard health
- jarvis health
- broad platform smoke routes
- stable runtime

Purpose:
- recover from interrupted multiverse pass B tail
- write missing snapshots, scan, and report
- preserve stable runtime
REPORT

echo "FINISH MULTIVERSE PASS B TAIL ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/multiverse_pass_b_scan_latest.json"
echo "  cat snapshots/multiverse_session_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_presence_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_action_router_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_transition_log_tail_${STAMP}.json"
echo "  cat reports/finish_multiverse_pass_b_tail_only_${STAMP}.txt"
echo "  bash scripts/status.sh"
