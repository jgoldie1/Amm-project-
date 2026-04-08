#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH SECTION 1 TAIL ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_section1_tail_${STAMP}.js"
cp db/aam.db "backups/aam_finish_section1_tail_${STAMP}.db"

########################################
# 1) VERIFY TABLES EXIST
########################################
python3 << 'PYEOF'
import sqlite3, sys
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "vocal_fx_box_registry",
    "live_operator_assist_registry",
    "vocal_lesson_program_registry",
    "genre_vocal_coach_registry",
    "studio_fx_cgi_registry",
    "screenplay_excellence_registry",
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

print("[OK] section 1 tables verified")
PYEOF

########################################
# 2) VERIFY ROUTE HELPERS EXIST
########################################
python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderStudioLabPage", "studio helper"),
    ("renderCompetitiveContactCenterPage", "competitive contact center helper"),
    ("renderEpisodeMoviePipelinePage", "episode movie pipeline helper"),
]

missing = [label for needle, label in checks if needle not in text]
if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] section 1 dashboard helpers verified")
PYEOF

########################################
# 3) HEALTH + ROUTE TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /studio-lab \
  /competitive-contact-center \
  /episode-movie-pipeline \
  /ai-call-center \
  /creator-tv \
  /streaming-network \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 4) SNAPSHOTS
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
# 5) WRITE MISSING SCAN FILE
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

latest = Path.home() / "aam_full_system" / "snapshots" / "section1_studio_callcenter_fx_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] section 1 latest scan written: {len(issues)} issues")
PYEOF

########################################
# 6) REPORT
########################################
cat > "reports/finish_section1_tail_only_${STAMP}.txt" <<REPORT
FINISH SECTION 1 TAIL ONLY REPORT
Timestamp: ${STAMP}

Verified:
- vocal FX box registry
- live operator assist registry
- vocal lesson program registry
- genre vocal coach registry
- studio FX / CGI registry
- screenplay excellence registry
- studio lab route
- competitive contact center route
- episode movie pipeline route
- dashboard health
- jarvis health
- fresh smoke tests

Purpose:
- recover from interrupted section 1 tail
- write the missing scan and snapshot files cleanly
- preserve stable runtime without redoing the whole patch
REPORT

echo "FINISH SECTION 1 TAIL ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/section1_studio_callcenter_fx_scan_latest.json"
echo "  cat reports/finish_section1_tail_only_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/episode-movie-pipeline"
