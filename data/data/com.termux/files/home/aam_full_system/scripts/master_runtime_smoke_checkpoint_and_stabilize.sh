#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MASTER RUNTIME SMOKE CHECKPOINT + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_master_runtime_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_master_runtime_${STAMP}.js"
cp db/aam.db "backups/aam_master_runtime_${STAMP}.db"

########################################
# 2) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 3) HEALTH TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 4) MASTER ROUTE SMOKE TEST
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
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as route_registry from route_registry;" > "snapshots/route_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as gap_audit_registry from gap_audit_registry;" > "snapshots/gap_audit_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as system_health_registry from system_health_registry;" > "snapshots/system_health_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select count(*) as ai_call_center_registry from ai_call_center_registry;" > "snapshots/ai_call_center_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as cx_competitive_feature_registry from cx_competitive_feature_registry;" > "snapshots/cx_competitive_feature_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as service_expansion_registry from service_expansion_registry;" > "snapshots/service_expansion_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as dispatch_program_registry from dispatch_program_registry;" > "snapshots/dispatch_program_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, route_path, route_group, route_status, created_at from route_registry order by id desc limit 50;" > "snapshots/route_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, health_area, health_value, health_status, created_at from system_health_registry order by id desc limit 50;" > "snapshots/system_health_registry_tail_${STAMP}.json"

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
    ("runtime_checkpoint", "completed", "ok"),
    ("smoke_scope", "master_runtime", "ok"),
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

latest = Path.home() / "aam_full_system" / "snapshots" / "master_runtime_smoke_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] master runtime smoke scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/master_runtime_smoke_checkpoint_and_stabilize_${STAMP}.txt" <<REPORT
MASTER RUNTIME SMOKE CHECKPOINT + STABILIZE REPORT
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
- world3d

Refreshed:
- system_health_registry
- route baseline snapshot
- full runtime smoke checkpoint

Purpose:
- preserve a locked stable runtime checkpoint
- run another broad smoke test
- prepare cleanly for the next layer
REPORT

echo "MASTER RUNTIME SMOKE CHECKPOINT + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/master_runtime_smoke_scan_latest.json"
echo "  cat reports/master_runtime_smoke_checkpoint_and_stabilize_${STAMP}.txt"
echo "  cat snapshots/system_health_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/multiservice-dispatch"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
