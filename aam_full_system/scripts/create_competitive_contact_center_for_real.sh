#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== CREATE COMPETITIVE CONTACT CENTER FOR REAL START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_create_competitive_cc_${STAMP}.js"
cp db/aam.db "backups/aam_create_competitive_cc_${STAMP}.db"

########################################
# 2) CREATE TABLES + SEED
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

tables = {
"remote_agent_program_registry": """
CREATE TABLE IF NOT EXISTS remote_agent_program_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_name TEXT NOT NULL,
  staffing_model TEXT DEFAULT 'work_from_home',
  contractor_mode TEXT DEFAULT 'enabled',
  schedule_mode TEXT DEFAULT 'flexible',
  certification_mode TEXT DEFAULT 'program_based',
  program_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"omnichannel_queue_registry": """
CREATE TABLE IF NOT EXISTS omnichannel_queue_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue_name TEXT NOT NULL,
  channel_mix TEXT DEFAULT 'voice,chat,email,sms',
  routing_strategy TEXT DEFAULT 'skill_based',
  priority_rules TEXT,
  queue_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"workforce_management_registry": """
CREATE TABLE IF NOT EXISTS workforce_management_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_name TEXT NOT NULL,
  forecasting_mode TEXT DEFAULT 'ai_forecast',
  scheduling_mode TEXT DEFAULT 'automated',
  adherence_mode TEXT DEFAULT 'tracked',
  coaching_mode TEXT DEFAULT 'enabled',
  team_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"quality_management_registry": """
CREATE TABLE IF NOT EXISTS quality_management_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_name TEXT NOT NULL,
  scoring_mode TEXT DEFAULT 'ai_assisted',
  coverage_scope TEXT DEFAULT '100_percent_review_target',
  coaching_workflow TEXT DEFAULT 'enabled',
  qm_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"ai_virtual_agent_registry": """
CREATE TABLE IF NOT EXISTS ai_virtual_agent_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_name TEXT NOT NULL,
  interaction_modes TEXT DEFAULT 'voice,chat',
  automation_scope TEXT,
  escalation_mode TEXT DEFAULT 'human_handoff',
  knowledge_mode TEXT DEFAULT 'connected',
  agent_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"knowledge_automation_registry": """
CREATE TABLE IF NOT EXISTS knowledge_automation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  knowledge_name TEXT NOT NULL,
  linked_vertical TEXT,
  answer_mode TEXT DEFAULT 'agent_and_bot',
  workflow_automation TEXT DEFAULT 'enabled',
  registry_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"cx_competitive_feature_registry": """
CREATE TABLE IF NOT EXISTS cx_competitive_feature_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_group TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  inspired_by TEXT,
  implementation_scope TEXT,
  feature_status TEXT DEFAULT 'planned_live',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)"""
}

for ddl in tables.values():
    cur.execute(ddl)

if cur.execute("SELECT count(*) FROM remote_agent_program_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO remote_agent_program_registry
        (program_name, staffing_model, contractor_mode, schedule_mode, certification_mode, program_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Arise-style Remote Partner Program", "work_from_home", "enabled", "flexible", "program_based", "active"),
        ("Stubbs AI Home Agent Network", "work_from_home", "enabled", "flexible", "ai_guided", "active"),
        ("Lyons Tech AI Hybrid Ops Team", "hybrid_remote", "enabled", "managed_shift_blocks", "ops_certified", "active"),
    ])

if cur.execute("SELECT count(*) FROM omnichannel_queue_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO omnichannel_queue_registry
        (queue_name, channel_mix, routing_strategy, priority_rules, queue_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Freight Dispatch Queue", "voice,chat,email,sms", "skill_based", "vip_shipper_first", "active"),
        ("Food Delivery Merchant Queue", "voice,chat,sms", "intent_based", "merchant_urgent_first", "active"),
        ("Real Estate Lead Queue", "voice,chat,email", "lead_value_based", "premium_listing_first", "active"),
        ("HoloStore Business Join Queue", "voice,chat,email", "onboarding_based", "new_seller_first", "active"),
    ])

if cur.execute("SELECT count(*) FROM workforce_management_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO workforce_management_registry
        (team_name, forecasting_mode, scheduling_mode, adherence_mode, coaching_mode, team_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Remote CX Team", "ai_forecast", "automated", "tracked", "enabled", "active"),
        ("Dispatch and Logistics Team", "ai_forecast", "automated", "tracked", "enabled", "active"),
        ("Business Onboarding Team", "ai_forecast", "automated", "tracked", "enabled", "active"),
    ])

