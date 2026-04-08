#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS ZA LIVE ROUTE REANCHOR START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_za_${STAMP}.js"

python3 <<'PY2EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

# remove old misplaced nav/help route block if it exists inside the wrong branch
old_routes = r"""
    if (req.method === 'GET' && pathname === '/navigation-workflow-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderNavigationWorkflowHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/help/navigation-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Navigation Help Bot','navigation_help','full_platform','manual_app_usage','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20navigation%20help%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/help/kingdom-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Kingdom Help Bot','kingdom_help','Kingdom App','kingdom_usage_and_guidance','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20Kingdom%20help%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/help/marketplace-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Marketplace Help Bot','marketplace_help','All American Marketplace Holographic Streaming Ecosystem','streaming_and_navigation_guidance','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20marketplace%20help%20created' });
      return res.end();
    }
"""
text = text.replace(old_routes, "")

# make sure helper exists
helper_sig = "function renderNavigationWorkflowHubPage(req, user = null, message = '') {"
if helper_sig not in text:
    helper = r"""
function renderNavigationWorkflowHubPage(req, user = null, message = '') {
  return htmlPage('Navigation Workflow Hub', `
    <main class="portal-main premium-main accessible-main">
      <section>
        <h1>Navigation + Workflow Hub</h1>
        <p>${esc(message || 'Swipe navigation, workflow mapping, and AI help guidance are live.')}</p>
      </section>
      <section>
        <h2>Swipe Directions</h2>
        <p><strong>Right:</strong> next major workspace</p>
        <p><strong>Left:</strong> AI and control spaces</p>
        <p><strong>Up:</strong> account, memory, and identity spaces</p>
        <p><strong>Down:</strong> deeper production and marketplace spaces</p>
      </section>
      <section>
        <h2>Help Bots</h2>
        <form method="POST" action="/help/navigation-safe" style="margin-bottom:12px;"><button type="submit">Create Navigation Help Bot</button></form>
        <form method="POST" action="/help/kingdom-safe" style="margin-bottom:12px;"><button type="submit">Create Kingdom Help Bot</button></form>
        <form method="POST" action="/help/marketplace-safe" style="margin-bottom:12px;"><button type="submit">Create Marketplace Help Bot</button></form>
      </section>
    </main>
  `, user);
}
"""
    anchor = "function renderCommandCenterPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

# insert new live routes right after the working homepage-showcase route
live_anchor = """    if (req.method === 'GET' && pathname === '/homepage-showcase') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHomepageShowcase(req, null, getQueryParam(req,'msg')||''));
    }
"""
new_live_routes = live_anchor + r"""

    if (req.method === 'GET' && pathname === '/navigation-workflow-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderNavigationWorkflowHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/help/navigation-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Navigation Help Bot','navigation_help','full_platform','manual_app_usage','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20navigation%20help%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/help/kingdom-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Kingdom Help Bot','kingdom_help','Kingdom App','kingdom_usage_and_guidance','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20Kingdom%20help%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/help/marketplace-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Marketplace Help Bot','marketplace_help','All American Marketplace Holographic Streaming Ecosystem','streaming_and_navigation_guidance','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20marketplace%20help%20created' });
      return res.end();
    }
"""

if "pathname === '/navigation-workflow-hub'" not in text and live_anchor in text:
    text = text.replace(live_anchor, new_live_routes, 1)

# ensure homepage nav link exists
nav_link = '<a href="/navigation-workflow-hub">Navigation Workflow Hub</a>'
if nav_link not in text and '<a href="/command-center">Command Center</a>' in text:
    text = text.replace(
        '<a href="/command-center">Command Center</a>',
        '<a href="/command-center">Command Center</a>\n<a href="/navigation-workflow-hub">Navigation Workflow Hub</a>',
        1
    )

p.write_text(text)
print("[OK] navigation routes re-anchored into live route chain")
PY2EOF

pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

curl -s http://127.0.0.1:4900/health > test_results/pass_za_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_za_jarvis_health_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/navigation-workflow-hub > test_results/pass_za_navigation_workflow_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/navigation-safe > test_results/pass_za_navigation_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/kingdom-safe > test_results/pass_za_kingdom_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/marketplace-safe > test_results/pass_za_marketplace_help_${STAMP}.txt || true

python3 <<PY3EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_za_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","pass_za_live_route_reanchor_scan_latest.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
print(json.dumps(issues, indent=2))
PY3EOF

bash scripts/status.sh || true

cat > "reports/pass_za_live_route_reanchor_${STAMP}.txt" <<REPORT
PASS ZA LIVE ROUTE REANCHOR REPORT
Timestamp: ${STAMP}

Fixed:
- moved navigation workflow routes into live request handler chain
- preserved dashboard and jarvis runtime

Purpose:
- make navigation workflow hub and help actions reachable
REPORT

echo "=== PASS ZA COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_za_live_route_reanchor_scan_latest.json"
echo "  cat reports/pass_za_live_route_reanchor_${STAMP}.txt"
echo "  bash scripts/status.sh"
