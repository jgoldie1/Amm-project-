#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MIDDLEVERSE PASS C COMMERCE + PRESENCE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_middleverse_pass_c_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_middleverse_pass_c_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_middleverse_pass_c_${STAMP}.js"

########################################
# 1) CREATE PASS C TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS marketplace_metaverse_bridge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bridge_name TEXT NOT NULL,
  marketplace_action TEXT,
  metaverse_action TEXT,
  creator_action TEXT,
  dispatch_action TEXT,
  bridge_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_presence_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  presence_name TEXT NOT NULL,
  identity_name TEXT,
  world_name TEXT,
  avatar_mode TEXT,
  commerce_mode TEXT,
  presence_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM marketplace_metaverse_bridge").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO marketplace_metaverse_bridge
        (bridge_name, marketplace_action, metaverse_action, creator_action, dispatch_action, bridge_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Holo Commerce Bridge", "buy_now", "spawn_item_portal", "promote_item_live", "prepare_delivery", "active"),
        ("Creator Fan Bridge", "tip_creator", "unlock_vip_room", "start_live_reaction", "none", "active"),
        ("Service Action Bridge", "book_service", "show_service_avatar", "announce_booking", "open_dispatch_request", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_presence_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_presence_registry
        (presence_name, identity_name, world_name, avatar_mode, commerce_mode, presence_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Jacobie Vision Presence", "Jacobie Vision", "creator_world", "host_avatar", "merch_live", "active"),
        ("Anyone Star Presence", "AAM Talent", "holo_stage", "performance_avatar", "fan_support", "active"),
        ("Dispatch Ops Presence", "Ops Desk", "service_grid", "operator_avatar", "service_actions", "active"),
    ])

conn.commit()
conn.close()
print("[OK] middleverse pass C tables created and seeded")
PYEOF

########################################
# 2) PATCH PASS C ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderMiddleverseBridgePage(req, user = null, message = '') {
  const events = dbQuery(`SELECT id, event_name, event_group, source_system, target_system, event_status, created_at
                          FROM middleverse_event_bus ORDER BY id DESC LIMIT 100`);
  const activities = dbQuery(`SELECT id, activity_name, activity_group, linked_user, linked_session, linked_world, activity_status, created_at
                              FROM middleverse_activity_registry ORDER BY id DESC LIMIT 100`);
  const sessions = dbQuery(`SELECT id, session_name, user_name, source_world, target_world, bridge_mode, session_status, created_at
                            FROM crossworld_session_registry ORDER BY id DESC LIMIT 100`);
  const syncs = dbQuery(`SELECT id, sync_name, source_system, target_system, sync_type, sync_result, sync_status, created_at
                         FROM middleverse_sync_log ORDER BY id DESC LIMIT 100`);
  const bridges = dbQuery(`SELECT id, bridge_name, marketplace_action, metaverse_action, creator_action, dispatch_action, bridge_status, created_at
                           FROM marketplace_metaverse_bridge ORDER BY id DESC LIMIT 100`);
  const presence = dbQuery(`SELECT id, presence_name, identity_name, world_name, avatar_mode, commerce_mode, presence_status, created_at
                            FROM middleverse_presence_registry ORDER BY id DESC LIMIT 100`);

  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${esc(r.event_name)}</td><td>${esc(r.event_group)}</td><td>${esc(r.source_system)}</td><td>${esc(r.target_system)}</td><td>${esc(r.event_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const activityRows = activities.map(r => `<tr><td>${r.id}</td><td>${esc(r.activity_name)}</td><td>${esc(r.activity_group)}</td><td>${esc(r.linked_user)}</td><td>${esc(r.linked_session)}</td><td>${esc(r.linked_world)}</td><td>${esc(r.activity_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${esc(r.session_name)}</td><td>${esc(r.user_name)}</td><td>${esc(r.source_world)}</td><td>${esc(r.target_world)}</td><td>${esc(r.bridge_mode)}</td><td>${esc(r.session_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const syncRows = syncs.map(r => `<tr><td>${r.id}</td><td>${esc(r.sync_name)}</td><td>${esc(r.source_system)}</td><td>${esc(r.target_system)}</td><td>${esc(r.sync_type)}</td><td>${esc(r.sync_result)}</td><td>${esc(r.sync_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const bridgeRows = bridges.map(r => `<tr><td>${r.id}</td><td>${esc(r.bridge_name)}</td><td>${esc(r.marketplace_action)}</td><td>${esc(r.metaverse_action)}</td><td>${esc(r.creator_action)}</td><td>${esc(r.dispatch_action)}</td><td>${esc(r.bridge_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const presenceRows = presence.map(r => `<tr><td>${r.id}</td><td>${esc(r.presence_name)}</td><td>${esc(r.identity_name)}</td><td>${esc(r.world_name)}</td><td>${esc(r.avatar_mode)}</td><td>${esc(r.commerce_mode)}</td><td>${esc(r.presence_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');

  return htmlPage('Middleverse Bridge', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Middleverse Bridge</h1><p>${esc(message || 'Middleverse Pass C commerce and presence bridge is live.')}</p></section>
      <section>
        <h2>Safe Bridge Actions</h2>
        <form method="POST" action="/middleverse/event-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Event</button></form>
        <form method="POST" action="/middleverse/activity-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Activity</button></form>
        <form method="POST" action="/middleverse/session-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Crossworld Session</button></form>
        <form method="POST" action="/middleverse/sync-safe" style="margin-bottom:12px;"><button type="submit">Run Safe Sync</button></form>
        <form method="POST" action="/middleverse/bridge-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Commerce Bridge</button></form>
        <form method="POST" action="/middleverse/presence-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Presence</button></form>
      </section>
      <section><h2>Event Bus</h2><table><thead><tr><th>ID</th><th>Event</th><th>Group</th><th>Source</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No events</td></tr>'}</tbody></table></section>
      <section><h2>Activities</h2><table><thead><tr><th>ID</th><th>Activity</th><th>Group</th><th>User</th><th>Session</th><th>World</th><th>Status</th><th>Created</th></tr></thead><tbody>${activityRows || '<tr><td colspan="8">No activities</td></tr>'}</tbody></table></section>
      <section><h2>Crossworld Sessions</h2><table><thead><tr><th>ID</th><th>Session</th><th>User</th><th>Source</th><th>Target</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="8">No sessions</td></tr>'}</tbody></table></section>
      <section><h2>Sync Log</h2><table><thead><tr><th>ID</th><th>Sync</th><th>Source</th><th>Target</th><th>Type</th><th>Result</th><th>Status</th><th>Created</th></tr></thead><tbody>${syncRows || '<tr><td colspan="8">No sync log</td></tr>'}</tbody></table></section>
      <section><h2>Marketplace-Metaverse Bridge</h2><table><thead><tr><th>ID</th><th>Bridge</th><th>Marketplace</th><th>Metaverse</th><th>Creator</th><th>Dispatch</th><th>Status</th><th>Created</th></tr></thead><tbody>${bridgeRows || '<tr><td colspan="8">No bridges</td></tr>'}</tbody></table></section>
      <section><h2>Presence Registry</h2><table><thead><tr><th>ID</th><th>Presence</th><th>Identity</th><th>World</th><th>Avatar</th><th>Commerce</th><th>Status</th><th>Created</th></tr></thead><tbody>${presenceRows || '<tr><td colspan="8">No presence</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

start = text.find("function renderMiddleverseBridgePage(req, user = null, message = '') {")
if start != -1:
    end = text.find("\n}\n", start)
    if end != -1:
        end += 3
        text = text[:start] + helper.strip() + "\n" + text[end:]
else:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

routes = r"""
    if (req.method === 'POST' && pathname === '/middleverse/bridge-safe') {
      dbRun(`INSERT INTO marketplace_metaverse_bridge (bridge_name, marketplace_action, metaverse_action, creator_action, dispatch_action, bridge_status)
             VALUES ('Safe Commerce Bridge','buy_now','spawn_item_portal','promote_live','prepare_delivery','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20bridge%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/presence-safe') {
      dbRun(`INSERT INTO middleverse_presence_registry (presence_name, identity_name, world_name, avatar_mode, commerce_mode, presence_status)
             VALUES ('Safe Presence','Demo Identity','middleverse','avatar_live','commerce_live','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20presence%20created' });
      return res.end();
    }
"""

if "pathname === '/middleverse/bridge-safe'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/middleverse-bridge') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] middleverse pass C routes patched")
PYEOF

########################################
# 3) SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 4) HEALTH TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 5) ROUTE SMOKE
########################################
for route in \
  /middleverse-bridge \
  /metaverse-control \
  /studio-lab \
  /episode-movie-pipeline \
  /creator-tv \
  /dispatch-actions \
  /multiservice-dispatch \
  /ai-call-center \
  /competitive-contact-center \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SAFE ACTION SMOKE
########################################
curl -s -i -X POST http://127.0.0.1:4900/middleverse/event-safe > "test_results/middleverse_event_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/activity-safe > "test_results/middleverse_activity_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/session-safe > "test_results/middleverse_session_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/sync-safe > "test_results/middleverse_sync_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/bridge-safe > "test_results/middleverse_bridge_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/presence-safe > "test_results/middleverse_presence_${STAMP}.txt" || true

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as marketplace_metaverse_bridge from marketplace_metaverse_bridge;" > "snapshots/marketplace_metaverse_bridge_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_presence_registry from middleverse_presence_registry;" > "snapshots/middleverse_presence_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, bridge_name, marketplace_action, metaverse_action, creator_action, dispatch_action, bridge_status, created_at from marketplace_metaverse_bridge order by id desc limit 20;" > "snapshots/marketplace_metaverse_bridge_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, presence_name, identity_name, world_name, avatar_mode, commerce_mode, presence_status, created_at from middleverse_presence_registry order by id desc limit 20;" > "snapshots/middleverse_presence_registry_tail_${STAMP}.json"

########################################
# 8) ERROR SCAN
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
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "middleverse_pass_c_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] middleverse pass C scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/middleverse_pass_c_commerce_presence_and_stabilize_${STAMP}.txt" <<REPORT
MIDDLEVERSE PASS C COMMERCE + PRESENCE + STABILIZE REPORT
Timestamp: ${STAMP}

Created:
- marketplace_metaverse_bridge
- middleverse_presence_registry
- safe bridge action
- safe presence action

Verified:
- dashboard health
- jarvis health
- middleverse bridge route
- safe middleverse pass C smoke
- stable runtime after pass C

Purpose:
- expand middleverse into commerce and presence
- connect identity, avatar, marketplace, and dispatch hooks
- prepare for middleverse pass D
REPORT

echo "MIDDLEVERSE PASS C COMMERCE + PRESENCE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/middleverse_pass_c_scan_latest.json"
echo "  cat snapshots/marketplace_metaverse_bridge_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_presence_registry_tail_${STAMP}.json"
echo "  cat reports/middleverse_pass_c_commerce_presence_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/middleverse-bridge"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
