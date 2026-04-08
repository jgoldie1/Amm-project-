#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PAYMENT INTEGRATION PREP + CONTROL START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results config

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_payment_prep_${STAMP}.js"
cp db/aam.db "backups/aam_payment_prep_${STAMP}.db"

########################################
# 2) CONFIG SCAFFOLD
########################################
mkdir -p config
if [ ! -f config/payment.env ]; then
  cat > config/payment.env <<SEC
PAYMENT_PROVIDER_MODE=sandbox
PAYMENT_PROVIDER_NAME=internal_sandbox
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
CRYPTO_PROVIDER=
WEBHOOK_SECRET=
SEC
  echo "[OK] config/payment.env created"
else
  echo "[OK] config/payment.env already exists"
fi

########################################
# 3) DATABASE SUPPORT
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS payment_provider_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_name TEXT NOT NULL UNIQUE,
  provider_type TEXT NOT NULL,
  provider_mode TEXT NOT NULL DEFAULT 'sandbox',
  provider_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS billing_customer_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  customer_ref TEXT,
  billing_email TEXT,
  billing_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payment_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  tier_code TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  session_ref TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  session_status TEXT NOT NULL DEFAULT 'created',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  provider_name TEXT NOT NULL,
  payment_session_id INTEGER,
  checkout_order_id INTEGER,
  tx_ref TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  tx_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_payload TEXT,
  event_status TEXT NOT NULL DEFAULT 'received',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payment_reconciliation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER,
  reconciliation_type TEXT NOT NULL,
  reconciliation_status TEXT NOT NULL DEFAULT 'processed',
  reconciliation_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

providers = [
    ("internal_sandbox", "sandbox_gateway", "sandbox"),
    ("stripe", "card_processor", "disabled"),
    ("crypto", "wallet_processor", "disabled"),
]
for provider_name, provider_type, provider_mode in providers:
    cur.execute("""
    INSERT OR IGNORE INTO payment_provider_profiles
    (provider_name, provider_type, provider_mode, provider_status)
    VALUES (?, ?, ?, 'active')
    """, (provider_name, provider_type, provider_mode))

# seed billing profiles for heirs if missing
heirs = cur.execute("SELECT id, name FROM heirs_registry ORDER BY id").fetchall()
for h in heirs:
    heir_id = int(h["id"])
    exists = cur.execute("SELECT 1 FROM billing_customer_profiles WHERE heir_id=? LIMIT 1", (heir_id,)).fetchone()
    if not exists:
        customer_ref = f"cust_{heir_id:04d}"
        billing_email = f"heir{heir_id}@aam.local"
        cur.execute("""
        INSERT INTO billing_customer_profiles
        (heir_id, customer_ref, billing_email, billing_status)
        VALUES (?, ?, ?, 'active')
        """, (heir_id, customer_ref, billing_email))

conn.commit()
conn.close()
print("[OK] payment prep DB ready")
PYEOF

