#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== GAMEPLAY PROGRESSION LAYER + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_gameplay_progression_${STAMP}.js"
cp db/aam.db "backups/aam_gameplay_progression_${STAMP}.db"
cp public/world3d/index.html "backups/world3d_gameplay_progression_${STAMP}.html" 2>/dev/null || true

########################################
# 2) DATABASE SUPPORT
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

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
CREATE TABLE IF NOT EXISTS progression_unlock_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unlock_name TEXT NOT NULL,
  unlock_type TEXT DEFAULT 'route',
  unlock_target TEXT NOT NULL,
  unlock_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

profiles = [
    ("Jacobie", "heir", 250, 3, 4, "active"),
    ("Isaiah", "heir", 180, 2, 3, "active"),
    ("Aniyah", "heir", 180, 2, 3, "active"),
    ("Guest Explorer", "guest", 40, 1, 1, "active"),
]
for row in profiles:
    cur.execute("""
    INSERT INTO player_progress_profiles
    (player_name, player_type, xp_points, level_rank, zone_unlocked_count, profile_status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, row)

missions = [
    ("Jacobie", "Explore the Marketplace Hub", "explore", "completed", "access", "connect_unlock"),
    ("Jacobie", "Visit the Creator Stage", "creator", "completed", "access", "watch_unlock"),
    ("Isaiah", "Enter the World Gate", "engine", "completed", "access", "engine_unlock"),
    ("Aniyah", "Meet NPC Beta", "avatar", "completed", "access", "avatar_unlock"),
]
for row in missions:
    cur.execute("""
    INSERT INTO mission_completion_log
    (player_name, mission_name, mission_type, completion_status, reward_type, reward_value)
    VALUES (?, ?, ?, ?, ?, ?)
    """, row)

rewards = [
    ("Jacobie", "access", "connect_unlock", "claimed"),
    ("Jacobie", "access", "watch_unlock", "claimed"),
    ("Isaiah", "access", "engine_unlock", "claimed"),
    ("Aniyah", "access", "avatar_unlock", "claimed"),
]
for row in rewards:
    cur.execute("""
    INSERT INTO reward_claim_log
    (player_name, reward_type, reward_value, claim_status)
    VALUES (?, ?, ?, ?)
    """, row)

saves = [
    ("Jacobie", "Marketplace District", "Chicago", "Chicago Tower One", "Claim Property Route", "active"),
    ("Isaiah", "World Engine District", "Detroit", "Texas Innovation Center", "Enter the World Gate", "active"),
    ("Aniyah", "Creator District", "Atlanta", "Atlanta Creator Center", "Meet NPC Beta", "active"),
]
for row in saves:
    cur.execute("""
    INSERT INTO world_session_saves
    (player_name, current_zone, current_city, current_property, mission_focus, save_status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, row)

unlocks = [
    ("Marketplace Access", "route", "/connect-system", "active"),
    ("Creator Access", "route", "/watch", "active"),
    ("Engine Access", "route", "/engine-bridge", "active"),
    ("Accessibility Access", "route", "/accessibility", "active"),
    ("Avatar Access", "route", "/avatar-rig-control", "active"),
    ("Property Access", "route", "/property-market", "active"),
    ("City Registry Access", "route", "/realworld-city-registry", "active"),
]
for row in unlocks:
    cur.execute("""
    INSERT INTO progression_unlock_registry
    (unlock_name, unlock_type, unlock_target, unlock_status)
    VALUES (?, ?, ?, ?)
    """, row)

conn.commit()
conn.close()
print("[OK] gameplay progression tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderGameplayProgressionPage(req, user = null, message = '') {
  const players = dbQuery(`
    SELECT id, player_name, player_type, xp_points, level_rank, zone_unlocked_count, profile_status, created_at
    FROM player_progress_profiles
    ORDER BY xp_points DESC, level_rank DESC, id DESC
    LIMIT 100
  `);

  const missions = dbQuery(`
    SELECT id, player_name, mission_name, mission_type, completion_status, reward_type, reward_value, created_at
    FROM mission_completion_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const rewards = dbQuery(`
    SELECT id, player_name, reward_type, reward_value, claim_status, created_at
    FROM reward_claim_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const saves = dbQuery(`
    SELECT id, player_name, current_zone, current_city, current_property, mission_focus, save_status, created_at
    FROM world_session_saves
    ORDER BY id DESC
    LIMIT 200
  `);

  const unlocks = dbQuery(`
    SELECT id, unlock_name, unlock_type, unlock_target, unlock_status, created_at
    FROM progression_unlock_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const playerRows = players.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.player_type}</td><td>${r.xp_points}</td><td>${r.level_rank}</td><td>${r.zone_unlocked_count}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const missionRows = missions.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.mission_name}</td><td>${r.mission_type || ''}</td><td>${r.completion_status}</td><td>${r.reward_type || ''}</td><td>${r.reward_value || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const rewardRows = rewards.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.reward_type}</td><td>${r.reward_value || ''}</td><td>${r.claim_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const saveRows = saves.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.current_zone || ''}</td><td>${r.current_city || ''}</td><td>${r.current_property || ''}</td><td>${r.mission_focus || ''}</td><td>${r.save_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const unlockRows = unlocks.map(r => `<tr><td>${r.id}</td><td>${r.unlock_name}</td><td>${r.unlock_type}</td><td>${r.unlock_target}</td><td>${r.unlock_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Gameplay Progression', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="progression-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Persistent Gameplay Layer</div>
            <h1 id="progression-title">Gameplay Progression</h1>
            <p>This page adds persistent progression, mission completion, reward claims, save-state tracking, and unlock routing for the world shell.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/gameplay-progression" class="hero-primary-btn">Gameplay Progression</a>
              <a href="/gameplay-control" class="hero-secondary-btn">Gameplay Control</a>
              <a href="/world3d" class="hero-secondary-btn">Open World</a>
              <a href="/property-market" class="hero-secondary-btn">Property</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Player Progress', `<table aria-label="Player Progress"><thead><tr><th>ID</th><th>Player</th><th>Type</th><th>XP</th><th>Level</th><th>Zones</th><th>Status</th><th>Created</th></tr></thead><tbody>${playerRows || '<tr><td colspan="8">No players yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Mission Completion', `<table aria-label="Mission Completion"><thead><tr><th>ID</th><th>Player</th><th>Mission</th><th>Type</th><th>Status</th><th>Reward Type</th><th>Reward Value</th><th>Created</th></tr></thead><tbody>${missionRows || '<tr><td colspan="8">No mission completions yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Reward Claims', `<table aria-label="Reward Claims"><thead><tr><th>ID</th><th>Player</th><th>Reward Type</th><th>Reward Value</th><th>Status</th><th>Created</th></tr></thead><tbody>${rewardRows || '<tr><td colspan="6">No reward claims yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('World Session Saves', `<table aria-label="World Session Saves"><thead><tr><th>ID</th><th>Player</th><th>Zone</th><th>City</th><th>Property</th><th>Mission Focus</th><th>Status</th><th>Created</th></tr></thead><tbody>${saveRows || '<tr><td colspan="8">No session saves yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Unlock Registry', `<table aria-label="Unlock Registry"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${unlockRows || '<tr><td colspan="6">No unlocks yet.</td></tr>'}</tbody></table>`) : ''}
      </main>
    </div>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderGameplayProgressionPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

if '<a href="/gameplay-progression">Progression</a>' not in text and '<a href="/gameplay-control">Gameplay</a>' in text:
    text = text.replace(
        '<a href="/gameplay-control">Gameplay</a>',
        '<a href="/gameplay-control">Gameplay</a>\n          <a href="/gameplay-progression">Progression</a>',
        1
    )

route_block = """
    if (req.method === 'GET' && pathname === '/gameplay-progression') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderGameplayProgressionPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/gameplay-progression'" not in text:
    route_anchor = "    if (req.method === 'GET' && pathname === '/gameplay-control') {"
    if route_anchor in text:
        text = text.replace(route_anchor, route_block + "\n" + route_anchor, 1)

p.write_text(text)
print("[OK] gameplay progression route patch applied")
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
  /gameplay-progression \
  /gameplay-control \
  /property-market \
  /realworld \
  /realworld-city-registry \
  /world3d \
  /engine-bridge \
  /watch \
  /connect-system \
  /avatar-rig-control
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as player_progress_profiles from player_progress_profiles;" > "snapshots/player_progress_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as mission_completion_log from mission_completion_log;" > "snapshots/mission_completion_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as reward_claim_log from reward_claim_log;" > "snapshots/reward_claim_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_session_saves from world_session_saves;" > "snapshots/world_session_saves_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as progression_unlock_registry from progression_unlock_registry;" > "snapshots/progression_unlock_registry_${STAMP}.json"

########################################
# 7) FRESH-ONLY ERROR SCAN
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
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "gameplay_progression_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] gameplay progression scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/gameplay_progression_layer_and_stabilize_${STAMP}.txt" <<REPORT
GAMEPLAY PROGRESSION LAYER + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- player_progress_profiles
- mission_completion_log
- reward_claim_log
- world_session_saves
- progression_unlock_registry
- gameplay-progression route

Purpose:
- add persistent player progression
- connect mission completion to rewards
- add world-state save scaffolding
- move the gameplay shell toward a real progression system
REPORT

echo "GAMEPLAY PROGRESSION LAYER + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/gameplay_progression_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/gameplay-progression"
echo "  termux-open-url http://127.0.0.1:4900/gameplay-control"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
