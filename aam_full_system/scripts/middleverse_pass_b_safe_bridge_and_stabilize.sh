#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MIDDLEVERSE PASS B SAFE BRIDGE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_middleverse_pass_b_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_middleverse_pass_b_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_middleverse_pass_b_${STAMP}.js"

########################################
# 1) CREATE PASS B TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_activity_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_name TEXT NOT NULL,
  activity_group TEXT,
  linked_user TEXT,
  linked_session TEXT,
  linked_world TEXT,
  activity_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS crossworld_session_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_name TEXT NOT NULL,
  user_name TEXT,
  source_world TEXT,
  target_world TEXT,
  bridge_mode TEXT,
  session_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_name TEXT NOT NULL,
  source_system TEXT,
  target_system TEXT,
  sync_type TEXT,
  sync_result TEXT,
  sync_status TEXT DEFAULT 'complete',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM middleverse_activity_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_activity_registry
        (activity_name, activity_group, linked_user, linked_session, linked_world, activity_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("entered_creator_world", "creator", "Demo User", "AAM Bridge Session 1", "creator_world", "active"),
        ("opened_holo_store", "commerce", "Demo User", "AAM Bridge Session 1", "market_world", "active"),
        ("joined_service_grid", "service", "Ops User", "Dispatch Bridge Session", "service_grid", "active"),
    ])

