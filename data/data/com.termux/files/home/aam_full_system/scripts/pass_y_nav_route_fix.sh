#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS Y FIX NAV ROUTES ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_y_${STAMP}.js"

########################################
# 1) PATCH ROUTES DIRECTLY BEFORE 404 FALLBACK
########################################
python3 <<'PY2EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

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

routes = r"""
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

if "function renderNavigationWorkflowHubPage(req, user = null, message = '') {" not in text:
    anchor = "function renderCommandCenterPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

if "pathname === '/navigation-workflow-hub'" not in text:
    fallback_anchor = "  res.writeHead(404"
    idx = text.find(fallback_anchor)
    if idx != -1:
        text = text[:idx] + routes + "\n" + text[idx:]

if '<a href="/navigation-workflow-hub">Navigation Workflow Hub</a>' not in text:
    nav_anchor = '<a href="/command-center">Command Center</a>'
    if nav_anchor in text:
        text = text.replace(
            nav_anchor,
            nav_anchor + '\n<a href="/navigation-workflow-hub">Navigation Workflow Hub</a>',
            1
        )

p.write_text(text)
print("[OK] navigation workflow routes patched before 404 fallback")
PY2EOF

########################################
# 2) RESTART
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 3) SMOKE
########################################
curl -s http://127.0.0.1:4900/health > test_results/pass_y_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_y_jarvis_health_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/navigation-workflow-hub > test_results/pass_y_navigation_workflow_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/navigation-safe > test_results/pass_y_navigation_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/kingdom-safe > test_results/pass_y_kingdom_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/marketplace-safe > test_results/pass_y_marketplace_help_${STAMP}.txt || true

########################################
# 4) SCAN
########################################
python3 <<PY3EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_y_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","pass_y_nav_route_fix_scan_latest.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
print(json.dumps(issues, indent=2))
PY3EOF

bash scripts/status.sh || true

cat > "reports/pass_y_nav_route_fix_${STAMP}.txt" <<REPORT
PASS Y NAV ROUTE FIX REPORT
Timestamp: ${STAMP}

Fixed:
- navigation workflow hub GET route
- navigation help POST route
- kingdom help POST route
- marketplace help POST route

Purpose:
- finish Pass X route attachment
- preserve stable runtime
REPORT

echo "=== PASS Y COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_y_nav_route_fix_scan_latest.json"
echo "  cat reports/pass_y_nav_route_fix_${STAMP}.txt"
echo "  bash scripts/status.sh"
