#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== WORLD COMMERCE SETTLEMENT BUILD START ==="

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
CREATE TABLE IF NOT EXISTS world_order_settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    world_order_id INTEGER NOT NULL,
    scene_id INTEGER NOT NULL,
    buyer_type TEXT NOT NULL,
    buyer_id INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL DEFAULT 0,
    receipt_id INTEGER,
    wallet_tx_id INTEGER,
    settlement_status TEXT NOT NULL DEFAULT 'settled',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_commerce_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    source_id INTEGER,
    commerce_event TEXT NOT NULL,
    commerce_payload TEXT,
    commerce_status TEXT NOT NULL DEFAULT 'processed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM world_order_settlements")
if cur.fetchone()[0] == 0:
    cur.execute("""
        INSERT INTO world_order_settlements
        (world_order_id, scene_id, buyer_type, buyer_id, amount_cents, settlement_status)
        VALUES (1, 1, 'avatar', 1, 2500, 'seeded')
    """)

cur.execute("SELECT count(*) FROM world_commerce_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_commerce_log
        (scene_id, source_type, source_id, commerce_event, commerce_payload, commerce_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, "seed", 1, "storefront_open", '{"storefront":"Commerce Crown Store"}', "processed"),
        (1, "seed", 2, "order_ready", '{"total":2500}', "processed"),
    ])

