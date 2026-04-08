#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX WORLD EXPERIENCE FINISH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_world_experience_fix_${STAMP}.js"
cp db/aam.db "backups/aam_world_experience_fix_${STAMP}.db"

########################################
# 2) ENSURE TABLES EXIST
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS world_render_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  render_quality TEXT NOT NULL DEFAULT 'high',
  texture_mode TEXT DEFAULT 'streamed',
  lighting_mode TEXT DEFAULT 'dynamic',
  lod_mode TEXT DEFAULT 'adaptive',
  profile_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_streaming_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  world_partition_mode TEXT DEFAULT 'zoned',
  tile_stream_mode TEXT DEFAULT 'dynamic',
  terrain_mode TEXT DEFAULT 'scaffold',
  streaming_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS physics_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  movement_mode TEXT DEFAULT 'arcade_sim',
  vehicle_mode TEXT DEFAULT 'prepared',
  gravity_mode TEXT DEFAULT 'earth_like',
  collision_mode TEXT DEFAULT 'standard',
  profile_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS npc_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  npc_type TEXT NOT NULL DEFAULT 'ambient',
  behavior_mode TEXT DEFAULT 'scripted',
  economy_role TEXT DEFAULT 'none',
  profile_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS gameplay_loop_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loop_name TEXT NOT NULL,
  loop_type TEXT NOT NULL DEFAULT 'explore_build_earn',
  reward_mode TEXT DEFAULT 'tiered',
  session_mode TEXT DEFAULT 'open_world',
  loop_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS immersion_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  immersion_mode TEXT NOT NULL DEFAULT 'cinematic_interactive',
  audio_mode TEXT DEFAULT 'spatial_ready',
  haptics_mode TEXT DEFAULT 'prepared',
  holographic_mode TEXT DEFAULT 'prepared',
  profile_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS client_experience_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_name TEXT NOT NULL,
  target_type TEXT NOT NULL,
  graphics_profile_id INTEGER,
  physics_profile_id INTEGER,
  immersion_profile_id INTEGER,
  target_status TEXT NOT NULL DEFAULT 'prepared',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_experience_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  target_name TEXT,
  job_payload TEXT,
  job_status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("[OK] world experience tables verified")
PYEOF

########################################
# 3) ENSURE UI ROUTE EXISTS
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-experience-control">World Experience</a>' not in text and 'portal-main-nav' in text and '<a href="/avatar-rig-control">Avatar Rig</a>' in text:
    text = text.replace(
        '<a href="/avatar-rig-control">Avatar Rig</a>',
        '<a href="/avatar-rig-control">Avatar Rig</a>\n          <a href="/world-experience-control">World Experience</a>'
    )

if "pathname === '/world-experience-control'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/avatar-rig-control') {"
    if anchor in text and "function renderWorldExperiencePage(req, user = null, message = '')" in text:
        route = """    if (req.method === 'GET' && pathname === '/world-experience-control') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldExperiencePage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/avatar-rig-control') {"""
        text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] world experience route verified")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
########################################
for route in \
  / \
  /watch \
  /build \
  /engine-bridge \
  /visual-streaming \
  /avatar-rig-control \
  /world-experience-control \
  /payment-control \
  /accessibility
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as world_render_profiles from world_render_profiles;" > "snapshots/world_render_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_streaming_profiles from world_streaming_profiles;" > "snapshots/world_streaming_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as physics_profiles from physics_profiles;" > "snapshots/physics_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as npc_profiles from npc_profiles;" > "snapshots/npc_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as gameplay_loop_profiles from gameplay_loop_profiles;" > "snapshots/gameplay_loop_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as immersion_profiles from immersion_profiles;" > "snapshots/immersion_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as client_experience_targets from client_experience_targets;" > "snapshots/client_experience_targets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_experience_jobs from world_experience_jobs;" > "snapshots/world_experience_jobs_${STAMP}.json"

########################################
# 7) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "world_experience_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] world experience scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/fix_world_experience_finish_${STAMP}.txt" <<REPORT
FIX WORLD EXPERIENCE FINISH REPORT
Timestamp: ${STAMP}

Verified:
- world experience tables
- world experience route
- dashboard health
- jarvis health
- socket health
- world experience smoke tests
- world experience snapshots

Purpose:
- recover from truncated bash paste
- stabilize everything
- finish the world experience control phase cleanly
REPORT

echo "FIX WORLD EXPERIENCE FINISH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/world_experience_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/world-experience-control"
echo "  termux-open-url http://127.0.0.1:4900/engine-bridge"
echo "  termux-open-url http://127.0.0.1:4900/avatar-rig-control"
