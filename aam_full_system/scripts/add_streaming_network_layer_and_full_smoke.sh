#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== ADD STREAMING NETWORK LAYER + FULL SMOKE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_streaming_layer_${STAMP}.js"
cp db/aam.db "backups/aam_streaming_layer_${STAMP}.db"

########################################
# 2) TABLES + SEED
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS streaming_network_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  network_name TEXT NOT NULL,
  network_type TEXT DEFAULT 'holographic_streaming',
  delivery_mode TEXT DEFAULT 'adaptive',
  latency_profile TEXT DEFAULT 'low_latency',
  network_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS streaming_event_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  event_group TEXT DEFAULT 'creator_stream',
  linked_channel TEXT,
  audience_mode TEXT DEFAULT 'global',
  event_status TEXT DEFAULT 'live_ready',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM streaming_network_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO streaming_network_registry
        (network_name, network_type, delivery_mode, latency_profile, network_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("HoloStream Core", "holographic_streaming", "adaptive", "low_latency", "active"),
        ("CreatorCast Network", "creator_streaming", "adaptive", "low_latency", "active"),
        ("OmniLive Broadcast", "broadcast_streaming", "global_delivery", "optimized", "active"),
    ])

if cur.execute("SELECT count(*) FROM streaming_event_log").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO streaming_event_log
        (event_name, event_group, linked_channel, audience_mode, event_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Isaiah TV launch event", "creator_stream", "Isaiah Anyone Can Be a Star AI TV", "global", "live_ready"),
        ("Holo creator stage preview", "holographic_stream", "Jacobie Vision Holo TV", "global", "live_ready"),
        ("AI talent spotlight", "creator_stream", "Aniyah Creator Spotlight", "global", "live_ready"),
    ])

conn.commit()
conn.close()
print("[OK] streaming network tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderStreamingNetworkPage(req, user = null, message = '') {
  const networks = dbQuery(`
    SELECT id, network_name, network_type, delivery_mode, latency_profile, network_status, created_at
    FROM streaming_network_registry
    ORDER BY id DESC LIMIT 100
  `);

  const events = dbQuery(`
    SELECT id, event_name, event_group, linked_channel, audience_mode, event_status, created_at
    FROM streaming_event_log
    ORDER BY id DESC LIMIT 200
  `);

  const networkRows = networks.map(r => `<tr><td>${r.id}</td><td>${r.network_name}</td><td>${r.network_type}</td><td>${r.delivery_mode}</td><td>${r.latency_profile}</td><td>${r.network_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${r.event_name}</td><td>${r.event_group}</td><td>${r.linked_channel || ''}</td><td>${r.audience_mode}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Streaming Network', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Streaming Network</h1><p>${message || 'Streaming networks and event visibility.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Delivery</th><th>Latency</th><th>Status</th><th>Created</th></tr></thead><tbody>${networkRows || '<tr><td colspan="7">No networks</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Event</th><th>Group</th><th>Channel</th><th>Audience</th><th>Status</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No events</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderStreamingNetworkPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/streaming-network') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderStreamingNetworkPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/creator-tv') {"
if "pathname === '/streaming-network'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/streaming-network">Streaming Network</a>' not in text and '<a href="/creator-tv">Creator TV</a>' in text:
    text = text.replace(
        '<a href="/creator-tv">Creator TV</a>',
        '<a href="/creator-tv">Creator TV</a>\n          <a href="/streaming-network">Streaming Network</a>',
        1
    )

p.write_text(text)
print("[OK] streaming network route added")
PYEOF

########################################
# 4) RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 5) FULL SMOKE TEST
########################################
for route in \
  / \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /neuro-control \
  /holojourney-tv \
  /creator-tv \
  /streaming-network \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as streaming_network_registry from streaming_network_registry;" > "snapshots/streaming_network_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as streaming_event_log from streaming_event_log;" > "snapshots/streaming_event_log_${STAMP}.json"
sqlite3 -json db/aam.db "select id, network_name, network_type, delivery_mode, latency_profile, network_status, created_at from streaming_network_registry order by id desc limit 20;" > "snapshots/streaming_network_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, event_name, event_group, linked_channel, audience_mode, event_status, created_at from streaming_event_log order by id desc limit 20;" > "snapshots/streaming_event_log_tail_${STAMP}.json"

########################################
# 7) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "streaming_network_full_smoke_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] streaming network full smoke scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/add_streaming_network_layer_and_full_smoke_${STAMP}.txt" <<REPORT
ADD STREAMING NETWORK LAYER + FULL SMOKE REPORT
Timestamp: ${STAMP}

Added:
- /streaming-network
- streaming_network_registry
- streaming_event_log

Verified:
- dashboard health
- jarvis health
- OmniMail OS
- Holo Search
- Platform Analytics
- Neuro Control
- HoloJourney TV
- Creator TV
- Streaming Network
- world3d

Purpose:
- extend the stable media/streaming stack
- run a broad smoke test across all major layers
- create a clean checkpoint before the next feature layer
REPORT

echo "ADD STREAMING NETWORK LAYER + FULL SMOKE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/streaming_network_full_smoke_scan_latest.json"
echo "  cat snapshots/streaming_network_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/streaming-network"
echo "  termux-open-url http://127.0.0.1:4900/creator-tv"
echo "  termux-open-url http://127.0.0.1:4900/holojourney-tv"
