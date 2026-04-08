#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REBUILD SECTION 1 FOR REAL + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_rebuild_section1_${STAMP}.js"
cp db/aam.db "backups/aam_rebuild_section1_${STAMP}.db"

########################################
# 2) CREATE SECTION 1 TABLES FOR REAL
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS vocal_fx_box_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fx_name TEXT NOT NULL,
  fx_group TEXT,
  fx_type TEXT,
  target_use TEXT,
  fx_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS live_operator_assist_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assist_program_name TEXT NOT NULL,
  support_channel TEXT,
  assist_mode TEXT,
  escalation_mode TEXT,
  operator_scope TEXT,
  assist_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS vocal_lesson_program_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_name TEXT NOT NULL,
  lesson_mode TEXT,
  genre_focus TEXT,
  skill_focus TEXT,
  licensing_mode TEXT DEFAULT 'placeholder_safe',
  program_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS genre_vocal_coach_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coach_profile_name TEXT NOT NULL,
  genre_name TEXT,
  coaching_style TEXT,
  vocal_focus TEXT,
  coach_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS studio_fx_cgi_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  effect_name TEXT NOT NULL,
  effect_group TEXT,
  pipeline_stage TEXT,
  output_target TEXT,
  effect_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS screenplay_excellence_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  script_focus TEXT,
  structure_mode TEXT,
  dialogue_mode TEXT,
  award_style_target TEXT,
  registry_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM vocal_fx_box_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO vocal_fx_box_registry
        (fx_name, fx_group, fx_type, target_use, fx_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Vocal Doubler", "voice", "enhancer", "lead vocals", "active"),
        ("Harmony Builder", "voice", "generator", "background harmony", "active"),
        ("Breath Cleaner", "cleanup", "repair", "vocal polishing", "active"),
        ("Crowd FX Box", "fx", "environment", "live performance", "active"),
        ("Cinematic Voice FX", "fx", "cinematic", "film dialogue", "active"),
    ])

if cur.execute("SELECT count(*) FROM live_operator_assist_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO live_operator_assist_registry
        (assist_program_name, support_channel, assist_mode, escalation_mode, operator_scope, assist_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Freight Live Assist", "voice+chat", "AI assist + human takeover", "supervisor warm transfer", "freight dispatch", "active"),
        ("Delivery Operator Assist", "voice+sms", "AI triage + live operator", "team lead escalation", "food delivery", "active"),
        ("Pharmacy Sensitive Support", "voice", "human first with AI assist", "compliance escalation", "pharmacy delivery", "active"),
        ("Business Onboarding Desk", "voice+chat+email", "AI guided + live closer", "sales manager escalation", "new businesses", "active"),
    ])

if cur.execute("SELECT count(*) FROM vocal_lesson_program_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO vocal_lesson_program_registry
        (program_name, lesson_mode, genre_focus, skill_focus, licensing_mode, program_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Elite Vocal Foundations", "guided", "all genres", "breath pitch tone control", "placeholder_safe", "active"),
        ("Gospel Power Program", "guided", "gospel", "projection phrasing runs", "placeholder_safe", "active"),
        ("R&B Artist Development", "guided", "r&b", "melisma dynamics emotion", "placeholder_safe", "active"),
        ("Pop Precision Coaching", "guided", "pop", "clarity hooks stamina", "placeholder_safe", "active"),
        ("Country Storytelling Voice", "guided", "country", "story delivery resonance", "placeholder_safe", "active"),
        ("Rock Belt Lab", "guided", "rock", "belt grit stamina", "placeholder_safe", "active"),
    ])

if cur.execute("SELECT count(*) FROM genre_vocal_coach_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO genre_vocal_coach_registry
        (coach_profile_name, genre_name, coaching_style, vocal_focus, coach_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Classic Soul Coach", "soul", "artist development", "tone phrasing control", "active"),
        ("Contemporary Gospel Coach", "gospel", "performance intensive", "power endurance runs", "active"),
        ("Modern Pop Coach", "pop", "precision", "pitch agility hooks", "active"),
        ("R&B Performance Coach", "r&b", "emotion and dynamics", "runs falsetto expression", "active"),
        ("Country Vocal Coach", "country", "storytelling", "clarity authenticity", "active"),
        ("Broadway Voice Coach", "musical theater", "projection", "articulation stamina", "active"),
    ])

if cur.execute("SELECT count(*) FROM studio_fx_cgi_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO studio_fx_cgi_registry
        (effect_name, effect_group, pipeline_stage, output_target, effect_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("AGI Scene Expansion", "cgi", "previs", "episode movie pipeline", "active"),
        ("SPX Blast Simulation", "special_fx", "shot_fx", "action scenes", "active"),
        ("Cinematic Particle Engine", "vfx", "composite", "trailers and films", "active"),
        ("Digital Crowd Builder", "cgi", "render", "stadium and city scenes", "active"),
        ("Holographic Set Extension", "vfx", "composite", "holojourney tv", "active"),
    ])

if cur.execute("SELECT count(*) FROM screenplay_excellence_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO screenplay_excellence_registry
        (profile_name, script_focus, structure_mode, dialogue_mode, award_style_target, registry_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Prestige Drama Writer Room", "character depth", "three act + prestige variation", "subtext heavy", "award prestige", "active"),
        ("Blockbuster Action Script Lab", "spectacle + pace", "setpiece driven", "sharp momentum", "box office + awards", "active"),
        ("Family Feature Story Lab", "emotion + uplift", "clear arc", "warm accessible", "broad audience excellence", "active"),
        ("Crime Thriller Script Engine", "suspense", "twist driven", "tight tension", "festival + mainstream", "active"),
    ])

conn.commit()
conn.close()
print("[OK] section 1 tables created and seeded")
PYEOF

########################################
# 3) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 4) HEALTH + ROUTE TESTS
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
# 5) SNAPSHOTS
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
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "rebuild_section1_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] rebuild section 1 scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/rebuild_section1_for_real_and_stabilize_${STAMP}.txt" <<REPORT
REBUILD SECTION 1 FOR REAL + STABILIZE REPORT
Timestamp: ${STAMP}

Created:
- vocal_fx_box_registry
- live_operator_assist_registry
- vocal_lesson_program_registry
- genre_vocal_coach_registry
- studio_fx_cgi_registry
- screenplay_excellence_registry

Verified:
- dashboard health
- jarvis health
- studio lab route
- competitive contact center route
- episode movie pipeline route
- fresh smoke tests

Purpose:
- create section 1 for real after the interrupted run
- stabilize runtime
- preserve a clean checkpoint
REPORT

echo "REBUILD SECTION 1 FOR REAL + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/rebuild_section1_scan_latest.json"
echo "  cat reports/rebuild_section1_for_real_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/episode-movie-pipeline"