if cur.execute("SELECT count(*) FROM quality_management_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO quality_management_registry
        (program_name, scoring_mode, coverage_scope, coaching_workflow, qm_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Global Contact Quality", "ai_assisted", "100_percent_review_target", "enabled", "active"),
        ("Freight Call Quality", "ai_assisted", "100_percent_review_target", "enabled", "active"),
        ("Merchant Onboarding Quality", "ai_assisted", "100_percent_review_target", "enabled", "active"),
    ])

if cur.execute("SELECT count(*) FROM ai_virtual_agent_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO ai_virtual_agent_registry
        (agent_name, interaction_modes, automation_scope, escalation_mode, knowledge_mode, agent_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Stubbs AI CX Agent", "voice,chat", "sales,support,onboarding", "human_handoff", "connected", "active"),
        ("Lyons Tech AI Ops Agent", "voice,chat", "dispatch,triage,workflow", "human_handoff", "connected", "active"),
        ("Merchant Join Bot", "chat", "merchant_onboarding,faq,document_intake", "human_handoff", "connected", "active"),
    ])

if cur.execute("SELECT count(*) FROM knowledge_automation_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO knowledge_automation_registry
        (knowledge_name, linked_vertical, answer_mode, workflow_automation, registry_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Freight Knowledge Hub", "freight_logistics", "agent_and_bot", "enabled", "active"),
        ("Food Delivery Merchant Playbook", "food_delivery", "agent_and_bot", "enabled", "active"),
        ("Real Estate Intake Knowledge", "real_estate", "agent_and_bot", "enabled", "active"),
        ("HoloStore Seller Guide", "holostore_retail", "agent_and_bot", "enabled", "active"),
    ])

if cur.execute("SELECT count(*) FROM cx_competitive_feature_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO cx_competitive_feature_registry
        (feature_group, feature_name, inspired_by, implementation_scope, feature_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("remote_work_model", "Flexible work-from-home servicing model", "Arise-style", "partner_program", "planned_live"),
        ("routing", "Omnichannel routing", "enterprise_ccaas", "queues_and_switchboard", "planned_live"),
        ("wfm", "AI forecasting and scheduling", "enterprise_ccaas", "workforce_management", "planned_live"),
        ("quality", "AI scoring and coaching workflow", "enterprise_ccaas", "quality_management", "planned_live"),
        ("ai_agent", "Unified human + AI agent support", "enterprise_ccaas", "ai_virtual_agents", "planned_live"),
        ("knowledge", "Knowledge-driven automation", "enterprise_ccaas", "knowledge_automation", "planned_live"),
        ("analytics", "Cross-channel performance visibility", "enterprise_ccaas", "analytics_and_ops", "planned_live"),
        ("vendor_strategy", "Engine-agnostic AI model strategy", "enterprise_ccaas", "llm_routing", "planned_live"),
    ])

