#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== WORLD MARKETPLACE + STOREFRONT BUILD START ==="

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
CREATE TABLE IF NOT EXISTS world_storefronts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    storefront_name TEXT NOT NULL,
    storefront_type TEXT NOT NULL,
    owner_type TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    storefront_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS storefront_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storefront_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL,
    price_cents INTEGER NOT NULL DEFAULT 0,
    inventory_count INTEGER NOT NULL DEFAULT 0,
    product_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_cart_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    storefront_id INTEGER NOT NULL,
    buyer_type TEXT NOT NULL,
    buyer_id INTEGER NOT NULL,
    order_total_cents INTEGER NOT NULL DEFAULT 0,
    order_status TEXT NOT NULL DEFAULT 'placed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS storefront_activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    storefront_id INTEGER,
    activity_type TEXT NOT NULL,
    activity_payload TEXT,
    activity_status TEXT NOT NULL DEFAULT 'processed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM world_storefronts")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_storefronts (scene_id, storefront_name, storefront_type, owner_type, owner_id, storefront_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, "Commerce Crown Store", "wearables", "avatar", 1, "active"),
        (1, "Book Display Market", "books", "avatar", 1, "active"),
        (2, "Ops Tools Exchange", "ops_tools", "avatar", 2, "active"),
        (3, "Creator Stage Shop", "creator_goods", "avatar", 3, "active"),
    ])

cur.execute("SELECT count(*) FROM storefront_products")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO storefront_products (storefront_id, product_name, product_type, price_cents, inventory_count, product_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, "Commerce Crown", "wearable", 2500, 10, "active"),
        (1, "Portal Crystal Skin", "wearable_skin", 4500, 5, "active"),
        (2, "Best Seller Book Access", "digital_book", 1500, 100, "active"),
        (3, "IoT Beacon License", "ops_license", 3000, 25, "active"),
        (4, "Creator Stage Pass", "creator_pass", 2200, 40, "active"),
    ])

cur.execute("SELECT count(*) FROM world_cart_orders")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_cart_orders (scene_id, storefront_id, buyer_type, buyer_id, order_total_cents, order_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 1, "avatar", 1, 2500, "placed"),
        (1, 2, "avatar", 1, 1500, "placed"),
    ])

cur.execute("SELECT count(*) FROM storefront_activity_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO storefront_activity_log (scene_id, storefront_id, activity_type, activity_payload, activity_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, "storefront_open", '{"store":"Commerce Crown Store"}', "processed"),
        (1, 2, "product_listed", '{"product":"Best Seller Book Access"}', "processed"),
        (2, 3, "storefront_open", '{"store":"Ops Tools Exchange"}', "processed"),
        (3, 4, "storefront_open", '{"store":"Creator Stage Shop"}', "processed"),
    ])

