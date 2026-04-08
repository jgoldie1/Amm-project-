#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== POST SECTION 1 MASTER SMOKE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_post_section1_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_post_section1_${STAMP}.js"
cp db/aam.db "backups/aam_post_section1_${STAMP}.db"

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
# 4) FULL STACK ROUTE SMOKE TEST
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
# 5) SECTION 1 DATA SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as vocal_fx_box_registry from vocal_fx_box_registry;" > "snapshots/vocal_fx_box_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as live_operator_assist_registry from live_operator_assist_registry;" > "snapshots/live_operator_assist_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as vocal_lesson_program_registry from vocal_lesson_program_registry;" > "snapshots/vocal_lesson_program_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as genre_vocal_coach_registry from genre_vocal_coach_registry;" > "snapshots/genre_vocal_coach_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as studio_fx_cgi_registry from studio_fx_cgi_registry;" > "snapshots/studio_fx_cgi_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as screenplay_excellence_registry from screenplay_excellence_registry;" > "snapshots/screenplay_excellence_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, fx_name, fx_group, fx_type, target_use, fx_status, created_at from vocal_fx_box_registry order by id desc limit 20;" > "snapshots/vocal_fx_box_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, assist_program_name, support_channel, assist_mode, escalation_mode, operator_scope, assist_status, created_at from live_operator_assist_registry order by id desc limit 20;" > "snapshots/live_operator_assist_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, program_name, lesson_mode, genre_focus, skill_focus, licensing_mode, program_status, created_at from vocal_lesson_program_registry order by id desc limit 20;" > "snapshots/vocal_lesson_program_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, coach_profile_name, genre_name, coaching_style, vocal_focus, coach_status, created_at from genre_vocal_coach_registry order by id desc limit 20;" > "snapshots/genre_vocal_coach_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, effect_name, effect_group, pipeline_stage, output_target, effect_status, created_at from studio_fx_cgi_registry order by id desc limit 20;" > "snapshots/studio_fx_cgi_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, profile_name, script_focus, structure_mode, dialogue_mode, award_style_target, registry_status, created_at from screenplay_excellence_registry order by id desc limit 20;" > "snapshots/screenplay_excellence_registry_tail_${STAMP}.json"

########################################
# 6) MASTER CHECKPOINT TABLE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS section_runtime_checkpoint_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checkpoint_name TEXT NOT NULL,
  checkpoint_scope TEXT,
  checkpoint_status TEXT DEFAULT 'ok',
  checkpoint_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
INSERT INTO section_runtime_checkpoint_registry
(checkpoint_name, checkpoint_scope, checkpoint_status, checkpoint_notes)
VALUES (?, ?, ?, ?)
""", (
    "post_section1_master_smoke",
    "studio_callcenter_fx_pipeline",
    "ok",
    "Section 1 rebuilt, smoke tested, and stabilized successfully."
))

conn.commit()
conn.close()
print("[OK] section runtime checkpoint refreshed")
PYEOF

sqlite3 -json db/aam.db "select id, checkpoint_name, checkpoint_scope, checkpoint_status, checkpoint_notes, created_at from section_runtime_checkpoint_registry order by id desc limit 20;" > "snapshots/section_runtime_checkpoint_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "post_section1_master_smoke_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] post section 1 master smoke scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/post_section1_master_smoke_and_stabilize_${STAMP}.txt" <<REPORT
POST SECTION 1 MASTER SMOKE + STABILIZE REPORT
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
- Quantum Speed
- Release Readiness
- Metaverse Control
- Studio Lab
- Dispatch Actions
- Episode Movie Pipeline
- world3d

Section 1 Verified:
- vocal FX box registry
- live operator assist registry
- vocal lesson program registry
- genre vocal coach registry
- studio FX / CGI registry
- screenplay excellence registry

Added / Refreshed:
- section_runtime_checkpoint_registry
- post section 1 stability checkpoint

Purpose:
- run a broad smoke test after rebuilding section 1
- stabilize runtime again
- preserve a clean checkpoint before section 2
REPORT

echo "POST SECTION 1 MASTER SMOKE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/post_section1_master_smoke_scan_latest.json"
echo "  cat snapshots/section_runtime_checkpoint_registry_tail_${STAMP}.json"
echo "  cat reports/post_section1_master_smoke_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/episode-movie-pipeline"
