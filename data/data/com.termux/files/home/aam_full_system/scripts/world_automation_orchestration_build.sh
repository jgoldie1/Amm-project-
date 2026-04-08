#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== WORLD AUTOMATION + ORCHESTRATION BUILD START ==="

########################################
# 1) DB ADDITIONS
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS world_automation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    rule_name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    action_type TEXT NOT NULL,
    rule_payload TEXT,
    rule_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    job_name TEXT NOT NULL,
    job_type TEXT NOT NULL,
    job_payload TEXT,
    job_status TEXT NOT NULL DEFAULT 'queued',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_orchestration_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    source_id INTEGER,
    orchestration_event TEXT NOT NULL,
    orchestration_payload TEXT,
    orchestration_status TEXT NOT NULL DEFAULT 'processed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM world_automation_rules")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_automation_rules (scene_id, rule_name, trigger_type, action_type, rule_payload, rule_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, "Commerce Auto Refresh", "scene_command", "refresh_world", '{"mode":"fast"}', "active"),
        (2, "Ops Auto Telemetry", "avatar_action", "sync_iot", '{"target":"iot"}', "active"),
        (3, "Creator Auto Portal Pulse", "object_command", "pulse_portal", '{"color":"cyan"}', "active"),
    ])

cur.execute("SELECT count(*) FROM world_jobs")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_jobs (scene_id, job_name, job_type, job_payload, job_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, "Commerce World Refresh", "refresh_world", '{"mode":"fast"}', "processed"),
        (2, "Ops Sync Pass", "sync_iot", '{"target":"iot"}', "processed"),
        (3, "Creator Portal Pulse", "pulse_portal", '{"color":"cyan"}', "processed"),
    ])

cur.execute("SELECT count(*) FROM world_orchestration_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_orchestration_log (scene_id, source_type, source_id, orchestration_event, orchestration_payload, orchestration_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, "seed", 1, "refresh_world", '{"mode":"fast"}', "processed"),
        (2, "seed", 2, "sync_iot", '{"target":"iot"}', "processed"),
        (3, "seed", 3, "pulse_portal", '{"color":"cyan"}', "processed"),
    ])

