#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FINAL 3 PART BUILD 3 FIX START ==="

python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def table_exists(name):
    row = cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (name,)
    ).fetchone()
    return row is not None

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

def ensure_column(table, col_name, ddl):
    if not table_exists(table):
        return
    if col_name not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] Added column {table}.{col_name}")

# create missing tables safely
cur.execute("""
CREATE TABLE IF NOT EXISTS scene_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_name TEXT NOT NULL,
    scene_type TEXT NOT NULL,
    scene_url TEXT,
    linked_world_id INTEGER,
    scene_status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS robotics_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    control_status TEXT NOT NULL DEFAULT 'idle',
    linked_hub_id INTEGER,
    last_command TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS manufacturing_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_name TEXT NOT NULL,
    job_type TEXT NOT NULL,
    material_type TEXT,
    job_status TEXT NOT NULL DEFAULT 'queued',
    output_path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# add columns if older versions exist
ensure_column("robotics_assets", "last_command", "last_command TEXT")
ensure_column("manufacturing_jobs", "output_path", "output_path TEXT")

# seed scenes if empty
count = cur.execute("SELECT count(*) FROM scene_registry").fetchone()[0]
if count == 0:
    cur.executemany("""
        INSERT INTO scene_registry (scene_name, scene_type, scene_url, linked_world_id, scene_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("AAM Commerce Plaza", "metaverse_scene", "/public/scenes/commerce_plaza.json", 1, "draft"),
        ("Middleverse Ops Map", "middleverse_scene", "/public/scenes/ops_map.json", 2, "draft"),
        ("Multiverse Creator Hall", "multiverse_scene", "/public/scenes/creator_hall.json", 3, "draft"),
    ])

# seed robotics if empty
count = cur.execute("SELECT count(*) FROM robotics_assets").fetchone()[0]
if count == 0:
    cur.executemany("""
        INSERT INTO robotics_assets (asset_name, asset_type, control_status, linked_hub_id, last_command)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Construction Robot Alpha", "construction_robot", "idle", 1, ""),
        ("Delivery Drone Fleet Node", "drone_system", "idle", 1, ""),
        ("Nano Printer Unit 1", "nano_printer", "idle", 1, ""),
        ("12D Printer Unit 1", "12d_printer", "idle", 1, ""),
    ])

# seed manufacturing if empty
count = cur.execute("SELECT count(*) FROM manufacturing_jobs").fetchone()[0]
if count == 0:
    cur.executemany("""
        INSERT INTO manufacturing_jobs (job_name, job_type, material_type, job_status, output_path)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Book Print Prototype", "print_job", "paper/composite", "queued", ""),
        ("Nano Fabrication Test", "nano_job", "nano_material", "queued", ""),
        ("12D Housing Component Test", "12d_job", "multi_material", "queued", ""),
    ])

conn.commit()
conn.close()
print("[OK] build 3 DB fix complete")
PYEOF

mkdir -p public/scenes

cat > public/scenes/commerce_plaza.json << 'SCENE'
{
  "scene": "AAM Commerce Plaza",
  "objects": [
    {"type": "billboard", "label": "Holographic Ad Wall"},
    {"type": "storefront", "label": "Book Store"},
    {"type": "portal", "label": "Podcast Rooms"}
  ]
}
SCENE

cat > public/scenes/ops_map.json << 'SCENE'
{
  "scene": "Middleverse Ops Map",
  "objects": [
    {"type": "hub", "label": "Chicago Main Hub"},
    {"type": "route", "label": "Active Logistics Routes"},
    {"type": "panel", "label": "IoT Telemetry"}
  ]
}
SCENE

cat > public/scenes/creator_hall.json << 'SCENE'
{
  "scene": "Multiverse Creator Hall",
  "objects": [
    {"type": "stage", "label": "Creator Showcase"},
    {"type": "audio_room", "label": "Live Podcast Hall"},
    {"type": "screen", "label": "Streaming Network"}
  ]
}
SCENE

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

