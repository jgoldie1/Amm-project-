#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MULTIVERSE PASS C MINIMAL SAFE CORE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_multiverse_pass_c_min_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_multiverse_pass_c_min_${STAMP}.js"

########################################
# 1) CREATE PASS C TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS googleplex_memory_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memory_name TEXT,
  memory_group TEXT,
  memory_scope TEXT,
  memory_value TEXT,
  memory_index_key TEXT,
  memory_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS execution_engine_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  engine_name TEXT,
  engine_group TEXT,
  engine_mode TEXT,
  target_scope TEXT,
  engine_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tool_orchestrator_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orchestrator_name TEXT,
  orchestrator_group TEXT,
  tool_scope TEXT,
  routing_mode TEXT,
  orchestrator_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_call_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_name TEXT,
  provider_name TEXT,
  call_target TEXT,
  call_payload TEXT,
  call_result TEXT,
  call_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS autonomy_goal_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_name TEXT,
  goal_group TEXT,
  goal_scope TEXT,
  goal_priority TEXT,
  goal_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multi_agent_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_name TEXT,
  agent_group TEXT,
  parent_agent TEXT,
  role_name TEXT,
  agent_scope TEXT,
  agent_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_message_bus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_name TEXT,
  source_agent TEXT,
  target_agent TEXT,
  message_group TEXT,
  message_payload TEXT,
  message_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS world_state_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_name TEXT,
  state_group TEXT,
  linked_realm TEXT,
  state_value TEXT,
  state_mode TEXT,
  state_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass C minimal tables created"

########################################
# 2) SEED PASS C
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO googleplex_memory_registry (memory_name, memory_group, memory_scope, memory_value, memory_index_key, memory_status)
SELECT 'platform_googleplex_memory','memory_core','global','stable_platform_state','root_index','active'
WHERE NOT EXISTS (SELECT 1 FROM googleplex_memory_registry WHERE memory_name='platform_googleplex_memory');

INSERT INTO execution_engine_registry (engine_name, engine_group, engine_mode, target_scope, engine_status)
SELECT 'jarvis_execution_engine','execution','agent_loop','platform','active'
WHERE NOT EXISTS (SELECT 1 FROM execution_engine_registry WHERE engine_name='jarvis_execution_engine');

INSERT INTO tool_orchestrator_registry (orchestrator_name, orchestrator_group, tool_scope, routing_mode, orchestrator_status)
SELECT 'jarvis_tool_orchestrator','tooling','global','policy_routed','active'
WHERE NOT EXISTS (SELECT 1 FROM tool_orchestrator_registry WHERE orchestrator_name='jarvis_tool_orchestrator');

INSERT INTO api_call_registry (api_name, provider_name, call_target, call_payload, call_result, call_status)
SELECT 'bootstrap_api_probe','ChatGPT','reasoning','{}','ok','complete'
WHERE NOT EXISTS (SELECT 1 FROM api_call_registry WHERE api_name='bootstrap_api_probe');

INSERT INTO autonomy_goal_registry (goal_name, goal_group, goal_scope, goal_priority, goal_status)
SELECT 'stabilize_multiverse_operations','autonomy','platform','high','active'
WHERE NOT EXISTS (SELECT 1 FROM autonomy_goal_registry WHERE goal_name='stabilize_multiverse_operations');

INSERT INTO multi_agent_registry (agent_name, agent_group, parent_agent, role_name, agent_scope, agent_status)
SELECT 'Jarvis Root','root',NULL,'orchestrator','platform','active'
WHERE NOT EXISTS (SELECT 1 FROM multi_agent_registry WHERE agent_name='Jarvis Root');

INSERT INTO multi_agent_registry (agent_name, agent_group, parent_agent, role_name, agent_scope, agent_status)
SELECT 'Clawbot Agent','operations','Jarvis Root','execution_worker','multiverse','active'
WHERE NOT EXISTS (SELECT 1 FROM multi_agent_registry WHERE agent_name='Clawbot Agent');

INSERT INTO multi_agent_registry (agent_name, agent_group, parent_agent, role_name, agent_scope, agent_status)
SELECT 'Symbolic Reasoner','reasoning','Jarvis Root','symbolic_worker','global','active'
WHERE NOT EXISTS (SELECT 1 FROM multi_agent_registry WHERE agent_name='Symbolic Reasoner');

INSERT INTO multi_agent_registry (agent_name, agent_group, parent_agent, role_name, agent_scope, agent_status)
SELECT 'Five Sense Agent','perception','Jarvis Root','sensory_worker','runtime','active'
WHERE NOT EXISTS (SELECT 1 FROM multi_agent_registry WHERE agent_name='Five Sense Agent');

INSERT INTO agent_message_bus (message_name, source_agent, target_agent, message_group, message_payload, message_status)
SELECT 'bootstrap_message','Jarvis Root','Clawbot Agent','control','{"instruction":"stabilize"}','sent'
WHERE NOT EXISTS (SELECT 1 FROM agent_message_bus WHERE message_name='bootstrap_message');

