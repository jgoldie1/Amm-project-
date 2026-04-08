#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MISSION PERSISTENCE SMALL PATCH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_mission_persistence_${STAMP}.js"
cp db/aam.db "backups/aam_mission_persistence_${STAMP}.db"

########################################
# 2) DATABASE VERIFY
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS player_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  player_role TEXT DEFAULT 'explorer',
  current_level INTEGER DEFAULT 1,
  xp_points INTEGER DEFAULT 0,
  profile_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS player_mission_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  mission_name TEXT NOT NULL,
  mission_type TEXT DEFAULT 'explore',
  progress_status TEXT DEFAULT 'available',
  progress_percent INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS player_unlocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  unlock_code TEXT NOT NULL,
  unlock_label TEXT NOT NULL,
  unlock_route TEXT DEFAULT '/world-experience-control',
  unlock_status TEXT DEFAULT 'granted',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS gameplay_event_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER,
  event_type TEXT NOT NULL,
  event_subject TEXT,
  event_payload TEXT,
  event_status TEXT DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

count = cur.execute("SELECT count(*) FROM player_profiles").fetchone()[0]
if count == 0:
    cur.execute("""
    INSERT INTO player_profiles (player_name, player_role, current_level, xp_points, profile_status)
    VALUES ('Primary Explorer', 'founder', 1, 0, 'active')
    """)

player_id = cur.execute("SELECT id FROM player_profiles ORDER BY id LIMIT 1").fetchone()[0]

missions = [
    ("Explore the Marketplace Hub", "explore"),
    ("Visit the Creator Stage", "creator"),
    ("Enter the World Gate", "engine"),
    ("Meet NPC Alpha", "accessibility"),
    ("Meet NPC Beta", "avatar"),
    ("Claim Property Route", "property"),
    ("Expand the City Network", "city")
]

for mission_name, mission_type in missions:
    exists = cur.execute(
        "SELECT count(*) FROM player_mission_progress WHERE player_id=? AND mission_name=?",
        (player_id, mission_name)
    ).fetchone()[0]
    if not exists:
        cur.execute("""
        INSERT INTO player_mission_progress
        (player_id, mission_name, mission_type, progress_status, progress_percent)
        VALUES (?, ?, ?, 'available', 0)
        """, (player_id, mission_name, mission_type))

conn.commit()
conn.close()
print("[OK] mission persistence tables verified")
PYEOF

