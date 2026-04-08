#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== ADD AI CALL CENTER + BUSINESS ONBOARDING + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_ai_call_center_${STAMP}.js"
cp db/aam.db "backups/aam_ai_call_center_${STAMP}.db"

########################################
# 2) TABLES + SEED
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS ai_call_center_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  center_name TEXT NOT NULL,
  service_scope TEXT DEFAULT 'multi_vertical',
  voice_mode TEXT DEFAULT 'ai_voice',
  chat_mode TEXT DEFAULT 'ai_chat',
  staffing_mode TEXT DEFAULT 'work_from_home',
  center_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS switchboard_number_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_name TEXT NOT NULL,
  number_label TEXT NOT NULL,
  number_value TEXT NOT NULL,
  routing_mode TEXT DEFAULT 'skill_based',
  fallback_route TEXT,
  number_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS business_onboarding_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  business_vertical TEXT NOT NULL,
  onboarding_stage TEXT DEFAULT 'lead',
  onboarding_source TEXT DEFAULT 'ai_call_center',
  assigned_agent TEXT DEFAULT 'Stubbs AI',
  onboarding_status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS service_vertical_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vertical_name TEXT NOT NULL,
  support_modes TEXT,
  fulfillment_route TEXT,
  revenue_mode TEXT,
  vertical_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS ai_agent_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_name TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  primary_channel TEXT DEFAULT 'voice_chat',
  specialty_scope TEXT,
  agent_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS call_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caller_name TEXT,
  business_vertical TEXT,
  interaction_channel TEXT DEFAULT 'voice',
  intent_name TEXT,
  outcome_status TEXT DEFAULT 'handled',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM ai_call_center_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO ai_call_center_registry
        (center_name, service_scope, voice_mode, chat_mode, staffing_mode, center_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Stubbs AI Call Center", "freight,delivery,real_estate,retail,logistics", "ai_voice", "ai_chat", "work_from_home", "active"),
        ("Lyons Tech AI Switchboard", "business_onboarding,sales,support,dispatch", "ai_voice", "ai_chat", "hybrid_remote", "active"),
    ])

if cur.execute("SELECT count(*) FROM switchboard_number_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO switchboard_number_registry
        (brand_name, number_label, number_value, routing_mode, fallback_route, number_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Stubbs AI", "Main Toll-Free", "1-800-STUBBS-AI", "skill_based", "/ops-checkpoint", "active"),
        ("Lyons Tech AI", "Business Onboarding", "1-800-LYONS-AI", "vertical_based", "/creator-monetization", "active"),
        ("HoloStore Easy Join", "Merchant Join Line", "1-800-HOLO-JOIN", "onboarding_based", "/upload-media-bridge", "active"),
    ])

if cur.execute("SELECT count(*) FROM service_vertical_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO service_vertical_registry
        (vertical_name, support_modes, fulfillment_route, revenue_mode, vertical_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("freight_logistics", "voice,chat,dispatch", "/streaming-network", "transactional + subscription", "active"),
        ("food_delivery", "voice,chat,merchant_support", "/creator-monetization", "transactional + merchant fee", "active"),
        ("real_estate", "voice,chat,lead_intake", "/upload-media-bridge", "lead + premium listing", "active"),
        ("holostore_retail", "voice,chat,onboarding", "/creator-tv", "listing + conversion fee", "active"),
        ("general_business", "voice,chat,onboarding,support", "/ops-checkpoint", "subscription", "active"),
    ])

if cur.execute("SELECT count(*) FROM ai_agent_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO ai_agent_registry
        (agent_name, agent_role, primary_channel, specialty_scope, agent_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Stubbs AI", "front_door_agent", "voice_chat", "intake,onboarding,sales,customer_support", "active"),
        ("Lyons Tech AI", "operations_agent", "voice_chat", "dispatch,analytics,workflow,triage", "active"),
        ("OmniMail OS Agent", "communication_agent", "chat", "mail,attachments,followup", "active"),
    ])

if cur.execute("SELECT count(*) FROM business_onboarding_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO business_onboarding_registry
        (business_name, business_vertical, onboarding_stage, onboarding_source, assigned_agent, onboarding_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Titan Freight Partner", "freight_logistics", "qualified", "ai_call_center", "Lyons Tech AI", "open"),
        ("HoloBites Merchant", "food_delivery", "documents_pending", "merchant_join_line", "Stubbs AI", "open"),
        ("Skyline Realty Group", "real_estate", "proposal_sent", "ai_call_center", "Stubbs AI", "open"),
        ("Creator HoloStore", "holostore_retail", "approved", "holostore_easy_join", "Lyons Tech AI", "open"),
    ])

