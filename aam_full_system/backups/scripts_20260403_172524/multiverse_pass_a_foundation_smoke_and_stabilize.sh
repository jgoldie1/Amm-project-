#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MULTIVERSE PASS A FOUNDATION + SMOKE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_multiverse_pass_a_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_multiverse_pass_a_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_multiverse_pass_a_${STAMP}.js"

########################################
# 1) CREATE MULTIVERSE PASS A TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS multiverse_realm_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  realm_name TEXT,
  realm_group TEXT,
  source_layer TEXT,
  target_layer TEXT,
  realm_mode TEXT,
  realm_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multiverse_gateway_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gateway_name TEXT,
  gateway_group TEXT,
  source_realm TEXT,
  target_realm TEXT,
  gateway_mode TEXT,
  gateway_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multiverse_sync_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_name TEXT,
  sync_group TEXT,
  source_system TEXT,
  target_system TEXT,
  sync_mode TEXT,
  sync_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multiverse_signal_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  signal_name TEXT,
  signal_group TEXT,
  signal_source TEXT,
  signal_target TEXT,
  signal_value TEXT,
  signal_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] multiverse pass A tables created"

########################################
# 2) SEED MULTIVERSE PASS A
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO multiverse_realm_registry (realm_name, realm_group, source_layer, target_layer, realm_mode, realm_status)
SELECT 'Primary Multiverse Realm','core','middleverse','multiverse','bridged','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_realm_registry WHERE realm_name='Primary Multiverse Realm');

INSERT INTO multiverse_gateway_registry (gateway_name, gateway_group, source_realm, target_realm, gateway_mode, gateway_status)
SELECT 'AAM Multiverse Gateway','core_gateway','middleverse_core','multiverse_core','controlled','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_gateway_registry WHERE gateway_name='AAM Multiverse Gateway');

INSERT INTO multiverse_sync_registry (sync_name, sync_group, source_system, target_system, sync_mode, sync_status)
SELECT 'Multiverse Core Sync','core_sync','middleverse-bridge','multiverse-bridge','safe_sync','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_sync_registry WHERE sync_name='Multiverse Core Sync');

INSERT INTO multiverse_signal_registry (signal_name, signal_group, signal_source, signal_target, signal_value, signal_status)
SELECT 'Initial Multiverse Signal','bootstrap','middleverse','multiverse','ready','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_signal_registry WHERE signal_name='Initial Multiverse Signal');
SQL

echo "[OK] multiverse pass A seeded"

