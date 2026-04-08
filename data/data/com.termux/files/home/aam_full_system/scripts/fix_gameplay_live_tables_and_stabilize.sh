#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX GAMEPLAY LIVE TABLES + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_fix_gameplay_live_tables_${STAMP}.js"
cp db/aam.db "backups/aam_fix_gameplay_live_tables_${STAMP}.db"

########################################
# 2) CREATE / REPAIR GAMEPLAY TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS world_interaction_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_subject TEXT,
  event_payload TEXT,
  event_status TEXT DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_mission_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_name TEXT NOT NULL,
  mission_type TEXT DEFAULT 'explore',
  reward_type TEXT DEFAULT 'access',
  reward_value TEXT DEFAULT 'world_unlock',
  mission_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS player_progress_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  player_type TEXT DEFAULT 'heir',
  xp_points INTEGER DEFAULT 0,
  level_rank INTEGER DEFAULT 1,
  zone_unlocked_count INTEGER DEFAULT 0,
  profile_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS mission_completion_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  mission_type TEXT,
  completion_status TEXT DEFAULT 'completed',
  reward_type TEXT,
  reward_value TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS reward_claim_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value TEXT,
  claim_status TEXT DEFAULT 'claimed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_session_saves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  current_zone TEXT,
  current_city TEXT,
  current_property TEXT,
  mission_focus TEXT,
  save_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS player_property_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  parcel_name TEXT,
  building_name TEXT,
  claim_type TEXT DEFAULT 'reserved',
  claim_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS city_progress_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  city_name TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_type TEXT DEFAULT 'explorer',
  badge_status TEXT DEFAULT 'earned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

mission_count = cur.execute("SELECT count(*) FROM world_mission_profiles").fetchone()[0]
if mission_count == 0:
    rows = [
        ("Explore the Marketplace Hub", "explore", "access", "connect_unlock", "active"),
        ("Visit the Creator Stage", "creator", "access", "watch_unlock", "active"),
        ("Enter the World Gate", "engine", "access", "engine_unlock", "active"),
        ("Meet NPC Alpha", "accessibility", "access", "accessibility_unlock", "active"),
        ("Meet NPC Beta", "avatar", "access", "avatar_unlock", "active"),
        ("Claim Property Route", "property", "listing", "property_unlock", "active"),
    ]
    for row in rows:
        cur.execute("""
        INSERT INTO world_mission_profiles
        (mission_name, mission_type, reward_type, reward_value, mission_status)
        VALUES (?, ?, ?, ?, ?)
        """, row)

progress_count = cur.execute("SELECT count(*) FROM player_progress_profiles").fetchone()[0]
if progress_count == 0:
    rows = [
        ("Jacobie", "heir", 250, 3, 4, "active"),
        ("Isaiah", "heir", 180, 2, 3, "active"),
        ("Aniyah", "heir", 180, 2, 3, "active"),
        ("Guest Explorer", "guest", 40, 1, 1, "active"),
    ]
    for row in rows:
        cur.execute("""
        INSERT INTO player_progress_profiles
        (player_name, player_type, xp_points, level_rank, zone_unlocked_count, profile_status)
        VALUES (?, ?, ?, ?, ?, ?)
        """, row)

conn.commit()
conn.close()
print("[OK] gameplay live tables repaired")
PYEOF

########################################
# 3) VERIFY / RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 4) LIVE ACTION RETEST
########################################
curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/mission-complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&mission_id=1" \
  > "test_results/gameplay_mission_complete_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/reward-claim" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&reward_type=access&reward_value=world_unlock" \
  > "test_results/gameplay_reward_claim_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/property-claim" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&building_name=Chicago Tower One" \
  > "test_results/gameplay_property_claim_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/city-badge" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&city_name=Chicago" \
  > "test_results/gameplay_city_badge_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/save-session" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&current_zone=Marketplace District&current_city=Chicago&current_property=Chicago Tower One&mission_focus=Claim Property Route" \
  > "test_results/gameplay_save_session_${STAMP}.txt" || true

for route in \
  /gameplay-live-actions \
  /gameplay-assets \
  /gameplay-progression \
  /gameplay-control \
  /property-market \
  /realworld \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as world_interaction_events from world_interaction_events;" > "snapshots/world_interaction_events_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as mission_completion_log from mission_completion_log;" > "snapshots/mission_completion_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as reward_claim_log from reward_claim_log;" > "snapshots/reward_claim_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as player_property_claims from player_property_claims;" > "snapshots/player_property_claims_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as city_progress_badges from city_progress_badges;" > "snapshots/city_progress_badges_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_session_saves from world_session_saves;" > "snapshots/world_session_saves_${STAMP}.json"

########################################
# 6) FRESH-ONLY ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such table" in lower:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "gameplay_live_actions_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] gameplay live actions scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/fix_gameplay_live_tables_and_stabilize_${STAMP}.txt" <<REPORT
FIX GAMEPLAY LIVE TABLES + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- created missing world_interaction_events
- repaired required gameplay live tables
- retested live gameplay action routes

Purpose:
- stabilize gameplay live actions
- restore real gameplay logging
- prepare for the next dual-world expansion phase
REPORT

echo "FIX GAMEPLAY LIVE TABLES + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/gameplay_live_actions_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/gameplay-live-actions"
echo "  termux-open-url http://127.0.0.1:4900/gameplay-assets"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
