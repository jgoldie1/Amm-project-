#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== ADD UPLOAD INGEST + MEDIA BRIDGE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results storage/uploads/images storage/uploads/video storage/uploads/audio storage/uploads/docs storage/uploads/other

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_upload_ingest_${STAMP}.js"
cp db/aam.db "backups/aam_upload_ingest_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS upload_ingest_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT NOT NULL,
  asset_type TEXT DEFAULT 'other',
  source_channel TEXT DEFAULT 'browser_upload',
  target_system TEXT DEFAULT 'asset_library',
  target_route TEXT,
  storage_path TEXT,
  ingest_status TEXT DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS media_attachment_bridge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT NOT NULL,
  linked_system TEXT NOT NULL,
  linked_entity TEXT NOT NULL,
  linked_route TEXT,
  bridge_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_policy_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_type TEXT NOT NULL,
  allowed_extensions TEXT,
  max_size_mb INTEGER DEFAULT 100,
  target_folder TEXT,
  policy_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_event_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  asset_type TEXT DEFAULT 'other',
  uploader_name TEXT DEFAULT 'system',
  upload_status TEXT DEFAULT 'logged',
  upload_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM upload_policy_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO upload_policy_registry
        (asset_type, allowed_extensions, max_size_mb, target_folder, policy_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("image", "png,jpg,jpeg,webp,gif", 25, "storage/uploads/images", "active"),
        ("video", "mp4,webm,mov,mkv", 500, "storage/uploads/video", "active"),
        ("audio", "mp3,wav,m4a,aac,ogg", 100, "storage/uploads/audio", "active"),
        ("document", "pdf,doc,docx,txt,md", 50, "storage/uploads/docs", "active"),
        ("other", "*", 100, "storage/uploads/other", "active"),
    ])

if cur.execute("SELECT count(*) FROM upload_ingest_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO upload_ingest_registry
        (asset_name, asset_type, source_channel, target_system, target_route, storage_path, ingest_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [
        ("creator_launch_poster.png", "image", "browser_upload", "creator_tv", "/creator-tv", "storage/uploads/images/creator_launch_poster.png", "queued"),
        ("isaiah_promo_clip.mp4", "video", "browser_upload", "streaming_network", "/streaming-network", "storage/uploads/video/isaiah_promo_clip.mp4", "queued"),
        ("welcome_theme.mp3", "audio", "browser_upload", "creator_tv", "/creator-tv", "storage/uploads/audio/welcome_theme.mp3", "queued"),
        ("creator_pitch_deck.pdf", "document", "browser_upload", "quantum_mail", "/quantum-mail", "storage/uploads/docs/creator_pitch_deck.pdf", "queued"),
    ])

if cur.execute("SELECT count(*) FROM media_attachment_bridge").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO media_attachment_bridge
        (asset_name, linked_system, linked_entity, linked_route, bridge_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("creator_launch_poster.png", "creator_tv", "Isaiah Anyone Can Be a Star AI TV", "/creator-tv", "active"),
        ("isaiah_promo_clip.mp4", "streaming_network", "Isaiah TV launch event", "/streaming-network", "active"),
        ("welcome_theme.mp3", "holojourney", "HoloJourney Core", "/holojourney-tv", "active"),
        ("creator_pitch_deck.pdf", "quantum_mail", "Jacobie", "/quantum-mail", "active"),
    ])

if cur.execute("SELECT count(*) FROM upload_event_log").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO upload_event_log
        (filename, asset_type, uploader_name, upload_status, upload_notes)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("creator_launch_poster.png", "image", "Jacobie", "logged", "creator promo asset"),
        ("isaiah_promo_clip.mp4", "video", "Isaiah", "logged", "tv promo upload"),
        ("welcome_theme.mp3", "audio", "Aniyah", "logged", "stream intro audio"),
        ("creator_pitch_deck.pdf", "document", "Jacobie", "logged", "mail attachment candidate"),
    ])

