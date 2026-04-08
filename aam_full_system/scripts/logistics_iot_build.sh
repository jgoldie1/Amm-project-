#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== LOGISTICS + IOT BUILD START ==="

########################################
# 1) DATABASE TABLES
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS logistics_hubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hub_name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    hub_type TEXT NOT NULL DEFAULT 'distribution',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS logistics_vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_name TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    plate_or_asset_tag TEXT,
    assigned_hub_id INTEGER,
    status TEXT NOT NULL DEFAULT 'ready',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assigned_hub_id) REFERENCES logistics_hubs(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS logistics_shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shipment_code TEXT NOT NULL UNIQUE,
    shipment_type TEXT NOT NULL DEFAULT 'delivery',
    origin_hub_id INTEGER,
    destination_label TEXT,
    assigned_vehicle_id INTEGER,
    shipment_status TEXT NOT NULL DEFAULT 'created',
    reference_type TEXT,
    reference_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(origin_hub_id) REFERENCES logistics_hubs(id),
    FOREIGN KEY(assigned_vehicle_id) REFERENCES logistics_vehicles(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS iot_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    linked_entity_type TEXT,
    linked_entity_id INTEGER,
    device_status TEXT NOT NULL DEFAULT 'online',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS iot_telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value TEXT NOT NULL,
    alert_level TEXT NOT NULL DEFAULT 'normal',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(device_id) REFERENCES iot_devices(id)
)
""")

# seed hubs
seed_hubs = [
    ("Chicago Main Hub", "Chicago", "IL", "distribution", "active"),
    ("Nashville Family Hub", "Nashville", "TN", "distribution", "active"),
    ("Texas Expansion Hub", "Dallas", "TX", "distribution", "active"),
]

for hub_name, city, state, hub_type, status in seed_hubs:
    cur.execute("SELECT 1 FROM logistics_hubs WHERE hub_name = ?", (hub_name,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO logistics_hubs (hub_name, city, state, hub_type, status)
            VALUES (?, ?, ?, ?, ?)
        """, (hub_name, city, state, hub_type, status))

# seed vehicles
seed_vehicles = [
    ("Titan Freight 1", "truck", "AAM-TRK-001", 1, "ready"),
    ("Aurora Delivery Van 1", "van", "AAM-VAN-001", 1, "ready"),
    ("SkyDrop Drone 1", "drone", "AAM-DRN-001", 1, "ready"),
]

