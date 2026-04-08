#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== UNIVERSAL ASSET LIBRARY + GAP AUDIT + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results
mkdir -p storage/uploads/images
mkdir -p storage/uploads/video
mkdir -p storage/uploads/audio
mkdir -p storage/uploads/docs
mkdir -p storage/uploads/other

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_asset_library_${STAMP}.js"
cp db/aam.db "backups/aam_asset_library_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS asset_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  asset_category TEXT DEFAULT 'general',
  file_path TEXT,
  mime_type TEXT,
  file_size_bytes INTEGER DEFAULT 0,
  linked_world TEXT DEFAULT 'present_world',
  linked_territory TEXT DEFAULT 'global',
  creator_name TEXT,
  asset_status TEXT DEFAULT 'registered',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS asset_usage_map (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT NOT NULL,
  usage_type TEXT DEFAULT 'display',
  linked_route TEXT,
  linked_system TEXT,
  usage_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS asset_gap_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gap_name TEXT NOT NULL,
  gap_group TEXT DEFAULT 'assets',
  priority_level TEXT DEFAULT 'medium',
  linked_system TEXT,
  fix_status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS asset_ingest_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT,
  asset_type TEXT,
  target_folder TEXT,
  ingest_status TEXT DEFAULT 'waiting',
  ingest_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed only if empty
if cur.execute("SELECT count(*) FROM asset_library").fetchone()[0] == 0:
    rows = [
        ("Georgia Launch Promo Banner", "image", "marketing", "storage/uploads/images/georgia_launch_banner.png", "image/png", 0, "present_world", "Georgia", "Platform", "registered"),
        ("Japan Premium World Trailer", "video", "promo_video", "storage/uploads/video/japan_premium_world_trailer.mp4", "video/mp4", 0, "future_world", "Japan", "Platform", "registered"),
        ("Holoverse Welcome Audio", "audio", "voice_intro", "storage/uploads/audio/holoverse_welcome.mp3", "audio/mpeg", 0, "present_world", "global", "Platform", "registered"),
        ("Creator Marketplace Guide", "document", "manual", "storage/uploads/docs/creator_marketplace_guide.pdf", "application/pdf", 0, "present_world", "global", "Platform", "registered"),
        ("Future City Model Pack", "other", "3d_asset", "storage/uploads/other/future_city_model_pack.zip", "application/zip", 0, "future_world", "global", "Platform", "registered"),
    ]
    cur.executemany("""
        INSERT INTO asset_library
        (asset_name, asset_type, asset_category, file_path, mime_type, file_size_bytes, linked_world, linked_territory, creator_name, asset_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM asset_usage_map").fetchone()[0] == 0:
    rows = [
        ("Georgia Launch Promo Banner", "display", "/territory-activation", "territory_activation", "active"),
        ("Japan Premium World Trailer", "display", "/world-era-mobility", "future_world", "active"),
        ("Holoverse Welcome Audio", "playback", "/holo-gpt-control", "holo_gpt", "active"),
        ("Creator Marketplace Guide", "reference", "/creator-marketplace", "creator_marketplace", "active"),
        ("Future City Model Pack", "world_build", "/world3d", "world3d", "active"),
    ]
    cur.executemany("""
        INSERT INTO asset_usage_map
        (asset_name, usage_type, linked_route, linked_system, usage_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM asset_gap_registry").fetchone()[0] == 0:
    rows = [
        ("Browser file upload handler", "assets", "high", "asset_library", "open"),
        ("Asset preview layer", "assets", "medium", "asset_library", "open"),
        ("Creator asset listing integration", "marketplace", "high", "creator_marketplace", "open"),
        ("World3D asset binding", "world", "high", "world3d", "open"),
        ("Music/video playback controls", "media", "medium", "holoverse", "open"),
        ("Document viewer workflow", "docs", "medium", "asset_library", "open"),
    ]
    cur.executemany("""
        INSERT INTO asset_gap_registry
        (gap_name, gap_group, priority_level, linked_system, fix_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM asset_ingest_queue").fetchone()[0] == 0:
    rows = [
        ("Upload image files", "image", "storage/uploads/images", "waiting", "ready for browser/device upload"),
        ("Upload video files", "video", "storage/uploads/video", "waiting", "ready for browser/device upload"),
        ("Upload audio files", "audio", "storage/uploads/audio", "waiting", "ready for browser/device upload"),
        ("Upload document files", "document", "storage/uploads/docs", "waiting", "ready for browser/device upload"),
        ("Upload model/other files", "other", "storage/uploads/other", "waiting", "ready for browser/device upload"),
    ]
    cur.executemany("""
        INSERT INTO asset_ingest_queue
        (asset_name, asset_type, target_folder, ingest_status, ingest_notes)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

conn.commit()
conn.close()
print("[OK] universal asset library tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderAssetLibraryPage(req, user = null, message = '') {
  const assets = dbQuery(`
    SELECT id, asset_name, asset_type, asset_category, file_path, mime_type, linked_world, linked_territory, creator_name, asset_status, created_at
    FROM asset_library
    ORDER BY id DESC
    LIMIT 300
  `);

  const usage = dbQuery(`
    SELECT id, asset_name, usage_type, linked_route, linked_system, usage_status, created_at
    FROM asset_usage_map
    ORDER BY id DESC
    LIMIT 300
  `);

  const queue = dbQuery(`
    SELECT id, asset_name, asset_type, target_folder, ingest_status, ingest_notes, created_at
    FROM asset_ingest_queue
    ORDER BY id DESC
    LIMIT 100
  `);

  const assetRows = assets.map(r => `<tr><td>${r.id}</td><td>${r.asset_name}</td><td>${r.asset_type}</td><td>${r.asset_category || ''}</td><td>${r.file_path || ''}</td><td>${r.mime_type || ''}</td><td>${r.linked_world || ''}</td><td>${r.linked_territory || ''}</td><td>${r.creator_name || ''}</td><td>${r.asset_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const usageRows = usage.map(r => `<tr><td>${r.id}</td><td>${r.asset_name}</td><td>${r.usage_type}</td><td>${r.linked_route || ''}</td><td>${r.linked_system || ''}</td><td>${r.usage_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const queueRows = queue.map(r => `<tr><td>${r.id}</td><td>${r.asset_name || ''}</td><td>${r.asset_type || ''}</td><td>${r.target_folder || ''}</td><td>${r.ingest_status}</td><td>${r.ingest_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Asset Library', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="asset-library-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Universal Media + Document Layer</div>
            <h1 id="asset-library-title">Asset Library</h1>
            <p>Manage images, video, music, documents, and other uploaded assets across worlds, territories, creator systems, and holoverse experiences.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/asset-library" class="hero-primary-btn">Asset Library</a>
              <a href="/platform-analytics" class="hero-secondary-btn">Analytics</a>
              <a href="/creator-marketplace" class="hero-secondary-btn">Marketplace</a>
              <a href="/world3d" class="hero-secondary-btn">World3D</a>
            </div>
          </div>
        </section>

        <section><table aria-label="Asset Library"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Category</th><th>Path</th><th>MIME</th><th>World</th><th>Territory</th><th>Creator</th><th>Status</th><th>Created</th></tr></thead><tbody>${assetRows || '<tr><td colspan="11">No assets yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Asset Usage Map"><thead><tr><th>ID</th><th>Asset</th><th>Usage</th><th>Route</th><th>System</th><th>Status</th><th>Created</th></tr></thead><tbody>${usageRows || '<tr><td colspan="7">No usage rows yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Asset Ingest Queue"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Folder</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${queueRows || '<tr><td colspan="7">No ingest queue rows yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

helper2 = r"""
function renderAssetGapAuditPage(req, user = null, message = '') {
  const gaps = dbQuery(`
    SELECT id, gap_name, gap_group, priority_level, linked_system, fix_status, created_at
    FROM asset_gap_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const gapRows = gaps.map(r => `<tr><td>${r.id}</td><td>${r.gap_name}</td><td>${r.gap_group}</td><td>${r.priority_level}</td><td>${r.linked_system || ''}</td><td>${r.fix_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Asset Gap Audit', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="asset-gap-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Asset Completion Audit</div>
            <h1 id="asset-gap-title">Asset Gap Audit</h1>
            <p>Track what is still missing for media, documents, creator asset flow, previews, and live world asset use.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Asset Gap Audit"><thead><tr><th>ID</th><th>Gap</th><th>Group</th><th>Priority</th><th>System</th><th>Status</th><th>Created</th></tr></thead><tbody>${gapRows || '<tr><td colspan="7">No asset gaps yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderAssetLibraryPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper1 + "\n" + helper2 + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/asset-library">Assets</a>' not in text and '<a href="/platform-analytics">Analytics</a>' in text:
    text = text.replace(
        '<a href="/platform-analytics">Analytics</a>',
        '<a href="/platform-analytics">Analytics</a>\n          <a href="/asset-library">Assets</a>\n          <a href="/asset-gap-audit">Asset Gaps</a>',
        1
    )

route1 = """
    if (req.method === 'GET' && pathname === '/asset-library') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAssetLibraryPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

route2 = """
    if (req.method === 'GET' && pathname === '/asset-gap-audit') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAssetGapAuditPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/asset-library'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/platform-analytics') {"
    if anchor in text:
        text = text.replace(anchor, route1 + "\n" + route2 + "\n" + anchor, 1)

p.write_text(text)
print("[OK] asset library + gap audit routes ready")
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
  /asset-library \
  /asset-gap-audit \
  /platform-analytics \
  /holo-gpt-control \
  /transaction-engine \
  /scaling-control \
  /creator-marketplace \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as asset_library from asset_library;" > "snapshots/asset_library_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as asset_usage_map from asset_usage_map;" > "snapshots/asset_usage_map_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as asset_gap_registry from asset_gap_registry;" > "snapshots/asset_gap_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as asset_ingest_queue from asset_ingest_queue;" > "snapshots/asset_ingest_queue_${STAMP}.json"

sqlite3 -json db/aam.db "select id, asset_name, asset_type, asset_category, file_path, mime_type, linked_world, linked_territory, creator_name, asset_status, created_at from asset_library order by id desc limit 50;" > "snapshots/asset_library_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, asset_name, usage_type, linked_route, linked_system, usage_status, created_at from asset_usage_map order by id desc limit 50;" > "snapshots/asset_usage_map_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, gap_name, gap_group, priority_level, linked_system, fix_status, created_at from asset_gap_registry order by id desc limit 50;" > "snapshots/asset_gap_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, asset_name, asset_type, target_folder, ingest_status, ingest_notes, created_at from asset_ingest_queue order by id desc limit 50;" > "snapshots/asset_ingest_queue_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "asset_library_gap_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] asset library + gap scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/universal_asset_library_gap_audit_and_stabilize_${STAMP}.txt" <<REPORT
UNIVERSAL ASSET LIBRARY + GAP AUDIT + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- asset_library
- asset_usage_map
- asset_gap_registry
- asset_ingest_queue
- asset-library route
- asset-gap-audit route
- upload storage folders for images/video/audio/docs/other

Purpose:
- prepare the platform for images, video, music, documents, and other files
- map assets to worlds, territories, creators, and routes
- identify remaining asset workflow gaps
- stabilize the content intake layer
REPORT

echo "UNIVERSAL ASSET LIBRARY + GAP AUDIT + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/asset_library_gap_scan_latest.json"
echo "  cat snapshots/asset_library_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/asset-library"
echo "  termux-open-url http://127.0.0.1:4900/asset-gap-audit"
echo "  termux-open-url http://127.0.0.1:4900/platform-analytics"
