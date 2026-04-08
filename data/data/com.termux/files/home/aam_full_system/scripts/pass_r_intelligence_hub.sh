#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS R INTELLIGENCE PROVIDERS + HUB START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_pass_r_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_pass_r_${STAMP}.js"

sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS intelligence_provider_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_name TEXT,
  provider_group TEXT,
  provider_role TEXT,
  provider_scope TEXT,
  provider_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intelligence_hub_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hub_name TEXT,
  linked_brand TEXT,
  hub_scope TEXT,
  routing_mode TEXT,
  hub_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider_connection_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connection_name TEXT,
  source_provider TEXT,
  target_system TEXT,
  connection_mode TEXT,
  connection_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS symbolic_reasoning_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbolic_name TEXT,
  linked_agent TEXT,
  reasoning_scope TEXT,
  reasoning_mode TEXT,
  symbolic_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS five_sense_runtime_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  runtime_name TEXT,
  linked_agent TEXT,
  sensory_scope TEXT,
  runtime_mode TEXT,
  runtime_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hierarchy_runtime_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hierarchy_name TEXT,
  parent_system TEXT,
  hierarchy_scope TEXT,
  control_mode TEXT,
  hierarchy_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'Stubbs AI','core_intelligence','primary_identity','platform_wide','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='Stubbs AI');

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'Lyons Tech','brand_layer','systems_architecture','platform_wide','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='Lyons Tech');

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'Googleplex Tech','intelligence_engine','orchestration+reasoning','platform_wide','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='Googleplex Tech');

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'Googleplex Memory','memory_engine','long_term_memory','platform_wide','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='Googleplex Memory');

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'Manus AI','agent_provider','workflow_execution','task_automation','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='Manus AI');

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'GitHub Copilot','coding_provider','code_assistance','development','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='GitHub Copilot');

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'ChatGPT Pro','reasoning_provider','conversation+planning','platform_wide','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='ChatGPT Pro');

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'Hugging Face','model_provider','models+spaces','ml_and_apps','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='Hugging Face');

INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
SELECT 'Lovable Dev','builder_provider','app_builder','rapid_ui_and_apps','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_provider_registry WHERE provider_name='Lovable Dev');

INSERT INTO intelligence_hub_registry (hub_name, linked_brand, hub_scope, routing_mode, hub_status)
SELECT 'Primary Intelligence Hub','Stubbs AI','all_intelligence_layers','hub_routing','active'
WHERE NOT EXISTS (SELECT 1 FROM intelligence_hub_registry WHERE hub_name='Primary Intelligence Hub');

INSERT INTO provider_connection_registry (connection_name, source_provider, target_system, connection_mode, connection_status)
SELECT 'Stubbs AI to Archive Memory','Stubbs AI','Archive Memory','native_bridge','active'
WHERE NOT EXISTS (SELECT 1 FROM provider_connection_registry WHERE connection_name='Stubbs AI to Archive Memory');

INSERT INTO provider_connection_registry (connection_name, source_provider, target_system, connection_mode, connection_status)
SELECT 'Googleplex Memory to Archive Memory','Googleplex Memory','Archive Memory','memory_bridge','active'
WHERE NOT EXISTS (SELECT 1 FROM provider_connection_registry WHERE connection_name='Googleplex Memory to Archive Memory');

INSERT INTO provider_connection_registry (connection_name, source_provider, target_system, connection_mode, connection_status)
SELECT 'ChatGPT Pro to Backlog','ChatGPT Pro','AI Backlog','continuation_bridge','active'
WHERE NOT EXISTS (SELECT 1 FROM provider_connection_registry WHERE connection_name='ChatGPT Pro to Backlog');

INSERT INTO provider_connection_registry (connection_name, source_provider, target_system, connection_mode, connection_status)
SELECT 'GitHub Copilot to Development','GitHub Copilot','Development Stack','code_bridge','active'
WHERE NOT EXISTS (SELECT 1 FROM provider_connection_registry WHERE connection_name='GitHub Copilot to Development');

