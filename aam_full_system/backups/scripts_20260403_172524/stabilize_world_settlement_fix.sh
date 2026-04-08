#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== STABILIZE WORLD SETTLEMENT FIX START ==="

########################################
# 1) DB HARDENING
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS settlement_error_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    world_order_id INTEGER,
    error_message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("[OK] settlement_error_log ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

old_block = r"""  if (pathname === '/settle-world-order') {
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
  }"""

new_block = r"""  if (pathname === '/settle-world-order') {
    const orderId = Number(url.searchParams.get('orderId') || 0);

    try {
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

      const existingSettlement = dbQuery(`SELECT id, receipt_id, wallet_tx_id, settlement_status
                                          FROM world_order_settlements
                                          WHERE world_order_id=${orderId}
                                          ORDER BY id DESC
                                          LIMIT 1`);

      if (existingSettlement.length) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          ok: true,
          already_settled: true,
          order_id: orderId,
          settlement_id: existingSettlement[0].id,
          receipt_id: existingSettlement[0].receipt_id,
          wallet_tx_id: existingSettlement[0].wallet_tx_id,
          settlement_status: existingSettlement[0].settlement_status
        }, null, 2));
      }

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
    } catch (err) {
      const msg = q(String(err && err.message ? err.message : err));
      try {
        execFileSync('sqlite3', [DB_FILE, `INSERT INTO settlement_error_log (world_order_id, error_message)
          VALUES (${orderId}, '${msg}')`], { encoding: 'utf8' });
      } catch (e) {}

      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        ok: false,
        error: 'settlement_failed',
        world_order_id: orderId,
        message: String(err && err.message ? err.message : err)
      }, null, 2));
    }
  }"""

if old_block in text:
    text = text.replace(old_block, new_block, 1)
    print("[OK] settlement endpoint hardened")
else:
    print("[OK] settlement block already patched or not found")

p.write_text(text)
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/restart_world_socket.sh
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

echo
echo "--- SOCKET HEALTH ---"
curl -s http://127.0.0.1:5090/health || true

########################################
# 4) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/world_socket.js "backups/world_socket_settlement_fix_${STAMP}.js"
cp apps/dashboard.js "backups/dashboard_settlement_fix_${STAMP}.js"
cp db/aam.db "backups/aam_settlement_fix_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_cart_orders from world_cart_orders;" > "snapshots/world_cart_orders_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_order_settlements from world_order_settlements;" > "snapshots/world_order_settlements_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as settlement_error_log from settlement_error_log;" > "snapshots/settlement_error_log_${STAMP}.json"

echo "WORLD SETTLEMENT FIX CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  curl -i 'http://127.0.0.1:5090/settle-world-order?orderId=1'"
echo "  sqlite3 -json db/aam.db \"select id, world_order_id, amount_cents, receipt_id, wallet_tx_id, settlement_status from world_order_settlements order by id desc limit 5;\""
echo "  sqlite3 -json db/aam.db \"select id, world_order_id, error_message, created_at from settlement_error_log order by id desc limit 5;\""