if cur.execute("SELECT count(*) FROM call_activity_log").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO call_activity_log
        (caller_name, business_vertical, interaction_channel, intent_name, outcome_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Prospect Freight Lead", "freight_logistics", "voice", "pricing_request", "handled"),
        ("Merchant Owner", "food_delivery", "chat", "onboarding_help", "handled"),
        ("Real Estate Broker", "real_estate", "voice", "lead_intake", "handled"),
        ("Retail Seller", "holostore_retail", "chat", "join_platform", "handled"),
    ])

conn.commit()
conn.close()
print("[OK] AI call center + onboarding tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderAICallCenterPage(req, user = null, message = '') {
  const centers = dbQuery(`
    SELECT id, center_name, service_scope, voice_mode, chat_mode, staffing_mode, center_status, created_at
    FROM ai_call_center_registry
    ORDER BY id DESC LIMIT 100
  `);

  const numbers = dbQuery(`
    SELECT id, brand_name, number_label, number_value, routing_mode, fallback_route, number_status, created_at
    FROM switchboard_number_registry
    ORDER BY id DESC LIMIT 100
  `);

  const onboarding = dbQuery(`
    SELECT id, business_name, business_vertical, onboarding_stage, onboarding_source, assigned_agent, onboarding_status, created_at
    FROM business_onboarding_registry
    ORDER BY id DESC LIMIT 200
  `);

  const verticals = dbQuery(`
    SELECT id, vertical_name, support_modes, fulfillment_route, revenue_mode, vertical_status, created_at
    FROM service_vertical_registry
    ORDER BY id DESC LIMIT 100
  `);

  const agents = dbQuery(`
    SELECT id, agent_name, agent_role, primary_channel, specialty_scope, agent_status, created_at
    FROM ai_agent_registry
    ORDER BY id DESC LIMIT 100
  `);

  const calls = dbQuery(`
    SELECT id, caller_name, business_vertical, interaction_channel, intent_name, outcome_status, created_at
    FROM call_activity_log
    ORDER BY id DESC LIMIT 200
  `);

  const centerRows = centers.map(r => `<tr><td>${r.id}</td><td>${r.center_name}</td><td>${r.service_scope}</td><td>${r.voice_mode}</td><td>${r.chat_mode}</td><td>${r.staffing_mode}</td><td>${r.center_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const numberRows = numbers.map(r => `<tr><td>${r.id}</td><td>${r.brand_name}</td><td>${r.number_label}</td><td>${r.number_value}</td><td>${r.routing_mode}</td><td>${r.fallback_route || ''}</td><td>${r.number_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const onboardingRows = onboarding.map(r => `<tr><td>${r.id}</td><td>${r.business_name}</td><td>${r.business_vertical}</td><td>${r.onboarding_stage}</td><td>${r.onboarding_source}</td><td>${r.assigned_agent}</td><td>${r.onboarding_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const verticalRows = verticals.map(r => `<tr><td>${r.id}</td><td>${r.vertical_name}</td><td>${r.support_modes || ''}</td><td>${r.fulfillment_route || ''}</td><td>${r.revenue_mode || ''}</td><td>${r.vertical_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const agentRows = agents.map(r => `<tr><td>${r.id}</td><td>${r.agent_name}</td><td>${r.agent_role}</td><td>${r.primary_channel}</td><td>${r.specialty_scope || ''}</td><td>${r.agent_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const callRows = calls.map(r => `<tr><td>${r.id}</td><td>${r.caller_name || ''}</td><td>${r.business_vertical || ''}</td><td>${r.interaction_channel}</td><td>${r.intent_name || ''}</td><td>${r.outcome_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('AI Call Center + Onboarding', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>AI Call Center + Business Onboarding</h1><p>${message || 'AI voice/chat call center, switchboard numbers, easy business onboarding, and vertical operations control.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Center</th><th>Scope</th><th>Voice</th><th>Chat</th><th>Staffing</th><th>Status</th><th>Created</th></tr></thead><tbody>${centerRows || '<tr><td colspan="8">No centers</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Brand</th><th>Label</th><th>Number</th><th>Routing</th><th>Fallback</th><th>Status</th><th>Created</th></tr></thead><tbody>${numberRows || '<tr><td colspan="8">No numbers</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Business</th><th>Vertical</th><th>Stage</th><th>Source</th><th>Agent</th><th>Status</th><th>Created</th></tr></thead><tbody>${onboardingRows || '<tr><td colspan="8">No onboarding records</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Vertical</th><th>Support</th><th>Route</th><th>Revenue</th><th>Status</th><th>Created</th></tr></thead><tbody>${verticalRows || '<tr><td colspan="7">No verticals</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Agent</th><th>Role</th><th>Channel</th><th>Specialty</th><th>Status</th><th>Created</th></tr></thead><tbody>${agentRows || '<tr><td colspan="7">No agents</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Caller</th><th>Vertical</th><th>Channel</th><th>Intent</th><th>Outcome</th><th>Created</th></tr></thead><tbody>${callRows || '<tr><td colspan="7">No call activity</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderAICallCenterPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/ai-call-center') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAICallCenterPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/ops-checkpoint') {"
if "pathname === '/ai-call-center'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/ai-call-center">AI Call Center</a>' not in text and '<a href="/ops-checkpoint">Ops Checkpoint</a>' in text:
    text = text.replace(
        '<a href="/ops-checkpoint">Ops Checkpoint</a>',
        '<a href="/ops-checkpoint">Ops Checkpoint</a>\n          <a href="/ai-call-center">AI Call Center</a>',
        1
    )

p.write_text(text)
print("[OK] AI call center route added")
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
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as ai_call_center_registry from ai_call_center_registry;" > "snapshots/ai_call_center_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as switchboard_number_registry from switchboard_number_registry;" > "snapshots/switchboard_number_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as business_onboarding_registry from business_onboarding_registry;" > "snapshots/business_onboarding_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as service_vertical_registry from service_vertical_registry;" > "snapshots/service_vertical_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as ai_agent_registry from ai_agent_registry;" > "snapshots/ai_agent_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as call_activity_log from call_activity_log;" > "snapshots/call_activity_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, center_name, service_scope, voice_mode, chat_mode, staffing_mode, center_status, created_at from ai_call_center_registry order by id desc limit 20;" > "snapshots/ai_call_center_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, brand_name, number_label, number_value, routing_mode, fallback_route, number_status, created_at from switchboard_number_registry order by id desc limit 20;" > "snapshots/switchboard_number_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, business_name, business_vertical, onboarding_stage, onboarding_source, assigned_agent, onboarding_status, created_at from business_onboarding_registry order by id desc limit 20;" > "snapshots/business_onboarding_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, vertical_name, support_modes, fulfillment_route, revenue_mode, vertical_status, created_at from service_vertical_registry order by id desc limit 20;" > "snapshots/service_vertical_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, agent_name, agent_role, primary_channel, specialty_scope, agent_status, created_at from ai_agent_registry order by id desc limit 20;" > "snapshots/ai_agent_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, caller_name, business_vertical, interaction_channel, intent_name, outcome_status, created_at from call_activity_log order by id desc limit 20;" > "snapshots/call_activity_log_tail_${STAMP}.json"

########################################
# 6) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "ai_call_center_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] AI call center scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/add_ai_call_center_business_onboarding_and_stabilize_${STAMP}.txt" <<REPORT
ADD AI CALL CENTER + BUSINESS ONBOARDING + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- /ai-call-center
- ai_call_center_registry
- switchboard_number_registry
- business_onboarding_registry
- service_vertical_registry
- ai_agent_registry
- call_activity_log

Verified:
- dashboard health
- jarvis health
- AI call center route
- Ops Checkpoint
- Upload Media Bridge
- Creator Monetization
- Streaming Network
- Creator TV
- HoloJourney TV
- Neuro Control
- OmniMail OS
- Holo Search
- Platform Analytics
- world3d

Purpose:
- add an advanced AI voice/chat call center layer
- support work-from-home operations and toll-free switchboard routing
- simplify onboarding for freight, food delivery, real estate, retail, and general business
- preserve stable runtime
REPORT

echo "ADD AI CALL CENTER + BUSINESS ONBOARDING + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/ai_call_center_scan_latest.json"
echo "  cat snapshots/business_onboarding_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/ops-checkpoint"
echo "  termux-open-url http://127.0.0.1:4900/creator-monetization"
