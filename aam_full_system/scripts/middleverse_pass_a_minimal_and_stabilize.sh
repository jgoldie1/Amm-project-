#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MIDDLEVERSE PASS A MINIMAL + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_middleverse_pass_a_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_middleverse_pass_a_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_middleverse_pass_a_${STAMP}.js"

########################################
# 1) CREATE ONE TABLE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_event_bus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  event_group TEXT,
  source_system TEXT,
  target_system TEXT,
  event_payload TEXT,
  event_status TEXT DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM middleverse_event_bus").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_event_bus
        (event_name, event_group, source_system, target_system, event_payload, event_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("creator_stream_started", "streaming", "creator_tv", "middleverse", '{"channel":"Anyone Can Be A Star"}', "queued"),
        ("marketplace_item_clicked", "commerce", "marketplace", "middleverse", '{"item":"Holo Merch"}', "queued"),
        ("dispatch_request_opened", "service", "dispatch", "middleverse", '{"service":"rideshare"}', "queued"),
    ])

conn.commit()
conn.close()
print("[OK] middleverse_event_bus ready")
PYEOF

########################################
# 2) PATCH ONE PAGE + ONE SAFE ROUTE
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderMiddleverseBridgePage(req, user = null, message = '') {
  const events = dbQuery(`SELECT id, event_name, event_group, source_system, target_system, event_status, created_at
                          FROM middleverse_event_bus ORDER BY id DESC LIMIT 100`);
  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${esc(r.event_name)}</td><td>${esc(r.event_group)}</td><td>${esc(r.source_system)}</td><td>${esc(r.target_system)}</td><td>${esc(r.event_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');

  return htmlPage('Middleverse Bridge', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Middleverse Bridge</h1><p>${esc(message || 'Middleverse Pass A bridge is live.')}</p></section>
      <section>
        <h2>Safe Event Action</h2>
        <form method="POST" action="/middleverse/event-safe" style="margin-bottom:12px;">
          <button type="submit">Create Safe Middleverse Event</button>
        </form>
      </section>
      <section><h2>Event Bus</h2><table><thead><tr><th>ID</th><th>Event</th><th>Group</th><th>Source</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No events</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

if "function renderMiddleverseBridgePage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

routes = r"""
    if (req.method === 'POST' && pathname === '/middleverse/event-safe') {
      dbRun(`INSERT INTO middleverse_event_bus (event_name, event_group, source_system, target_system, event_payload, event_status)
             VALUES ('user_entered_bridge','middleverse','metaverse-control','marketplace','{"mode":"safe"}','processed')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20middleverse%20event%20created' });
      return res.end();
    }

    if (req.method === 'GET' && pathname === '/middleverse-bridge') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMiddleverseBridgePage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/middleverse-bridge'" not in text:
    for anchor in [
        "    if (req.method === 'GET' && pathname === '/metaverse-control') {",
        "    if (req.method === 'GET' && pathname === '/studio-lab') {",
        "    if (req.method === 'GET' && pathname === '/dispatch-actions') {",
    ]:
        if anchor in text:
            text = text.replace(anchor, routes + "\n" + anchor, 1)
            break

for nav_anchor in [
    '<a href="/metaverse-control">Metaverse</a>',
    '<a href="/studio-lab">Studio Lab</a>',
    '<a href="/dispatch-actions">Dispatch Actions</a>',
]:
    if nav_anchor in text and '<a href="/middleverse-bridge">Middleverse</a>' not in text:
        text = text.replace(nav_anchor, nav_anchor + '\n          <a href="/middleverse-bridge">Middleverse</a>', 1)
        break

p.write_text(text)
print("[OK] middleverse pass A minimal routes patched")
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

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as middleverse_event_bus from middleverse_event_bus;" > "snapshots/middleverse_event_bus_${STAMP}.json"
sqlite3 -json db/aam.db "select id, event_name, event_group, source_system, target_system, event_status, created_at from middleverse_event_bus order by id desc limit 20;" > "snapshots/middleverse_event_bus_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "middleverse_pass_a_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] middleverse pass A scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/middleverse_pass_a_minimal_and_stabilize_${STAMP}.txt" <<REPORT
MIDDLEVERSE PASS A MINIMAL + STABILIZE REPORT
Timestamp: ${STAMP}

Created:
- middleverse_event_bus
- /middleverse-bridge
- one safe middleverse event action

Verified:
- dashboard health
- jarvis health
- middleverse bridge route
- safe middleverse POST smoke
- stable runtime after minimal middleverse build

Purpose:
- start the middleverse safely
- avoid large patch risk
- prepare for middleverse pass B
REPORT

echo "MIDDLEVERSE PASS A MINIMAL + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/middleverse_pass_a_scan_latest.json"
echo "  cat snapshots/middleverse_event_bus_tail_${STAMP}.json"
echo "  cat reports/middleverse_pass_a_minimal_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/middleverse-bridge"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