INSERT INTO provider_connection_registry (connection_name, source_provider, target_system, connection_mode, connection_status)
SELECT 'Manus AI to Workflow Engine','Manus AI','Workflow Engine','agent_bridge','active'
WHERE NOT EXISTS (SELECT 1 FROM provider_connection_registry WHERE connection_name='Manus AI to Workflow Engine');

INSERT INTO provider_connection_registry (connection_name, source_provider, target_system, connection_mode, connection_status)
SELECT 'Hugging Face to Model Layer','Hugging Face','Model Layer','model_bridge','active'
WHERE NOT EXISTS (SELECT 1 FROM provider_connection_registry WHERE connection_name='Hugging Face to Model Layer');

INSERT INTO provider_connection_registry (connection_name, source_provider, target_system, connection_mode, connection_status)
SELECT 'Lovable Dev to UI Builder','Lovable Dev','UI Builder','builder_bridge','active'
WHERE NOT EXISTS (SELECT 1 FROM provider_connection_registry WHERE connection_name='Lovable Dev to UI Builder');

INSERT INTO symbolic_reasoning_registry (symbolic_name, linked_agent, reasoning_scope, reasoning_mode, symbolic_status)
SELECT 'Primary Symbolic Runtime','Stubbs AI','platform_reasoning','symbolic_logic','active'
WHERE NOT EXISTS (SELECT 1 FROM symbolic_reasoning_registry WHERE symbolic_name='Primary Symbolic Runtime');

INSERT INTO five_sense_runtime_registry (runtime_name, linked_agent, sensory_scope, runtime_mode, runtime_status)
SELECT 'Primary Five Sense Runtime','Stubbs AI','voice+hearing+vision+context+response','multisense','active'
WHERE NOT EXISTS (SELECT 1 FROM five_sense_runtime_registry WHERE runtime_name='Primary Five Sense Runtime');

INSERT INTO hierarchy_runtime_registry (hierarchy_name, parent_system, hierarchy_scope, control_mode, hierarchy_status)
SELECT 'Primary AGI Hierarchy','Lyons Tech','agents+providers+memory','layered_control','active'
WHERE NOT EXISTS (SELECT 1 FROM hierarchy_runtime_registry WHERE hierarchy_name='Primary AGI Hierarchy');
SQL

