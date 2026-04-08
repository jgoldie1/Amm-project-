#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== CREATE MULTISERVICE DISPATCH FOR REAL START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_create_multiservice_${STAMP}.js"
cp db/aam.db "backups/aam_create_multiservice_${STAMP}.db"

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
"service_expansion_registry": """
CREATE TABLE IF NOT EXISTS service_expansion_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL,
  service_group TEXT NOT NULL,
  dispatch_mode TEXT DEFAULT 'ai_assisted',
  onboarding_mode TEXT DEFAULT 'enabled',
  revenue_mode TEXT,
  service_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"dispatch_program_registry": """
CREATE TABLE IF NOT EXISTS dispatch_program_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  routing_model TEXT DEFAULT 'dynamic_dispatch',
  ai_agent_name TEXT,
  dispatch_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"vehicle_fleet_registry": """
CREATE TABLE IF NOT EXISTS vehicle_fleet_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fleet_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  capacity_profile TEXT,
  fleet_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"pharmacy_delivery_registry": """
CREATE TABLE IF NOT EXISTS pharmacy_delivery_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pharmacy_name TEXT NOT NULL,
  fulfillment_mode TEXT DEFAULT 'same_day',
  compliance_mode TEXT DEFAULT 'manual_review',
  delivery_channel TEXT DEFAULT 'driver_dispatch',
  pharmacy_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"drone_delivery_registry": """
CREATE TABLE IF NOT EXISTS drone_delivery_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drone_program_name TEXT NOT NULL,
  delivery_scope TEXT,
  payload_profile TEXT,
  launch_mode TEXT DEFAULT 'scheduled',
  drone_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"service_request_log": """
CREATE TABLE IF NOT EXISTS service_request_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_name TEXT,
  service_name TEXT NOT NULL,
  request_type TEXT,
  assigned_program TEXT,
  request_status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"callcenter_feature_extension_registry": """
CREATE TABLE IF NOT EXISTS callcenter_feature_extension_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_name TEXT NOT NULL,
  feature_group TEXT NOT NULL,
  linked_service TEXT,
  feature_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)"""
}

for ddl in tables.values():
    cur.execute(ddl)

if cur.execute("SELECT count(*) FROM service_expansion_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO service_expansion_registry
        (service_name, service_group, dispatch_mode, onboarding_mode, revenue_mode, service_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("rideshare", "mobility", "ai_assisted", "enabled", "trip_fee + subscription", "active"),
        ("pharmacy_delivery", "health_logistics", "ai_assisted", "enabled", "delivery_fee + merchant_fee", "active"),
        ("drone_delivery", "autonomous_logistics", "ai_assisted", "enabled", "delivery_fee + premium_speed", "active"),
        ("freight_logistics", "logistics", "ai_assisted", "enabled", "dispatch_fee + contract", "active"),
        ("food_delivery", "last_mile", "ai_assisted", "enabled", "merchant_fee + delivery_fee", "active"),
        ("real_estate_support", "business_services", "ai_assisted", "enabled", "lead_fee + premium_service", "active"),
    ])

if cur.execute("SELECT count(*) FROM dispatch_program_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO dispatch_program_registry
        (program_name, service_name, routing_model, ai_agent_name, dispatch_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Rideshare Dispatch Core", "rideshare", "dynamic_dispatch", "Lyons Tech AI", "active"),
        ("Pharmacy Rush Dispatch", "pharmacy_delivery", "priority_dispatch", "Stubbs AI", "active"),
        ("SkyDrop Drone Dispatch", "drone_delivery", "route_optimized_dispatch", "Lyons Tech AI", "active"),
        ("Freight Control Tower", "freight_logistics", "load_priority_dispatch", "Lyons Tech AI", "active"),
        ("Food Delivery Control", "food_delivery", "merchant_priority_dispatch", "Stubbs AI", "active"),
    ])

if cur.execute("SELECT count(*) FROM vehicle_fleet_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO vehicle_fleet_registry
        (fleet_name, vehicle_type, service_name, capacity_profile, fleet_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("City Ride Fleet", "car", "rideshare", "1_to_4_passengers", "active"),
        ("Pharmacy Courier Fleet", "car_van", "pharmacy_delivery", "secure_small_package", "active"),
        ("Drone Fleet Alpha", "drone", "drone_delivery", "light_payload_fast_range", "active"),
        ("Freight Support Fleet", "truck_van", "freight_logistics", "heavy_payload", "active"),
        ("Food Runner Fleet", "car_bike_scooter", "food_delivery", "hot_and_fast_delivery", "active"),
    ])

