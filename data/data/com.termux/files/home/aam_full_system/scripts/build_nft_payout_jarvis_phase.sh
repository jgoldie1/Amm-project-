#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system || exit 1

echo "=== BUILD NFT + PAYOUT + JARVIS ACTIONS ==="

mkdir -p backups
cp apps/dashboard.js backups/dashboard_before_nft_payout_jarvis_$(date +%Y%m%d_%H%M%S).js
cp apps/jarvis.js backups/jarvis_before_actions_$(date +%Y%m%d_%H%M%S).js

python << 'PYEOF'
from pathlib import Path
import sqlite3

root = Path.home() / "aam_full_system"
db = root / "db" / "aam.db"

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.executescript("""
CREATE TABLE IF NOT EXISTS nft_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_name TEXT NOT NULL,
  creator_name TEXT,
  chain_name TEXT DEFAULT 'base',
  collection_status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nft_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER,
  asset_name TEXT NOT NULL,
  asset_type TEXT DEFAULT 'holographic_nft',
  metadata_json TEXT DEFAULT '{}',
  mint_status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creator_payout_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_name TEXT NOT NULL,
  payout_wallet TEXT DEFAULT '',
  split_percent REAL DEFAULT 100,
  payout_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creator_payout_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_name TEXT NOT NULL,
  source_amount_cents INTEGER DEFAULT 0,
  payout_amount_cents INTEGER DEFAULT 0,
  payout_status TEXT DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jarvis_action_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_name TEXT NOT NULL,
  action_payload TEXT DEFAULT '{}',
  action_result TEXT DEFAULT 'accepted',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
""")

# seed minimal data
cur.execute("SELECT COUNT(*) FROM creator_payout_rules")
if cur.fetchone()[0] == 0:
    cur.execute("""
    INSERT INTO creator_payout_rules (creator_name, payout_wallet, split_percent, payout_status)
    VALUES ('AAM Creator One', 'wallet_demo_001', 85, 'active')
    """)

cur.execute("SELECT COUNT(*) FROM nft_collections")
if cur.fetchone()[0] == 0:
    cur.execute("""
    INSERT INTO nft_collections (collection_name, creator_name, chain_name, collection_status)
    VALUES ('Holo Genesis', 'AAM Creator One', 'base', 'draft')
    """)
    collection_id = cur.lastrowid
    cur.execute("""
    INSERT INTO nft_assets (collection_id, asset_name, asset_type, metadata_json, mint_status)
    VALUES (?, 'Genesis Lightform #1', 'holographic_nft', '{"rarity":"legendary","scene":"life_world"}', 'draft')
    """, (collection_id,))

conn.commit()
conn.close()
print("DB tables ready.")
PYEOF

