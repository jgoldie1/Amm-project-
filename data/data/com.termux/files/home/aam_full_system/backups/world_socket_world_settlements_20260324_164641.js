const http = require('http');
const { execFileSync } = require('child_process');

const PORT = 5090;
const HOME = process.env.HOME;
const DB_FILE = `${HOME}/aam_full_system/db/aam.db`;
const clients = new Map();

function dbQuery(sql) {
  const out = execFileSync('sqlite3', ['-json', DB_FILE, sql], { encoding: 'utf8' });
  return out.trim() ? JSON.parse(out) : [];
}

function q(text) {
  return String(text || '').replace(/'/g, "''");
}


function sendSSE(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcastScene(sceneId, payload) {
  const key = String(sceneId);
  if (!clients.has(key)) return;
  for (const res of clients.get(key)) {
    try {
      sendSSE(res, payload);
    } catch (e) {}
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'world-socket-foundation', port: PORT }, null, 2));
  }

  if (pathname.startsWith('/stream/')) {
    const sceneId = Number(pathname.split('/')[2]);
    const key = String(sceneId);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    if (!clients.has(key)) clients.set(key, new Set());
    clients.get(key).add(res);

    sendSSE(res, {
      ok: true,
      type: 'connected',
      scene_id: sceneId,
      timestamp: new Date().toISOString()
    });

    req.on('close', () => {
      if (clients.has(key)) {
        clients.get(key).delete(res);
        if (clients.get(key).size === 0) clients.delete(key);
      }
    });
    return;
  }

  if (pathname.startsWith('/sync/')) {
    const sceneId = Number(pathname.split('/')[2]);
    const connections = dbQuery(`SELECT id, socket_key, avatar_id, connection_status, created_at FROM socket_connections WHERE scene_id=${sceneId} ORDER BY id DESC`);
    const state = dbQuery(`SELECT state_key, state_value, state_status, created_at FROM shared_world_state WHERE scene_id=${sceneId} ORDER BY id ASC`);
    const events = dbQuery(`SELECT id, event_type, event_payload, event_status, created_at FROM socket_event_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`);
    const avatars = dbQuery(`SELECT avatar_id, pos_x, pos_y, pos_z, facing, movement_status, updated_at FROM avatar_positions WHERE scene_id=${sceneId} ORDER BY avatar_id ASC`);
    const objects = dbQuery(`SELECT id, object_name, object_type, pos_x, pos_y, pos_z, object_state, interaction_status, updated_at FROM shared_world_objects WHERE scene_id=${sceneId} ORDER BY id ASC`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      scene_id: sceneId,
      connections,
      shared_state: state,
      avatars,
      objects,
      scene_commands: dbQuery(`SELECT id, command_type, command_payload, command_status, created_at FROM scene_command_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      avatar_actions: dbQuery(`SELECT id, avatar_id, action_type, action_payload, action_status, created_at FROM avatar_action_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      object_commands: dbQuery(`SELECT id, object_id, command_type, command_payload, command_status, created_at FROM object_command_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      sessions: dbQuery(`SELECT id, session_name, session_status, started_at, ended_at FROM world_sessions WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 10`),
      checkpoints: dbQuery(`SELECT id, checkpoint_name, checkpoint_status, created_at FROM scene_checkpoints WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recovery_snapshots: dbQuery(`SELECT id, snapshot_name, snapshot_status, created_at FROM recovery_snapshots WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      automation_rules: dbQuery(`SELECT id, rule_name, trigger_type, action_type, rule_status, created_at FROM world_automation_rules WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      world_jobs: dbQuery(`SELECT id, job_name, job_type, job_status, created_at, completed_at FROM world_jobs WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      orchestration_log: dbQuery(`SELECT id, source_type, source_id, orchestration_event, orchestration_status, created_at FROM world_orchestration_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      assets: dbQuery(`SELECT id, asset_name, asset_type, asset_rarity, asset_status, created_at FROM world_assets WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 50`),
      ownership: dbQuery(`SELECT ao.id, ao.asset_id, ao.owner_type, ao.owner_id, ao.ownership_status, ao.acquired_at FROM asset_ownership ao WHERE ao.asset_id IN (SELECT id FROM world_assets WHERE scene_id=${sceneId}) ORDER BY ao.id DESC LIMIT 50`),
      transfers: dbQuery(`SELECT atl.id, atl.asset_id, atl.from_owner_type, atl.from_owner_id, atl.to_owner_type, atl.to_owner_id, atl.transfer_type, atl.transfer_status, atl.created_at FROM asset_transfer_log atl WHERE atl.asset_id IN (SELECT id FROM world_assets WHERE scene_id=${sceneId}) ORDER BY atl.id DESC LIMIT 50`),
      storefronts: dbQuery(`SELECT id, storefront_name, storefront_type, owner_type, owner_id, storefront_status, created_at FROM world_storefronts WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 50`),
      storefront_products: dbQuery(`SELECT sp.id, sp.storefront_id, sp.product_name, sp.product_type, sp.price_cents, sp.inventory_count, sp.product_status, sp.created_at FROM storefront_products sp WHERE sp.storefront_id IN (SELECT id FROM world_storefronts WHERE scene_id=${sceneId}) ORDER BY sp.id DESC LIMIT 100`),
      world_orders: dbQuery(`SELECT id, storefront_id, buyer_type, buyer_id, order_total_cents, order_status, created_at FROM world_cart_orders WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      storefront_activity: dbQuery(`SELECT id, storefront_id, activity_type, activity_payload, activity_status, created_at FROM storefront_activity_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      settlements: dbQuery(`SELECT id, world_order_id, buyer_type, buyer_id, amount_cents, receipt_id, wallet_tx_id, settlement_status, created_at FROM world_order_settlements WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      commerce_log: dbQuery(`SELECT id, source_type, source_id, commerce_event, commerce_status, created_at FROM world_commerce_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 100`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));
  }








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

  if (pathname === '/mint-asset') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const ownerType = q(url.searchParams.get('ownerType') || 'avatar');
    const ownerId = Number(url.searchParams.get('ownerId') || 1);
    const assetName = q(url.searchParams.get('assetName') || 'World Asset');
    const assetType = q(url.searchParams.get('assetType') || 'generic_asset');
    const rarity = q(url.searchParams.get('rarity') || 'standard');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_assets (scene_id, asset_name, asset_type, asset_rarity, asset_status)
      VALUES (${sceneId}, '${assetName}', '${assetType}', '${rarity}', 'active')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO asset_ownership (asset_id, owner_type, owner_id, ownership_status)
      VALUES ((SELECT id FROM world_assets ORDER BY id DESC LIMIT 1), '${ownerType}', ${ownerId}, 'owned')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_inventory (owner_type, owner_id, asset_id, quantity, inventory_status)
      VALUES ('${ownerType}', ${ownerId}, (SELECT id FROM world_assets ORDER BY id DESC LIMIT 1), 1, 'active')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO asset_transfer_log (asset_id, from_owner_type, from_owner_id, to_owner_type, to_owner_id, transfer_type, transfer_status)
      VALUES ((SELECT id FROM world_assets ORDER BY id DESC LIMIT 1), NULL, NULL, '${ownerType}', ${ownerId}, 'mint_assign', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'mint_asset',
      scene_id: sceneId,
      owner_type: ownerType,
      owner_id: ownerId,
      asset_name: assetName,
      asset_type: assetType,
      rarity,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, minted: true, scene_id: sceneId, owner_type: ownerType, owner_id: ownerId, asset_name: assetName }, null, 2));
  }

  if (pathname === '/transfer-asset') {
    const assetId = Number(url.searchParams.get('assetId') || 0);
    const toOwnerType = q(url.searchParams.get('toOwnerType') || 'avatar');
    const toOwnerId = Number(url.searchParams.get('toOwnerId') || 1);

    const assetRows = dbQuery(`SELECT id, scene_id FROM world_assets WHERE id=${assetId} LIMIT 1`);
    if (!assetRows.length) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'asset_not_found' }, null, 2));
    }
    const sceneId = assetRows[0].scene_id;

    const currentRows = dbQuery(`SELECT owner_type, owner_id FROM asset_ownership WHERE asset_id=${assetId} ORDER BY id DESC LIMIT 1`);
    const fromOwnerType = currentRows.length ? q(currentRows[0].owner_type || '') : '';
    const fromOwnerId = currentRows.length ? Number(currentRows[0].owner_id || 0) : 0;

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO asset_ownership (asset_id, owner_type, owner_id, ownership_status)
      VALUES (${assetId}, '${toOwnerType}', ${toOwnerId}, 'owned')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO world_inventory (owner_type, owner_id, asset_id, quantity, inventory_status)
      VALUES ('${toOwnerType}', ${toOwnerId}, ${assetId}, 1, 'active')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO asset_transfer_log (asset_id, from_owner_type, from_owner_id, to_owner_type, to_owner_id, transfer_type, transfer_status)
      VALUES (${assetId}, '${fromOwnerType}', ${fromOwnerId}, '${toOwnerType}', ${toOwnerId}, 'transfer', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'transfer_asset',
      scene_id: sceneId,
      asset_id: assetId,
      to_owner_type: toOwnerType,
      to_owner_id: toOwnerId,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, transferred: true, asset_id: assetId, scene_id: sceneId, to_owner_type: toOwnerType, to_owner_id: toOwnerId }, null, 2));
  }

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

  if (pathname === '/checkpoint') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const sessionId = Number(url.searchParams.get('sessionId') || 1);
    const name = q(url.searchParams.get('name') || `Checkpoint Scene ${sceneId}`);
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO scene_checkpoints (scene_id, session_id, checkpoint_name, checkpoint_payload, checkpoint_status)
      VALUES (${sceneId}, ${sessionId}, '${name}', '${payload}', 'saved')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO replay_timeline (scene_id, session_id, event_source, event_ref_id, replay_payload, replay_status)
      VALUES (${sceneId}, ${sessionId}, 'checkpoint', (SELECT id FROM scene_checkpoints ORDER BY id DESC LIMIT 1), '${payload}', 'recorded')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'checkpoint',
      scene_id: sceneId,
      checkpoint_name: name,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, checkpoint: true, scene_id: sceneId, session_id: sessionId, checkpoint_name: name }, null, 2));
  }

  if (pathname === '/recover') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);

    const rows = dbQuery(`SELECT id, snapshot_name, snapshot_payload FROM recovery_snapshots WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 1`);
    const snapshot = rows.length ? rows[0] : null;

    broadcastScene(sceneId, {
      ok: true,
      type: 'recover',
      scene_id: sceneId,
      snapshot,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, recovered: true, scene_id: sceneId, snapshot }, null, 2));
  }

  if (pathname === '/scene-command') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const commandType = q(url.searchParams.get('commandType') || 'scene_command');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO scene_command_queue (scene_id, command_type, command_payload, command_status)
      VALUES (${sceneId}, '${commandType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO shared_world_state (scene_id, state_key, state_value, state_status)
      VALUES (${sceneId}, 'scene_command_${commandType}', '${payload}', 'active')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO state_application_log (scene_id, source_type, source_id, applied_key, applied_value, apply_status)
      VALUES (${sceneId}, 'scene_command', (SELECT id FROM scene_command_queue ORDER BY id DESC LIMIT 1), 'scene_command_${commandType}', '${payload}', 'applied')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-control', ${sceneId}, 1, 'scene_command', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'scene_command',
      scene_id: sceneId,
      command_type: commandType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, scene_command: true, scene_id: sceneId, command_type: commandType }, null, 2));
  }

  if (pathname === '/avatar-action') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const actionType = q(url.searchParams.get('actionType') || 'action');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO avatar_action_queue (avatar_id, scene_id, action_type, action_payload, action_status)
      VALUES (${avatarId}, ${sceneId}, '${actionType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `UPDATE avatar_positions
      SET movement_status='${actionType}', updated_at=CURRENT_TIMESTAMP
      WHERE avatar_id=${avatarId} AND scene_id=${sceneId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO state_application_log (scene_id, source_type, source_id, applied_key, applied_value, apply_status)
      VALUES (${sceneId}, 'avatar_action', (SELECT id FROM avatar_action_queue ORDER BY id DESC LIMIT 1), 'avatar_action_${actionType}', '${payload}', 'applied')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-avatar-${avatarId}', ${sceneId}, ${avatarId}, 'avatar_action', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'avatar_action',
      scene_id: sceneId,
      avatar_id: avatarId,
      action_type: actionType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, avatar_action: true, scene_id: sceneId, avatar_id: avatarId, action_type: actionType }, null, 2));
  }

  if (pathname === '/object-command') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const objectId = Number(url.searchParams.get('objectId') || 0);
    const commandType = q(url.searchParams.get('commandType') || 'object_command');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO object_command_queue (object_id, scene_id, command_type, command_payload, command_status)
      VALUES (${objectId}, ${sceneId}, '${commandType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `UPDATE shared_world_objects
      SET object_state='${commandType}', updated_at=CURRENT_TIMESTAMP
      WHERE id=${objectId} AND scene_id=${sceneId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO state_application_log (scene_id, source_type, source_id, applied_key, applied_value, apply_status)
      VALUES (${sceneId}, 'object_command', (SELECT id FROM object_command_queue ORDER BY id DESC LIMIT 1), 'object_command_${commandType}', '${payload}', 'applied')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-object-${objectId}', ${sceneId}, 1, 'object_command', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'object_command',
      scene_id: sceneId,
      object_id: objectId,
      command_type: commandType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, object_command: true, scene_id: sceneId, object_id: objectId, command_type: commandType }, null, 2));
  }

  if (pathname === '/move') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const x = Number(url.searchParams.get('x') || 0);
    const y = Number(url.searchParams.get('y') || 0);
    const z = Number(url.searchParams.get('z') || 0);
    const facing = q(url.searchParams.get('facing') || 'north');

    execFileSync('sqlite3', [DB_FILE, `UPDATE avatar_positions
      SET pos_x=${x}, pos_y=${y}, pos_z=${z}, facing='${facing}', movement_status='moving', updated_at=CURRENT_TIMESTAMP
      WHERE avatar_id=${avatarId} AND scene_id=${sceneId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-avatar-${avatarId}', ${sceneId}, ${avatarId}, 'avatar_move', '{"x":${x},"y":${y},"z":${z},"facing":"${facing}"}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'avatar_move',
      scene_id: sceneId,
      avatar_id: avatarId,
      position: { x, y, z, facing },
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, moved: true, scene_id: sceneId, avatar_id: avatarId, x, y, z, facing }, null, 2));
  }

  if (pathname === '/interact') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const objectId = Number(url.searchParams.get('objectId') || 0);
    const interactionType = q(url.searchParams.get('interactionType') || 'inspect');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO object_interaction_log (scene_id, avatar_id, object_id, interaction_type, interaction_payload, interaction_status)
      VALUES (${sceneId}, ${avatarId}, ${objectId}, '${interactionType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `UPDATE shared_world_objects
      SET object_state='${interactionType}', updated_at=CURRENT_TIMESTAMP
      WHERE id=${objectId} AND scene_id=${sceneId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-avatar-${avatarId}', ${sceneId}, ${avatarId}, 'object_interaction', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'object_interaction',
      scene_id: sceneId,
      avatar_id: avatarId,
      object_id: objectId,
      interaction_type: interactionType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, interacted: true, scene_id: sceneId, avatar_id: avatarId, object_id: objectId, interaction_type: interactionType }, null, 2));
  }

  if (pathname === '/emit') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const socketKey = q(url.searchParams.get('socketKey') || `sock-scene-${sceneId}-admin`);
    const eventType = q(url.searchParams.get('eventType') || 'manual_emit');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('${socketKey}', ${sceneId}, ${avatarId}, '${eventType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'event',
      scene_id: sceneId,
      avatar_id: avatarId,
      event_type: eventType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, emitted: true, scene_id: sceneId, event_type: eventType }, null, 2));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`World socket foundation running on ${PORT}`);
});