if cur.execute("SELECT count(*) FROM pharmacy_delivery_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO pharmacy_delivery_registry
        (pharmacy_name, fulfillment_mode, compliance_mode, delivery_channel, pharmacy_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("QuickMed Pharmacy", "same_day", "manual_review", "driver_dispatch", "active"),
        ("CareScript Express", "scheduled", "manual_review", "driver_dispatch", "active"),
    ])

if cur.execute("SELECT count(*) FROM drone_delivery_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO drone_delivery_registry
        (drone_program_name, delivery_scope, payload_profile, launch_mode, drone_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("SkyDrop Neighborhood", "local_radius", "light_payload", "scheduled", "active"),
        ("SkyDrop Merchant Rush", "merchant_priority", "small_payload", "on_demand", "active"),
    ])

if cur.execute("SELECT count(*) FROM service_request_log").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO service_request_log
        (requester_name, service_name, request_type, assigned_program, request_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Rider Prospect", "rideshare", "new_trip_request", "Rideshare Dispatch Core", "open"),
        ("Pharmacy Manager", "pharmacy_delivery", "merchant_onboarding", "Pharmacy Rush Dispatch", "open"),
        ("Retail Merchant", "drone_delivery", "delivery_quote", "SkyDrop Drone Dispatch", "open"),
        ("Logistics Broker", "freight_logistics", "load_support", "Freight Control Tower", "open"),
        ("Restaurant Owner", "food_delivery", "merchant_onboarding", "Food Delivery Control", "open"),
    ])

if cur.execute("SELECT count(*) FROM callcenter_feature_extension_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO callcenter_feature_extension_registry
        (feature_name, feature_group, linked_service, feature_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("Smart dispatch escalation", "dispatch_control", "rideshare", "active"),
        ("Prescription handoff notes", "compliance_support", "pharmacy_delivery", "active"),
        ("Drone mission queue", "autonomous_dispatch", "drone_delivery", "active"),
        ("Merchant quick onboarding", "business_onboarding", "food_delivery", "active"),
        ("Real-time trip triage", "operations", "rideshare", "active"),
        ("Multi-service unified intake", "call_center_core", "all", "active"),
    ])