conn.commit()
conn.close()
print("[OK] automation/orchestration DB additions ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

block = r"""
  if (pathname === '/run-job') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const jobType = q(url.searchParams.get('jobType') || 'job');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_jobs (scene_id, job_name, job_type, job_payload, job_status, completed_at)
      VALUES (${sceneId}, '${jobType}', '${jobType}', '${payload}', 'processed', CURRENT_TIMESTAMP)`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_orchestration_log (scene_id, source_type, source_id, orchestration_event, orchestration_payload, orchestration_status)
      VALUES (${sceneId}, 'world_job', (SELECT id FROM world_jobs ORDER BY id DESC LIMIT 1), '${jobType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-job', ${sceneId}, 1, 'world_job', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'world_job',
      scene_id: sceneId,
      job_type: jobType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, world_job: true, scene_id: sceneId, job_type: jobType }, null, 2));
  }

  if (pathname === '/run-rule') {
    const ruleId = Number(url.searchParams.get('ruleId') || 0);
    const rows = dbQuery(`SELECT id, scene_id, rule_name, action_type, rule_payload FROM world_automation_rules WHERE id=${ruleId} LIMIT 1`);
    if (!rows.length) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'rule_not_found' }, null, 2));
    }

    const rule = rows[0];
    const payload = q(rule.rule_payload || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_jobs (scene_id, job_name, job_type, job_payload, job_status, completed_at)
      VALUES (${rule.scene_id}, '${q(rule.rule_name)}', '${q(rule.action_type)}', '${payload}', 'processed', CURRENT_TIMESTAMP)`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_orchestration_log (scene_id, source_type, source_id, orchestration_event, orchestration_payload, orchestration_status)
      VALUES (${rule.scene_id}, 'automation_rule', ${rule.id}, '${q(rule.action_type)}', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(rule.scene_id, {
      ok: true,
      type: 'automation_rule',
      scene_id: rule.scene_id,
      rule_id: rule.id,
      action_type: rule.action_type,
      payload: rule.rule_payload || '{}',
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, rule_run: true, rule_id: rule.id, scene_id: rule.scene_id, action_type: rule.action_type }, null, 2));
  }
"""

marker = "  if (pathname === '/checkpoint') {"
if "pathname === '/run-job'" not in text and marker in text:
    text = text.replace(marker, block + "\n" + marker, 1)

sync_old = """      checkpoints: dbQuery(`SELECT id, checkpoint_name, checkpoint_status, created_at FROM scene_checkpoints WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recovery_snapshots: dbQuery(`SELECT id, snapshot_name, snapshot_status, created_at FROM recovery_snapshots WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""
sync_new = """      checkpoints: dbQuery(`SELECT id, checkpoint_name, checkpoint_status, created_at FROM scene_checkpoints WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recovery_snapshots: dbQuery(`SELECT id, snapshot_name, snapshot_status, created_at FROM recovery_snapshots WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      automation_rules: dbQuery(`SELECT id, rule_name, trigger_type, action_type, rule_status, created_at FROM world_automation_rules WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      world_jobs: dbQuery(`SELECT id, job_name, job_type, job_status, created_at, completed_at FROM world_jobs WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      orchestration_log: dbQuery(`SELECT id, source_type, source_id, orchestration_event, orchestration_status, created_at FROM world_orchestration_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""
if "automation_rules: dbQuery(`SELECT id, rule_name" not in text:
    text = text.replace(sync_old, sync_new, 1)

p.write_text(text)
print("[OK] world_socket.js automation/orchestration patch applied")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-automation">World Automation</a>' not in text and '<a href="/world-persistence">World Persistence</a>' in text:
    text = text.replace(
        '<a href="/world-persistence">World Persistence</a>',
        '<a href="/world-persistence">World Persistence</a>\n      <a href="/world-automation">World Automation</a>'
    )

helper = r'''
function renderWorldAutomationPage(user = null) {
  const rules = dbQuery(`
    SELECT war.id, sr.scene_name, war.rule_name, war.trigger_type, war.action_type, war.rule_payload, war.rule_status, war.created_at
    FROM world_automation_rules war
    LEFT JOIN scene_registry sr ON sr.id = war.scene_id
    ORDER BY war.id DESC
    LIMIT 100
  `);

  const jobs = dbQuery(`
    SELECT wj.id, sr.scene_name, wj.job_name, wj.job_type, wj.job_payload, wj.job_status, wj.created_at, wj.completed_at
    FROM world_jobs wj
    LEFT JOIN scene_registry sr ON sr.id = wj.scene_id
    ORDER BY wj.id DESC
    LIMIT 100
  `);

  const logs = dbQuery(`
    SELECT wol.id, sr.scene_name, wol.source_type, wol.source_id, wol.orchestration_event, wol.orchestration_payload, wol.orchestration_status, wol.created_at
    FROM world_orchestration_log wol
    LEFT JOIN scene_registry sr ON sr.id = wol.scene_id
    ORDER BY wol.id DESC
    LIMIT 100
  `);

  const ruleRows = rules.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.rule_name}</td><td>${r.trigger_type}</td><td>${r.action_type}</td><td><code>${r.rule_payload || ''}</code></td><td>${r.rule_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const jobRows = jobs.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.job_name}</td><td>${r.job_type}</td><td><code>${r.job_payload || ''}</code></td><td>${r.job_status}</td><td>${r.created_at || ''}</td><td>${r.completed_at || ''}</td></tr>
  `).join('');

  const logRows = logs.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.source_type}</td><td>${r.source_id || ''}</td><td>${r.orchestration_event}</td><td><code>${r.orchestration_payload || ''}</code></td><td>${r.orchestration_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Automation', `
    <div class="section"><div class="card">
      <h2>World Automation + Orchestration</h2>
      <p>This layer automates scene behaviors, runs world jobs, and records orchestration events across immersive worlds.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Automation Rules</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Rule</th><th>Trigger</th><th>Action</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${ruleRows || '<tr><td colspan="8">No automation rules yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>World Jobs</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Job</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th><th>Completed</th></tr></thead>
        <tbody>${jobRows || '<tr><td colspan="8">No world jobs yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Orchestration Log</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Source</th><th>Source ID</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${logRows || '<tr><td colspan="8">No orchestration events yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldAutomationPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/world-persistence') {"
if "pathname === '/world-automation'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-automation') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldAutomationPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/world-persistence') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js automation/orchestration patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/restart_world_socket.sh
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh
curl -s http://127.0.0.1:5090/health || true

########################################
# 5) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_world_automation_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_world_automation_${STAMP}.js"
cp db/aam.db "backups/aam_world_automation_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_automation_rules from world_automation_rules;" > "snapshots/world_automation_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_jobs from world_jobs;" > "snapshots/world_jobs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_orchestration_log from world_orchestration_log;" > "snapshots/world_orchestration_log_${STAMP}.json"

echo "WORLD AUTOMATION CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-automation"
echo "  curl -s http://127.0.0.1:5090/sync/1"
echo "  curl -s 'http://127.0.0.1:5090/run-job?sceneId=1&jobType=refresh_world&payload=%7B%22mode%22%3A%22fast%22%7D'"
echo "  curl -s 'http://127.0.0.1:5090/run-rule?ruleId=1'"