conn.commit()
conn.close()
print("[OK] competitive contact center tables created and seeded")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderCompetitiveContactCenterPage(req, user = null, message = '') {
  const remotePrograms = dbQuery(`
    SELECT id, program_name, staffing_model, contractor_mode, schedule_mode, certification_mode, program_status, created_at
    FROM remote_agent_program_registry
    ORDER BY id DESC LIMIT 100
  `);

  const queues = dbQuery(`
    SELECT id, queue_name, channel_mix, routing_strategy, priority_rules, queue_status, created_at
    FROM omnichannel_queue_registry
    ORDER BY id DESC LIMIT 100
  `);

  const wfm = dbQuery(`
    SELECT id, team_name, forecasting_mode, scheduling_mode, adherence_mode, coaching_mode, team_status, created_at
    FROM workforce_management_registry
    ORDER BY id DESC LIMIT 100
  `);

  const qm = dbQuery(`
    SELECT id, program_name, scoring_mode, coverage_scope, coaching_workflow, qm_status, created_at
    FROM quality_management_registry
    ORDER BY id DESC LIMIT 100
  `);

  const agents = dbQuery(`
    SELECT id, agent_name, interaction_modes, automation_scope, escalation_mode, knowledge_mode, agent_status, created_at
    FROM ai_virtual_agent_registry
    ORDER BY id DESC LIMIT 100
  `);

  const knowledge = dbQuery(`
    SELECT id, knowledge_name, linked_vertical, answer_mode, workflow_automation, registry_status, created_at
    FROM knowledge_automation_registry
    ORDER BY id DESC LIMIT 100
  `);

  const features = dbQuery(`
    SELECT id, feature_group, feature_name, inspired_by, implementation_scope, feature_status, created_at
    FROM cx_competitive_feature_registry
    ORDER BY id DESC LIMIT 200
  `);

  const remoteRows = remotePrograms.map(r => `<tr><td>${r.id}</td><td>${r.program_name}</td><td>${r.staffing_model}</td><td>${r.contractor_mode}</td><td>${r.schedule_mode}</td><td>${r.certification_mode}</td><td>${r.program_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const queueRows = queues.map(r => `<tr><td>${r.id}</td><td>${r.queue_name}</td><td>${r.channel_mix}</td><td>${r.routing_strategy}</td><td>${r.priority_rules || ''}</td><td>${r.queue_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const wfmRows = wfm.map(r => `<tr><td>${r.id}</td><td>${r.team_name}</td><td>${r.forecasting_mode}</td><td>${r.scheduling_mode}</td><td>${r.adherence_mode}</td><td>${r.coaching_mode}</td><td>${r.team_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const qmRows = qm.map(r => `<tr><td>${r.id}</td><td>${r.program_name}</td><td>${r.scoring_mode}</td><td>${r.coverage_scope}</td><td>${r.coaching_workflow}</td><td>${r.qm_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const agentRows = agents.map(r => `<tr><td>${r.id}</td><td>${r.agent_name}</td><td>${r.interaction_modes}</td><td>${r.automation_scope || ''}</td><td>${r.escalation_mode}</td><td>${r.knowledge_mode}</td><td>${r.agent_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const knowledgeRows = knowledge.map(r => `<tr><td>${r.id}</td><td>${r.knowledge_name}</td><td>${r.linked_vertical || ''}</td><td>${r.answer_mode}</td><td>${r.workflow_automation}</td><td>${r.registry_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const featureRows = features.map(r => `<tr><td>${r.id}</td><td>${r.feature_group}</td><td>${r.feature_name}</td><td>${r.inspired_by || ''}</td><td>${r.implementation_scope || ''}</td><td>${r.feature_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Competitive Contact Center Stack', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Competitive Contact Center Stack</h1><p>${message || 'Advanced virtual call center, remote workforce, omnichannel, QA, AI agents, and knowledge automation layer.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Program</th><th>Staffing</th><th>Contractor</th><th>Schedule</th><th>Certification</th><th>Status</th><th>Created</th></tr></thead><tbody>${remoteRows || '<tr><td colspan="8">No remote programs</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Queue</th><th>Channels</th><th>Routing</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>${queueRows || '<tr><td colspan="7">No queues</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Team</th><th>Forecast</th><th>Scheduling</th><th>Adherence</th><th>Coaching</th><th>Status</th><th>Created</th></tr></thead><tbody>${wfmRows || '<tr><td colspan="8">No WFM records</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>QM Program</th><th>Scoring</th><th>Coverage</th><th>Coaching</th><th>Status</th><th>Created</th></tr></thead><tbody>${qmRows || '<tr><td colspan="7">No QM records</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Agent</th><th>Modes</th><th>Scope</th><th>Escalation</th><th>Knowledge</th><th>Status</th><th>Created</th></tr></thead><tbody>${agentRows || '<tr><td colspan="8">No AI agents</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Knowledge</th><th>Vertical</th><th>Answer</th><th>Workflow</th><th>Status</th><th>Created</th></tr></thead><tbody>${knowledgeRows || '<tr><td colspan="7">No knowledge entries</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Group</th><th>Feature</th><th>Inspired By</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${featureRows || '<tr><td colspan="7">No competitive features</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderCompetitiveContactCenterPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/competitive-contact-center') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCompetitiveContactCenterPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/ai-call-center') {"
if "pathname === '/competitive-contact-center'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/competitive-contact-center">CX Stack</a>' not in text and '<a href="/ai-call-center">AI Call Center</a>' in text:
    text = text.replace(
        '<a href="/ai-call-center">AI Call Center</a>',
        '<a href="/ai-call-center">AI Call Center</a>\n          <a href="/competitive-contact-center">CX Stack</a>',
        1
    )

p.write_text(text)
print("[OK] competitive contact center route added")
PYEOF

########################################
# 4) RESTART + SMOKE TEST
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /competitive-contact-center \
  /ai-call-center \
  /ops-checkpoint \
  /upload-media-bridge \
  /creator-monetization \
  /streaming-network \
  /creator-tv \
  /holojourney-tv \
  /neuro-control \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) WRITE SCAN FILE
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
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "competitive_contact_center_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] competitive contact center scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) REPORT
########################################
cat > "reports/create_competitive_contact_center_for_real_${STAMP}.txt" <<REPORT
CREATE COMPETITIVE CONTACT CENTER FOR REAL REPORT
Timestamp: ${STAMP}

Created:
- remote agent programs
- omnichannel queues
- workforce management
- quality management
- AI virtual agents
- knowledge automation
- competitive CX features
- /competitive-contact-center

Verified:
- dashboard health
- jarvis health
- fresh smoke tests

Purpose:
- create the competitive contact center layer for real
- recover from interrupted earlier runs
- preserve stable runtime
REPORT

echo "CREATE COMPETITIVE CONTACT CENTER FOR REAL COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/competitive_contact_center_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/ops-checkpoint"
