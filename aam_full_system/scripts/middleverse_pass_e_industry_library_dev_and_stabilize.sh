#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MIDDLEVERSE PASS E INDUSTRY + LIBRARY + DEV + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_middleverse_pass_e_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_middleverse_pass_e_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_middleverse_pass_e_${STAMP}.js"

########################################
# 1) CREATE PASS E TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_industry_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  industry_name TEXT NOT NULL,
  industry_group TEXT,
  use_case_scope TEXT,
  bridge_mode TEXT,
  monetization_mode TEXT,
  industry_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_library_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  library_name TEXT NOT NULL,
  library_group TEXT,
  module_scope TEXT,
  dependency_mode TEXT,
  library_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_dev_package_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_name TEXT NOT NULL,
  package_group TEXT,
  version_name TEXT,
  package_scope TEXT,
  package_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_extension_manifest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  extension_name TEXT NOT NULL,
  extension_group TEXT,
  target_layer TEXT,
  install_mode TEXT,
  extension_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM middleverse_industry_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_industry_registry
        (industry_name, industry_group, use_case_scope, bridge_mode, monetization_mode, industry_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Retail Commerce", "commerce", "storefront + holo buying", "marketplace_bridge", "sales", "active"),
        ("Freight Logistics", "transport", "dispatch + fleet + support", "service_bridge", "service_fees", "active"),
        ("Food Delivery", "delivery", "order + dispatch + support", "service_bridge", "delivery_margin", "active"),
        ("Real Estate", "property", "showings + onboarding + media", "experience_bridge", "lead_gen", "active"),
        ("Education", "learning", "courses + creators + sessions", "creator_bridge", "subscriptions", "active"),
        ("Creator Media", "media", "stream + studio + monetization", "creator_bridge", "tips + subscriptions", "active"),
        ("Staffing", "workforce", "jobs + dispatch + support", "operator_bridge", "placement_fees", "active"),
        ("Wellness", "services", "booking + media + coaching", "service_bridge", "bookings", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_library_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_library_registry
        (library_name, library_group, module_scope, dependency_mode, library_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Commerce Action Library", "commerce", "cart, buy, tip, subscribe", "core", "active"),
        ("Dispatch Workflow Library", "service", "request, assign, resolve", "core", "active"),
        ("Creator Studio Library", "creator", "projects, sessions, pipeline", "core", "active"),
        ("Middleverse Routing Library", "bridge", "events, sessions, transitions", "core", "active"),
        ("AI Operator Library", "ai", "agents, handoffs, support", "core", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_dev_package_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_dev_package_registry
        (package_name, package_group, version_name, package_scope, package_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("aam-commerce-sdk", "sdk", "v1.0.0", "commerce integration", "active"),
        ("aam-middleverse-sdk", "sdk", "v1.0.0", "bridge integration", "active"),
        ("aam-dispatch-sdk", "sdk", "v1.0.0", "service integration", "active"),
        ("aam-creator-sdk", "sdk", "v1.0.0", "creator integration", "active"),
        ("aam-ai-ops-sdk", "sdk", "v1.0.0", "ai/operator integration", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_extension_manifest").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_extension_manifest
        (extension_name, extension_group, target_layer, install_mode, extension_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("retail-extension-pack", "industry", "commerce_layer", "managed", "active"),
        ("creator-extension-pack", "industry", "creator_layer", "managed", "active"),
        ("dispatch-extension-pack", "industry", "service_layer", "managed", "active"),
        ("middleverse-bridge-pack", "platform", "bridge_layer", "managed", "active"),
    ])

conn.commit()
conn.close()
print("[OK] middleverse pass E tables created and seeded")
PYEOF

########################################
# 2) PATCH PASS E ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderMiddleverseBridgePage(req, user = null, message = '') {
  const industries = dbQuery(`SELECT id, industry_name, industry_group, use_case_scope, bridge_mode, monetization_mode, industry_status, created_at
                              FROM middleverse_industry_registry ORDER BY id DESC LIMIT 100`);
  const libraries = dbQuery(`SELECT id, library_name, library_group, module_scope, dependency_mode, library_status, created_at
                             FROM middleverse_library_registry ORDER BY id DESC LIMIT 100`);
  const packages = dbQuery(`SELECT id, package_name, package_group, version_name, package_scope, package_status, created_at
                            FROM middleverse_dev_package_registry ORDER BY id DESC LIMIT 100`);
  const extensions = dbQuery(`SELECT id, extension_name, extension_group, target_layer, install_mode, extension_status, created_at
                              FROM middleverse_extension_manifest ORDER BY id DESC LIMIT 100`);
  const routes = dbQuery(`SELECT id, action_name, source_zone, target_zone, route_type, action_status, created_at
                          FROM middleverse_action_router ORDER BY id DESC LIMIT 100`);

  const industryRows = industries.map(r => `<tr><td>${r.id}</td><td>${esc(r.industry_name)}</td><td>${esc(r.industry_group)}</td><td>${esc(r.use_case_scope)}</td><td>${esc(r.bridge_mode)}</td><td>${esc(r.monetization_mode)}</td><td>${esc(r.industry_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const libraryRows = libraries.map(r => `<tr><td>${r.id}</td><td>${esc(r.library_name)}</td><td>${esc(r.library_group)}</td><td>${esc(r.module_scope)}</td><td>${esc(r.dependency_mode)}</td><td>${esc(r.library_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const packageRows = packages.map(r => `<tr><td>${r.id}</td><td>${esc(r.package_name)}</td><td>${esc(r.package_group)}</td><td>${esc(r.version_name)}</td><td>${esc(r.package_scope)}</td><td>${esc(r.package_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const extensionRows = extensions.map(r => `<tr><td>${r.id}</td><td>${esc(r.extension_name)}</td><td>${esc(r.extension_group)}</td><td>${esc(r.target_layer)}</td><td>${esc(r.install_mode)}</td><td>${esc(r.extension_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const routeRows = routes.map(r => `<tr><td>${r.id}</td><td>${esc(r.action_name)}</td><td>${esc(r.source_zone)}</td><td>${esc(r.target_zone)}</td><td>${esc(r.route_type)}</td><td>${esc(r.action_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');

  return htmlPage('Middleverse Bridge', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Middleverse Bridge</h1><p>${esc(message || 'Middleverse Pass E industry, library, and developer layer is live.')}</p></section>

      <section>
        <h2>Safe Expansion Actions</h2>
        <form method="POST" action="/middleverse/industry-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Industry</button></form>
        <form method="POST" action="/middleverse/library-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Library</button></form>
        <form method="POST" action="/middleverse/package-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Dev Package</button></form>
        <form method="POST" action="/middleverse/extension-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Extension</button></form>
      </section>

      <section><h2>Industry Registry</h2><table><thead><tr><th>ID</th><th>Industry</th><th>Group</th><th>Scope</th><th>Bridge</th><th>Monetization</th><th>Status</th><th>Created</th></tr></thead><tbody>${industryRows || '<tr><td colspan="8">No industries</td></tr>'}</tbody></table></section>
      <section><h2>Library Registry</h2><table><thead><tr><th>ID</th><th>Library</th><th>Group</th><th>Scope</th><th>Dependency</th><th>Status</th><th>Created</th></tr></thead><tbody>${libraryRows || '<tr><td colspan="7">No libraries</td></tr>'}</tbody></table></section>
      <section><h2>Developer Package Registry</h2><table><thead><tr><th>ID</th><th>Package</th><th>Group</th><th>Version</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${packageRows || '<tr><td colspan="7">No packages</td></tr>'}</tbody></table></section>
      <section><h2>Extension Manifest</h2><table><thead><tr><th>ID</th><th>Extension</th><th>Group</th><th>Target</th><th>Install</th><th>Status</th><th>Created</th></tr></thead><tbody>${extensionRows || '<tr><td colspan="7">No extensions</td></tr>'}</tbody></table></section>
      <section><h2>Action Router</h2><table><thead><tr><th>ID</th><th>Action</th><th>Source</th><th>Target</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${routeRows || '<tr><td colspan="7">No routes</td></tr>'}</tbody></table></section>
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
    if (req.method === 'POST' && pathname === '/middleverse/industry-safe') {
      dbRun(`INSERT INTO middleverse_industry_registry (industry_name, industry_group, use_case_scope, bridge_mode, monetization_mode, industry_status)
             VALUES ('Safe Industry','platform','cross-industry workflow','bridge_core','subscriptions','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20industry%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/library-safe') {
      dbRun(`INSERT INTO middleverse_library_registry (library_name, library_group, module_scope, dependency_mode, library_status)
             VALUES ('Safe Library','platform','shared modules','core','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20library%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/package-safe') {
      dbRun(`INSERT INTO middleverse_dev_package_registry (package_name, package_group, version_name, package_scope, package_status)
             VALUES ('safe-dev-sdk','sdk','v1.0.1','platform integration','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20package%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/extension-safe') {
      dbRun(`INSERT INTO middleverse_extension_manifest (extension_name, extension_group, target_layer, install_mode, extension_status)
             VALUES ('safe-extension-pack','platform','bridge_layer','managed','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20extension%20created' });
      return res.end();
    }
"""

if "pathname === '/middleverse/industry-safe'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/middleverse-bridge') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] middleverse pass E routes patched")
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
curl -s -i -X POST http://127.0.0.1:4900/middleverse/industry-safe > "test_results/middleverse_industry_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/library-safe > "test_results/middleverse_library_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/package-safe > "test_results/middleverse_package_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/extension-safe > "test_results/middleverse_extension_${STAMP}.txt" || true

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as middleverse_industry_registry from middleverse_industry_registry;" > "snapshots/middleverse_industry_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_library_registry from middleverse_library_registry;" > "snapshots/middleverse_library_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_dev_package_registry from middleverse_dev_package_registry;" > "snapshots/middleverse_dev_package_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_extension_manifest from middleverse_extension_manifest;" > "snapshots/middleverse_extension_manifest_${STAMP}.json"

sqlite3 -json db/aam.db "select id, industry_name, industry_group, use_case_scope, bridge_mode, monetization_mode, industry_status, created_at from middleverse_industry_registry order by id desc limit 20;" > "snapshots/middleverse_industry_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, library_name, library_group, module_scope, dependency_mode, library_status, created_at from middleverse_library_registry order by id desc limit 20;" > "snapshots/middleverse_library_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, package_name, package_group, version_name, package_scope, package_status, created_at from middleverse_dev_package_registry order by id desc limit 20;" > "snapshots/middleverse_dev_package_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, extension_name, extension_group, target_layer, install_mode, extension_status, created_at from middleverse_extension_manifest order by id desc limit 20;" > "snapshots/middleverse_extension_manifest_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "middleverse_pass_e_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] middleverse pass E scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/middleverse_pass_e_industry_library_dev_and_stabilize_${STAMP}.txt" <<REPORT
MIDDLEVERSE PASS E INDUSTRY + LIBRARY + DEV + STABILIZE REPORT
Timestamp: ${STAMP}

Created:
- middleverse_industry_registry
- middleverse_library_registry
- middleverse_dev_package_registry
- middleverse_extension_manifest
- safe industry/library/package/extension actions

Verified:
- dashboard health
- jarvis health
- middleverse bridge route
- safe middleverse pass E smoke
- stable runtime after pass E

Purpose:
- expand middleverse into all-industry growth
- create reusable libraries and developer packages
- prepare platform-native development inside the ecosystem
REPORT

echo "MIDDLEVERSE PASS E INDUSTRY + LIBRARY + DEV + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/middleverse_pass_e_scan_latest.json"
echo "  cat snapshots/middleverse_industry_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_library_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_dev_package_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_extension_manifest_tail_${STAMP}.json"
echo "  cat reports/middleverse_pass_e_industry_library_dev_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/middleverse-bridge"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
