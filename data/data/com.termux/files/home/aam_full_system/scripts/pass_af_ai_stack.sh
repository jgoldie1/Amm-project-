#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS AF ADVANCED AI STACK + MONDAY + AGENTS START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports test_results backups

cp apps/dashboard.js "backups/dashboard_pass_af_${STAMP}.js"

########################################
# DATABASE (AI STACK)
########################################
sqlite3 data/aam.db <<SQL

CREATE TABLE IF NOT EXISTS ai_stack_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stack_name TEXT,
  stack_role TEXT,
  provider TEXT,
  stack_status TEXT
);

CREATE TABLE IF NOT EXISTS ai_agent_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_name TEXT,
  agent_type TEXT,
  agent_role TEXT,
  monetization_mode TEXT,
  agent_status TEXT
);

CREATE TABLE IF NOT EXISTS ai_task_marketplace_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT,
  task_type TEXT,
  payout_model TEXT,
  execution_mode TEXT,
  task_status TEXT
);

CREATE TABLE IF NOT EXISTS monday_ai_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_name TEXT,
  workflow_type TEXT,
  automation_scope TEXT,
  workflow_status TEXT
);

SQL

echo "[OK] AI STACK TABLES CREATED"

########################################
# PATCH DASHBOARD (AI HUB)
########################################
python3 <<'PY2EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderAIStackHubPage(req, user = null, message = '') {
  return htmlPage('AI Stack Hub', `
    <main class="portal-main premium-main accessible-main">
      <section>
        <h1>AI STACK CONTROL CENTER</h1>
        <p>${esc(message || 'All AI systems integrated: Stubbs AI, Lyons Tech AI, Monday AI, Creator Agents.')}</p>
      </section>

      <section>
        <h2>AI Systems</h2>
        <form method="POST" action="/ai/stubbs-safe"><button>Create Stubbs AI</button></form>
        <form method="POST" action="/ai/lyons-safe"><button>Create Lyons Tech AI</button></form>
        <form method="POST" action="/ai/monday-safe"><button>Create Monday AI Workflow</button></form>
      </section>

      <section>
        <h2>AI Agent Marketplace</h2>
        <form method="POST" action="/agent/create-safe"><button>Create AI Worker Agent</button></form>
        <form method="POST" action="/agent/task-safe"><button>Create Paid Task</button></form>
      </section>
    </main>
  `, user);
}
"""

if "renderAIStackHubPage" not in text:
    anchor = "function renderCommandCenterPage"
    text = text.replace(anchor, helper + "\n\n" + anchor, 1)

route = r"""
if (req.method === 'GET' && pathname === '/ai-stack-hub') {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  return res.end(renderAIStackHubPage(req, null, getQueryParam(req,'msg')||''));
}

if (req.method === 'POST' && pathname === '/ai/stubbs-safe') {
  dbRun(`INSERT INTO ai_stack_registry (stack_name, stack_role, provider, stack_status)
         VALUES ('Stubbs AI','front_assistant','internal','active')`);
  res.writeHead(302, { Location: '/ai-stack-hub?msg=Stubbs%20AI%20created' });
  return res.end();
}

if (req.method === 'POST' && pathname === '/ai/lyons-safe') {
  dbRun(`INSERT INTO ai_stack_registry (stack_name, stack_role, provider, stack_status)
         VALUES ('Lyons Tech AI','orchestrator','internal','active')`);
  res.writeHead(302, { Location: '/ai-stack-hub?msg=Lyons%20AI%20created' });
  return res.end();
}

if (req.method === 'POST' && pathname === '/ai/monday-safe') {
  dbRun(`INSERT INTO monday_ai_registry (workflow_name, workflow_type, automation_scope, workflow_status)
         VALUES ('Auto Workflow','project_ai','full_system','active')`);
  res.writeHead(302, { Location: '/ai-stack-hub?msg=Monday%20AI%20created' });
  return res.end();
}

if (req.method === 'POST' && pathname === '/agent/create-safe') {
  dbRun(`INSERT INTO ai_agent_registry (agent_name, agent_type, agent_role, monetization_mode, agent_status)
         VALUES ('AI Worker','task_agent','execution','paid','active')`);
  res.writeHead(302, { Location: '/ai-stack-hub?msg=Agent%20created' });
  return res.end();
}

if (req.method === 'POST' && pathname === '/agent/task-safe') {
  dbRun(`INSERT INTO ai_task_marketplace_registry (task_name, task_type, payout_model, execution_mode, task_status)
         VALUES ('AI Task','marketplace','per_task','automated','active')`);
  res.writeHead(302, { Location: '/ai-stack-hub?msg=Task%20created' });
  return res.end();
}
"""

if "pathname === '/ai-stack-hub'" not in text:
    anchor = "pathname === '/command-center'"
    text = text.replace(anchor, route + "\n" + anchor, 1)

p.write_text(text)
print("[OK] AI STACK HUB PATCHED")
PY2EOF

########################################
# RESTART
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# SMOKE TEST
########################################
curl -s -i http://127.0.0.1:4900/ai-stack-hub > test_results/pass_af_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/agent/create-safe > test_results/pass_af_agent_${STAMP}.txt || true

########################################
# STATUS
########################################
bash scripts/status.sh || true

echo "=== PASS AF COMPLETE ==="