conn.commit()
conn.close()
print("[OK] world marketplace DB additions ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

block = r"""
  if (pathname === '/open-storefront') {
    const storefrontId = Number(url.searchParams.get('storefrontId') || 0);
    const rows = dbQuery(`SELECT id, scene_id, storefront_name FROM world_storefronts WHERE id=${storefrontId} LIMIT 1`);
    if (!rows.length) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'storefront_not_found' }, null, 2));
    }
    const sf = rows[0];

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO storefront_activity_log (scene_id, storefront_id, activity_type, activity_payload, activity_status)
      VALUES (${sf.scene_id}, ${sf.id}, 'storefront_open', '{"storefront":"${q(sf.storefront_name)}"}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sf.scene_id, {
      ok: true,
      type: 'storefront_open',
      scene_id: sf.scene_id,
      storefront_id: sf.id,
      storefront_name: sf.storefront_name,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, storefront_open: true, storefront_id: sf.id, scene_id: sf.scene_id }, null, 2));
  }

  if (pathname === '/place-world-order') {
    const storefrontId = Number(url.searchParams.get('storefrontId') || 0);
    const buyerType = q(url.searchParams.get('buyerType') || 'avatar');
    const buyerId = Number(url.searchParams.get('buyerId') || 1);
    const total = Number(url.searchParams.get('total') || 0);

    const rows = dbQuery(`SELECT id, scene_id, storefront_name FROM world_storefronts WHERE id=${storefrontId} LIMIT 1`);
    if (!rows.length) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'storefront_not_found' }, null, 2));
    }
    const sf = rows[0];

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_cart_orders (scene_id, storefront_id, buyer_type, buyer_id, order_total_cents, order_status)
      VALUES (${sf.scene_id}, ${sf.id}, '${buyerType}', ${buyerId}, ${total}, 'placed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO storefront_activity_log (scene_id, storefront_id, activity_type, activity_payload, activity_status)
      VALUES (${sf.scene_id}, ${sf.id}, 'order_placed', '{"buyerType":"${buyerType}","buyerId":${buyerId},"total":${total}}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sf.scene_id, {
      ok: true,
      type: 'world_order',
      scene_id: sf.scene_id,
      storefront_id: sf.id,
      buyer_type: buyerType,
      buyer_id: buyerId,
      total,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, order_placed: true, storefront_id: sf.id, scene_id: sf.scene_id, total }, null, 2));
  }
"""

marker = "  if (pathname === '/mint-asset') {"
if "pathname === '/open-storefront'" not in text and marker in text:
    text = text.replace(marker, block + "\n" + marker, 1)

sync_old = """      assets: dbQuery(`SELECT id, asset_name, asset_type, asset_rarity, asset_status, created_at FROM world_assets WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 50`),
      ownership: dbQuery(`SELECT ao.id, ao.asset_id, ao.owner_type, ao.owner_id, ao.ownership_status, ao.acquired_at FROM asset_ownership ao WHERE ao.asset_id IN (SELECT id FROM world_assets WHERE scene_id=${sceneId}) ORDER BY ao.id DESC LIMIT 50`),
      transfers: dbQuery(`SELECT atl.id, atl.asset_id, atl.from_owner_type, atl.from_owner_id, atl.to_owner_type, atl.to_owner_id, atl.transfer_type, atl.transfer_status, atl.created_at FROM asset_transfer_log atl WHERE atl.asset_id IN (SELECT id FROM world_assets WHERE scene_id=${sceneId}) ORDER BY atl.id DESC LIMIT 50`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""

sync_new = """      assets: dbQuery(`SELECT id, asset_name, asset_type, asset_rarity, asset_status, created_at FROM world_assets WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 50`),
      ownership: dbQuery(`SELECT ao.id, ao.asset_id, ao.owner_type, ao.owner_id, ao.ownership_status, ao.acquired_at FROM asset_ownership ao WHERE ao.asset_id IN (SELECT id FROM world_assets WHERE scene_id=${sceneId}) ORDER BY ao.id DESC LIMIT 50`),
      transfers: dbQuery(`SELECT atl.id, atl.asset_id, atl.from_owner_type, atl.from_owner_id, atl.to_owner_type, atl.to_owner_id, atl.transfer_type, atl.transfer_status, atl.created_at FROM asset_transfer_log atl WHERE atl.asset_id IN (SELECT id FROM world_assets WHERE scene_id=${sceneId}) ORDER BY atl.id DESC LIMIT 50`),
      storefronts: dbQuery(`SELECT id, storefront_name, storefront_type, owner_type, owner_id, storefront_status, created_at FROM world_storefronts WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 50`),
      storefront_products: dbQuery(`SELECT sp.id, sp.storefront_id, sp.product_name, sp.product_type, sp.price_cents, sp.inventory_count, sp.product_status, sp.created_at FROM storefront_products sp WHERE sp.storefront_id IN (SELECT id FROM world_storefronts WHERE scene_id=${sceneId}) ORDER BY sp.id DESC LIMIT 100`),
      world_orders: dbQuery(`SELECT id, storefront_id, buyer_type, buyer_id, order_total_cents, order_status, created_at FROM world_cart_orders WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      storefront_activity: dbQuery(`SELECT id, storefront_id, activity_type, activity_payload, activity_status, created_at FROM storefront_activity_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""

if "storefronts: dbQuery(`SELECT id, storefront_name" not in text:
    text = text.replace(sync_old, sync_new, 1)

p.write_text(text)
print("[OK] world_socket.js storefront patch applied")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-storefronts">World Storefronts</a>' not in text and '<a href="/world-economy">World Economy</a>' in text:
    text = text.replace(
        '<a href="/world-economy">World Economy</a>',
        '<a href="/world-economy">World Economy</a>\n      <a href="/world-storefronts">World Storefronts</a>'
    )

helper = r'''
function renderWorldStorefrontsPage(user = null) {
  const storefronts = dbQuery(`
    SELECT ws.id, sr.scene_name, ws.storefront_name, ws.storefront_type, ws.owner_type, ws.owner_id, ws.storefront_status, ws.created_at
    FROM world_storefronts ws
    LEFT JOIN scene_registry sr ON sr.id = ws.scene_id
    ORDER BY ws.id DESC
    LIMIT 200
  `);

  const products = dbQuery(`
    SELECT sp.id, ws.storefront_name, sp.product_name, sp.product_type, sp.price_cents, sp.inventory_count, sp.product_status, sp.created_at
    FROM storefront_products sp
    LEFT JOIN world_storefronts ws ON ws.id = sp.storefront_id
    ORDER BY sp.id DESC
    LIMIT 200
  `);

  const orders = dbQuery(`
    SELECT wco.id, ws.storefront_name, wco.buyer_type, wco.buyer_id, wco.order_total_cents, wco.order_status, wco.created_at
    FROM world_cart_orders wco
    LEFT JOIN world_storefronts ws ON ws.id = wco.storefront_id
    ORDER BY wco.id DESC
    LIMIT 200
  `);

  const activity = dbQuery(`
    SELECT sal.id, ws.storefront_name, sal.activity_type, sal.activity_payload, sal.activity_status, sal.created_at
    FROM storefront_activity_log sal
    LEFT JOIN world_storefronts ws ON ws.id = sal.storefront_id
    ORDER BY sal.id DESC
    LIMIT 200
  `);

  const storefrontRows = storefronts.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.storefront_name}</td><td>${r.storefront_type}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.storefront_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const productRows = products.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.product_name}</td><td>${r.product_type}</td><td>${r.price_cents}</td><td>${r.inventory_count}</td><td>${r.product_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const orderRows = orders.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.buyer_type}</td><td>${r.buyer_id}</td><td>${r.order_total_cents}</td><td>${r.order_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const activityRows = activity.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.activity_type}</td><td><code>${r.activity_payload || ''}</code></td><td>${r.activity_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Storefronts', `
    <div class="section"><div class="card">
      <h2>World Marketplace + Storefronts</h2>
      <p>This layer connects immersive worlds to storefront ownership, product listings, and order activity.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Storefronts</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Type</th><th>Owner Type</th><th>Owner ID</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${storefrontRows || '<tr><td colspan="8">No storefronts yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Products</h3>
      <table>
        <thead><tr><th>ID</th><th>Storefront</th><th>Product</th><th>Type</th><th>Price</th><th>Inventory</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${productRows || '<tr><td colspan="8">No products yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Orders</h3>
      <table>
        <thead><tr><th>ID</th><th>Storefront</th><th>Buyer Type</th><th>Buyer ID</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${orderRows || '<tr><td colspan="7">No orders yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Storefront Activity</h3>
      <table>
        <thead><tr><th>ID</th><th>Storefront</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${activityRows || '<tr><td colspan="6">No storefront activity yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldStorefrontsPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/world-economy') {"
if "pathname === '/world-storefronts'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-storefronts') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldStorefrontsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/world-economy') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js storefront patch applied")
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

cp apps/dashboard.js "backups/dashboard_world_storefronts_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_world_storefronts_${STAMP}.js"
cp db/aam.db "backups/aam_world_storefronts_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_storefronts from world_storefronts;" > "snapshots/world_storefronts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storefront_products from storefront_products;" > "snapshots/storefront_products_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_cart_orders from world_cart_orders;" > "snapshots/world_cart_orders_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storefront_activity_log from storefront_activity_log;" > "snapshots/storefront_activity_log_${STAMP}.json"

echo "WORLD STOREFRONTS CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-storefronts"
echo "  curl -s http://127.0.0.1:5090/sync/1"
echo "  curl -s 'http://127.0.0.1:5090/open-storefront?storefrontId=1'"
echo "  curl -s 'http://127.0.0.1:5090/place-world-order?storefrontId=1&buyerType=avatar&buyerId=1&total=2500'"
