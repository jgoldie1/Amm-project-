#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== WALLET + RECEIPTS + BOOKS UI BUILD START ==="

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

# nav
if '<a href="/wallets">Wallets</a>' not in text and '<a href="/iot">IoT</a>' in text:
    text = text.replace(
        '<a href="/iot">IoT</a>',
        '<a href="/iot">IoT</a>\n      <a href="/wallets">Wallets</a>\n      <a href="/receipts">Receipts</a>\n      <a href="/books">Books</a>'
    )

helpers = r'''
function renderWalletsPage(user = null) {
  const rows = dbQuery(`
    SELECT id, owner_type, owner_id, wallet_name, balance_cents, created_at
    FROM wallets
    ORDER BY id DESC
  `);

  const tableRows = rows.map(w => `
    <tr>
      <td>${w.id}</td>
      <td>${w.owner_type}</td>
      <td>${w.owner_id}</td>
      <td>${w.wallet_name}</td>
      <td>${money(w.balance_cents || 0)}</td>
      <td>${w.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Wallets', `
    <div class="section">
      <div class="card">
        <h2>Wallet Control</h2>
        <p>Wallet foundation for balances, future purchases, receipts, payouts, and ecosystem finance.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Owner Type</th><th>Owner ID</th><th>Wallet</th><th>Balance</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No wallets yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderReceiptsPage(user = null) {
  const rows = dbQuery(`
    SELECT id, payer_type, payer_id, amount_cents, receipt_type, reference_type, reference_id, receipt_status, created_at
    FROM receipts
    ORDER BY id DESC
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.payer_type}</td>
      <td>${r.payer_id}</td>
      <td>${money(r.amount_cents || 0)}</td>
      <td>${r.receipt_type}</td>
      <td>${r.reference_type || ''}</td>
      <td>${r.reference_id || ''}</td>
      <td>${r.receipt_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Receipts', `
    <div class="section">
      <div class="card">
        <h2>Receipts</h2>
        <p>Receipt history for book sales, services, memberships, future marketplace orders, and wallet-linked activity.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Payer Type</th><th>Payer ID</th><th>Amount</th><th>Type</th><th>Ref Type</th><th>Ref ID</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="9">No receipts yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderBooksPage(user = null) {
  const rows = dbQuery(`
    SELECT id, title, author_name, description, book_type, price_cents, access_level, created_at
    FROM books
    ORDER BY id DESC
  `);

  const cards = rows.map(b => `
    <div class="card">
      <h3>${b.title}</h3>
      <p><strong>Author:</strong> ${b.author_name}</p>
      <p><strong>Type:</strong> ${b.book_type}</p>
      <p><strong>Access:</strong> ${b.access_level}</p>
      <p><strong>Price:</strong> ${money(b.price_cents || 0)}</p>
      <p>${b.description || ''}</p>
      <p class="muted">${b.created_at || ''}</p>
    </div>
  `).join('');

  return htmlPage('Books', `
    <div class="section">
      <div class="card">
        <h2>Book Store / Reader Foundation</h2>
        <p>Books, paid access, future audiobook hooks, reading rooms, and education commerce inside the ecosystem.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No books yet.</p></div>'}</div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", helpers)

anchor = "    if (req.method === 'GET' && pathname === '/search-engine') {"
if "pathname === '/wallets'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/wallets') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWalletsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/receipts') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderReceiptsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/books') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderBooksPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/search-engine') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] wallet + receipts + books UI patch applied")
PYEOF

bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_wallet_receipts_books_${STAMP}.js"
cp db/aam.db "backups/aam_wallet_receipts_books_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as wallets from wallets;" > "snapshots/wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as receipts from receipts;" > "snapshots/receipts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as books from books;" > "snapshots/books_${STAMP}.json"

echo "WALLET + RECEIPTS + BOOKS UI STABLE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/wallets"
echo "  termux-open-url http://127.0.0.1:4900/receipts"
echo "  termux-open-url http://127.0.0.1:4900/books"