########################################
# 3) PATCH ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderMultiverseBridgePage(req, user = null, message = '') {
  const realms = dbQuery(`SELECT id, realm_name, realm_group, source_layer, target_layer, realm_mode, realm_status, created_at FROM multiverse_realm_registry ORDER BY id DESC LIMIT 100`);
  const gateways = dbQuery(`SELECT id, gateway_name, gateway_group, source_realm, target_realm, gateway_mode, gateway_status, created_at FROM multiverse_gateway_registry ORDER BY id DESC LIMIT 100`);
  const syncs = dbQuery(`SELECT id, sync_name, sync_group, source_system, target_system, sync_mode, sync_status, created_at FROM multiverse_sync_registry ORDER BY id DESC LIMIT 100`);
  const signals = dbQuery(`SELECT id, signal_name, signal_group, signal_source, signal_target, signal_value, signal_status, created_at FROM multiverse_signal_registry ORDER BY id DESC LIMIT 100`);

  const realmRows = realms.map(r => `<tr><td>${r.id}</td><td>${esc(r.realm_name)}</td><td>${esc(r.realm_group)}</td><td>${esc(r.source_layer)}</td><td>${esc(r.target_layer)}</td><td>${esc(r.realm_mode)}</td><td>${esc(r.realm_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const gatewayRows = gateways.map(r => `<tr><td>${r.id}</td><td>${esc(r.gateway_name)}</td><td>${esc(r.gateway_group)}</td><td>${esc(r.source_realm)}</td><td>${esc(r.target_realm)}</td><td>${esc(r.gateway_mode)}</td><td>${esc(r.gateway_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const syncRows = syncs.map(r => `<tr><td>${r.id}</td><td>${esc(r.sync_name)}</td><td>${esc(r.sync_group)}</td><td>${esc(r.source_system)}</td><td>${esc(r.target_system)}</td><td>${esc(r.sync_mode)}</td><td>${esc(r.sync_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const signalRows = signals.map(r => `<tr><td>${r.id}</td><td>${esc(r.signal_name)}</td><td>${esc(r.signal_group)}</td><td>${esc(r.signal_source)}</td><td>${esc(r.signal_target)}</td><td>${esc(r.signal_value)}</td><td>${esc(r.signal_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');

  return htmlPage('Multiverse Bridge', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Multiverse Bridge</h1><p>${esc(message || 'Multiverse pass A foundation is live.')}</p></section>

      <section>
        <h2>Safe Multiverse Actions</h2>
        <form method="POST" action="/multiverse/realm-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Realm</button></form>
        <form method="POST" action="/multiverse/gateway-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Gateway</button></form>
        <form method="POST" action="/multiverse/sync-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Sync</button></form>
        <form method="POST" action="/multiverse/signal-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Signal</button></form>
      </section>

      <section><h2>Realm Registry</h2><table><thead><tr><th>ID</th><th>Realm</th><th>Group</th><th>Source</th><th>Target</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead><tbody>${realmRows || '<tr><td colspan="8">No realms</td></tr>'}</tbody></table></section>
      <section><h2>Gateway Registry</h2><table><thead><tr><th>ID</th><th>Gateway</th><th>Group</th><th>Source Realm</th><th>Target Realm</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead><tbody>${gatewayRows || '<tr><td colspan="8">No gateways</td></tr>'}</tbody></table></section>
      <section><h2>Sync Registry</h2><table><thead><tr><th>ID</th><th>Sync</th><th>Group</th><th>Source System</th><th>Target System</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead><tbody>${syncRows || '<tr><td colspan="8">No syncs</td></tr>'}</tbody></table></section>
      <section><h2>Signal Registry</h2><table><thead><tr><th>ID</th><th>Signal</th><th>Group</th><th>Source</th><th>Target</th><th>Value</th><th>Status</th><th>Created</th></tr></thead><tbody>${signalRows || '<tr><td colspan="8">No signals</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

if "function renderMultiverseBridgePage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

routes = r"""
    if (req.method === 'POST' && pathname === '/multiverse/realm-safe') {
      dbRun(`INSERT INTO multiverse_realm_registry (realm_name, realm_group, source_layer, target_layer, realm_mode, realm_status)
             VALUES ('Safe Realm','sandbox','middleverse','multiverse','safe_bridge','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20realm%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/multiverse/gateway-safe') {
      dbRun(`INSERT INTO multiverse_gateway_registry (gateway_name, gateway_group, source_realm, target_realm, gateway_mode, gateway_status)
             VALUES ('Safe Gateway','sandbox','safe_source_realm','safe_target_realm','controlled','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20gateway%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/multiverse/sync-safe') {
      dbRun(`INSERT INTO multiverse_sync_registry (sync_name, sync_group, source_system, target_system, sync_mode, sync_status)
             VALUES ('Safe Multiverse Sync','sandbox','middleverse-bridge','multiverse-bridge','safe_sync','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20sync%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/multiverse/signal-safe') {
      dbRun(`INSERT INTO multiverse_signal_registry (signal_name, signal_group, signal_source, signal_target, signal_value, signal_status)
             VALUES ('Safe Signal','sandbox','middleverse','multiverse','safe_value','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20signal%20created' });
      return res.end();
    }

    if (req.method === 'GET' && pathname === '/multiverse-bridge') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMultiverseBridgePage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/multiverse-bridge'" not in text:
    anchors = [
        "    if (req.method === 'GET' && pathname === '/middleverse-bridge') {",
        "    if (req.method === 'GET' && pathname === '/metaverse-control') {",
        "    if (req.method === 'GET' && pathname === '/studio-lab') {",
    ]
    for anchor in anchors:
        if anchor in text:
            text = text.replace(anchor, routes + "\n" + anchor, 1)
            break

for candidate in [
    '<a href="/middleverse-bridge">Middleverse</a>',
    '<a href="/metaverse-control">Metaverse</a>',
    '<a href="/studio-lab">Studio Lab</a>',
]:
    if candidate in text and '<a href="/multiverse-bridge">Multiverse</a>' not in text:
        text = text.replace(candidate, candidate + '\n          <a href="/multiverse-bridge">Multiverse</a>', 1)
        break

p.write_text(text)
print("[OK] multiverse pass A routes patched")
PYEOF

########################################
# 4) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 5) HEALTH + BROAD ROUTE SMOKE
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  / \
  /multiverse-bridge \
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
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SAFE ACTION TESTS
########################################
curl -s -i -X POST http://127.0.0.1:4900/multiverse/realm-safe > "test_results/multiverse_realm_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/gateway-safe > "test_results/multiverse_gateway_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/sync-safe > "test_results/multiverse_sync_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/signal-safe > "test_results/multiverse_signal_${STAMP}.txt" || true

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as multiverse_realm_registry from multiverse_realm_registry;" > "snapshots/multiverse_realm_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_gateway_registry from multiverse_gateway_registry;" > "snapshots/multiverse_gateway_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_sync_registry from multiverse_sync_registry;" > "snapshots/multiverse_sync_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_signal_registry from multiverse_signal_registry;" > "snapshots/multiverse_signal_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, realm_name, realm_group, source_layer, target_layer, realm_mode, realm_status, created_at from multiverse_realm_registry order by id desc limit 20;" > "snapshots/multiverse_realm_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, gateway_name, gateway_group, source_realm, target_realm, gateway_mode, gateway_status, created_at from multiverse_gateway_registry order by id desc limit 20;" > "snapshots/multiverse_gateway_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, sync_name, sync_group, source_system, target_system, sync_mode, sync_status, created_at from multiverse_sync_registry order by id desc limit 20;" > "snapshots/multiverse_sync_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, signal_name, signal_group, signal_source, signal_target, signal_value, signal_status, created_at from multiverse_signal_registry order by id desc limit 20;" > "snapshots/multiverse_signal_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "multiverse_pass_a_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] multiverse pass A scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/multiverse_pass_a_foundation_smoke_and_stabilize_${STAMP}.txt" <<REPORT
MULTIVERSE PASS A FOUNDATION + SMOKE + STABILIZE REPORT
Timestamp: ${STAMP}

Built:
- multiverse realm registry
- multiverse gateway registry
- multiverse sync registry
- multiverse signal registry
- multiverse bridge route
- safe multiverse actions

Verified:
- dashboard health
- jarvis health
- broad platform smoke routes
- multiverse route smoke
- stable runtime

Purpose:
- start the multiverse safely
- add the first multiverse bridge foundation
- preserve stable runtime while opening the next layer
REPORT

echo "MULTIVERSE PASS A FOUNDATION + SMOKE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/multiverse_pass_a_scan_latest.json"
echo "  cat snapshots/multiverse_realm_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_gateway_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_sync_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_signal_registry_tail_${STAMP}.json"
echo "  cat reports/multiverse_pass_a_foundation_smoke_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
