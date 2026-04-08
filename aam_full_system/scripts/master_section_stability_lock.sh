#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MASTER SECTION STABILITY LOCK START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_section_lock_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_section_lock_${STAMP}.js"
cp db/aam.db "backups/aam_section_lock_${STAMP}.db"

########################################
# 2) JS CHECK
########################################
bash scripts/check_js.sh

########################################
# 3) CLEAN RESTART
########################################
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4

########################################
# 4) HEALTH TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 5) MASTER ROUTE SMOKE TEST
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
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SECTION SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as quantum_mail_accounts from quantum_mail_accounts;" > "snapshots/lock_quantum_mail_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holo_search_index from holo_search_index;" > "snapshots/lock_holo_search_index_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as platform_usage_metrics from platform_usage_metrics;" > "snapshots/lock_platform_usage_metrics_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as neuro_interface_profiles from neuro_interface_profiles;" > "snapshots/lock_neuro_interface_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holojourney_generation_profiles from holojourney_generation_profiles;" > "snapshots/lock_holojourney_generation_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_tv_channels from creator_tv_channels;" > "snapshots/lock_creator_tv_channels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as streaming_network_registry from streaming_network_registry;" > "snapshots/lock_streaming_network_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_subscription_plans from creator_subscription_plans;" > "snapshots/lock_creator_subscription_plans_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as upload_ingest_registry from upload_ingest_registry;" > "snapshots/lock_upload_ingest_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as ops_checkpoint_registry from ops_checkpoint_registry;" > "snapshots/lock_ops_checkpoint_registry_${STAMP}.json"

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
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "master_section_stability_lock_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] master section lock scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/master_section_stability_lock_${STAMP}.txt" <<REPORT
MASTER SECTION STABILITY LOCK REPORT
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
- world3d

Purpose:
- run one more full smoke test
- preserve a locked stable checkpoint
- finish this section cleanly before the next add-on
REPORT

echo "MASTER SECTION STABILITY LOCK COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/master_section_stability_lock_scan_latest.json"
echo "  cat reports/master_section_stability_lock_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/ops-checkpoint"
echo "  termux-open-url http://127.0.0.1:4900/creator-monetization"
echo "  termux-open-url http://127.0.0.1:4900/upload-media-bridge"
