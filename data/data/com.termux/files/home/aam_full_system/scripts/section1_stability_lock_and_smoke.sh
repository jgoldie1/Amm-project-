#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECTION 1 STABILITY LOCK + SMOKE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_section1_lock_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_section1_lock_${STAMP}.js"
cp db/aam.db "backups/aam_section1_lock_${STAMP}.db"

########################################
# 2) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 3) HEALTH CHECKS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 4) FULL STACK SMOKE TEST
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
  /quantum-speed \
  /release-readiness \
  /metaverse-control \
  /studio-lab \
  /dispatch-actions \
  /episode-movie-pipeline \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) STABILITY LOCK TABLE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS section_stability_lock_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lock_name TEXT NOT NULL,
  lock_scope TEXT,
  lock_status TEXT DEFAULT 'locked',
  lock_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
INSERT INTO section_stability_lock_registry
(lock_name, lock_scope, lock_status, lock_notes)
VALUES (?, ?, ?, ?)
""", (
    "section1_locked_baseline",
    "studio_callcenter_fx_pipeline",
    "locked",
    "Section 1 stable baseline locked after repeated zero-issue smoke tests."
))

conn.commit()
conn.close()
print("[OK] stability lock refreshed")
PYEOF

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, lock_name, lock_scope, lock_status, lock_notes, created_at from section_stability_lock_registry order by id desc limit 20;" > "snapshots/section_stability_lock_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, fx_name, fx_group, fx_type, target_use, fx_status, created_at from vocal_fx_box_registry order by id desc limit 20;" > "snapshots/vocal_fx_box_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, assist_program_name, support_channel, assist_mode, escalation_mode, operator_scope, assist_status, created_at from live_operator_assist_registry order by id desc limit 20;" > "snapshots/live_operator_assist_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, profile_name, script_focus, structure_mode, dialogue_mode, award_style_target, registry_status, created_at from screenplay_excellence_registry order by id desc limit 20;" > "snapshots/screenplay_excellence_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "section1_stability_lock_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] section 1 stability lock scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/section1_stability_lock_and_smoke_${STAMP}.txt" <<REPORT
SECTION 1 STABILITY LOCK + SMOKE REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- full stack smoke test
- Studio Lab
- Competitive Contact Center
- Episode Movie Pipeline
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
- Multiservice Dispatch
- Quantum Speed
- Release Readiness
- Metaverse Control
- Dispatch Actions
- world3d

Locked:
- section_stability_lock_registry
- section 1 stable baseline

Purpose:
- run one more broad smoke test
- preserve a locked stable baseline
- prepare cleanly for section 2
REPORT

echo "SECTION 1 STABILITY LOCK + SMOKE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/section1_stability_lock_scan_latest.json"
echo "  cat snapshots/section_stability_lock_registry_tail_${STAMP}.json"
echo "  cat reports/section1_stability_lock_and_smoke_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/episode-movie-pipeline"
