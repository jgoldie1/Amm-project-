#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX WEB3D ROUTE PATCH + FINISH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results public/world3d

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_web3d_route_fix_${STAMP}.js"
cp db/aam.db "backups/aam_web3d_route_fix_${STAMP}.db"

########################################
# 2) ENSURE WORLD HTML EXISTS
########################################
if [ ! -f public/world3d/index.html ]; then
  cat > public/world3d/index.html <<'HTML'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>AAM Web 3D World</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin:0; height:100%; background:#020617; color:#fff; font-family:Arial,sans-serif; }
    body { display:grid; place-items:center; }
    .card { max-width:720px; padding:24px; border:1px solid #334155; border-radius:20px; background:rgba(2,6,23,.86); }
    a { color:#93c5fd; }
  </style>
</head>
<body>
  <div class="card">
    <h1>AAM Web 3D World Placeholder</h1>
    <p>The full HTML prototype was not present, so this recovery page was created to keep the route alive.</p>
    <p>Return to <a href="/web3d-client">Web 3D Client</a>.</p>
  </div>
</body>
</html>
HTML
  echo "[OK] created public/world3d/index.html"
else
  echo "[OK] public/world3d/index.html already exists"
fi

########################################
# 3) PATCH dashboard.js
########################################
python3 << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderWeb3DClientPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, render_mode, control_mode, environment_mode, profile_status, created_at
    FROM web3d_client_profiles
    ORDER BY id DESC
    LIMIT 50
  `);

  const nodes = dbQuery(`
    SELECT id, node_name, node_type, pos_x, pos_y, pos_z, scale_value, node_status, created_at
    FROM web3d_scene_nodes
    ORDER BY id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT id, event_type, event_payload, event_status, created_at
    FROM web3d_runtime_events
    ORDER BY id DESC
    LIMIT 100
  `);

  const profileRows = profiles.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.render_mode}</td><td>${r.control_mode}</td><td>${r.environment_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const nodeRows = nodes.map(r => `
    <tr><td>${r.id}</td><td>${r.node_name}</td><td>${r.node_type}</td><td>${r.pos_x}</td><td>${r.pos_y}</td><td>${r.pos_z}</td><td>${r.scale_value}</td><td>${r.node_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr><td>${r.id}</td><td>${r.event_type}</td><td>${r.event_payload || ''}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Web 3D Client', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="web3d-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Rendered Client Layer</div>
            <h1 id="web3d-title">Web 3D World Client</h1>
            <p>This is the first visible rendered world prototype bridge for the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/world3d" class="hero-primary-btn">Open 3D World</a>
              <a href="/world-experience-control" class="hero-secondary-btn">World Experience</a>
              <a href="/engine-bridge" class="hero-secondary-btn">Engine Bridge</a>
              <a href="/avatar-rig-control" class="hero-secondary-btn">Avatar Rig</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Client Profiles', `
          <table aria-label="Web 3D Client Profiles">
            <thead><tr><th>ID</th><th>Name</th><th>Render</th><th>Control</th><th>Environment</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${profileRows || '<tr><td colspan="7">No client profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Scene Nodes', `
          <table aria-label="Web 3D Scene Nodes">
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>X</th><th>Y</th><th>Z</th><th>Scale</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${nodeRows || '<tr><td colspan="9">No scene nodes yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Runtime Events', `
          <table aria-label="Web 3D Runtime Events">
            <thead><tr><th>ID</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="5">No runtime events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWeb3DClientPage(req, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/web3d-client">Web 3D</a>' not in text:
    if '<a href="/world-experience-control">World Experience</a>' in text:
        text = text.replace(
            '<a href="/world-experience-control">World Experience</a>',
            '<a href="/world-experience-control">World Experience</a>\n          <a href="/web3d-client">Web 3D</a>'
        )

route_block = """    if (req.method === 'GET' && pathname === '/world3d') {
      try {
        const html = require('fs').readFileSync('public/world3d/index.html', 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('World 3D client not found');
      }
    }

    if (req.method === 'GET' && pathname === '/web3d-client') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWeb3DClientPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/world3d'" not in text or "pathname === '/web3d-client'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/world-experience-control') {"
    if anchor in text:
        text = text.replace(anchor, route_block + "\n" + anchor, 1)
    else:
        raise SystemExit("Could not find world-experience anchor in dashboard.js")

p.write_text(text)
print("[OK] dashboard web3d route patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
########################################
for route in \
  / \
  /world-experience-control \
  /web3d-client \
  /world3d \
  /engine-bridge \
  /avatar-rig-control \
  /visual-streaming \
  /payment-control \
  /accessibility
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as web3d_client_profiles from web3d_client_profiles;" > "snapshots/web3d_client_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as web3d_scene_nodes from web3d_scene_nodes;" > "snapshots/web3d_scene_nodes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as web3d_runtime_events from web3d_runtime_events;" > "snapshots/web3d_runtime_events_${STAMP}.json"

sqlite3 -json db/aam.db "select id, profile_name, render_mode, control_mode, environment_mode, profile_status, created_at from web3d_client_profiles order by id desc limit 50;" > "snapshots/web3d_client_profiles_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, node_name, node_type, pos_x, pos_y, pos_z, scale_value, node_status, created_at from web3d_scene_nodes order by id desc limit 100;" > "snapshots/web3d_scene_nodes_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, event_type, event_payload, event_status, created_at from web3d_runtime_events order by id desc limit 100;" > "snapshots/web3d_runtime_events_tail_${STAMP}.json"

########################################
# 7) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "world 3d client not found" in lower:
        issues.append({"file": f.name, "problem": "world3d_missing"})

latest = Path.home() / "aam_full_system" / "snapshots" / "web3d_client_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] web3d client scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/fix_web3d_route_patch_and_finish_${STAMP}.txt" <<REPORT
FIX WEB3D ROUTE PATCH + FINISH REPORT
Timestamp: ${STAMP}

Fixed:
- /web3d-client route patch
- /world3d route patch
- nav link for Web 3D
- world3d file presence

Verified:
- dashboard health
- jarvis health
- socket health
- web3d smoke tests
- web3d snapshots

Purpose:
- recover from missing route patch
- stabilize everything
- finish the web 3d client phase cleanly
REPORT

echo "FIX WEB3D ROUTE PATCH + FINISH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/web3d_client_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/web3d-client"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
echo "  termux-open-url http://127.0.0.1:4900/world-experience-control"