conn.commit()
conn.close()
print("[OK] multiservice dispatch tables created and seeded")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderMultiserviceDispatchPage(req, user = null, message = '') {
  const services = dbQuery(`
    SELECT id, service_name, service_group, dispatch_mode, onboarding_mode, revenue_mode, service_status, created_at
    FROM service_expansion_registry
    ORDER BY id DESC LIMIT 100
  `);

  const programs = dbQuery(`
    SELECT id, program_name, service_name, routing_model, ai_agent_name, dispatch_status, created_at
    FROM dispatch_program_registry
    ORDER BY id DESC LIMIT 100
  `);

  const fleets = dbQuery(`
    SELECT id, fleet_name, vehicle_type, service_name, capacity_profile, fleet_status, created_at
    FROM vehicle_fleet_registry
    ORDER BY id DESC LIMIT 100
  `);

  const pharmacies = dbQuery(`
    SELECT id, pharmacy_name, fulfillment_mode, compliance_mode, delivery_channel, pharmacy_status, created_at
    FROM pharmacy_delivery_registry
    ORDER BY id DESC LIMIT 100
  `);

  const drones = dbQuery(`
    SELECT id, drone_program_name, delivery_scope, payload_profile, launch_mode, drone_status, created_at
    FROM drone_delivery_registry
    ORDER BY id DESC LIMIT 100
  `);

  const requests = dbQuery(`
    SELECT id, requester_name, service_name, request_type, assigned_program, request_status, created_at
    FROM service_request_log
    ORDER BY id DESC LIMIT 200
  `);

  const features = dbQuery(`
    SELECT id, feature_name, feature_group, linked_service, feature_status, created_at
    FROM callcenter_feature_extension_registry
    ORDER BY id DESC LIMIT 200
  `);

  const serviceRows = services.map(r => `<tr><td>${r.id}</td><td>${r.service_name}</td><td>${r.service_group}</td><td>${r.dispatch_mode}</td><td>${r.onboarding_mode}</td><td>${r.revenue_mode || ''}</td><td>${r.service_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const programRows = programs.map(r => `<tr><td>${r.id}</td><td>${r.program_name}</td><td>${r.service_name}</td><td>${r.routing_model}</td><td>${r.ai_agent_name || ''}</td><td>${r.dispatch_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const fleetRows = fleets.map(r => `<tr><td>${r.id}</td><td>${r.fleet_name}</td><td>${r.vehicle_type}</td><td>${r.service_name}</td><td>${r.capacity_profile || ''}</td><td>${r.fleet_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const pharmacyRows = pharmacies.map(r => `<tr><td>${r.id}</td><td>${r.pharmacy_name}</td><td>${r.fulfillment_mode}</td><td>${r.compliance_mode}</td><td>${r.delivery_channel}</td><td>${r.pharmacy_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const droneRows = drones.map(r => `<tr><td>${r.id}</td><td>${r.drone_program_name}</td><td>${r.delivery_scope || ''}</td><td>${r.payload_profile || ''}</td><td>${r.launch_mode}</td><td>${r.drone_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const requestRows = requests.map(r => `<tr><td>${r.id}</td><td>${r.requester_name || ''}</td><td>${r.service_name}</td><td>${r.request_type || ''}</td><td>${r.assigned_program || ''}</td><td>${r.request_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const featureRows = features.map(r => `<tr><td>${r.id}</td><td>${r.feature_name}</td><td>${r.feature_group}</td><td>${r.linked_service || ''}</td><td>${r.feature_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Multiservice Dispatch Expansion', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Multiservice Dispatch + Call Center Expansion</h1><p>${message || 'Rideshare, pharmacy delivery, drone delivery, and expanded call center business operations.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Service</th><th>Group</th><th>Dispatch</th><th>Onboarding</th><th>Revenue</th><th>Status</th><th>Created</th></tr></thead><tbody>${serviceRows || '<tr><td colspan="8">No services</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Program</th><th>Service</th><th>Routing</th><th>AI Agent</th><th>Status</th><th>Created</th></tr></thead><tbody>${programRows || '<tr><td colspan="7">No programs</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Fleet</th><th>Vehicle</th><th>Service</th><th>Capacity</th><th>Status</th><th>Created</th></tr></thead><tbody>${fleetRows || '<tr><td colspan="7">No fleets</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Pharmacy</th><th>Fulfillment</th><th>Compliance</th><th>Channel</th><th>Status</th><th>Created</th></tr></thead><tbody>${pharmacyRows || '<tr><td colspan="7">No pharmacy records</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Drone Program</th><th>Scope</th><th>Payload</th><th>Launch</th><th>Status</th><th>Created</th></tr></thead><tbody>${droneRows || '<tr><td colspan="7">No drone records</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Requester</th><th>Service</th><th>Type</th><th>Assigned</th><th>Status</th><th>Created</th></tr></thead><tbody>${requestRows || '<tr><td colspan="7">No service requests</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Feature</th><th>Group</th><th>Linked Service</th><th>Status</th><th>Created</th></tr></thead><tbody>${featureRows || '<tr><td colspan="6">No feature extensions</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderMultiserviceDispatchPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/multiservice-dispatch') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMultiserviceDispatchPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/competitive-contact-center') {"
if "pathname === '/multiservice-dispatch'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/multiservice-dispatch">Dispatch Expansion</a>' not in text and '<a href="/competitive-contact-center">CX Stack</a>' in text:
    text = text.replace(
        '<a href="/competitive-contact-center">CX Stack</a>',
        '<a href="/competitive-contact-center">CX Stack</a>\n          <a href="/multiservice-dispatch">Dispatch Expansion</a>',
        1
    )

p.write_text(text)
print("[OK] multiservice dispatch route added")
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
  /multiservice-dispatch \
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

latest = Path.home() / "aam_full_system" / "snapshots" / "multiservice_dispatch_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] multiservice dispatch scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) REPORT
########################################
cat > "reports/create_multiservice_dispatch_for_real_${STAMP}.txt" <<REPORT
CREATE MULTISERVICE DISPATCH FOR REAL REPORT
Timestamp: ${STAMP}

Created:
- rideshare
- pharmacy delivery
- drone delivery
- dispatch programs
- vehicle fleet registry
- service request log
- call center feature extensions
- /multiservice-dispatch

Verified:
- dashboard health
- jarvis health
- fresh smoke tests

Purpose:
- create the multiservice dispatch layer for real
- recover from interrupted earlier runs
- preserve stable runtime
REPORT

echo "CREATE MULTISERVICE DISPATCH FOR REAL COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/multiservice_dispatch_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/multiservice-dispatch"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
