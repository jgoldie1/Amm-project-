#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== WORLD ECONOMY + OWNERSHIP BUILD START ==="

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
CREATE TABLE IF NOT EXISTS world_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    asset_rarity TEXT DEFAULT 'standard',
    asset_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS asset_ownership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    owner_type TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    ownership_status TEXT NOT NULL DEFAULT 'owned',
    acquired_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_type TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    asset_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    inventory_status TEXT NOT NULL DEFAULT 'active',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS asset_transfer_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    from_owner_type TEXT,
    from_owner_id INTEGER,
    to_owner_type TEXT NOT NULL,
    to_owner_id INTEGER NOT NULL,
    transfer_type TEXT NOT NULL DEFAULT 'assign',
    transfer_status TEXT NOT NULL DEFAULT 'processed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM world_assets")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_assets (scene_id, asset_name, asset_type, asset_rarity, asset_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, "Commerce Portal Crystal", "portal_asset", "legendary", "active"),
        (1, "Book Display License", "commerce_asset", "rare", "active"),
        (2, "IoT Beacon License", "ops_asset", "rare", "active"),
        (2, "Route Map Token", "logistics_asset", "standard", "active"),
        (3, "Creator Stage Pass", "creator_asset", "rare", "active"),
        (3, "Hybrid Game Key", "game_asset", "legendary", "active"),
    ])

cur.execute("SELECT count(*) FROM asset_ownership")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO asset_ownership (asset_id, owner_type, owner_id, ownership_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "avatar", 1, "owned"),
        (2, "avatar", 1, "owned"),
        (3, "avatar", 2, "owned"),
        (4, "avatar", 2, "owned"),
        (5, "avatar", 3, "owned"),
        (6, "avatar", 3, "owned"),
    ])

cur.execute("SELECT count(*) FROM world_inventory")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_inventory (owner_type, owner_id, asset_id, quantity, inventory_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("avatar", 1, 1, 1, "active"),
        ("avatar", 1, 2, 1, "active"),
        ("avatar", 2, 3, 1, "active"),
        ("avatar", 2, 4, 1, "active"),
        ("avatar", 3, 5, 1, "active"),
        ("avatar", 3, 6, 1, "active"),
    ])

cur.execute("SELECT count(*) FROM asset_transfer_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO asset_transfer_log (asset_id, from_owner_type, from_owner_id, to_owner_type, to_owner_id, transfer_type, transfer_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [
        (1, None, None, "avatar", 1, "mint_assign", "processed"),
        (3, None, None, "avatar", 2, "mint_assign", "processed"),
        (6, None, None, "avatar", 3, "mint_assign", "processed"),
    ])