pages = r'''
function renderSceneDetail(sceneId, user = null) {
  const rows = dbQuery(`SELECT id, scene_name, scene_type, scene_url, linked_world_id, scene_status, created_at FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = rows[0];
  return htmlPage('Scene Detail', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>World:</strong> ${s.linked_world_id || ''}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <p><strong>Scene File:</strong> <code>${s.scene_url || ''}</code></p>
        <p class="muted">${s.created_at || ''}</p>
      </div>
    </div>
  `, user);
}

function renderRoboticsAssetDetail(assetId, user = null) {
  const rows = dbQuery(`SELECT id, asset_name, asset_type, control_status, linked_hub_id, last_command, created_at FROM robotics_assets WHERE id=${Number(assetId)} LIMIT 1`);
  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Robotics asset not found</h2></div>`, user);

  const a = rows[0];
  return htmlPage('Robotics Asset Detail', `
    <div class="section">
      <div class="card">
        <h2>${a.asset_name}</h2>
        <p><strong>Type:</strong> ${a.asset_type}</p>
        <p><strong>Status:</strong> ${a.control_status}</p>
        <p><strong>Hub:</strong> ${a.linked_hub_id || ''}</p>
        <p><strong>Last Command:</strong> ${a.last_command || ''}</p>
        <p class="muted">${a.created_at || ''}</p>
      </div>
    </div>
  `, user);
}

function renderManufacturingJobDetail(jobId, user = null) {
  const rows = dbQuery(`SELECT id, job_name, job_type, material_type, job_status, output_path, created_at FROM manufacturing_jobs WHERE id=${Number(jobId)} LIMIT 1`);
  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Manufacturing job not found</h2></div>`, user);

  const j = rows[0];
  return htmlPage('Manufacturing Job Detail', `
    <div class="section">
      <div class="card">
        <h2>${j.job_name}</h2>
        <p><strong>Type:</strong> ${j.job_type}</p>
        <p><strong>Material:</strong> ${j.material_type || ''}</p>
        <p><strong>Status:</strong> ${j.job_status}</p>
        <p><strong>Output Path:</strong> ${j.output_path || ''}</p>
        <p class="muted">${j.created_at || ''}</p>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

if 'href="/scenes/' not in text:
    text = text.replace(
        "<h3>${s.scene_name}</h3>",
        "<h3><a href=\"/scenes/${s.id}\">${s.scene_name}</a></h3>"
    )

if 'href="/robotics/assets/' not in text:
    text = text.replace(
        "<tr><td>${a.id}</td><td>${a.asset_name}</td>",
        "<tr><td>${a.id}</td><td><a href=\"/robotics/assets/${a.id}\">${a.asset_name}</a></td>"
    )

if 'href="/manufacturing/jobs/' not in text:
    text = text.replace(
        "<tr><td>${j.id}</td><td>${j.job_name}</td>",
        "<tr><td>${j.id}</td><td><a href=\"/manufacturing/jobs/${j.id}\">${j.job_name}</a></td>"
    )

anchor = "    if (req.method === 'GET' && pathname === '/scenes') {"
if "pathname.startsWith('/scenes/')" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname.startsWith('/scenes/')) {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      const sceneId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSceneDetail(sceneId, authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/robotics/assets/')) {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      const assetId = Number(pathname.split('/')[3]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRoboticsAssetDetail(assetId, authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/manufacturing/jobs/')) {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      const jobId = Number(pathname.split('/')[3]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderManufacturingJobDetail(jobId, authUser));
    }

    if (req.method === 'GET' && pathname === '/scenes') {"""
    text = text.replace(anchor, routes)

if "pathname === '/sitemap.xml'" not in text and "pathname === '/search-engine'" in text:
    text = text.replace(
        "    if (req.method === 'GET' && pathname === '/search-engine') {",
        """    if (req.method === 'GET' && pathname === '/sitemap.xml') {
      const rows = dbQuery("SELECT slug FROM blog_posts ORDER BY id DESC");
      const blogUrls = rows.map(r => `<url><loc>http://127.0.0.1:4900/blog/${r.slug}</loc></url>`).join('');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://127.0.0.1:4900/</loc></url>
  <url><loc>http://127.0.0.1:4900/branches</loc></url>
  <url><loc>http://127.0.0.1:4900/payments</loc></url>
  <url><loc>http://127.0.0.1:4900/credit-repair</loc></url>
  <url><loc>http://127.0.0.1:4900/search-engine</loc></url>
  <url><loc>http://127.0.0.1:4900/blog</loc></url>
  ${blogUrls}
</urlset>`;
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
      return res.end(xml);
    }

    if (req.method === 'GET' && pathname === '/search-engine') {"""
    )

p.write_text(text)
print("[OK] build 3 fix UI patch applied")
PYEOF

bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots
cp apps/dashboard.js "backups/dashboard_build3_fix_${STAMP}.js"
cp db/aam.db "backups/aam_build3_fix_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as scene_registry from scene_registry;" > "snapshots/build3_fix_scene_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as robotics_assets from robotics_assets;" > "snapshots/build3_fix_robotics_assets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as manufacturing_jobs from manufacturing_jobs;" > "snapshots/build3_fix_manufacturing_jobs_${STAMP}.json"

echo "FINAL 3 PART BUILD 3 FIX COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/scenes"
echo "  termux-open-url http://127.0.0.1:4900/robotics"
echo "  curl -i http://127.0.0.1:4900/sitemap.xml"