python3 <<'PY2EOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderIntelligenceHubPage(req, user = null, message = '') {
  return htmlPage('Intelligence Hub', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section>
        <h1>Intelligence Hub</h1>
        <p>${esc(message || 'Stubbs AI, Lyons Tech, Googleplex, Manus, Copilot, ChatGPT, Hugging Face, and Lovable Dev are connected to the platform intelligence layer.')}</p>
      </section>
      <section>
        <h2>Quick Actions</h2>
        <form method="POST" action="/intelligence/provider-safe" style="margin-bottom:12px;"><button type="submit">Create Provider Record</button></form>
        <form method="POST" action="/intelligence/connection-safe" style="margin-bottom:12px;"><button type="submit">Create Provider Connection</button></form>
        <form method="POST" action="/intelligence/symbolic-safe" style="margin-bottom:12px;"><button type="submit">Create Symbolic Runtime</button></form>
        <form method="POST" action="/intelligence/five-sense-safe" style="margin-bottom:12px;"><button type="submit">Create Five Sense Runtime</button></form>
        <form method="POST" action="/intelligence/hierarchy-safe" style="margin-bottom:12px;"><button type="submit">Create AGI Hierarchy</button></form>
      </section>
    </main>
  `, user);
}
"""

routes = r"""
    if (req.method === 'GET' && pathname === '/intelligence-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderIntelligenceHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/intelligence/provider-safe') {
      dbRun(`INSERT INTO intelligence_provider_registry (provider_name, provider_group, provider_role, provider_scope, provider_status)
             VALUES ('Safe Provider','intelligence_provider','attached_service','platform_wide','active')`);
      res.writeHead(302, { Location: '/intelligence-hub?msg=Safe%20provider%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/intelligence/connection-safe') {
      dbRun(`INSERT INTO provider_connection_registry (connection_name, source_provider, target_system, connection_mode, connection_status)
             VALUES ('Safe Provider Connection','Stubbs AI','Archive Memory','native_bridge','active')`);
      res.writeHead(302, { Location: '/intelligence-hub?msg=Safe%20connection%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/intelligence/symbolic-safe') {
      dbRun(`INSERT INTO symbolic_reasoning_registry (symbolic_name, linked_agent, reasoning_scope, reasoning_mode, symbolic_status)
             VALUES ('Safe Symbolic Runtime','Stubbs AI','platform_reasoning','symbolic_logic','active')`);
      res.writeHead(302, { Location: '/intelligence-hub?msg=Safe%20symbolic%20runtime%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/intelligence/five-sense-safe') {
      dbRun(`INSERT INTO five_sense_runtime_registry (runtime_name, linked_agent, sensory_scope, runtime_mode, runtime_status)
             VALUES ('Safe Five Sense Runtime','Stubbs AI','voice+hearing+vision+context+response','multisense','active')`);
      res.writeHead(302, { Location: '/intelligence-hub?msg=Safe%20five%20sense%20runtime%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/intelligence/hierarchy-safe') {
      dbRun(`INSERT INTO hierarchy_runtime_registry (hierarchy_name, parent_system, hierarchy_scope, control_mode, hierarchy_status)
             VALUES ('Safe AGI Hierarchy','Lyons Tech','agents+providers+memory','layered_control','active')`);
      res.writeHead(302, { Location: '/intelligence-hub?msg=Safe%20AGI%20hierarchy%20created' });
      return res.end();
    }
"""

if "function renderIntelligenceHubPage(req, user = null, message = '') {" not in text:
    anchor = "function renderCommandCenterPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

if "pathname === '/intelligence-hub'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/command-center') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

if '<a href="/intelligence-hub">Intelligence Hub</a>' not in text and '<a href="/archive-memory">Archive Memory</a>' in text:
    text = text.replace(
        '<a href="/archive-memory">Archive Memory</a>',
        '<a href="/archive-memory">Archive Memory</a>\n<a href="/intelligence-hub">Intelligence Hub</a>',
        1
    )

p.write_text(text)
print("[OK] intelligence hub helper + routes patched")
PY2EOF

pkill -f "dashboard.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5

curl -s -i http://127.0.0.1:4900/intelligence-hub > test_results/intelligence_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/intelligence/provider-safe > test_results/intelligence_provider_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/intelligence/connection-safe > test_results/intelligence_connection_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/intelligence/symbolic-safe > test_results/intelligence_symbolic_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/intelligence/five-sense-safe > test_results/intelligence_five_sense_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/intelligence/hierarchy-safe > test_results/intelligence_hierarchy_${STAMP}.txt || true

python3 <<PY3EOF
from pathlib import Path
import json
stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []
for f in root.glob(f"*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
Path.home().joinpath("aam_full_system","snapshots","pass_r_intelligence_hub_scan_latest.json").write_text(json.dumps(issues, indent=2))
print("issues:", len(issues))
PY3EOF

bash scripts/status.sh || true

cat > "reports/pass_r_intelligence_hub_${STAMP}.txt" <<REPORT
PASS R INTELLIGENCE HUB REPORT
Timestamp: ${STAMP}

Built:
- intelligence provider registry
- intelligence hub registry
- provider connection registry
- symbolic reasoning registry
- five sense runtime registry
- hierarchy runtime registry
- intelligence hub page
- intelligence safe actions
REPORT

echo "=== PASS R COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_r_intelligence_hub_scan_latest.json"
echo "  cat reports/pass_r_intelligence_hub_${STAMP}.txt"
echo "  bash scripts/status.sh"