conn.commit()
conn.close()
print("[OK] world economy DB additions ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

block = r"""
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
"""

marker = "  if (pathname === '/run-job') {"
if "pathname === '/mint-asset'" not in text and marker in text:
    text = text.replace(marker, block + "\n" + marker, 1)

sync_old = """      automation_rules: dbQuery(`SELECT id, rule_name, trigger_type, action_type, rule_status, created_at FROM world_automation_rules WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      world_jobs: dbQuery(`SELECT id, job_name, job_type, job_status, created_at, completed_at FROM world_jobs WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      orchestration_log: dbQuery(`SELECT id, source_type, source_id, orchestration_event, orchestration_status, created_at FROM world_orchestration_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""
sync_new = """      automation_rules: dbQuery(`SELECT id, rule_name, trigger_type, action_type, rule_status, created_at FROM world_automation_rules WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      world_jobs: dbQuery(`SELECT id, job_name, job_type, job_status, created_at, completed_at FROM world_jobs WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      orchestration_log: dbQuery(`SELECT id, source_type, source_id, orchestration_event, orchestration_status, created_at FROM world_orchestration_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      assets: dbQuery(`SELECT id, asset_name, asset_type, asset_rarity, asset_status, created_at FROM world_assets WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 50`),
      ownership: dbQuery(`SELECT ao.id, ao.asset_id, ao.owner_type, ao.owner_id, ao.ownership_status, ao.acquired_at FROM asset_ownership ao WHERE ao.asset_id IN (SELECT id FROM world_assets WHERE scene_id=${sceneId}) ORDER BY ao.id DESC LIMIT 50`),
      transfers: dbQuery(`SELECT atl.id, atl.asset_id, atl.from_owner_type, atl.from_owner_id, atl.to_owner_type, atl.to_owner_id, atl.transfer_type, atl.transfer_status, atl.created_at FROM asset_transfer_log atl WHERE atl.asset_id IN (SELECT id FROM world_assets WHERE scene_id=${sceneId}) ORDER BY atl.id DESC LIMIT 50`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""
if "assets: dbQuery(`SELECT id, asset_name" not in text:
    text = text.replace(sync_old, sync_new, 1)

p.write_text(text)
print("[OK] world_socket.js economy patch applied")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-economy">World Economy</a>' not in text and '<a href="/world-automation">World Automation</a>' in text:
    text = text.replace(
        '<a href="/world-automation">World Automation</a>',
        '<a href="/world-automation">World Automation</a>\n      <a href="/world-economy">World Economy</a>'
    )

helper = r'''
function renderWorldEconomyPage(user = null) {
  const assets = dbQuery(`
    SELECT wa.id, sr.scene_name, wa.asset_name, wa.asset_type, wa.asset_rarity, wa.asset_status, wa.created_at
    FROM world_assets wa
    LEFT JOIN scene_registry sr ON sr.id = wa.scene_id
    ORDER BY wa.id DESC
    LIMIT 200
  `);

  const ownership = dbQuery(`
    SELECT ao.id, wa.asset_name, ao.owner_type, ao.owner_id, ao.ownership_status, ao.acquired_at
    FROM asset_ownership ao
    LEFT JOIN world_assets wa ON wa.id = ao.asset_id
    ORDER BY ao.id DESC
    LIMIT 200
  `);

  const inventory = dbQuery(`
    SELECT wi.id, wi.owner_type, wi.owner_id, wa.asset_name, wi.quantity, wi.inventory_status, wi.updated_at
    FROM world_inventory wi
    LEFT JOIN world_assets wa ON wa.id = wi.asset_id
    ORDER BY wi.id DESC
    LIMIT 200
  `);

  const transfers = dbQuery(`
    SELECT atl.id, wa.asset_name, atl.from_owner_type, atl.from_owner_id, atl.to_owner_type, atl.to_owner_id, atl.transfer_type, atl.transfer_status, atl.created_at
    FROM asset_transfer_log atl
    LEFT JOIN world_assets wa ON wa.id = atl.asset_id
    ORDER BY atl.id DESC
    LIMIT 200
  `);

  const assetRows = assets.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.asset_name}</td><td>${r.asset_type}</td><td>${r.asset_rarity || ''}</td><td>${r.asset_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const ownershipRows = ownership.map(r => `
    <tr><td>${r.id}</td><td>${r.asset_name || ''}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.ownership_status}</td><td>${r.acquired_at || ''}</td></tr>
  `).join('');

  const inventoryRows = inventory.map(r => `
    <tr><td>${r.id}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.asset_name || ''}</td><td>${r.quantity}</td><td>${r.inventory_status}</td><td>${r.updated_at || ''}</td></tr>
  `).join('');

  const transferRows = transfers.map(r => `
    <tr><td>${r.id}</td><td>${r.asset_name || ''}</td><td>${r.from_owner_type || ''}</td><td>${r.from_owner_id || ''}</td><td>${r.to_owner_type}</td><td>${r.to_owner_id}</td><td>${r.transfer_type}</td><td>${r.transfer_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Economy', `
    <div class="section"><div class="card">
      <h2>World Economy + Ownership</h2>
      <p>This layer handles assets, ownership, inventory, and transfers across immersive worlds.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>World Assets</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Asset</th><th>Type</th><th>Rarity</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${assetRows || '<tr><td colspan="7">No assets yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Asset Ownership</h3>
      <table>
        <thead><tr><th>ID</th><th>Asset</th><th>Owner Type</th><th>Owner ID</th><th>Status</th><th>Acquired</th></tr></thead>
        <tbody>${ownershipRows || '<tr><td colspan="6">No ownership rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>World Inventory</h3>
      <table>
        <thead><tr><th>ID</th><th>Owner Type</th><th>Owner ID</th><th>Asset</th><th>Qty</th><th>Status</th><th>Updated</th></tr></thead>
        <tbody>${inventoryRows || '<tr><td colspan="7">No inventory rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Asset Transfer Log</h3>
      <table>
        <thead><tr><th>ID</th><th>Asset</th><th>From Type</th><th>From ID</th><th>To Type</th><th>To ID</th><th>Transfer</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${transferRows || '<tr><td colspan="9">No transfer rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldEconomyPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/world-automation') {"
if "pathname === '/world-economy'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-economy') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldEconomyPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/world-automation') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js economy patch applied")
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

cp apps/dashboard.js "backups/dashboard_world_economy_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_world_economy_${STAMP}.js"
cp db/aam.db "backups/aam_world_economy_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_assets from world_assets;" > "snapshots/world_assets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as asset_ownership from asset_ownership;" > "snapshots/asset_ownership_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_inventory from world_inventory;" > "snapshots/world_inventory_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as asset_transfer_log from asset_transfer_log;" > "snapshots/asset_transfer_log_${STAMP}.json"

echo "WORLD ECONOMY CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-economy"
echo "  curl -s http://127.0.0.1:5090/sync/1"
echo "  curl -s 'http://127.0.0.1:5090/mint-asset?sceneId=1&ownerType=avatar&ownerId=1&assetName=Commerce%20Crown&assetType=wearable&rarity=epic'"
echo "  curl -s 'http://127.0.0.1:5090/transfer-asset?assetId=1&toOwnerType=avatar&toOwnerId=2'"
