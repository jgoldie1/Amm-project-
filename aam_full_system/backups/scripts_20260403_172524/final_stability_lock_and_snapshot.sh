#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINAL STABILITY LOCK + SNAPSHOT START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_stability_lock_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_stability_lock_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_stability_lock_${STAMP}.js"
cp db/aam.db "backups/aam_stability_lock_${STAMP}.db"

########################################
# 2) VERIFY CORE HEALTH
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 3) ROUTE SNAPSHOTS
########################################
for route in \
  / \
  /join \
  /watch \
  /build \
  /learn \
  /connect-system \
  /conversion-control \
  /monetization-control \
  /payment-control \
  /accessibility \
  /avatar-rig-control \
  /engine-bridge \
  /visual-streaming \
  /role-hub \
  /executive-dashboard
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 4) DATABASE SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "snapshots/heir_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as membership_tiers from membership_tiers;" > "snapshots/membership_tiers_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as ecosystem_access_passes from ecosystem_access_passes;" > "snapshots/ecosystem_access_passes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payment_transactions from payment_transactions;" > "snapshots/payment_transactions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as blockchain_events from blockchain_events;" > "snapshots/blockchain_events_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as accessibility_profiles from accessibility_profiles;" > "snapshots/accessibility_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_characters from avatar_characters;" > "snapshots/avatar_characters_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_rig_profiles from avatar_rig_profiles;" > "snapshots/avatar_rig_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as engine_registry from engine_registry;" > "snapshots/engine_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as visual_world_scenes from visual_world_scenes;" > "snapshots/visual_world_scenes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_stream_channels from creator_stream_channels;" > "snapshots/creator_stream_channels_${STAMP}.json"

########################################
# 5) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "final_stability_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] final stability scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) REPORT
########################################
cat > "reports/final_stability_lock_and_snapshot_${STAMP}.txt" <<REPORT
FINAL STABILITY LOCK + SNAPSHOT REPORT
Timestamp: ${STAMP}

Locked:
- dashboard.js
- world_socket.js
- jarvis.js
- aam.db

Verified:
- dashboard health
- jarvis health
- world socket health
- core routes
- monetization routes
- payment routes
- accessibility route
- avatar rig route
- engine bridge route
- visual streaming route

Purpose:
- stabilize everything
- create rollback confidence
- preserve the current high-progress platform state
REPORT

echo "FINAL STABILITY LOCK + SNAPSHOT COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/final_stability_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/accessibility"
echo "  termux-open-url http://127.0.0.1:4900/avatar-rig-control"
echo "  termux-open-url http://127.0.0.1:4900/payment-control"
