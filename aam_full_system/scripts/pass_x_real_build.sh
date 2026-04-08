#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS X REAL BUILD START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_pass_x_real_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_pass_x_real_${STAMP}.js"

########################################
# 1) CREATE TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS navigation_surface_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surface_name TEXT,
  surface_group TEXT,
  linked_route TEXT,
  surface_scope TEXT,
  surface_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS swipe_navigation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nav_name TEXT,
  direction_name TEXT,
  source_surface TEXT,
  target_surface TEXT,
  nav_mode TEXT,
  nav_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_path_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_name TEXT,
  workflow_group TEXT,
  entry_surface TEXT,
  target_outcome TEXT,
  workflow_mode TEXT,
  workflow_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS help_assistant_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assistant_name TEXT,
  assistant_group TEXT,
  target_system TEXT,
  help_scope TEXT,
  assistant_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_guidance_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guide_name TEXT,
  guide_group TEXT,
  linked_surface TEXT,
  guidance_mode TEXT,
  guide_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Homepage Showcase','core','/homepage-showcase','entry_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Homepage Showcase');

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Command Center','core','/command-center','system_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Command Center');

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Streaming Hub','media','/streaming-hub','creator_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Streaming Hub');

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Publishing Hub','media','/publishing-hub','release_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Publishing Hub');

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Studio Lab','production','/studio-lab','production_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Studio Lab');

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Creator TV','media','/creator-tv','creator_media_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Creator TV');

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Archive Memory','intelligence','/archive-memory','memory_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Archive Memory');

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Intelligence Hub','intelligence','/intelligence-hub','ai_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Intelligence Hub');

INSERT INTO navigation_surface_registry (surface_name, surface_group, linked_route, surface_scope, surface_status)
SELECT 'Account Center','identity','/account-center','account_navigation','active'
WHERE NOT EXISTS (SELECT 1 FROM navigation_surface_registry WHERE surface_name='Account Center');

INSERT INTO swipe_navigation_registry (nav_name, direction_name, source_surface, target_surface, nav_mode, nav_status)
SELECT 'Home To Command','right','Homepage Showcase','Command Center','swipe','active'
WHERE NOT EXISTS (SELECT 1 FROM swipe_navigation_registry WHERE nav_name='Home To Command');

INSERT INTO swipe_navigation_registry (nav_name, direction_name, source_surface, target_surface, nav_mode, nav_status)
SELECT 'Command To Streaming','down','Command Center','Streaming Hub','swipe','active'
WHERE NOT EXISTS (SELECT 1 FROM swipe_navigation_registry WHERE nav_name='Command To Streaming');

INSERT INTO swipe_navigation_registry (nav_name, direction_name, source_surface, target_surface, nav_mode, nav_status)
SELECT 'Streaming To Publishing','right','Streaming Hub','Publishing Hub','swipe','active'
WHERE NOT EXISTS (SELECT 1 FROM swipe_navigation_registry WHERE nav_name='Streaming To Publishing');

INSERT INTO swipe_navigation_registry (nav_name, direction_name, source_surface, target_surface, nav_mode, nav_status)
SELECT 'Publishing To Studio','down','Publishing Hub','Studio Lab','swipe','active'
WHERE NOT EXISTS (SELECT 1 FROM swipe_navigation_registry WHERE nav_name='Publishing To Studio');

INSERT INTO swipe_navigation_registry (nav_name, direction_name, source_surface, target_surface, nav_mode, nav_status)
SELECT 'Studio To Creator TV','right','Studio Lab','Creator TV','swipe','active'
WHERE NOT EXISTS (SELECT 1 FROM swipe_navigation_registry WHERE nav_name='Studio To Creator TV');

INSERT INTO swipe_navigation_registry (nav_name, direction_name, source_surface, target_surface, nav_mode, nav_status)
SELECT 'Command To Intelligence','left','Command Center','Intelligence Hub','swipe','active'
WHERE NOT EXISTS (SELECT 1 FROM swipe_navigation_registry WHERE nav_name='Command To Intelligence');

INSERT INTO swipe_navigation_registry (nav_name, direction_name, source_surface, target_surface, nav_mode, nav_status)
SELECT 'Intelligence To Archive','up','Intelligence Hub','Archive Memory','swipe','active'
WHERE NOT EXISTS (SELECT 1 FROM swipe_navigation_registry WHERE nav_name='Intelligence To Archive');

INSERT INTO swipe_navigation_registry (nav_name, direction_name, source_surface, target_surface, nav_mode, nav_status)
SELECT 'Command To Account','up','Command Center','Account Center','swipe','active'
WHERE NOT EXISTS (SELECT 1 FROM swipe_navigation_registry WHERE nav_name='Command To Account');

INSERT INTO workflow_path_registry (workflow_name, workflow_group, entry_surface, target_outcome, workflow_mode, workflow_status)
SELECT 'Creator Launch Workflow','creator','Homepage Showcase','creator_growth_and_release','guided_flow','active'
WHERE NOT EXISTS (SELECT 1 FROM workflow_path_registry WHERE workflow_name='Creator Launch Workflow');

INSERT INTO workflow_path_registry (workflow_name, workflow_group, entry_surface, target_outcome, workflow_mode, workflow_status)
SELECT 'Movie To Revenue Workflow','media','Studio Lab','production_to_distribution_to_revenue','guided_flow','active'
WHERE NOT EXISTS (SELECT 1 FROM workflow_path_registry WHERE workflow_name='Movie To Revenue Workflow');

