#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PLATFORM USAGE + HOLO GPT ANALYTICS + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_usage_hologpt_${STAMP}.js"
cp db/aam.db "backups/aam_usage_hologpt_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS platform_user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  session_type TEXT DEFAULT 'web',
  territory_name TEXT DEFAULT 'global',
  world_name TEXT DEFAULT 'present_world',
  session_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS platform_user_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  route_name TEXT,
  activity_type TEXT,
  territory_name TEXT DEFAULT 'global',
  world_name TEXT DEFAULT 'present_world',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS platform_usage_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT,
  metric_value INTEGER DEFAULT 0,
  metric_scope TEXT DEFAULT 'global',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holo_gpt_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  interface_mode TEXT DEFAULT 'holographic_assistant',
  session_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holo_gpt_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  event_type TEXT,
  event_payload TEXT,
  event_status TEXT DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holoverse_presence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  territory_name TEXT DEFAULT 'global',
  world_name TEXT DEFAULT 'present_world',
  presence_type TEXT DEFAULT 'viewer',
  presence_status TEXT DEFAULT 'online',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM platform_user_sessions").fetchone()[0] == 0:
    sessions = [
        ("Jacobie", "web", "Georgia", "present_world", "active"),
        ("Aniyah", "web", "California", "present_world", "active"),
        ("Isaiah", "web", "Texas", "future_world", "active"),
        ("Guest Explorer", "web", "global", "present_world", "active"),
    ]
    cur.executemany("""
        INSERT INTO platform_user_sessions
        (username, session_type, territory_name, world_name, session_status)
        VALUES (?, ?, ?, ?, ?)
    """, sessions)

if cur.execute("SELECT count(*) FROM platform_user_activity").fetchone()[0] == 0:
    acts = [
        ("Jacobie", "/world3d", "visit", "Georgia", "present_world"),
        ("Aniyah", "/creator-marketplace", "visit", "California", "present_world"),
        ("Isaiah", "/world-selector", "visit", "Texas", "future_world"),
        ("Guest Explorer", "/realworld", "visit", "global", "present_world"),
        ("Jacobie", "/revenue-engine", "visit", "Georgia", "present_world"),
    ]
    cur.executemany("""
        INSERT INTO platform_user_activity
        (username, route_name, activity_type, territory_name, world_name)
        VALUES (?, ?, ?, ?, ?)
    """, acts)

