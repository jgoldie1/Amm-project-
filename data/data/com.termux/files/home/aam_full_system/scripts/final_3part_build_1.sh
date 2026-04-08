#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FINAL 3 PART BUILD 1 START ==="

python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

def ensure_column(table, col_name, ddl):
    if col_name not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] Added column {table}.{col_name}")

ensure_column("wallets", "currency_code", "currency_code TEXT DEFAULT 'USD'")
ensure_column("receipts", "receipt_note", "receipt_note TEXT")
ensure_column("book_chapters", "is_free", "is_free INTEGER DEFAULT 0")
ensure_column("credit_documents", "analysis_score", "analysis_score TEXT")

# starter chapter seed
cur.execute("SELECT id FROM books ORDER BY id")
book_ids = [r[0] for r in cur.fetchall()]
for book_id in book_ids:
    cur.execute("SELECT 1 FROM book_chapters WHERE book_id = ?", (book_id,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO book_chapters (book_id, chapter_title, chapter_order, content, is_free)
            VALUES (?, 'Introduction', 1, 'This is the starter chapter content for the reader system.', 1)
        """, (book_id,))
        cur.execute("""
            INSERT INTO book_chapters (book_id, chapter_title, chapter_order, content, is_free)
            VALUES (?, 'Premium Chapter', 2, 'This premium chapter is unlocked by purchase and entitlement.', 0)
        """, (book_id,))

conn.commit()
conn.close()
print("[OK] build 1 DB prep complete")
PYEOF

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

if '<a href="/receipt-detail">Receipt Detail</a>' not in text and '<a href="/books">Books</a>' in text:
    text = text.replace(
        '<a href="/books">Books</a>',
        '<a href="/books">Books</a>\n      <a href="/receipts">Receipts</a>\n      <a href="/wallet-transactions">Wallet Tx</a>'
    )

pages = r'''
function renderReceiptDetailPage(receiptId, user = null) {
  const rows = dbQuery(`
    SELECT id, payer_type, payer_id, amount_cents, receipt_type, reference_type, reference_id, receipt_status, receipt_note, created_at
    FROM receipts
    WHERE id=${Number(receiptId)}
    LIMIT 1
  `);

  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Receipt not found</h2></div>`, user);

  const r = rows[0];
  return htmlPage('Receipt Detail', `
    <div class="section">
      <div class="card">
        <h2>Receipt #${r.id}</h2>
        <p><strong>Payer Type:</strong> ${r.payer_type}</p>
        <p><strong>Payer ID:</strong> ${r.payer_id}</p>
        <p><strong>Amount:</strong> ${money(r.amount_cents || 0)}</p>
        <p><strong>Type:</strong> ${r.receipt_type}</p>
        <p><strong>Reference:</strong> ${r.reference_type || ''} ${r.reference_id || ''}</p>
        <p><strong>Status:</strong> ${r.receipt_status}</p>
        <p><strong>Note:</strong> ${r.receipt_note || ''}</p>
        <p class="muted">${r.created_at || ''}</p>
      </div>
    </div>
  `, user);
}

function renderEnhancedBookReaderPage(bookId, user = null, message = '') {
  const books = dbQuery(`SELECT id, title, author_name, description, price_cents, access_level FROM books WHERE id=${Number(bookId)} LIMIT 1`);
  if (!books.length) return htmlPage('Not Found', `<div class="card"><h2>Book not found</h2></div>`, user);

  const b = books[0];
  const chapters = dbQuery(`SELECT id, chapter_title, chapter_order, content, is_free FROM book_chapters WHERE book_id=${Number(bookId)} ORDER BY chapter_order, id`);
  const ent = dbQuery(`SELECT id FROM book_entitlements WHERE user_type='admin' AND user_id=1 AND book_id=${Number(bookId)} LIMIT 1`);
  const unlocked = ent.length > 0;

  const chapterHtml = chapters.map(c => {
    const allowed = unlocked || Number(c.is_free) === 1;
    return `
      <div class="card">
        <h3>${c.chapter_title}</h3>
        <pre>${allowed ? (c.content || '') : 'Locked chapter. Purchase required.'}</pre>
      </div>
    `;
  }).join('');

  const buyBox = unlocked
    ? `<p class="ok"><strong>Book unlocked.</strong></p>`
    : `<form method="POST" action="/books/purchase/${b.id}">
         <button type="submit">Purchase for ${money(b.price_cents || 0)}</button>
       </form>`;

  return htmlPage('Book Reader', `
    <div class="section">
      <div class="card">
        <h2>${b.title}</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <p><strong>Author:</strong> ${b.author_name}</p>
        <p><strong>Price:</strong> ${money(b.price_cents || 0)}</p>
        <p>${b.description || ''}</p>
        ${buyBox}
      </div>
    </div>
    <div class="section">
      <div class="grid">${chapterHtml}</div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

old_books_reader_call = "return res.end(renderBookReaderPage(bookId, authUser, requestURL.searchParams.get('msg') || ''));"
new_books_reader_call = "return res.end(renderEnhancedBookReaderPage(bookId, authUser, requestURL.searchParams.get('msg') || ''));"
text = text.replace(old_books_reader_call, new_books_reader_call)

old_purchase_logic = """      dbRun(`INSERT INTO wallet_transactions (wallet_id, tx_type, amount_cents, reference_type, reference_id, note, tx_status)
             VALUES (1, 'book_sale', ${Number(b.price_cents || 0)}, 'book', ${Number(bookId)}, '${q(b.title || "Book purchase")}', 'posted')`);

      return redirect(res, `/books/read/${bookId}?msg=Book%20purchase%20recorded`);"""
new_purchase_logic = """      dbRun(`INSERT INTO wallet_transactions (wallet_id, tx_type, amount_cents, reference_type, reference_id, note, tx_status)
             VALUES (1, 'book_sale', ${Number(b.price_cents || 0)}, 'book', ${Number(bookId)}, '${q(b.title || "Book purchase")}', 'posted')`);

      dbRun(`UPDATE wallets
             SET balance_cents = balance_cents + ${Number(b.price_cents || 0)}
             WHERE id = 1`);

      dbRun(`INSERT OR IGNORE INTO book_entitlements (user_type, user_id, book_id, access_type)
             VALUES ('admin', 1, ${Number(bookId)}, 'full')`);

      return redirect(res, `/books/read/${bookId}?msg=Book%20purchase%20recorded%20and%20wallet%20updated`);"""
text = text.replace(old_purchase_logic, new_purchase_logic)

anchor = "    if (req.method === 'GET' && pathname === '/wallet-transactions') {"
if "pathname.startsWith('/receipts/')" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname.startsWith('/receipts/')) {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      const receiptId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderReceiptDetailPage(receiptId, authUser));
    }

    if (req.method === 'GET' && pathname === '/wallet-transactions') {"""
    text = text.replace(anchor, routes)

# document intelligence scoring
old_doc_update = """      const autoSummary = analysisStatus === 'analyzed'
        ? 'Document reviewed and prepared for next workflow step.'
        : analysisStatus === 'ready_for_letter'
        ? 'Document appears ready for letter generation workflow.'
        : 'Document status updated in the intelligence pipeline.';

      dbRun(`UPDATE credit_documents
             SET analysis_status='${q(analysisStatus)}',
                 classification='${q(autoClass)}',
                 analysis_summary='${q(autoSummary)}'
             WHERE id=${docId}`);"""
new_doc_update = """      const autoSummary = analysisStatus === 'analyzed'
        ? 'Document reviewed and prepared for next workflow step.'
        : analysisStatus === 'ready_for_letter'
        ? 'Document appears ready for letter generation workflow.'
        : 'Document status updated in the intelligence pipeline.';

      const autoScore = analysisStatus === 'ready_for_letter' ? '95'
        : analysisStatus === 'analyzed' ? '85'
        : analysisStatus === 'reviewing' ? '60'
        : '40';

      dbRun(`UPDATE credit_documents
             SET analysis_status='${q(analysisStatus)}',
                 classification='${q(autoClass)}',
                 analysis_summary='${q(autoSummary)}',
                 analysis_score='${q(autoScore)}'
             WHERE id=${docId}`);"""
text = text.replace(old_doc_update, new_doc_update)

p.write_text(text)
print("[OK] build 1 UI patch applied")
PYEOF

bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots
cp apps/dashboard.js "backups/dashboard_build1_${STAMP}.js"
cp db/aam.db "backups/aam_build1_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as receipts from receipts;" > "snapshots/build1_receipts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallet_transactions from wallet_transactions;" > "snapshots/build1_wallet_transactions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as book_entitlements from book_entitlements;" > "snapshots/build1_book_entitlements_${STAMP}.json"

echo "FINAL 3 PART BUILD 1 COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/books"
echo "  termux-open-url http://127.0.0.1:4900/wallet-transactions"
echo "  termux-open-url http://127.0.0.1:4900/receipts"
