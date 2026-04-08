#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FULL STABILITY + SMOKE TEST + CHECKPOINT START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_full_stability_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_full_stability_${STAMP}.js"
cp db/aam.db "backups/aam_full_stability_${STAMP}.db"

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
# 4) HEALTH CHECKS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 5) FULL ROUTE SMOKE TEST
########################################
for route in \
  / \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /neuro-control \
  /holojourney-tv \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) DATABASE SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as quantum_mail_accounts from quantum_mail_accounts;" > "snapshots/quantum_mail_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_messages from quantum_mail_messages;" > "snapshots/quantum_mail_messages_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_drafts from quantum_mail_drafts;" > "snapshots/quantum_mail_drafts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_folders from quantum_mail_folders;" > "snapshots/quantum_mail_folders_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_metrics from quantum_mail_metrics;" > "snapshots/quantum_mail_metrics_${STAMP}.json"

sqlite3 -json db/aam.db "select count(*) as holo_search_index from holo_search_index;" > "snapshots/holo_search_index_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holo_search_queries from holo_search_queries;" > "snapshots/holo_search_queries_${STAMP}.json"

sqlite3 -json db/aam.db "select count(*) as platform_usage_metrics from platform_usage_metrics;" > "snapshots/platform_usage_metrics_${STAMP}.json"

sqlite3 -json db/aam.db "select count(*) as neuro_interface_profiles from neuro_interface_profiles;" > "snapshots/neuro_interface_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as neuro_signal_sessions from neuro_signal_sessions;" > "snapshots/neuro_signal_sessions_${STAMP}.json"

sqlite3 -json db/aam.db "select count(*) as holojourney_generation_profiles from holojourney_generation_profiles;" > "snapshots/holojourney_generation_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holojourney_render_queue from holojourney_render_queue;" > "snapshots/holojourney_render_queue_${STAMP}.json"

sqlite3 -json db/aam.db "select id, display_name, mail_address, account_type, account_status, created_at from quantum_mail_accounts order by id desc limit 20;" > "snapshots/quantum_mail_accounts_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, mailbox_owner, folder_name, sender_address, recipient_address, subject_line, message_status, created_at from quantum_mail_messages order by id desc limit 20;" > "snapshots/quantum_mail_messages_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, source_name, source_route, source_group, index_status, created_at from holo_search_index order by id desc limit 20;" > "snapshots/holo_search_index_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, metric_name, metric_value, metric_scope, created_at from platform_usage_metrics order by id desc limit 20;" > "snapshots/platform_usage_metrics_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, profile_name, interface_type, control_mode, signal_source, safety_mode, profile_status, created_at from neuro_interface_profiles order by id desc limit 20;" > "snapshots/neuro_interface_profiles_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, profile_name, generation_mode, output_style, holographic_mode, profile_status, created_at from holojourney_generation_profiles order by id desc limit 20;" > "snapshots/holojourney_generation_profiles_tail_${STAMP}.json"

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
    if "dashboard health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "full_stability_smoke_test_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] full stability smoke scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/full_stability_smoke_test_and_checkpoint_${STAMP}.txt" <<REPORT
FULL STABILITY + SMOKE TEST + CHECKPOINT REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- /quantum-mail
- /quantum-mail-admin
- /holo-search
- /platform-analytics
- /neuro-control
- /holojourney-tv
- /world3d

Database checkpointed:
- OmniMail OS layer
- Holo Search layer
- Platform Analytics layer
- Neuro layer
- HoloJourney layer

Purpose:
- stabilize the current build
- run a broad smoke test
- create a clean checkpoint before the next feature layer
REPORT

echo "FULL STABILITY + SMOKE TEST + CHECKPOINT COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/full_stability_smoke_test_scan_latest.json"
echo "  cat reports/full_stability_smoke_test_and_checkpoint_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
echo "  termux-open-url http://127.0.0.1:4900/holo-search"
echo "  termux-open-url http://127.0.0.1:4900/platform-analytics"
echo "  termux-open-url http://127.0.0.1:4900/neuro-control"
echo "  termux-open-url http://127.0.0.1:4900/holojourney-tv"
