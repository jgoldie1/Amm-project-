#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FINAL 3 PART BUILD 3 START ==="

python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

def ensure_column(table, col_name, ddl):
    if col_name not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] Added column {table}.{col_name}")

ensure_column("robotics_assets", "last_command", "last_command TEXT")
ensure_column("manufacturing_jobs", "output_path", "output_path TEXT")

conn.commit()
conn.close()
print("[OK] build 3 DB prep complete")
PYEOF

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

# add links in existing pages
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

# hard insert sitemap route if still missing
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
print("[OK] build 3 UI patch applied")
PYEOF

bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots
cp apps/dashboard.js "backups/dashboard_build3_${STAMP}.js"
cp db/aam.db "backups/aam_build3_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as scene_registry from scene_registry;" > "snapshots/build3_scene_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as robotics_assets from robotics_assets;" > "snapshots/build3_robotics_assets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as manufacturing_jobs from manufacturing_jobs;" > "snapshots/build3_manufacturing_jobs_${STAMP}.json"

echo "FINAL 3 PART BUILD 3 COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/scenes"
echo "  termux-open-url http://127.0.0.1:4900/robotics"
echo "  curl -i http://127.0.0.1:4900/sitemap.xml"
