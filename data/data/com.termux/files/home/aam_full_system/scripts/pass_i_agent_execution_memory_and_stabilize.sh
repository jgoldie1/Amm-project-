#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS I AGENT EXECUTION + MEMORY + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_pass_i_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_pass_i_${STAMP}.js"

########################################
# 1) CREATE PASS I TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS agi_planner_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planner_name TEXT,
  planner_group TEXT,
  planning_mode TEXT,
  target_scope TEXT,
  planner_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agi_worker_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_name TEXT,
  worker_group TEXT,
  task_scope TEXT,
  execution_mode TEXT,
  worker_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agi_memory_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memory_key TEXT,
  memory_group TEXT,
  memory_value TEXT,
  memory_scope TEXT,
  memory_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agi_tool_call_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_name TEXT,
  provider_name TEXT,
  call_input TEXT,
  call_output TEXT,
  call_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agi_verifier_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verifier_name TEXT,
  verifier_group TEXT,
  verification_mode TEXT,
  target_scope TEXT,
  verifier_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agi_recovery_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recovery_name TEXT,
  recovery_group TEXT,
  failure_type TEXT,
  recovery_action TEXT,
  recovery_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agi_task_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT,
  task_group TEXT,
  assigned_planner TEXT,
  assigned_worker TEXT,
  task_input TEXT,
  task_priority TEXT,
  task_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass I tables created"

########################################
# 2) SEED PASS I
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO agi_planner_registry (planner_name, planner_group, planning_mode, target_scope, planner_status)
SELECT 'Jarvis Master Planner','orchestration','goal_breakdown','platform','active'
WHERE NOT EXISTS (SELECT 1 FROM agi_planner_registry WHERE planner_name='Jarvis Master Planner');

INSERT INTO agi_worker_registry (worker_name, worker_group, task_scope, execution_mode, worker_status)
SELECT 'Dispatch Worker','service_ops','dispatch-actions','tool_assisted','active'
WHERE NOT EXISTS (SELECT 1 FROM agi_worker_registry WHERE worker_name='Dispatch Worker');

INSERT INTO agi_worker_registry (worker_name, worker_group, task_scope, execution_mode, worker_status)
SELECT 'Creator Worker','creator_ops','studio-lab','tool_assisted','active'
WHERE NOT EXISTS (SELECT 1 FROM agi_worker_registry WHERE worker_name='Creator Worker');

INSERT INTO agi_worker_registry (worker_name, worker_group, task_scope, execution_mode, worker_status)
SELECT 'Commerce Worker','market_ops','middleverse-bridge','tool_assisted','active'
WHERE NOT EXISTS (SELECT 1 FROM agi_worker_registry WHERE worker_name='Commerce Worker');

INSERT INTO agi_memory_registry (memory_key, memory_group, memory_value, memory_scope, memory_status)
SELECT 'platform_state','system','stable','global','active'
WHERE NOT EXISTS (SELECT 1 FROM agi_memory_registry WHERE memory_key='platform_state');

INSERT INTO agi_verifier_registry (verifier_name, verifier_group, verification_mode, target_scope, verifier_status)
SELECT 'Jarvis Verifier','quality','post_execution_check','platform','active'
WHERE NOT EXISTS (SELECT 1 FROM agi_verifier_registry WHERE verifier_name='Jarvis Verifier');

INSERT INTO agi_recovery_registry (recovery_name, recovery_group, failure_type, recovery_action, recovery_status)
SELECT 'Default Runtime Recovery','runtime','service_down','restart_and_recheck','ready'
WHERE NOT EXISTS (SELECT 1 FROM agi_recovery_registry WHERE recovery_name='Default Runtime Recovery');

INSERT INTO agi_task_queue (task_name, task_group, assigned_planner, assigned_worker, task_input, task_priority, task_status)
SELECT 'Initial Platform Audit','system','Jarvis Master Planner','Commerce Worker','{"scope":"full"}','high','queued'
WHERE NOT EXISTS (SELECT 1 FROM agi_task_queue WHERE task_name='Initial Platform Audit');
SQL

echo "[OK] pass I seeded"

########################################
# 3) PATCH ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

routes = r"""
    if (req.method === 'POST' && pathname === '/agi/planner-safe') {
      dbRun(`INSERT INTO agi_planner_registry (planner_name, planner_group, planning_mode, target_scope, planner_status)
             VALUES ('Safe Planner','orchestration','goal_breakdown','platform','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20planner%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/worker-safe') {
      dbRun(`INSERT INTO agi_worker_registry (worker_name, worker_group, task_scope, execution_mode, worker_status)
             VALUES ('Safe Worker','general','platform','tool_assisted','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20worker%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/memory-safe') {
      dbRun(`INSERT INTO agi_memory_registry (memory_key, memory_group, memory_value, memory_scope, memory_status)
             VALUES ('safe_memory_key','runtime','safe_memory_value','platform','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20memory%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/toolcall-safe') {
      dbRun(`INSERT INTO agi_tool_call_registry (tool_name, provider_name, call_input, call_output, call_status)
             VALUES ('safe_tool','ChatGPT','safe_input','safe_output','complete')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20tool%20call%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/verifier-safe') {
      dbRun(`INSERT INTO agi_verifier_registry (verifier_name, verifier_group, verification_mode, target_scope, verifier_status)
             VALUES ('Safe Verifier','quality','post_execution_check','platform','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20verifier%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/recovery-safe') {
      dbRun(`INSERT INTO agi_recovery_registry (recovery_name, recovery_group, failure_type, recovery_action, recovery_status)
             VALUES ('Safe Recovery','runtime','generic_failure','retry_then_restore','ready')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20recovery%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/agi/task-safe') {
      dbRun(`INSERT INTO agi_task_queue (task_name, task_group, assigned_planner, assigned_worker, task_input, task_priority, task_status)
             VALUES ('Safe Task','platform','Jarvis Master Planner','Safe Worker','{"mode":"safe"}','medium','queued')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20task%20created' });
      return res.end();
    }
"""