for vehicle_name, vehicle_type, tag, hub_id, status in seed_vehicles:
    cur.execute("SELECT 1 FROM logistics_vehicles WHERE vehicle_name = ?", (vehicle_name,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO logistics_vehicles (vehicle_name, vehicle_type, plate_or_asset_tag, assigned_hub_id, status)
            VALUES (?, ?, ?, ?, ?)
        """, (vehicle_name, vehicle_type, tag, hub_id, status))

# seed shipments
seed_shipments = [
    ("SHIP-000001", "delivery", 1, "Chicago Retail Route", 2, "created", "book", 1),
    ("SHIP-000002", "freight", 1, "Nashville Branch Delivery", 1, "in_transit", "wallet", 1),
    ("SHIP-000003", "drone", 1, "Local Premium Package", 3, "created", "podcast", 1),
]

for code, stype, origin_hub_id, dest, vehicle_id, status, ref_type, ref_id in seed_shipments:
    cur.execute("SELECT 1 FROM logistics_shipments WHERE shipment_code = ?", (code,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO logistics_shipments
            (shipment_code, shipment_type, origin_hub_id, destination_label, assigned_vehicle_id, shipment_status, reference_type, reference_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (code, stype, origin_hub_id, dest, vehicle_id, status, ref_type, ref_id))

# seed iot devices
seed_devices = [
    ("Truck Sensor Node 1", "vehicle_sensor", "logistics_vehicle", 1, "online"),
    ("Van Sensor Node 1", "vehicle_sensor", "logistics_vehicle", 2, "online"),
    ("Drone Sensor Node 1", "vehicle_sensor", "logistics_vehicle", 3, "online"),
    ("Chicago Hub Temperature Sensor", "hub_sensor", "logistics_hub", 1, "online"),
]

for name, dtype, entity_type, entity_id, status in seed_devices:
    cur.execute("SELECT 1 FROM iot_devices WHERE device_name = ?", (name,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO iot_devices (device_name, device_type, linked_entity_type, linked_entity_id, device_status)
            VALUES (?, ?, ?, ?, ?)
        """, (name, dtype, entity_type, entity_id, status))

# seed telemetry
seed_telemetry = [
    (1, "battery", "91%", "normal"),
    (1, "location", "Chicago Route Active", "normal"),
    (2, "temperature", "72F", "normal"),
    (3, "battery", "48%", "warning"),
    (4, "temperature", "68F", "normal"),
]

for device_id, metric_name, metric_value, alert_level in seed_telemetry:
    cur.execute("""
        INSERT INTO iot_telemetry (device_id, metric_name, metric_value, alert_level)
        VALUES (?, ?, ?, ?)
    """, (device_id, metric_name, metric_value, alert_level))

conn.commit()
conn.close()
print("[OK] logistics + iot tables ready")
PYEOF

########################################
# 2) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

# nav
if '<a href="/logistics">Logistics</a>' not in text and '<a href="/barcodes">Barcodes</a>' in text:
    text = text.replace(
        '<a href="/barcodes">Barcodes</a>',
        '<a href="/barcodes">Barcodes</a>\n      <a href="/logistics">Logistics</a>\n      <a href="/iot">IoT</a>'
    )

helpers = r'''
function renderLogisticsPage(user = null) {
  const hubs = dbQuery("SELECT id, hub_name, city, state, hub_type, status FROM logistics_hubs ORDER BY id DESC");
  const vehicles = dbQuery("SELECT id, vehicle_name, vehicle_type, plate_or_asset_tag, status FROM logistics_vehicles ORDER BY id DESC");
  const shipments = dbQuery(`
    SELECT s.id, s.shipment_code, s.shipment_type, s.destination_label, s.shipment_status,
           v.vehicle_name
    FROM logistics_shipments s
    LEFT JOIN logistics_vehicles v ON v.id = s.assigned_vehicle_id
    ORDER BY s.id DESC
  `);

  const hubRows = hubs.map(h => `<tr><td>${h.id}</td><td>${h.hub_name}</td><td>${h.city || ''}</td><td>${h.state || ''}</td><td>${h.hub_type}</td><td>${h.status}</td></tr>`).join('');
  const vehicleRows = vehicles.map(v => `<tr><td>${v.id}</td><td>${v.vehicle_name}</td><td>${v.vehicle_type}</td><td>${v.plate_or_asset_tag || ''}</td><td>${v.status}</td></tr>`).join('');
  const shipmentRows = shipments.map(s => `<tr><td>${s.id}</td><td>${s.shipment_code}</td><td>${s.shipment_type}</td><td>${s.destination_label || ''}</td><td>${s.vehicle_name || ''}</td><td>${s.shipment_status}</td></tr>`).join('');

  return htmlPage('Logistics Control', `
    <div class="section">
      <div class="card">
        <h2>Logistics Control Layer</h2>
        <p>Freight, delivery, hubs, vehicles, dispatch, and future robotics/manufacturing logistics tracking.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Hubs</h3>
          <table>
            <thead><tr><th>ID</th><th>Hub</th><th>City</th><th>State</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>${hubRows || '<tr><td colspan="6">No hubs yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Vehicles</h3>
          <table>
            <thead><tr><th>ID</th><th>Vehicle</th><th>Type</th><th>Asset Tag</th><th>Status</th></tr></thead>
            <tbody>${vehicleRows || '<tr><td colspan="5">No vehicles yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Shipments</h3>
          <table>
            <thead><tr><th>ID</th><th>Code</th><th>Type</th><th>Destination</th><th>Vehicle</th><th>Status</th></tr></thead>
            <tbody>${shipmentRows || '<tr><td colspan="6">No shipments yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}

function renderIotPage(user = null) {
  const devices = dbQuery("SELECT id, device_name, device_type, linked_entity_type, linked_entity_id, device_status FROM iot_devices ORDER BY id DESC");
  const telemetry = dbQuery(`
    SELECT t.id, d.device_name, t.metric_name, t.metric_value, t.alert_level, t.created_at
    FROM iot_telemetry t
    JOIN iot_devices d ON d.id = t.device_id
    ORDER BY t.id DESC
    LIMIT 100
  `);

  const deviceRows = devices.map(d => `<tr><td>${d.id}</td><td>${d.device_name}</td><td>${d.device_type}</td><td>${d.linked_entity_type || ''}</td><td>${d.linked_entity_id || ''}</td><td>${d.device_status}</td></tr>`).join('');
  const telemetryRows = telemetry.map(t => `<tr><td>${t.id}</td><td>${t.device_name}</td><td>${t.metric_name}</td><td>${t.metric_value}</td><td>${t.alert_level}</td><td>${t.created_at || ''}</td></tr>`).join('');

  return htmlPage('IoT Control', `
    <div class="section">
      <div class="card">
        <h2>IoT Device + Telemetry Layer</h2>
        <p>Connected sensors for hubs, vehicles, assets, warehouses, manufacturing, robotics, and future metaverse-linked devices.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Devices</h3>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Entity</th><th>Entity ID</th><th>Status</th></tr></thead>
            <tbody>${deviceRows || '<tr><td colspan="6">No devices yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Telemetry</h3>
          <table>
            <thead><tr><th>ID</th><th>Device</th><th>Metric</th><th>Value</th><th>Alert</th><th>Created</th></tr></thead>
            <tbody>${telemetryRows || '<tr><td colspan="6">No telemetry yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", helpers)

anchor = "    if (req.method === 'GET' && pathname === '/search-engine') {"
if "pathname === '/logistics'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/logistics') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderLogisticsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/iot') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderIotPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/search-engine') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] logistics + iot patch applied")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

########################################
# 4) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_logistics_iot_stable_${STAMP}.js"
cp db/aam.db "backups/aam_logistics_iot_stable_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as logistics_hubs from logistics_hubs;" > "snapshots/logistics_hubs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as logistics_vehicles from logistics_vehicles;" > "snapshots/logistics_vehicles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as logistics_shipments from logistics_shipments;" > "snapshots/logistics_shipments_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as iot_devices from iot_devices;" > "snapshots/iot_devices_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as iot_telemetry from iot_telemetry;" > "snapshots/iot_telemetry_${STAMP}.json"

echo "LOGISTICS + IOT STABLE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/logistics"
echo "  termux-open-url http://127.0.0.1:4900/iot"