INSERT INTO workflow_path_registry (workflow_name, workflow_group, entry_surface, target_outcome, workflow_mode, workflow_status)
SELECT 'Kingdom App Guidance Workflow','kingdom','Homepage Showcase','kingdom_navigation_and_help','guided_flow','active'
WHERE NOT EXISTS (SELECT 1 FROM workflow_path_registry WHERE workflow_name='Kingdom App Guidance Workflow');

INSERT INTO workflow_path_registry (workflow_name, workflow_group, entry_surface, target_outcome, workflow_mode, workflow_status)
SELECT 'Marketplace Holographic Streaming Workflow','marketplace','Streaming Hub','all_american_marketplace_holographic_streaming','guided_flow','active'
WHERE NOT EXISTS (SELECT 1 FROM workflow_path_registry WHERE workflow_name='Marketplace Holographic Streaming Workflow');

INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
SELECT 'Navigation Help Bot','navigation_help','full_platform','manual_app_usage','active'
WHERE NOT EXISTS (SELECT 1 FROM help_assistant_registry WHERE assistant_name='Navigation Help Bot');

INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
SELECT 'Kingdom App Help Bot','kingdom_help','Kingdom App','kingdom_usage_and_guidance','active'
WHERE NOT EXISTS (SELECT 1 FROM help_assistant_registry WHERE assistant_name='Kingdom App Help Bot');

INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
SELECT 'Marketplace Holo Streaming Help Bot','marketplace_help','All American Marketplace Holographic Streaming Ecosystem','streaming_and_navigation_guidance','active'
WHERE NOT EXISTS (SELECT 1 FROM help_assistant_registry WHERE assistant_name='Marketplace Holo Streaming Help Bot');

INSERT INTO user_guidance_registry (guide_name, guide_group, linked_surface, guidance_mode, guide_status)
SELECT 'Swipe Guidance','navigation','Homepage Showcase','directional_swipe_guide','active'
WHERE NOT EXISTS (SELECT 1 FROM user_guidance_registry WHERE guide_name='Swipe Guidance');

INSERT INTO user_guidance_registry (guide_name, guide_group, linked_surface, guidance_mode, guide_status)
SELECT 'Creator Guidance','creator','Streaming Hub','guided_steps','active'
WHERE NOT EXISTS (SELECT 1 FROM user_guidance_registry WHERE guide_name='Creator Guidance');

INSERT INTO user_guidance_registry (guide_name, guide_group, linked_surface, guidance_mode, guide_status)
SELECT 'Kingdom Guidance','kingdom','Homepage Showcase','guided_steps','active'
WHERE NOT EXISTS (SELECT 1 FROM user_guidance_registry WHERE guide_name='Kingdom Guidance');
SQL

########################################
# 2) PATCH ROUTES
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
        <p><strong>Right:</strong> move into the next major workspace</p>
        <p><strong>Left:</strong> move into AI and control spaces</p>
        <p><strong>Up:</strong> move into account, memory, and identity spaces</p>
        <p><strong>Down:</strong> move into deeper production, release, and marketplace spaces</p>
      </section>
      <section>
        <h2>Primary App Flow</h2>
        <p>Homepage → Command Center → Streaming Hub → Publishing Hub → Studio Lab → Creator TV</p>
        <p>Command Center → Intelligence Hub → Archive Memory</p>
        <p>Command Center → Account Center</p>
      </section>
      <section>
        <h2>Help Bots</h2>
        <form method="POST" action="/help/navigation-safe" style="margin-bottom:12px;"><button type="submit">Create Navigation Help Bot</button></form>
        <form method="POST" action="/help/kingdom-safe" style="margin-bottom:12px;"><button type="submit">Create Kingdom Help Bot</button></form>
        <form method="POST" action="/help/marketplace-safe" style="margin-bottom:12px;"><button type="submit">Create Marketplace Holo Streaming Help Bot</button></form>
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
    anchor = "    if (req.method === 'GET' && pathname === '/command-center') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

if '<a href="/navigation-workflow-hub">Navigation Workflow Hub</a>' not in text and '<a href="/command-center">Command Center</a>' in text:
    text = text.replace(
        '<a href="/command-center">Command Center</a>',
        '<a href="/command-center">Command Center</a>\n<a href="/navigation-workflow-hub">Navigation Workflow Hub</a>',
        1
    )

p.write_text(text)
print("[OK] navigation workflow hub patched")
PY2EOF

########################################
# 3) RESTART
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 4) SMOKE
########################################
curl -s http://127.0.0.1:4900/health > test_results/pass_x_real_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_x_real_jarvis_health_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/navigation-workflow-hub > test_results/pass_x_real_navigation_workflow_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/navigation-safe > test_results/pass_x_real_navigation_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/kingdom-safe > test_results/pass_x_real_kingdom_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/marketplace-safe > test_results/pass_x_real_marketplace_help_${STAMP}.txt || true

########################################
# 5) SCAN
########################################
python3 <<PY3EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_x_real_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","pass_x_navigation_workflow_scan_latest.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
print(json.dumps(issues, indent=2))
PY3EOF

bash scripts/status.sh || true

cat > "reports/pass_x_real_build_${STAMP}.txt" <<REPORT
PASS X REAL BUILD REPORT
Timestamp: ${STAMP}

Built:
- navigation surface registry
- swipe navigation registry
- workflow path registry
- help assistant registry
- user guidance registry
- navigation workflow hub
- help bot routes

Purpose:
- create real swipe/workflow/help layer
- support Kingdom app guidance
- support All American Marketplace holographic streaming ecosystem guidance
REPORT

echo "=== PASS X REAL BUILD COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_x_navigation_workflow_scan_latest.json"
echo "  cat reports/pass_x_real_build_${STAMP}.txt"
echo "  bash scripts/status.sh"
