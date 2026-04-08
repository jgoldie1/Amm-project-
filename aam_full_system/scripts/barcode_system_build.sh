#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== BARCODE SYSTEM BUILD START ==="

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
CREATE TABLE IF NOT EXISTS barcode_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode_value TEXT NOT NULL UNIQUE,
    barcode_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    label TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS barcode_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode_value TEXT NOT NULL,
    scan_context TEXT,
    scanned_by TEXT,
    result_status TEXT NOT NULL DEFAULT 'resolved',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed barcode entries for books
book_rows = cur.execute("SELECT id, title FROM books ORDER BY id").fetchall()
for book_id, title in book_rows:
    barcode_value = f"AAM-BOOK-{book_id:06d}"
    cur.execute("SELECT 1 FROM barcode_registry WHERE barcode_value = ?", (barcode_value,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO barcode_registry (barcode_value, barcode_type, entity_type, entity_id, label, status)
            VALUES (?, 'CODE128', 'book', ?, ?, 'active')
        """, (barcode_value, book_id, title))

# seed barcode entries for wallets
wallet_rows = cur.execute("SELECT id, wallet_name FROM wallets ORDER BY id").fetchall()
for wallet_id, wallet_name in wallet_rows:
    barcode_value = f"AAM-WALLET-{wallet_id:06d}"
    cur.execute("SELECT 1 FROM barcode_registry WHERE barcode_value = ?", (barcode_value,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO barcode_registry (barcode_value, barcode_type, entity_type, entity_id, label, status)
            VALUES (?, 'CODE128', 'wallet', ?, ?, 'active')
        """, (barcode_value, wallet_id, wallet_name))

# seed barcode entries for podcasts
pod_rows = cur.execute("SELECT id, title FROM podcasts ORDER BY id").fetchall()
for pod_id, title in pod_rows:
    barcode_value = f"AAM-POD-{pod_id:06d}"
    cur.execute("SELECT 1 FROM barcode_registry WHERE barcode_value = ?", (barcode_value,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO barcode_registry (barcode_value, barcode_type, entity_type, entity_id, label, status)
            VALUES (?, 'CODE128', 'podcast', ?, ?, 'active')
        """, (barcode_value, pod_id, title))

conn.commit()
conn.close()
print("[OK] barcode tables ready")
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

# nav links
if '<a href="/barcodes">Barcodes</a>' not in text and '<a href="/blog">Blog</a>' in text:
    text = text.replace(
        '<a href="/blog">Blog</a>',
        '<a href="/blog">Blog</a>\n      <a href="/barcodes">Barcodes</a>\n      <a href="/barcode-lookup">Barcode Lookup</a>'
    )

helpers = r'''
function renderBarcodesPage(user = null, message = '') {
  const rows = dbQuery(`
    SELECT id, barcode_value, barcode_type, entity_type, entity_id, label, status, created_at
    FROM barcode_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td><code>${r.barcode_value}</code></td>
      <td>${r.barcode_type}</td>
      <td>${r.entity_type}</td>
      <td>${r.entity_id}</td>
      <td>${r.label || ''}</td>
      <td>${r.status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Barcode Registry', `
    <div class="section">
      <div class="card">
        <h2>Barcode Registry</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <p>Barcode system for books, wallets, podcasts, products, receipts, logistics assets, and future robotics/manufacturing tracking.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Add Barcode</h3>
          <form method="POST" action="/barcodes/add">
            <label>Barcode Value</label>
            <input type="text" name="barcode_value" required>

            <label>Barcode Type</label>
            <select name="barcode_type">
              <option value="CODE128">CODE128</option>
              <option value="QR">QR</option>
              <option value="EAN13">EAN13</option>
              <option value="UPC">UPC</option>
            </select>

            <label>Entity Type</label>
            <input type="text" name="entity_type" placeholder="book / wallet / product / receipt / asset" required>

            <label>Entity ID</label>
            <input type="number" name="entity_id" required>

            <label>Label</label>
            <input type="text" name="label">

            <button type="submit">Add Barcode</button>
          </form>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Barcode</th><th>Type</th><th>Entity</th><th>Entity ID</th><th>Label</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="8">No barcodes yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderBarcodeLookupPage(user = null, query = '', message = '') {
  const safe = String(query || '').replace(/'/g, "''");
  const rows = query
    ? dbQuery(`
        SELECT id, barcode_value, barcode_type, entity_type, entity_id, label, status, created_at
        FROM barcode_registry
        WHERE barcode_value LIKE '%${safe}%' OR label LIKE '%${safe}%'
        ORDER BY id DESC
        LIMIT 25
      `)
    : [];

  const scans = dbQuery(`
    SELECT id, barcode_value, scan_context, scanned_by, result_status, created_at
    FROM barcode_scans
    ORDER BY id DESC
    LIMIT 25
  `);

  const resultRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td><code>${r.barcode_value}</code></td>
      <td>${r.entity_type}</td>
      <td>${r.entity_id}</td>
      <td>${r.label || ''}</td>
      <td>${r.status}</td>
    </tr>
  `).join('');

  const scanRows = scans.map(s => `
    <tr>
      <td>${s.id}</td>
      <td><code>${s.barcode_value}</code></td>
      <td>${s.scan_context || ''}</td>
      <td>${s.scanned_by || ''}</td>
      <td>${s.result_status}</td>
      <td>${s.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Barcode Lookup', `
    <div class="section">
      <div class="card">
        <h2>Barcode Lookup</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <form method="GET" action="/barcode-lookup">
          <input type="text" name="q" value="${(query || '').replace(/"/g,'&quot;')}" placeholder="Enter barcode or label">
          <button type="submit">Lookup</button>
        </form>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Results</h3>
          <table>
            <thead><tr><th>ID</th><th>Barcode</th><th>Entity</th><th>Entity ID</th><th>Label</th><th>Status</th></tr></thead>
            <tbody>${resultRows || '<tr><td colspan="6">No results</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Recent Scans</h3>
          <table>
            <thead><tr><th>ID</th><th>Barcode</th><th>Context</th><th>Scanned By</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${scanRows || '<tr><td colspan="6">No scans yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", helpers)

anchor = "    if (req.method === 'GET' && pathname === '/search-engine') {"
if "pathname === '/barcodes'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/barcodes') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderBarcodesPage(authUser, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/barcodes/add') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      const body = await parseBody(req);

      const barcodeValue = (body.barcode_value || '').trim();
      const barcodeType = (body.barcode_type || 'CODE128').trim();
      const entityType = (body.entity_type || '').trim();
      const entityId = Number(body.entity_id || 0);
      const label = (body.label || '').trim();

      if (!barcodeValue || !entityType || !entityId) {
        return redirect(res, '/barcodes?msg=Missing%20required%20fields');
      }

      dbRun(`INSERT INTO barcode_registry (barcode_value, barcode_type, entity_type, entity_id, label, status)
             VALUES ('${q(barcodeValue)}', '${q(barcodeType)}', '${q(entityType)}', ${entityId}, '${q(label)}', 'active')`);

      return redirect(res, '/barcodes?msg=Barcode%20added');
    }

    if (req.method === 'GET' && pathname === '/barcode-lookup') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;

      const query = requestURL.searchParams.get('q') || '';
      const safe = String(query || '').trim();
      if (safe) {
        dbRun(`INSERT INTO barcode_scans (barcode_value, scan_context, scanned_by, result_status)
               VALUES ('${q(safe)}', 'lookup', '${q(authUser.role || 'admin')}', 'resolved')`);
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderBarcodeLookupPage(authUser, query));
    }

    if (req.method === 'GET' && pathname === '/search-engine') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] barcode patch applied")
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

cp apps/dashboard.js "backups/dashboard_barcode_stable_${STAMP}.js"
cp db/aam.db "backups/aam_barcode_stable_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as barcode_registry from barcode_registry;" > "snapshots/barcode_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as barcode_scans from barcode_scans;" > "snapshots/barcode_scans_${STAMP}.json"

echo "BARCODE SYSTEM STABLE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/barcodes"
echo "  termux-open-url http://127.0.0.1:4900/barcode-lookup"