########################################
# 3) PATCH DASHBOARD API ONLY
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function normalizeMissionUnlock(meta) {
  const map = {
    'Explore the Marketplace Hub': ['connect_unlock', 'Marketplace Access', '/connect-system'],
    'Visit the Creator Stage': ['watch_unlock', 'Creator Access', '/watch'],
    'Enter the World Gate': ['engine_unlock', 'Engine Access', '/engine-bridge'],
    'Meet NPC Alpha': ['accessibility_unlock', 'Accessibility Access', '/accessibility'],
    'Meet NPC Beta': ['avatar_unlock', 'Avatar Access', '/avatar-rig-control'],
    'Claim Property Route': ['property_unlock', 'Property Access', '/property-market'],
    'Expand the City Network': ['city_unlock', 'City Access', '/realworld-city-registry']
  };
  return map[meta] || ['world_unlock', meta || 'World Access', '/world-experience-control'];
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function normalizeMissionUnlock(meta)" not in text and server_marker in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

api_route = """
    if (req.method === 'POST' && pathname === '/api/mission-complete') {
      const body = await parseBody(req);
      const missionName = String(body.mission_name || '').trim();
      const playerRows = dbQuery(`SELECT id, xp_points, current_level FROM player_profiles ORDER BY id LIMIT 1`);
      const playerId = playerRows.length ? Number(playerRows[0].id) : 0;

      if (!missionName || !playerId) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: 'missing mission or player' }));
      }

      dbRun(`
        UPDATE player_mission_progress
        SET progress_status='completed',
            progress_percent=100,
            completed_at=datetime('now')
        WHERE player_id=${playerId}
          AND mission_name='${q(missionName)}'
      `);

      dbRun(`
        UPDATE player_profiles
        SET xp_points=coalesce(xp_points,0)+100
        WHERE id=${playerId}
      `);

      const levelRows = dbQuery(`SELECT xp_points FROM player_profiles WHERE id=${playerId} LIMIT 1`);
      const xp = levelRows.length ? Number(levelRows[0].xp_points || 0) : 0;
      const newLevel = Math.max(1, Math.floor(xp / 300) + 1);
      dbRun(`UPDATE player_profiles SET current_level=${newLevel} WHERE id=${playerId}`);

      const unlockMeta = normalizeMissionUnlock(missionName);
      dbRun(`
        INSERT INTO player_unlocks (player_id, unlock_code, unlock_label, unlock_route, unlock_status)
        VALUES (${playerId}, '${q(unlockMeta[0])}', '${q(unlockMeta[1])}', '${q(unlockMeta[2])}', 'granted')
      `);

      dbRun(`
        INSERT INTO gameplay_event_log (player_id, event_type, event_subject, event_payload, event_status)
        VALUES (${playerId}, 'mission_completed', '${q(missionName)}', '${q(unlockMeta[0])}', 'processed')
      `);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        ok: true,
        mission_name: missionName,
        unlock_route: unlockMeta[2],
        xp_points: xp,
        current_level: newLevel
      }));
    }

"""

if "pathname === '/api/mission-complete'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/player-progress') {"
    if anchor in text:
        text = text.replace(anchor, api_route + "\n" + anchor, 1)
    else:
        fallback = "    if (req.method === 'GET' && pathname === '/gameplay-control') {"
        if fallback in text:
            text = text.replace(fallback, api_route + "\n" + fallback, 1)

p.write_text(text)
print("[OK] mission persistence API patch applied")
PYEOF

########################################
# 4) VERIFY / RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) ROUTE + API TEST
########################################
for route in \
  / \
  /world3d \
  /property-market \
  /gameplay-control \
  /player-progress
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

curl -s -i -X POST "http://127.0.0.1:4900/api/mission-complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "mission_name=Explore the Marketplace Hub" \
  > "test_results/api_mission_complete_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as player_profiles from player_profiles;" > "snapshots/player_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as player_mission_progress from player_mission_progress;" > "snapshots/player_mission_progress_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as player_unlocks from player_unlocks;" > "snapshots/player_unlocks_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as gameplay_event_log from gameplay_event_log;" > "snapshots/gameplay_event_log_${STAMP}.json"
sqlite3 -json db/aam.db "select id, mission_name, progress_status, progress_percent, completed_at from player_mission_progress order by id desc limit 20;" > "snapshots/player_mission_progress_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, unlock_code, unlock_label, unlock_route, unlock_status, created_at from player_unlocks order by id desc limit 20;" > "snapshots/player_unlocks_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, event_type, event_subject, event_payload, event_status, created_at from gameplay_event_log order by id desc limit 20;" > "snapshots/gameplay_event_log_tail_${STAMP}.json"

########################################
# 7) FRESH ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "no such column" in txt:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "missing mission or player" in txt:
        issues.append({"file": f.name, "problem": "mission_api_failed"})

Path.home().joinpath("aam_full_system","snapshots","mission_persistence_small_patch_latest.json").write_text(json.dumps(issues, indent=2))
print(f"[OK] mission persistence small patch scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/mission_persistence_small_patch_${STAMP}.txt" <<REPORT
MISSION PERSISTENCE SMALL PATCH REPORT
Timestamp: ${STAMP}

Added:
- mission completion API
- persistent mission writes
- unlock writes
- gameplay event writes

Purpose:
- add one real gameplay persistence step
- keep patch size small
- stabilize everything safely
REPORT

echo "MISSION PERSISTENCE SMALL PATCH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/mission_persistence_small_patch_latest.json"
echo "  cat snapshots/player_mission_progress_tail_${STAMP}.json"
echo "  cat snapshots/player_unlocks_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/player-progress"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