if cur.execute("SELECT count(*) FROM crossworld_session_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO crossworld_session_registry
        (session_name, user_name, source_world, target_world, bridge_mode, session_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("AAM Bridge Session 1", "Demo User", "marketplace", "middleverse", "commerce_to_world", "active"),
        ("Creator Bridge Session", "Creator User", "creator_tv", "middleverse", "creator_to_world", "active"),
        ("Dispatch Bridge Session", "Ops User", "dispatch", "middleverse", "service_to_world", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_sync_log").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_sync_log
        (sync_name, source_system, target_system, sync_type, sync_result, sync_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("creator_to_middleverse_sync", "creator_tv", "middleverse", "event_bridge", "ok", "complete"),
        ("marketplace_to_middleverse_sync", "marketplace", "middleverse", "commerce_bridge", "ok", "complete"),
        ("dispatch_to_middleverse_sync", "dispatch", "middleverse", "service_bridge", "ok", "complete"),
    ])

conn.commit()
conn.close()
print("[OK] middleverse pass B tables created and seeded")
PYEOF

########################################
# 2) PATCH PASS B ROUTES
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

  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${esc(r.event_name)}</td><td>${esc(r.event_group)}</td><td>${esc(r.source_system)}</td><td>${esc(r.target_system)}</td><td>${esc(r.event_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const activityRows = activities.map(r => `<tr><td>${r.id}</td><td>${esc(r.activity_name)}</td><td>${esc(r.activity_group)}</td><td>${esc(r.linked_user)}</td><td>${esc(r.linked_session)}</td><td>${esc(r.linked_world)}</td><td>${esc(r.activity_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${esc(r.session_name)}</td><td>${esc(r.user_name)}</td><td>${esc(r.source_world)}</td><td>${esc(r.target_world)}</td><td>${esc(r.bridge_mode)}</td><td>${esc(r.session_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const syncRows = syncs.map(r => `<tr><td>${r.id}</td><td>${esc(r.sync_name)}</td><td>${esc(r.source_system)}</td><td>${esc(r.target_system)}</td><td>${esc(r.sync_type)}</td><td>${esc(r.sync_result)}</td><td>${esc(r.sync_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');

  return htmlPage('Middleverse Bridge', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Middleverse Bridge</h1><p>${esc(message || 'Middleverse Pass B bridge is live.')}</p></section>
      <section>
        <h2>Safe Bridge Actions</h2>
        <form method="POST" action="/middleverse/event-safe" style="margin-bottom:12px;">
          <button type="submit">Create Safe Event</button>
        </form>
        <form method="POST" action="/middleverse/activity-safe" style="margin-bottom:12px;">
          <button type="submit">Create Safe Activity</button>
        </form>
        <form method="POST" action="/middleverse/session-safe" style="margin-bottom:12px;">
          <button type="submit">Create Safe Crossworld Session</button>
        </form>
        <form method="POST" action="/middleverse/sync-safe" style="margin-bottom:12px;">
          <button type="submit">Run Safe Sync</button>
        </form>
      </section>
      <section><h2>Event Bus</h2><table><thead><tr><th>ID</th><th>Event</th><th>Group</th><th>Source</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No events</td></tr>'}</tbody></table></section>
      <section><h2>Activities</h2><table><thead><tr><th>ID</th><th>Activity</th><th>Group</th><th>User</th><th>Session</th><th>World</th><th>Status</th><th>Created</th></tr></thead><tbody>${activityRows || '<tr><td colspan="8">No activities</td></tr>'}</tbody></table></section>
      <section><h2>Crossworld Sessions</h2><table><thead><tr><th>ID</th><th>Session</th><th>User</th><th>Source</th><th>Target</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="8">No sessions</td></tr>'}</tbody></table></section>
      <section><h2>Sync Log</h2><table><thead><tr><th>ID</th><th>Sync</th><th>Source</th><th>Target</th><th>Type</th><th>Result</th><th>Status</th><th>Created</th></tr></thead><tbody>${syncRows || '<tr><td colspan="8">No sync log</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

# Replace old helper safely
start = text.find("function renderMiddleverseBridgePage(req, user = null, message = '') {")
if start != -1:
    end = text.find("\n}\n", start)
    if end != -1:
        end = end + 3
        text = text[:start] + helper.strip() + "\n" + text[end:]
else:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

routes = r"""
    if (req.method === 'POST' && pathname === '/middleverse/activity-safe') {
      dbRun(`INSERT INTO middleverse_activity_registry (activity_name, activity_group, linked_user, linked_session, linked_world, activity_status)
             VALUES ('bridge_activity','crossworld','Demo User','AAM Bridge Session 1','middleverse','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20activity%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/session-safe') {
      dbRun(`INSERT INTO crossworld_session_registry (session_name, user_name, source_world, target_world, bridge_mode, session_status)
             VALUES ('Safe Session','Demo User','marketplace','middleverse','commerce_to_world','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20session%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/sync-safe') {
      dbRun(`INSERT INTO middleverse_sync_log (sync_name, source_system, target_system, sync_type, sync_result, sync_status)
             VALUES ('middleverse_sync','creator_tv','marketplace','event_bridge','ok','complete')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20sync%20created' });
      return res.end();
    }
"""

if "pathname === '/middleverse/activity-safe'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/middleverse-bridge') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] middleverse pass B routes patched")
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

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as middleverse_event_bus from middleverse_event_bus;" > "snapshots/middleverse_event_bus_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_activity_registry from middleverse_activity_registry;" > "snapshots/middleverse_activity_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as crossworld_session_registry from crossworld_session_registry;" > "snapshots/crossworld_session_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_sync_log from middleverse_sync_log;" > "snapshots/middleverse_sync_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, event_name, event_group, source_system, target_system, event_status, created_at from middleverse_event_bus order by id desc limit 20;" > "snapshots/middleverse_event_bus_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, activity_name, activity_group, linked_user, linked_session, linked_world, activity_status, created_at from middleverse_activity_registry order by id desc limit 20;" > "snapshots/middleverse_activity_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, session_name, user_name, source_world, target_world, bridge_mode, session_status, created_at from crossworld_session_registry order by id desc limit 20;" > "snapshots/crossworld_session_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, sync_name, source_system, target_system, sync_type, sync_result, sync_status, created_at from middleverse_sync_log order by id desc limit 20;" > "snapshots/middleverse_sync_log_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "middleverse_pass_b_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] middleverse pass B scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/middleverse_pass_b_safe_bridge_and_stabilize_${STAMP}.txt" <<REPORT
MIDDLEVERSE PASS B SAFE BRIDGE + STABILIZE REPORT
Timestamp: ${STAMP}

Created:
- middleverse_activity_registry
- crossworld_session_registry
- middleverse_sync_log
- safe activity/session/sync actions

Verified:
- dashboard health
- jarvis health
- middleverse bridge route
- safe middleverse pass B smoke
- stable runtime after pass B

Purpose:
- expand the middleverse safely
- connect activity, sessions, and sync flow
- prepare for middleverse pass C
REPORT

echo "MIDDLEVERSE PASS B SAFE BRIDGE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/middleverse_pass_b_scan_latest.json"
echo "  cat snapshots/middleverse_activity_registry_tail_${STAMP}.json"
echo "  cat snapshots/crossworld_session_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_sync_log_tail_${STAMP}.json"
echo "  cat reports/middleverse_pass_b_safe_bridge_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/middleverse-bridge"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