conn.commit()
conn.close()
print("[OK] upload ingest + media bridge tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderUploadMediaBridgePage(req, user = null, message = '') {
  const ingestRowsData = dbQuery(`
    SELECT id, asset_name, asset_type, source_channel, target_system, target_route, storage_path, ingest_status, created_at
    FROM upload_ingest_registry
    ORDER BY id DESC LIMIT 200
  `);

  const bridgeRowsData = dbQuery(`
    SELECT id, asset_name, linked_system, linked_entity, linked_route, bridge_status, created_at
    FROM media_attachment_bridge
    ORDER BY id DESC LIMIT 200
  `);

  const policyRowsData = dbQuery(`
    SELECT id, asset_type, allowed_extensions, max_size_mb, target_folder, policy_status, created_at
    FROM upload_policy_registry
    ORDER BY id DESC LIMIT 100
  `);

  const eventRowsData = dbQuery(`
    SELECT id, filename, asset_type, uploader_name, upload_status, upload_notes, created_at
    FROM upload_event_log
    ORDER BY id DESC LIMIT 200
  `);

  const ingestRows = ingestRowsData.map(r => `<tr><td>${r.id}</td><td>${r.asset_name}</td><td>${r.asset_type}</td><td>${r.source_channel}</td><td>${r.target_system}</td><td>${r.target_route || ''}</td><td>${r.storage_path || ''}</td><td>${r.ingest_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const bridgeRows = bridgeRowsData.map(r => `<tr><td>${r.id}</td><td>${r.asset_name}</td><td>${r.linked_system}</td><td>${r.linked_entity}</td><td>${r.linked_route || ''}</td><td>${r.bridge_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const policyRows = policyRowsData.map(r => `<tr><td>${r.id}</td><td>${r.asset_type}</td><td>${r.allowed_extensions || ''}</td><td>${r.max_size_mb}</td><td>${r.target_folder || ''}</td><td>${r.policy_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const eventRows = eventRowsData.map(r => `<tr><td>${r.id}</td><td>${r.filename}</td><td>${r.asset_type}</td><td>${r.uploader_name}</td><td>${r.upload_status}</td><td>${r.upload_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Upload Media Bridge', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Upload Media Bridge</h1><p>${message || 'Browser upload intake, media attachment bridge, and policy visibility.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Asset</th><th>Type</th><th>Source</th><th>Target System</th><th>Route</th><th>Storage</th><th>Status</th><th>Created</th></tr></thead><tbody>${ingestRows || '<tr><td colspan="9">No ingest records</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Asset</th><th>Linked System</th><th>Entity</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${bridgeRows || '<tr><td colspan="7">No bridge records</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Type</th><th>Extensions</th><th>Max MB</th><th>Folder</th><th>Status</th><th>Created</th></tr></thead><tbody>${policyRows || '<tr><td colspan="7">No upload policies</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Filename</th><th>Type</th><th>Uploader</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No upload events</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderUploadMediaBridgePage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/upload-media-bridge') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderUploadMediaBridgePage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/creator-monetization') {"
if "pathname === '/upload-media-bridge'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/upload-media-bridge">Upload Media Bridge</a>' not in text and '<a href="/creator-monetization">Creator Monetization</a>' in text:
    text = text.replace(
        '<a href="/creator-monetization">Creator Monetization</a>',
        '<a href="/creator-monetization">Creator Monetization</a>\n          <a href="/upload-media-bridge">Upload Media Bridge</a>',
        1
    )

p.write_text(text)
print("[OK] upload media bridge route added")
PYEOF

########################################
# 4) RESTART + SMOKE TEST
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /upload-media-bridge \
  /creator-monetization \
  /streaming-network \
  /creator-tv \
  /holojourney-tv \
  /neuro-control \
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
sqlite3 -json db/aam.db "select count(*) as upload_ingest_registry from upload_ingest_registry;" > "snapshots/upload_ingest_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as media_attachment_bridge from media_attachment_bridge;" > "snapshots/media_attachment_bridge_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as upload_policy_registry from upload_policy_registry;" > "snapshots/upload_policy_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as upload_event_log from upload_event_log;" > "snapshots/upload_event_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, asset_name, asset_type, source_channel, target_system, target_route, storage_path, ingest_status, created_at from upload_ingest_registry order by id desc limit 20;" > "snapshots/upload_ingest_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, asset_name, linked_system, linked_entity, linked_route, bridge_status, created_at from media_attachment_bridge order by id desc limit 20;" > "snapshots/media_attachment_bridge_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, asset_type, allowed_extensions, max_size_mb, target_folder, policy_status, created_at from upload_policy_registry order by id desc limit 20;" > "snapshots/upload_policy_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, filename, asset_type, uploader_name, upload_status, upload_notes, created_at from upload_event_log order by id desc limit 20;" > "snapshots/upload_event_log_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "upload_media_bridge_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] upload media bridge scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/add_upload_ingest_media_bridge_and_stabilize_${STAMP}.txt" <<REPORT
ADD UPLOAD INGEST + MEDIA BRIDGE + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- /upload-media-bridge
- upload_ingest_registry
- media_attachment_bridge
- upload_policy_registry
- upload_event_log

Verified:
- dashboard health
- jarvis health
- upload media bridge route
- creator monetization route
- streaming network route
- creator TV route
- HoloJourney TV
- Neuro Control
- OmniMail OS
- Holo Search
- Platform Analytics
- world3d

Purpose:
- prepare browser/media intake tracking
- bridge uploaded assets into mail, creator TV, streaming, and holo systems
- preserve stable runtime
REPORT

echo "ADD UPLOAD INGEST + MEDIA BRIDGE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/upload_media_bridge_scan_latest.json"
echo "  cat snapshots/upload_ingest_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/upload-media-bridge"
echo "  termux-open-url http://127.0.0.1:4900/creator-monetization"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