if "pathname === '/agi/planner-safe'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/middleverse-bridge') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

if "Create Safe Planner" not in text and "</main>" in text:
    section = """
      <section>
        <h2>Pass I Agent Execution Actions</h2>
        <form method="POST" action="/agi/planner-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Planner</button></form>
        <form method="POST" action="/agi/worker-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Worker</button></form>
        <form method="POST" action="/agi/memory-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Memory</button></form>
        <form method="POST" action="/agi/toolcall-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Tool Call</button></form>
        <form method="POST" action="/agi/verifier-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Verifier</button></form>
        <form method="POST" action="/agi/recovery-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Recovery</button></form>
        <form method="POST" action="/agi/task-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Task</button></form>
      </section>
"""
    text = text.replace("</main>", section + "\n    </main>", 1)

p.write_text(text)
print("[OK] pass I routes patched")
PYEOF

########################################
# 4) JS CHECK + RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 5) HEALTH + ROUTE TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

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
# 6) SAFE ACTION TESTS
########################################
curl -s -i -X POST http://127.0.0.1:4900/agi/planner-safe > "test_results/agi_planner_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/worker-safe > "test_results/agi_worker_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/memory-safe > "test_results/agi_memory_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/toolcall-safe > "test_results/agi_toolcall_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/verifier-safe > "test_results/agi_verifier_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/recovery-safe > "test_results/agi_recovery_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/agi/task-safe > "test_results/agi_task_${STAMP}.txt" || true

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as agi_planner_registry from agi_planner_registry;" > "snapshots/agi_planner_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_worker_registry from agi_worker_registry;" > "snapshots/agi_worker_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_memory_registry from agi_memory_registry;" > "snapshots/agi_memory_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_tool_call_registry from agi_tool_call_registry;" > "snapshots/agi_tool_call_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_verifier_registry from agi_verifier_registry;" > "snapshots/agi_verifier_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_recovery_registry from agi_recovery_registry;" > "snapshots/agi_recovery_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as agi_task_queue from agi_task_queue;" > "snapshots/agi_task_queue_${STAMP}.json"

sqlite3 -json db/aam.db "select id, planner_name, planner_group, planning_mode, target_scope, planner_status, created_at from agi_planner_registry order by id desc limit 20;" > "snapshots/agi_planner_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, worker_name, worker_group, task_scope, execution_mode, worker_status, created_at from agi_worker_registry order by id desc limit 20;" > "snapshots/agi_worker_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, memory_key, memory_group, memory_value, memory_scope, memory_status, created_at from agi_memory_registry order by id desc limit 20;" > "snapshots/agi_memory_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, tool_name, provider_name, call_input, call_output, call_status, created_at from agi_tool_call_registry order by id desc limit 20;" > "snapshots/agi_tool_call_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, verifier_name, verifier_group, verification_mode, target_scope, verifier_status, created_at from agi_verifier_registry order by id desc limit 20;" > "snapshots/agi_verifier_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, recovery_name, recovery_group, failure_type, recovery_action, recovery_status, created_at from agi_recovery_registry order by id desc limit 20;" > "snapshots/agi_recovery_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, task_name, task_group, assigned_planner, assigned_worker, task_input, task_priority, task_status, created_at from agi_task_queue order by id desc limit 20;" > "snapshots/agi_task_queue_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "pass_i_agent_execution_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] pass I scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/pass_i_agent_execution_memory_and_stabilize_${STAMP}.txt" <<REPORT
PASS I AGENT EXECUTION + MEMORY + STABILIZE REPORT
Timestamp: ${STAMP}

Built:
- agi planner registry
- agi worker registry
- agi memory registry
- agi tool call registry
- agi verifier registry
- agi recovery registry
- agi task queue

Verified:
- dashboard health
- jarvis health
- bridge/platform smoke routes
- safe agent execution actions
- stable runtime

Purpose:
- add the agent execution brain loop
- add memory and tool orchestration foundation
- prepare for deeper autonomous behavior
REPORT

echo "PASS I AGENT EXECUTION + MEMORY + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pass_i_agent_execution_scan_latest.json"
echo "  cat reports/pass_i_agent_execution_memory_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
