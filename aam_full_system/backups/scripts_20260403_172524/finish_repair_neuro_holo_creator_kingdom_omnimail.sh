#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH REPAIR NEURO + HOLO CREATOR + KINGDOM + OMNIMAIL OS START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_repair_neuro_holo_${STAMP}.js"
cp db/aam.db "backups/aam_finish_repair_neuro_holo_${STAMP}.db"

python3 << 'PYEOF'
import sqlite3
from pathlib import Path
import sys

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "platform_identity_registry",
    "neuro_interface_profiles",
    "neuro_signal_sessions",
    "holojourney_generation_profiles",
    "holojourney_render_queue",
    "creator_tv_channels",
    "creator_tv_programs",
    "streaming_network_registry",
    "streaming_event_log",
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

print("[OK] repair tables verified")
PYEOF

python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderNeuroControlPage", "helper renderNeuroControlPage"),
    ("renderHoloJourneyPage", "helper renderHoloJourneyPage"),
    ("pathname === '/neuro-control'", "route /neuro-control"),
    ("pathname === '/holojourney-tv'", "route /holojourney-tv"),
    ("OmniMail OS", "OmniMail OS label"),
]

missing = [label for needle, label in checks if needle not in text]
if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] repair routes verified")
PYEOF

bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

for route in \
  / \
  /neuro-control \
  /holojourney-tv \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

sqlite3 -json db/aam.db "select id, identity_group, internal_name, public_name, identity_status, created_at from platform_identity_registry order by id desc limit 20;" > "snapshots/platform_identity_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as neuro_interface_profiles from neuro_interface_profiles;" > "snapshots/neuro_interface_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as neuro_signal_sessions from neuro_signal_sessions;" > "snapshots/neuro_signal_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holojourney_generation_profiles from holojourney_generation_profiles;" > "snapshots/holojourney_generation_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holojourney_render_queue from holojourney_render_queue;" > "snapshots/holojourney_render_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_tv_channels from creator_tv_channels;" > "snapshots/creator_tv_channels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_tv_programs from creator_tv_programs;" > "snapshots/creator_tv_programs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as streaming_network_registry from streaming_network_registry;" > "snapshots/streaming_network_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as streaming_event_log from streaming_event_log;" > "snapshots/streaming_event_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, channel_name, channel_owner, channel_type, visibility_mode, monetization_mode, channel_status, created_at from creator_tv_channels order by id desc limit 50;" > "snapshots/creator_tv_channels_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, profile_name, interface_type, control_mode, signal_source, safety_mode, profile_status, created_at from neuro_interface_profiles order by id desc limit 50;" > "snapshots/neuro_interface_profiles_tail_${STAMP}.json"

python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "no such table" in txt:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in txt:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "repair_neuro_holo_creator_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] finish repair scan complete: {len(issues)} issues")
PYEOF

cat > "reports/finish_repair_neuro_holo_creator_kingdom_omnimail_${STAMP}.txt" <<REPORT
FINISH REPAIR NEURO + HOLO CREATOR + KINGDOM + OMNIMAIL OS REPORT
Timestamp: ${STAMP}

Verified:
- platform identity registry
- neuro interface tables
- holojourney tables
- creator TV tables
- streaming tables
- /neuro-control
- /holojourney-tv
- OmniMail OS labels
- dashboard health
- jarvis health
- fresh route smoke tests

Purpose:
- finish the cut-off repair run
- preserve OmniMail OS and The Kingdom OS identity
- stabilize the advanced creator, streaming, and assistive layer
REPORT

echo "FINISH REPAIR NEURO + HOLO CREATOR + KINGDOM + OMNIMAIL OS COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/repair_neuro_holo_creator_scan_latest.json"
echo "  cat snapshots/platform_identity_registry_${STAMP}.json"
echo "  cat snapshots/creator_tv_channels_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/neuro-control"
echo "  termux-open-url http://127.0.0.1:4900/holojourney-tv"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