########################################
# 4) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderPaymentControlPage(req, user = null, message = '') {
  const providers = dbQuery(`
    SELECT id, provider_name, provider_type, provider_mode, provider_status, created_at
    FROM payment_provider_profiles
    ORDER BY id ASC
  `);

  const billing = dbQuery(`
    SELECT b.id, h.name as heir_name, b.customer_ref, b.billing_email, b.billing_status, b.created_at
    FROM billing_customer_profiles b
    LEFT JOIN heirs_registry h ON h.id = b.heir_id
    ORDER BY b.id DESC
    LIMIT 100
  `);

  const sessions = dbQuery(`
    SELECT s.id, h.name as heir_name, s.tier_code, s.provider_name, s.session_ref, s.amount_cents, s.session_status, s.created_at
    FROM payment_sessions s
    LEFT JOIN heirs_registry h ON h.id = s.heir_id
    ORDER BY s.id DESC
    LIMIT 100
  `);

  const txs = dbQuery(`
    SELECT t.id, h.name as heir_name, t.provider_name, t.payment_session_id, t.checkout_order_id, t.tx_ref, t.amount_cents, t.currency_code, t.tx_status, t.created_at
    FROM payment_transactions t
    LEFT JOIN heirs_registry h ON h.id = t.heir_id
    ORDER BY t.id DESC
    LIMIT 100
  `);

  const hooks = dbQuery(`
    SELECT id, provider_name, event_type, event_status, created_at
    FROM payment_webhook_events
    ORDER BY id DESC
    LIMIT 100
  `);

  const recs = dbQuery(`
    SELECT id, transaction_id, reconciliation_type, reconciliation_status, reconciliation_notes, created_at
    FROM payment_reconciliation_log
    ORDER BY id DESC
    LIMIT 100
  `);

  const providerRows = providers.map(r => `
    <tr><td>${r.id}</td><td>${r.provider_name}</td><td>${r.provider_type}</td><td>${r.provider_mode}</td><td>${r.provider_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const billingRows = billing.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.customer_ref || ''}</td><td>${r.billing_email || ''}</td><td>${r.billing_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const sessionRows = sessions.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.tier_code}</td><td>${r.provider_name}</td><td>${r.session_ref || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const txRows = txs.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.provider_name}</td><td>${r.payment_session_id || ''}</td><td>${r.checkout_order_id || ''}</td><td>${r.tx_ref || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.currency_code}</td><td>${r.tx_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const hookRows = hooks.map(r => `
    <tr><td>${r.id}</td><td>${r.provider_name}</td><td>${r.event_type}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const recRows = recs.map(r => `
    <tr><td>${r.id}</td><td>${r.transaction_id || ''}</td><td>${r.reconciliation_type}</td><td>${r.reconciliation_status}</td><td>${r.reconciliation_notes || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Payment Control', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Payment Control</div>
            <h1>Payment Integration Prep</h1>
            <p>Prepare the platform for real payment processors, transaction tracking, webhook ingestion, and reconciliation.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join</a>
              <a href="/monetization-control" class="hero-secondary-btn">Monetization</a>
              <a href="/conversion-control" class="hero-secondary-btn">Conversion</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Providers', `
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${providerRows || '<tr><td colspan="6">No providers yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Billing Customer Profiles', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Customer Ref</th><th>Email</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${billingRows || '<tr><td colspan="6">No billing profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Payment Sessions', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Tier</th><th>Provider</th><th>Session Ref</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${sessionRows || '<tr><td colspan="8">No payment sessions yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Transactions', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Provider</th><th>Session</th><th>Checkout Order</th><th>TX Ref</th><th>Amount</th><th>Currency</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${txRows || '<tr><td colspan="10">No transactions yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Webhook Events', `
          <table>
            <thead><tr><th>ID</th><th>Provider</th><th>Event Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${hookRows || '<tr><td colspan="5">No webhook events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Reconciliation Log', `
          <table>
            <thead><tr><th>ID</th><th>Transaction ID</th><th>Type</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead>
            <tbody>${recRows || '<tr><td colspan="6">No reconciliation rows yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderPaymentControlPage(req, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/payment-control">Payments</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/conversion-control">Conversion</a>',
        '<a href="/conversion-control">Conversion</a>\n          <a href="/payment-control">Payments</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/conversion-control') {"
if "pathname === '/payment-control'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/payment-control') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPaymentControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/conversion-control') {"""
    text = text.replace(anchor, route, 1)

# Log payment prep rows during checkout complete
old_snippet = """      dbRun(`INSERT INTO checkout_orders (owner_type, owner_id, tier_code, amount_cents, checkout_status)
             VALUES ('heir', ${heirId}, '${q(t.tier_code)}', ${Number(t.price_cents || 0)}, 'paid')`);"""
new_snippet = """      dbRun(`INSERT INTO checkout_orders (owner_type, owner_id, tier_code, amount_cents, checkout_status)
             VALUES ('heir', ${heirId}, '${q(t.tier_code)}', ${Number(t.price_cents || 0)}, 'paid')`);

      dbRun(`INSERT INTO payment_sessions (heir_id, tier_code, provider_name, session_ref, amount_cents, session_status)
             VALUES (${heirId}, '${q(t.tier_code)}', 'internal_sandbox', 'sess_' || strftime('%s','now') || '_' || ${heirId}, ${Number(t.price_cents || 0)}, 'completed')`);

      const __sessionRow = dbQuery(`SELECT id FROM payment_sessions ORDER BY id DESC LIMIT 1`);
      const __paymentSessionId = __sessionRow.length ? Number(__sessionRow[0].id) : 0;

      const __checkoutRow = dbQuery(`SELECT id FROM checkout_orders ORDER BY id DESC LIMIT 1`);
      const __checkoutOrderId = __checkoutRow.length ? Number(__checkoutRow[0].id) : 0;

      dbRun(`INSERT INTO payment_transactions (heir_id, provider_name, payment_session_id, checkout_order_id, tx_ref, amount_cents, currency_code, tx_status)
             VALUES (${heirId}, 'internal_sandbox', ${__paymentSessionId}, ${__checkoutOrderId}, 'tx_' || strftime('%s','now') || '_' || ${heirId}, ${Number(t.price_cents || 0)}, 'USD', 'completed')`);

      const __txRow = dbQuery(`SELECT id FROM payment_transactions ORDER BY id DESC LIMIT 1`);
      const __transactionId = __txRow.length ? Number(__txRow[0].id) : 0;

      dbRun(`INSERT INTO payment_webhook_events (provider_name, event_type, event_payload, event_status)
             VALUES ('internal_sandbox', 'checkout.completed', '${q(t.tier_code)}', 'processed')`);

      dbRun(`INSERT INTO payment_reconciliation_log (transaction_id, reconciliation_type, reconciliation_status, reconciliation_notes)
             VALUES (${__transactionId}, 'sandbox_reconcile', 'processed', '${q(t.tier_code)}')`);"""
if old_snippet in text:
    text = text.replace(old_snippet, new_snippet, 1)

p.write_text(text)
print("[OK] payment control UI patch applied")
PYEOF

########################################
# 5) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 6) NEXT-LEVEL SMOKE TEST
########################################
curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=basic_access&username=jacobie" \
  > "test_results/payment_checkout_jacobie_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=creator_access&username=aniyah" \
  > "test_results/payment_checkout_aniyah_${STAMP}.txt" || true

for route in \
  /payment-control \
  /join \
  /conversion-control \
  /monetization-control \
  /connect-system \
  /watch
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as payment_provider_profiles from payment_provider_profiles;" > "snapshots/payment_provider_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as billing_customer_profiles from billing_customer_profiles;" > "snapshots/billing_customer_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payment_sessions from payment_sessions;" > "snapshots/payment_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payment_transactions from payment_transactions;" > "snapshots/payment_transactions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payment_webhook_events from payment_webhook_events;" > "snapshots/payment_webhook_events_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payment_reconciliation_log from payment_reconciliation_log;" > "snapshots/payment_reconciliation_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, heir_id, tier_code, provider_name, session_ref, amount_cents, session_status, created_at from payment_sessions order by id desc limit 50;" > "snapshots/payment_sessions_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, provider_name, payment_session_id, checkout_order_id, tx_ref, amount_cents, currency_code, tx_status, created_at from payment_transactions order by id desc limit 50;" > "snapshots/payment_transactions_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, provider_name, event_type, event_payload, event_status, created_at from payment_webhook_events order by id desc limit 50;" > "snapshots/payment_webhooks_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, transaction_id, reconciliation_type, reconciliation_status, reconciliation_notes, created_at from payment_reconciliation_log order by id desc limit 50;" > "snapshots/payment_reconciliation_tail_${STAMP}.json"

########################################
# 8) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "checkout failed" in lower:
        issues.append({"file": f.name, "problem": "checkout_failed"})

latest = Path.home() / "aam_full_system" / "snapshots" / "payment_control_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] payment control scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) REPORT
########################################
cat > "reports/payment_integration_prep_and_control_${STAMP}.txt" <<REPORT
PAYMENT INTEGRATION PREP + CONTROL REPORT
Timestamp: ${STAMP}

Added:
- payment_provider_profiles
- billing_customer_profiles
- payment_sessions
- payment_transactions
- payment_webhook_events
- payment_reconciliation_log
- /payment-control

Extended:
- checkout complete now writes payment prep records
- sandbox payment session rows
- sandbox transaction rows
- webhook/reconciliation rows

Purpose:
- prepare the platform for real payment integration
- make payment flows visible and auditable
- create launch-ready transaction scaffolding
REPORT

echo "PAYMENT INTEGRATION PREP + CONTROL COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/payment_control_scan_latest.json"
echo "  cat snapshots/payment_transactions_tail_${STAMP}.json"
echo "  cat snapshots/payment_reconciliation_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/payment-control"
echo "  termux-open-url http://127.0.0.1:4900/join"
echo "  termux-open-url http://127.0.0.1:4900/monetization-control"
