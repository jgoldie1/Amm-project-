#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FIX ENTITLEMENTS + RESTART START ==="

########################################
# 1) DB REPAIR
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

# make sure wallet_transactions has tx_status
if "wallet_transactions" in [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]:
    if "tx_status" not in cols("wallet_transactions"):
        cur.execute("ALTER TABLE wallet_transactions ADD COLUMN tx_status TEXT DEFAULT 'posted'")
        print("[OK] Added wallet_transactions.tx_status")

# make sure entitlement tables exist
cur.execute("""
CREATE TABLE IF NOT EXISTS world_entitlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    entitlement_name TEXT NOT NULL,
    entitlement_type TEXT NOT NULL,
    asset_id INTEGER,
    entitlement_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_access_passes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    owner_type TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    entitlement_id INTEGER,
    pass_status TEXT NOT NULL DEFAULT 'granted',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_access_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    owner_type TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    access_type TEXT NOT NULL,
    access_result TEXT NOT NULL,
    access_payload TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed entitlements if empty
cur.execute("SELECT count(*) FROM world_entitlements")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_entitlements (scene_id, entitlement_name, entitlement_type, asset_id, entitlement_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, "Commerce Premium Entry", "scene_access", 1, "active"),
        (1, "Commerce Crown Access", "asset_access", 7, "active"),
        (2, "Ops Control Access", "scene_access", 3, "active"),
        (3, "Creator Stage Access", "scene_access", 5, "active"),
    ])
    print("[OK] Seeded world_entitlements")

cur.execute("SELECT count(*) FROM world_access_passes")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_access_passes (scene_id, owner_type, owner_id, entitlement_id, pass_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, "avatar", 1, 1, "granted"),
        (2, "avatar", 2, 3, "granted"),
        (3, "avatar", 3, 4, "granted"),
    ])
    print("[OK] Seeded world_access_passes")

cur.execute("SELECT count(*) FROM world_access_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_access_log (scene_id, owner_type, owner_id, access_type, access_result, access_payload)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, "avatar", 1, "scene_access", "granted", '{"reason":"seed access"}'),
        (2, "avatar", 2, "scene_access", "granted", '{"reason":"seed access"}'),
        (3, "avatar", 3, "scene_access", "granted", '{"reason":"seed access"}'),
    ])
    print("[OK] Seeded world_access_log")

conn.commit()
conn.close()
print("[OK] DB repair complete")
PYEOF

########################################
# 2) RECONCILE SETTLEMENTS AGAIN
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

rows = cur.execute("""
SELECT id, world_order_id, scene_id, buyer_type, buyer_id, amount_cents, receipt_id, wallet_tx_id, settlement_status
FROM world_order_settlements
WHERE (receipt_id IS NULL OR wallet_tx_id IS NULL OR settlement_status='seeded')
ORDER BY id ASC
""").fetchall()

fixed = 0

for r in rows:
    world_order_id = int(r["world_order_id"])
    scene_id = int(r["scene_id"])
    buyer_type = r["buyer_type"]
    buyer_id = int(r["buyer_id"])
    amount_cents = int(r["amount_cents"] or 0)

    receipt_id = r["receipt_id"]
    wallet_tx_id = r["wallet_tx_id"]

    if receipt_id is None:
        cur.execute("""
        INSERT INTO receipts
        (payer_type, payer_id, amount_cents, receipt_type, reference_type, reference_id, receipt_status)
        VALUES (?, ?, ?, 'world_order', 'world_cart_order', ?, 'paid')
        """, (buyer_type, buyer_id, amount_cents, world_order_id))
        receipt_id = cur.lastrowid

    if wallet_tx_id is None:
        cur.execute("""
        INSERT INTO wallet_transactions
        (wallet_id, tx_type, amount_cents, reference_type, reference_id, note, tx_status)
        VALUES (1, 'world_order_sale', ?, 'world_cart_order', ?, 'World order settlement reconciliation', 'posted')
        """, (amount_cents, world_order_id))
        wallet_tx_id = cur.lastrowid

    cur.execute("""
    UPDATE world_order_settlements
    SET receipt_id=?, wallet_tx_id=?, settlement_status='settled'
    WHERE id=?
    """, (receipt_id, wallet_tx_id, int(r["id"])))

    cur.execute("""
    UPDATE world_cart_orders
    SET order_status='settled'
    WHERE id=?
    """, (world_order_id,))

    cur.execute("""
    INSERT INTO world_commerce_log
    (scene_id, source_type, source_id, commerce_event, commerce_payload, commerce_status)
    VALUES (?, 'settlement_reconcile', ?, 'reconciled_settlement', ?, 'processed')
    """, (scene_id, world_order_id, f'{{"receiptId":{receipt_id},"walletTxId":{wallet_tx_id}}}'))

    fixed += 1

conn.commit()
conn.close()
print(f"[OK] reconciled settlements: {fixed}")
PYEOF

########################################
# 3) PATCH WORLD SOCKET FOR ACCESS ROUTES IF MISSING
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

block = r"""
  if (pathname === '/grant-access') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const ownerType = q(url.searchParams.get('ownerType') || 'avatar');
    const ownerId = Number(url.searchParams.get('ownerId') || 1);
    const entitlementId = Number(url.searchParams.get('entitlementId') || 0);

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_access_passes
      (scene_id, owner_type, owner_id, entitlement_id, pass_status)
      VALUES (${sceneId}, '${ownerType}', ${ownerId}, ${entitlementId}, 'granted')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_access_log
      (scene_id, owner_type, owner_id, access_type, access_result, access_payload)
      VALUES (${sceneId}, '${ownerType}', ${ownerId}, 'grant_access', 'granted', '{"entitlementId":${entitlementId}}')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'grant_access',
      scene_id: sceneId,
      owner_type: ownerType,
      owner_id: ownerId,
      entitlement_id: entitlementId,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      access_granted: true,
      scene_id: sceneId,
      owner_type: ownerType,
      owner_id: ownerId,
      entitlement_id: entitlementId
    }, null, 2));
  }

  if (pathname === '/check-access') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const ownerType = q(url.searchParams.get('ownerType') || 'avatar');
    const ownerId = Number(url.searchParams.get('ownerId') || 1);

    const rows = dbQuery(`SELECT id, entitlement_id, pass_status, created_at
                          FROM world_access_passes
                          WHERE scene_id=${sceneId}
                            AND owner_type='${ownerType}'
                            AND owner_id=${ownerId}
                            AND pass_status='granted'
                          ORDER BY id DESC`);

    const granted = rows.length > 0;

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_access_log
      (scene_id, owner_type, owner_id, access_type, access_result, access_payload)
      VALUES (${sceneId}, '${ownerType}', ${ownerId}, 'check_access', '${granted ? "granted" : "denied"}', '{"matches":${rows.length}}')`], { encoding: 'utf8' });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      granted,
      scene_id: sceneId,
      owner_type: ownerType,
      owner_id: ownerId,
      matches: rows
    }, null, 2));
  }
"""

marker = "  if (pathname === '/settle-world-order') {"
if "pathname === '/grant-access'" not in text and marker in text:
    text = text.replace(marker, block + "\n" + marker, 1)

sync_old = """      settlements: dbQuery(`SELECT id, world_order_id, buyer_type, buyer_id, amount_cents, receipt_id, wallet_tx_id, settlement_status, created_at FROM world_order_settlements WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      commerce_log: dbQuery(`SELECT id, source_type, source_id, commerce_event, commerce_status, created_at FROM world_commerce_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""

sync_new = """      settlements: dbQuery(`SELECT id, world_order_id, buyer_type, buyer_id, amount_cents, receipt_id, wallet_tx_id, settlement_status, created_at FROM world_order_settlements WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      commerce_log: dbQuery(`SELECT id, source_type, source_id, commerce_event, commerce_status, created_at FROM world_commerce_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      entitlements: dbQuery(`SELECT id, entitlement_name, entitlement_type, asset_id, entitlement_status, created_at FROM world_entitlements WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      access_passes: dbQuery(`SELECT id, owner_type, owner_id, entitlement_id, pass_status, created_at FROM world_access_passes WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      access_log: dbQuery(`SELECT id, owner_type, owner_id, access_type, access_result, created_at FROM world_access_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""

if "entitlements: dbQuery(`SELECT id, entitlement_name" not in text:
    text = text.replace(sync_old, sync_new, 1)

p.write_text(text)
print("[OK] world_socket.js checked")
PYEOF

########################################
# 4) PATCH DASHBOARD ACCESS PAGE IF MISSING
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-access">World Access</a>' not in text and '<a href="/world-settlements">World Settlements</a>' in text:
    text = text.replace(
        '<a href="/world-settlements">World Settlements</a>',
        '<a href="/world-settlements">World Settlements</a>\n      <a href="/world-access">World Access</a>'
    )

helper = r'''
function renderWorldAccessPage(user = null) {
  const entitlements = dbQuery(`
    SELECT we.id, sr.scene_name, we.entitlement_name, we.entitlement_type, we.asset_id, we.entitlement_status, we.created_at
    FROM world_entitlements we
    LEFT JOIN scene_registry sr ON sr.id = we.scene_id
    ORDER BY we.id DESC
    LIMIT 200
  `);

  const passes = dbQuery(`
    SELECT wap.id, sr.scene_name, wap.owner_type, wap.owner_id, wap.entitlement_id, wap.pass_status, wap.created_at
    FROM world_access_passes wap
    LEFT JOIN scene_registry sr ON sr.id = wap.scene_id
    ORDER BY wap.id DESC
    LIMIT 200
  `);

  const logs = dbQuery(`
    SELECT wal.id, sr.scene_name, wal.owner_type, wal.owner_id, wal.access_type, wal.access_result, wal.access_payload, wal.created_at
    FROM world_access_log wal
    LEFT JOIN scene_registry sr ON sr.id = wal.scene_id
    ORDER BY wal.id DESC
    LIMIT 200
  `);

  const entRows = entitlements.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.entitlement_name}</td><td>${r.entitlement_type}</td><td>${r.asset_id || ''}</td><td>${r.entitlement_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const passRows = passes.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.entitlement_id || ''}</td><td>${r.pass_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const logRows = logs.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.access_type}</td><td>${r.access_result}</td><td><code>${r.access_payload || ''}</code></td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Access', `
    <div class="section"><div class="card">
      <h2>World Access + Entitlements</h2>
      <p>This layer controls premium access, entitlement grants, and access validation inside immersive worlds.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Entitlements</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Type</th><th>Asset</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${entRows || '<tr><td colspan="7">No entitlements yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Access Passes</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Owner Type</th><th>Owner ID</th><th>Entitlement</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${passRows || '<tr><td colspan="7">No access passes yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Access Log</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Owner Type</th><th>Owner ID</th><th>Access Type</th><th>Result</th><th>Payload</th><th>Created</th></tr></thead>
        <tbody>${logRows || '<tr><td colspan="8">No access log yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldAccessPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/world-settlements') {"
if "pathname === '/world-access'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-access') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldAccessPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/world-settlements') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js checked")
PYEOF

########################################
# 5) RESTART EVERYTHING
########################################
bash scripts/restart_world_socket.sh
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

echo
echo "--- SOCKET HEALTH ---"
curl -s http://127.0.0.1:5090/health || true

########################################
# 6) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/world_socket.js "backups/world_socket_reconcile_access_${STAMP}.js"
cp apps/dashboard.js "backups/dashboard_reconcile_access_${STAMP}.js"
cp db/aam.db "backups/aam_reconcile_access_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_order_settlements from world_order_settlements;" > "snapshots/world_order_settlements_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as settlement_error_log from settlement_error_log;" > "snapshots/settlement_error_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_entitlements from world_entitlements;" > "snapshots/world_entitlements_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_access_passes from world_access_passes;" > "snapshots/world_access_passes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_access_log from world_access_log;" > "snapshots/world_access_log_${STAMP}.json"

echo "RECONCILE + ACCESS FIX CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  curl -i 'http://127.0.0.1:5090/settle-world-order?orderId=1'"
echo "  curl -s 'http://127.0.0.1:5090/check-access?sceneId=1&ownerType=avatar&ownerId=1'"
echo "  curl -s 'http://127.0.0.1:5090/grant-access?sceneId=1&ownerType=avatar&ownerId=2&entitlementId=1'"
echo "  termux-open-url http://127.0.0.1:4900/world-access"