if cur.execute("SELECT count(*) FROM holo_gpt_sessions").fetchone()[0] == 0:
    rows = [
        ("Jacobie", "holographic_assistant", "active"),
        ("Aniyah", "voice_assistant", "active"),
    ]
    cur.executemany("""
        INSERT INTO holo_gpt_sessions
        (username, interface_mode, session_status)
        VALUES (?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM holo_gpt_events").fetchone()[0] == 0:
    rows = [
        ("Jacobie", "voice_query", "open world analytics", "processed"),
        ("Aniyah", "assistant_prompt", "show creator sales", "processed"),
    ]
    cur.executemany("""
        INSERT INTO holo_gpt_events
        (username, event_type, event_payload, event_status)
        VALUES (?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM holoverse_presence").fetchone()[0] == 0:
    rows = [
        ("Jacobie", "Georgia", "present_world", "builder", "online"),
        ("Aniyah", "California", "present_world", "creator", "online"),
        ("Isaiah", "Texas", "future_world", "explorer", "online"),
    ]
    cur.executemany("""
        INSERT INTO holoverse_presence
        (username, territory_name, world_name, presence_type, presence_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

cur.execute("DELETE FROM platform_usage_metrics")

metrics = [
    ("total_sessions", cur.execute("SELECT count(*) FROM platform_user_sessions").fetchone()[0], "global"),
    ("total_activity_events", cur.execute("SELECT count(*) FROM platform_user_activity").fetchone()[0], "global"),
    ("total_holo_gpt_sessions", cur.execute("SELECT count(*) FROM holo_gpt_sessions").fetchone()[0], "global"),
    ("total_holoverse_presence", cur.execute("SELECT count(*) FROM holoverse_presence").fetchone()[0], "global"),
]
cur.executemany("""
    INSERT INTO platform_usage_metrics
    (metric_name, metric_value, metric_scope)
    VALUES (?, ?, ?)
""", metrics)

conn.commit()
conn.close()
print("[OK] platform usage + holo gpt analytics tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderPlatformAnalyticsPage(req, user = null, message = '') {
  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM platform_usage_metrics
    ORDER BY id DESC
    LIMIT 100
  `);

  const sessions = dbQuery(`
    SELECT id, username, session_type, territory_name, world_name, session_status, created_at
    FROM platform_user_sessions
    ORDER BY id DESC
    LIMIT 200
  `);

  const activity = dbQuery(`
    SELECT id, username, route_name, activity_type, territory_name, world_name, created_at
    FROM platform_user_activity
    ORDER BY id DESC
    LIMIT 200
  `);

  const presence = dbQuery(`
    SELECT id, username, territory_name, world_name, presence_type, presence_status, created_at
    FROM holoverse_presence
    ORDER BY id DESC
    LIMIT 200
  `);

  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.session_type}</td><td>${r.territory_name}</td><td>${r.world_name}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const activityRows = activity.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.route_name || ''}</td><td>${r.activity_type}</td><td>${r.territory_name}</td><td>${r.world_name}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const presenceRows = presence.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.territory_name}</td><td>${r.world_name}</td><td>${r.presence_type}</td><td>${r.presence_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Platform Analytics', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="platform-analytics-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Usage Intelligence</div>
            <h1 id="platform-analytics-title">Platform Analytics</h1>
            <p>Track sessions, activity, usage metrics, and holoverse presence across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Usage Metrics"><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No metrics yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="User Sessions"><thead><tr><th>ID</th><th>User</th><th>Type</th><th>Territory</th><th>World</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="7">No sessions yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="User Activity"><thead><tr><th>ID</th><th>User</th><th>Route</th><th>Type</th><th>Territory</th><th>World</th><th>Created</th></tr></thead><tbody>${activityRows || '<tr><td colspan="7">No activity yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Holoverse Presence"><thead><tr><th>ID</th><th>User</th><th>Territory</th><th>World</th><th>Presence</th><th>Status</th><th>Created</th></tr></thead><tbody>${presenceRows || '<tr><td colspan="7">No presence yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

helper2 = r"""
function renderHoloGptControlPage(req, user = null, message = '') {
  const sessions = dbQuery(`
    SELECT id, username, interface_mode, session_status, created_at
    FROM holo_gpt_sessions
    ORDER BY id DESC
    LIMIT 200
  `);

  const events = dbQuery(`
    SELECT id, username, event_type, event_payload, event_status, created_at
    FROM holo_gpt_events
    ORDER BY id DESC
    LIMIT 200
  `);

  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.interface_mode}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.event_type}</td><td>${r.event_payload || ''}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Holo GPT Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="hologpt-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Holoverse Assistant Layer</div>
            <h1 id="hologpt-title">Holo GPT Control</h1>
            <p>Track holographic assistant sessions, prompts, events, and interface usage.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Holo GPT Sessions"><thead><tr><th>ID</th><th>User</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="5">No holo sessions yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Holo GPT Events"><thead><tr><th>ID</th><th>User</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="6">No holo events yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderPlatformAnalyticsPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper1 + "\n" + helper2 + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/platform-analytics">Analytics</a>' not in text and '<a href="/world-era-mobility">World Era</a>' in text:
    text = text.replace(
        '<a href="/world-era-mobility">World Era</a>',
        '<a href="/world-era-mobility">World Era</a>\n          <a href="/platform-analytics">Analytics</a>\n          <a href="/holo-gpt-control">Holo GPT</a>',
        1
    )

route1 = """
    if (req.method === 'GET' && pathname === '/platform-analytics') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPlatformAnalyticsPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

route2 = """
    if (req.method === 'GET' && pathname === '/holo-gpt-control') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHoloGptControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/platform-analytics'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/world-era-mobility') {"
    if anchor in text:
        text = text.replace(anchor, route1 + "\n" + route2 + "\n" + anchor, 1)

p.write_text(text)
print("[OK] platform analytics + holo gpt routes ready")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
########################################
for route in \
  / \
  /platform-analytics \
  /holo-gpt-control \
  /revenue-engine \
  /world-era-mobility \
  /territory-bridge \
  /world-selector \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as platform_user_sessions from platform_user_sessions;" > "snapshots/platform_user_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as platform_user_activity from platform_user_activity;" > "snapshots/platform_user_activity_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as platform_usage_metrics from platform_usage_metrics;" > "snapshots/platform_usage_metrics_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holo_gpt_sessions from holo_gpt_sessions;" > "snapshots/holo_gpt_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holo_gpt_events from holo_gpt_events;" > "snapshots/holo_gpt_events_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holoverse_presence from holoverse_presence;" > "snapshots/holoverse_presence_${STAMP}.json"

sqlite3 -json db/aam.db "select id, username, session_type, territory_name, world_name, session_status, created_at from platform_user_sessions order by id desc limit 20;" > "snapshots/platform_user_sessions_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, username, route_name, activity_type, territory_name, world_name, created_at from platform_user_activity order by id desc limit 20;" > "snapshots/platform_user_activity_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, metric_name, metric_value, metric_scope, created_at from platform_usage_metrics order by id desc limit 20;" > "snapshots/platform_usage_metrics_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, username, interface_mode, session_status, created_at from holo_gpt_sessions order by id desc limit 20;" > "snapshots/holo_gpt_sessions_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, username, event_type, event_payload, event_status, created_at from holo_gpt_events order by id desc limit 20;" > "snapshots/holo_gpt_events_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, username, territory_name, world_name, presence_type, presence_status, created_at from holoverse_presence order by id desc limit 20;" > "snapshots/holoverse_presence_tail_${STAMP}.json"

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
    if "no such table" in lower:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "platform_usage_hologpt_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] platform usage + holo gpt scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/platform_usage_hologpt_analytics_and_stabilize_${STAMP}.txt" <<REPORT
PLATFORM USAGE + HOLO GPT ANALYTICS + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- platform_user_sessions
- platform_user_activity
- platform_usage_metrics
- holo_gpt_sessions
- holo_gpt_events
- holoverse_presence
- platform-analytics route
- holo-gpt-control route

Purpose:
- track how many users are using the platform
- track route/world/territory activity
- track holoverse and holo gpt usage
- stabilize analytics visibility
REPORT

echo "PLATFORM USAGE + HOLO GPT ANALYTICS + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/platform_usage_hologpt_scan_latest.json"
echo "  cat snapshots/platform_usage_metrics_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/platform-analytics"
echo "  termux-open-url http://127.0.0.1:4900/holo-gpt-control"
echo "  termux-open-url http://127.0.0.1:4900/revenue-engine"