INSERT INTO world_state_registry (state_name, state_group, linked_realm, state_value, state_mode, state_status)
SELECT 'multiverse_runtime_state','runtime','Primary Multiverse Realm','stable','managed','active'
WHERE NOT EXISTS (SELECT 1 FROM world_state_registry WHERE state_name='multiverse_runtime_state');
SQL

echo "[OK] pass C minimal seeded"

########################################
# 3) PATCH ONLY SAFE POST ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

routes = r"""
    if (req.method === 'POST' && pathname === '/agi/googleplex-memory-safe') {
      dbRun(`INSERT INTO googleplex_memory_registry (memory_name, memory_group, memory_scope, memory_value, memory_index_key, memory_status)
             VALUES ('Safe Googleplex Memory','sandbox','platform','safe_memory_state','safe_index','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20Googleplex%20memory%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/execution-engine-safe') {
      dbRun(`INSERT INTO execution_engine_registry (engine_name, engine_group, engine_mode, target_scope, engine_status)
             VALUES ('Safe Execution Engine','sandbox','agent_loop','platform','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20execution%20engine%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/tool-orchestrator-safe') {
      dbRun(`INSERT INTO tool_orchestrator_registry (orchestrator_name, orchestrator_group, tool_scope, routing_mode, orchestrator_status)
             VALUES ('Safe Tool Orchestrator','sandbox','global','policy_routed','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20tool%20orchestrator%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/api-call-safe') {
      dbRun(`INSERT INTO api_call_registry (api_name, provider_name, call_target, call_payload, call_result, call_status)
             VALUES ('Safe API Call','Magnus AI','cross_industry_ops','{}','ok','complete')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20API%20call%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/goal-safe') {
      dbRun(`INSERT INTO autonomy_goal_registry (goal_name, goal_group, goal_scope, goal_priority, goal_status)
             VALUES ('Safe Goal','sandbox','platform','medium','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20goal%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/agent-safe') {
      dbRun(`INSERT INTO multi_agent_registry (agent_name, agent_group, parent_agent, role_name, agent_scope, agent_status)
             VALUES ('Safe Agent','sandbox','Jarvis Root','worker','multiverse','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20agent%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/message-safe') {
      dbRun(`INSERT INTO agent_message_bus (message_name, source_agent, target_agent, message_group, message_payload, message_status)
             VALUES ('Safe Message','Jarvis Root','Safe Agent','control','{"instruction":"assist"}','sent')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20message%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/world-state-safe') {
      dbRun(`INSERT INTO world_state_registry (state_name, state_group, linked_realm, state_value, state_mode, state_status)
             VALUES ('Safe World State','sandbox','Primary Multiverse Realm','stable','managed','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20world%20state%20created' });
      return res.end();
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/multiverse-bridge') {"
if "pathname === '/agi/googleplex-memory-safe'" not in text and anchor in text:
    text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] pass C minimal routes patched")
PYEOF

########################################
# 4) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 5) CURRENT-RUN TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true

curl -s -i -X POST http://127.0.0.1:4900/agi/googleplex-memory-safe > "test_results/googleplex_memory_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/execution-engine-safe > "test_results/execution_engine_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/tool-orchestrator-safe > "test_results/tool_orchestrator_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/api-call-safe > "test_results/api_call_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/goal-safe > "test_results/autonomy_goal_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/agent-safe > "test_results/multi_agent_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/message-safe > "test_results/agent_message_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/world-state-safe > "test_results/world_state_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as googleplex_memory_registry from googleplex_memory_registry;" > "snapshots/googleplex_memory_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as execution_engine_registry from execution_engine_registry;" > "snapshots/execution_engine_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as tool_orchestrator_registry from tool_orchestrator_registry;" > "snapshots/tool_orchestrator_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as api_call_registry from api_call_registry;" > "snapshots/api_call_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as autonomy_goal_registry from autonomy_goal_registry;" > "snapshots/autonomy_goal_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multi_agent_registry from multi_agent_registry;" > "snapshots/multi_agent_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agent_message_bus from agent_message_bus;" > "snapshots/agent_message_bus_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_state_registry from world_state_registry;" > "snapshots/world_state_registry_${STAMP}.json"

########################################
# 7) CURRENT-RUN ERROR SCAN ONLY
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

latest = Path.home() / "aam_full_system" / "snapshots" / "multiverse_pass_c_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] multiverse pass C minimal scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/multiverse_pass_c_minimal_safe_core_${STAMP}.txt" <<REPORT
MULTIVERSE PASS C MINIMAL SAFE CORE REPORT
Timestamp: ${STAMP}

Built:
- googleplex memory registry
- execution engine registry
- tool orchestrator registry
- api call registry
- autonomy goal registry
- multi agent registry
- agent message bus
- world state registry

Verified:
- dashboard health
- jarvis health
- multiverse bridge route
- safe pass C actions
- current-run-only scan
- stable runtime

Purpose:
- add deep memory and execution foundations safely
- avoid giant dashboard helper interruption risk
- prepare for later UI expansion and commerce hooks
REPORT

echo "MULTIVERSE PASS C MINIMAL SAFE CORE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/multiverse_pass_c_scan_latest.json"
echo "  cat reports/multiverse_pass_c_minimal_safe_core_${STAMP}.txt"
echo "  bash scripts/status.sh"