conn.commit()
conn.close()
print("[OK] commerce settlement DB additions ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

block = r"""
  if (pathname === '/settle-world-order') {
    const orderId = Number(url.searchParams.get('orderId') || 0);

    const orderRows = dbQuery(`SELECT id, scene_id, buyer_type, buyer_id, order_total_cents, order_status
                               FROM world_cart_orders
                               WHERE id=${orderId}
                               LIMIT 1`);
    if (!orderRows.length) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'world_order_not_found' }, null, 2));
    }

    const order = orderRows[0];
    const amount = Number(order.order_total_cents || 0);

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO receipts
      (payer_type, payer_id, amount_cents, receipt_type, reference_type, reference_id, receipt_status)
      VALUES ('${q(order.buyer_type)}', ${Number(order.buyer_id)}, ${amount}, 'world_order', 'world_cart_order', ${orderId}, 'paid')`], { encoding: 'utf8' });

    const receiptRows = dbQuery(`SELECT id FROM receipts ORDER BY id DESC LIMIT 1`);
    const receiptId = receiptRows.length ? Number(receiptRows[0].id) : 0;

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO wallet_transactions
      (wallet_id, tx_type, amount_cents, reference_type, reference_id, note, tx_status)
      VALUES (1, 'world_order_sale', ${amount}, 'world_cart_order', ${orderId}, 'World order settlement', 'posted')`], { encoding: 'utf8' });

    const walletRows = dbQuery(`SELECT id FROM wallet_transactions ORDER BY id DESC LIMIT 1`);
    const walletTxId = walletRows.length ? Number(walletRows[0].id) : 0;

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_order_settlements
      (world_order_id, scene_id, buyer_type, buyer_id, amount_cents, receipt_id, wallet_tx_id, settlement_status)
      VALUES (${orderId}, ${Number(order.scene_id)}, '${q(order.buyer_type)}', ${Number(order.buyer_id)}, ${amount}, ${receiptId}, ${walletTxId}, 'settled')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `UPDATE world_cart_orders
      SET order_status='settled'
      WHERE id=${orderId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_commerce_log
      (scene_id, source_type, source_id, commerce_event, commerce_payload, commerce_status)
      VALUES (${Number(order.scene_id)}, 'world_order', ${orderId}, 'order_settled', '{"amount":${amount},"receiptId":${receiptId},"walletTxId":${walletTxId}}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(order.scene_id, {
      ok: true,
      type: 'world_order_settled',
      scene_id: order.scene_id,
      order_id: orderId,
      amount_cents: amount,
      receipt_id: receiptId,
      wallet_tx_id: walletTxId,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      settled: true,
      order_id: orderId,
      scene_id: order.scene_id,
      amount_cents: amount,
      receipt_id: receiptId,
      wallet_tx_id: walletTxId
    }, null, 2));
  }
"""

marker = "  if (pathname === '/open-storefront') {"
if "pathname === '/settle-world-order'" not in text and marker in text:
    text = text.replace(marker, block + "\n" + marker, 1)

sync_old = """      storefronts: dbQuery(`SELECT id, storefront_name, storefront_type, owner_type, owner_id, storefront_status, created_at FROM world_storefronts WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 50`),
      storefront_products: dbQuery(`SELECT sp.id, sp.storefront_id, sp.product_name, sp.product_type, sp.price_cents, sp.inventory_count, sp.product_status, sp.created_at FROM storefront_products sp WHERE sp.storefront_id IN (SELECT id FROM world_storefronts WHERE scene_id=${sceneId}) ORDER BY sp.id DESC LIMIT 100`),
      world_orders: dbQuery(`SELECT id, storefront_id, buyer_type, buyer_id, order_total_cents, order_status, created_at FROM world_cart_orders WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      storefront_activity: dbQuery(`SELECT id, storefront_id, activity_type, activity_payload, activity_status, created_at FROM storefront_activity_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""

sync_new = """      storefronts: dbQuery(`SELECT id, storefront_name, storefront_type, owner_type, owner_id, storefront_status, created_at FROM world_storefronts WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 50`),
      storefront_products: dbQuery(`SELECT sp.id, sp.storefront_id, sp.product_name, sp.product_type, sp.price_cents, sp.inventory_count, sp.product_status, sp.created_at FROM storefront_products sp WHERE sp.storefront_id IN (SELECT id FROM world_storefronts WHERE scene_id=${sceneId}) ORDER BY sp.id DESC LIMIT 100`),
      world_orders: dbQuery(`SELECT id, storefront_id, buyer_type, buyer_id, order_total_cents, order_status, created_at FROM world_cart_orders WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      storefront_activity: dbQuery(`SELECT id, storefront_id, activity_type, activity_payload, activity_status, created_at FROM storefront_activity_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      settlements: dbQuery(`SELECT id, world_order_id, buyer_type, buyer_id, amount_cents, receipt_id, wallet_tx_id, settlement_status, created_at FROM world_order_settlements WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      commerce_log: dbQuery(`SELECT id, source_type, source_id, commerce_event, commerce_status, created_at FROM world_commerce_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""

if "settlements: dbQuery(`SELECT id, world_order_id" not in text:
    text = text.replace(sync_old, sync_new, 1)

p.write_text(text)
print("[OK] world_socket.js commerce settlement patch applied")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-settlements">World Settlements</a>' not in text and '<a href="/world-storefronts">World Storefronts</a>' in text:
    text = text.replace(
        '<a href="/world-storefronts">World Storefronts</a>',
        '<a href="/world-storefronts">World Storefronts</a>\n      <a href="/world-settlements">World Settlements</a>'
    )

helper = r'''
function renderWorldSettlementsPage(user = null) {
  const settlements = dbQuery(`
    SELECT wos.id, sr.scene_name, wos.world_order_id, wos.buyer_type, wos.buyer_id, wos.amount_cents, wos.receipt_id, wos.wallet_tx_id, wos.settlement_status, wos.created_at
    FROM world_order_settlements wos
    LEFT JOIN scene_registry sr ON sr.id = wos.scene_id
    ORDER BY wos.id DESC
    LIMIT 200
  `);

  const commerce = dbQuery(`
    SELECT wcl.id, sr.scene_name, wcl.source_type, wcl.source_id, wcl.commerce_event, wcl.commerce_payload, wcl.commerce_status, wcl.created_at
    FROM world_commerce_log wcl
    LEFT JOIN scene_registry sr ON sr.id = wcl.scene_id
    ORDER BY wcl.id DESC
    LIMIT 200
  `);

  const receiptRows = settlements.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.world_order_id}</td><td>${r.buyer_type}</td><td>${r.buyer_id}</td><td>${r.amount_cents}</td><td>${r.receipt_id || ''}</td><td>${r.wallet_tx_id || ''}</td><td>${r.settlement_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const commerceRows = commerce.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.source_type}</td><td>${r.source_id || ''}</td><td>${r.commerce_event}</td><td><code>${r.commerce_payload || ''}</code></td><td>${r.commerce_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Settlements', `
    <div class="section"><div class="card">
      <h2>World Commerce Settlements</h2>
      <p>This layer bridges immersive world orders into receipts, wallet transactions, and settlement records.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Settlement Records</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Order</th><th>Buyer Type</th><th>Buyer ID</th><th>Amount</th><th>Receipt</th><th>Wallet Tx</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${receiptRows || '<tr><td colspan="10">No settlements yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Commerce Log</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Source Type</th><th>Source ID</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${commerceRows || '<tr><td colspan="8">No commerce events yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldSettlementsPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/world-storefronts') {"
if "pathname === '/world-settlements'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-settlements') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldSettlementsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/world-storefronts') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js settlements patch applied")
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

cp apps/dashboard.js "backups/dashboard_world_settlements_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_world_settlements_${STAMP}.js"
cp db/aam.db "backups/aam_world_settlements_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_order_settlements from world_order_settlements;" > "snapshots/world_order_settlements_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_commerce_log from world_commerce_log;" > "snapshots/world_commerce_log_${STAMP}.json"

echo "WORLD COMMERCE SETTLEMENT CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-settlements"
echo "  curl -s http://127.0.0.1:5090/sync/1"
echo "  curl -s 'http://127.0.0.1:5090/place-world-order?storefrontId=1&buyerType=avatar&buyerId=1&total=2500'"
echo "  curl -s 'http://127.0.0.1:5090/settle-world-order?orderId=1'"