python << 'PYEOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if "function renderNftLaunchpadPage(user = null)" not in text:
    insert_before = "function renderDashboard() {"
    block = r'''
function renderNftLaunchpadPage(user = null) {
  const collections = dbQuery("SELECT id, collection_name, creator_name, chain_name, collection_status, created_at FROM nft_collections ORDER BY id DESC LIMIT 50");
  const assets = dbQuery("SELECT id, collection_id, asset_name, asset_type, mint_status, created_at FROM nft_assets ORDER BY id DESC LIMIT 50");

  const collectionRows = collections.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.collection_name || ''}</td>
      <td>${c.creator_name || ''}</td>
      <td>${c.chain_name || ''}</td>
      <td>${c.collection_status || ''}</td>
      <td>${c.created_at || ''}</td>
    </tr>
  `).join('');

  const assetRows = assets.map(a => `
    <tr>
      <td>${a.id}</td>
      <td>${a.collection_id || ''}</td>
      <td>${a.asset_name || ''}</td>
      <td>${a.asset_type || ''}</td>
      <td>${a.mint_status || ''}</td>
      <td>${a.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('NFT Launchpad', `
    <div class="section">
      <div class="card">
        <h2>Omnisea Holo NFT Launchpad</h2>
        <p>Create holographic NFT collections and seed mintable assets inside the AAM ecosystem.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Create Collection</h3>
        <form method="POST" action="/nft-launchpad/create-collection">
          <label>Collection Name</label>
          <input name="collection_name" required />
          <label>Creator Name</label>
          <input name="creator_name" required />
          <label>Chain</label>
          <input name="chain_name" value="base" />
          <button type="submit">Create Collection</button>
        </form>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Create Holographic NFT</h3>
        <form method="POST" action="/nft-launchpad/create-asset">
          <label>Collection ID</label>
          <input name="collection_id" required />
          <label>Asset Name</label>
          <input name="asset_name" required />
          <label>Metadata JSON</label>
          <textarea name="metadata_json">{}</textarea>
          <button type="submit">Generate NFT Record</button>
        </form>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Collections</h3>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Creator</th><th>Chain</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${collectionRows}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>NFT Assets</h3>
        <table>
          <thead><tr><th>ID</th><th>Collection</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${assetRows}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderCreatorPayoutsPage(user = null) {
  const rules = dbQuery("SELECT id, creator_name, payout_wallet, split_percent, payout_status, created_at FROM creator_payout_rules ORDER BY id DESC LIMIT 50");
  const runs = dbQuery("SELECT id, creator_name, source_amount_cents, payout_amount_cents, payout_status, created_at FROM creator_payout_runs ORDER BY id DESC LIMIT 50");

  const ruleRows = rules.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.creator_name || ''}</td>
      <td>${r.payout_wallet || ''}</td>
      <td>${r.split_percent || 0}%</td>
      <td>${r.payout_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.creator_name || ''}</td>
      <td>$${((Number(r.source_amount_cents || 0))/100).toFixed(2)}</td>
      <td>$${((Number(r.payout_amount_cents || 0))/100).toFixed(2)}</td>
      <td>${r.payout_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Creator Payouts', `
    <div class="section">
      <div class="card">
        <h2>Creator Payout Control</h2>
        <p>Configure payout rules and run milestone or revenue-based creator disbursements.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Create / Update Payout Rule</h3>
        <form method="POST" action="/creator-payouts/create-rule">
          <label>Creator Name</label>
          <input name="creator_name" required />
          <label>Payout Wallet</label>
          <input name="payout_wallet" />
          <label>Split Percent</label>
          <input name="split_percent" value="85" />
          <button type="submit">Save Rule</button>
        </form>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Execute Payout Run</h3>
        <form method="POST" action="/creator-payouts/run">
          <label>Creator Name</label>
          <input name="creator_name" required />
          <label>Source Revenue (cents)</label>
          <input name="source_amount_cents" value="10000" />
          <button type="submit">Run Payout</button>
        </form>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Payout Rules</h3>
        <table>
          <thead><tr><th>ID</th><th>Creator</th><th>Wallet</th><th>Split</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${ruleRows}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Payout Runs</h3>
        <table>
          <thead><tr><th>ID</th><th>Creator</th><th>Source</th><th>Payout</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${runRows}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
    text = text.replace(insert_before, block + "\n" + insert_before, 1)

# add dashboard links
if '<a href="/nft-launchpad">NFT Launchpad</a>' not in text:
    text = text.replace(
        '<a href="/university">University</a>',
        '<a href="/university">University</a>\n      <a href="/nft-launchpad">NFT Launchpad</a>\n      <a href="/creator-payouts">Creator Payouts</a>',
        1
    )

# add routes before /university route if possible
route_anchor = "    if (req.method === 'GET' && pathname === '/university') {"
if route_anchor in text and "pathname === '/nft-launchpad'" not in text:
    route_block = r"""    if (req.method === 'GET' && pathname === '/nft-launchpad') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderNftLaunchpadPage(authUser));
    }

    if (req.method === 'POST' && pathname === '/nft-launchpad/create-collection') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      return readBody(req, body => {
        const collection_name = q(body.collection_name || 'Untitled Collection');
        const creator_name = q(body.creator_name || 'Unknown Creator');
        const chain_name = q(body.chain_name || 'base');
        dbRun(`INSERT INTO nft_collections (collection_name, creator_name, chain_name, collection_status) VALUES ('${collection_name}', '${creator_name}', '${chain_name}', 'draft')`);
        res.writeHead(302, { Location: '/nft-launchpad' });
        return res.end();
      });
    }

    if (req.method === 'POST' && pathname === '/nft-launchpad/create-asset') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      return readBody(req, body => {
        const collection_id = Number(body.collection_id || 0);
        const asset_name = q(body.asset_name || 'Untitled Asset');
        const metadata_json = q(body.metadata_json || '{}');
        dbRun(`INSERT INTO nft_assets (collection_id, asset_name, asset_type, metadata_json, mint_status) VALUES (${collection_id}, '${asset_name}', 'holographic_nft', '${metadata_json}', 'generated')`);
        res.writeHead(302, { Location: '/nft-launchpad' });
        return res.end();
      });
    }

    if (req.method === 'GET' && pathname === '/creator-payouts') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCreatorPayoutsPage(authUser));
    }

    if (req.method === 'POST' && pathname === '/creator-payouts/create-rule') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      return readBody(req, body => {
        const creator_name = q(body.creator_name || 'Unknown Creator');
        const payout_wallet = q(body.payout_wallet || '');
        const split_percent = Number(body.split_percent || 100);
        dbRun(`INSERT INTO creator_payout_rules (creator_name, payout_wallet, split_percent, payout_status) VALUES ('${creator_name}', '${payout_wallet}', ${split_percent}, 'active')`);
        res.writeHead(302, { Location: '/creator-payouts' });
        return res.end();
      });
    }

    if (req.method === 'POST' && pathname === '/creator-payouts/run') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      return readBody(req, body => {
        const creator_name = q(body.creator_name || 'Unknown Creator');
        const source_amount_cents = Number(body.source_amount_cents || 0);
        const rule = dbGet(`SELECT split_percent FROM creator_payout_rules WHERE creator_name='${creator_name}' ORDER BY id DESC LIMIT 1`) || { split_percent: 100 };
        const payout_amount_cents = Math.round(source_amount_cents * (Number(rule.split_percent || 100) / 100));
        dbRun(`INSERT INTO creator_payout_runs (creator_name, source_amount_cents, payout_amount_cents, payout_status) VALUES ('${creator_name}', ${source_amount_cents}, ${payout_amount_cents}, 'processed')`);
        res.writeHead(302, { Location: '/creator-payouts' });
        return res.end();
      });
    }

"""
    text = text.replace(route_anchor, route_block + route_anchor, 1)

p.write_text(text)
print("Dashboard NFT + payout routes patched.")
PYEOF

python << 'PYEOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "jarvis.js"
text = p.read_text()

# add action log helper textually with minimal assumptions
if "jarvis_action_log" not in text and "pathname === '/command'" in text:
    text = text.replace(
        "  if (pathname === '/command') {",
        """  if (pathname === '/action') {
    const action = (url.searchParams.get('action') || '').trim().toLowerCase();
    const value = (url.searchParams.get('value') || '').trim();
    try {
      if (action === 'system_check') {
        return sendJSON(res, {
          ok: true,
          action: 'system_check',
          result: 'dashboard + jarvis + life world expected online'
        });
      }

      if (action === 'launch_life_world') {
        return sendJSON(res, {
          ok: true,
          action: 'launch_life_world',
          target: 'http://127.0.0.1:4902/',
          result: 'ready'
        });
      }

      if (action === 'log_event') {
        return sendJSON(res, {
          ok: true,
          action: 'log_event',
          value,
          result: 'accepted'
        });
      }

      return sendJSON(res, {
        ok: true,
        action: action || 'none',
        result: 'unknown_action'
      });
    } catch (e) {
      return sendJSON(res, {
        ok: false,
        action: action || 'none',
        error: String(e && e.message || e)
      });
    }
  }

  if (pathname === '/command') {""",
        1
    )

# add action link on page
if 'href="/action?action=system_check"' not in text:
    text = text.replace(
        '<a href="/command?q=hello%20jarvis">Test Command</a>',
        '<a href="/command?q=hello%20jarvis">Test Command</a>\n      <a href="/action?action=system_check">System Check</a>\n      <a href="/action?action=launch_life_world">Launch Life World</a>',
        1
    )

p.write_text(text)
print("Jarvis action routes patched.")
PYEOF

echo
echo "=== RESTART / STABILIZE ==="
bash scripts/safe_restart.sh || exit 1
bash scripts/check_js.sh || exit 1
bash scripts/status.sh || exit 1
bash scripts/smoke_test.sh || exit 1

echo
echo "=== LIFE WORLD ==="
curl -s http://127.0.0.1:4902/health || echo "life world down"

echo
echo "=== JARVIS ACTION TESTS ==="
curl -s "http://127.0.0.1:5000/action?action=system_check"
echo
curl -s "http://127.0.0.1:5000/action?action=launch_life_world"
echo

echo
echo "=== ROUTE VERIFY ==="
grep -n "renderNftLaunchpadPage" apps/dashboard.js || true
grep -n "renderCreatorPayoutsPage" apps/dashboard.js || true
grep -n "pathname === '/nft-launchpad'" apps/dashboard.js || true
grep -n "pathname === '/creator-payouts'" apps/dashboard.js || true
grep -n "pathname === '/action'" apps/jarvis.js || true

echo
echo "BUILD COMPLETE"
