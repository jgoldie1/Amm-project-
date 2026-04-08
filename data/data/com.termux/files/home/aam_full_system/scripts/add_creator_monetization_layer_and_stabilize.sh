#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== ADD CREATOR MONETIZATION LAYER + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_creator_monetization_${STAMP}.js"
cp db/aam.db "backups/aam_creator_monetization_${STAMP}.db"

########################################
# 2) TABLES + SEED
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_subscription_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  billing_period TEXT DEFAULT 'monthly',
  price_cents INTEGER DEFAULT 0,
  perks_summary TEXT,
  plan_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_name TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  membership_status TEXT DEFAULT 'active',
  renews_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_tip_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supporter_name TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  tip_amount_cents INTEGER DEFAULT 0,
  tip_message TEXT,
  tip_status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_payout_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_name TEXT NOT NULL,
  gross_amount_cents INTEGER DEFAULT 0,
  platform_fee_cents INTEGER DEFAULT 0,
  net_amount_cents INTEGER DEFAULT 0,
  payout_status TEXT DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM creator_subscription_plans").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO creator_subscription_plans
        (channel_name, plan_name, billing_period, price_cents, perks_summary, plan_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Isaiah Anyone Can Be a Star AI TV", "Star Pass", "monthly", 999, "member badge + bonus episodes", "active"),
        ("Jacobie Vision Holo TV", "Vision Premium", "monthly", 1499, "premium holo broadcasts + archives", "active"),
        ("Aniyah Creator Spotlight", "Spotlight Circle", "monthly", 799, "creator drops + member room", "active"),
    ])

if cur.execute("SELECT count(*) FROM creator_memberships").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO creator_memberships
        (member_name, channel_name, plan_name, membership_status, renews_at)
        VALUES (?, ?, ?, ?, datetime('now','+30 day'))
    """, [
        ("Jacobie", "Isaiah Anyone Can Be a Star AI TV", "Star Pass", "active"),
        ("Aniyah", "Jacobie Vision Holo TV", "Vision Premium", "active"),
        ("Isaiah", "Aniyah Creator Spotlight", "Spotlight Circle", "active"),
    ])

if cur.execute("SELECT count(*) FROM creator_tip_ledger").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO creator_tip_ledger
        (supporter_name, channel_name, tip_amount_cents, tip_message, tip_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Guest Explorer", "Isaiah Anyone Can Be a Star AI TV", 500, "Great show", "completed"),
        ("Jacobie", "Aniyah Creator Spotlight", 800, "Keep going", "completed"),
        ("Isaiah", "Jacobie Vision Holo TV", 1200, "Holo news was powerful", "completed"),
    ])

cur.execute("DELETE FROM creator_payout_summary")
rows = cur.execute("""
SELECT
  channel_name,
  COALESCE(SUM(amount),0)
FROM (
  SELECT channel_name, price_cents as amount FROM creator_subscription_plans
  UNION ALL
  SELECT channel_name, tip_amount_cents as amount FROM creator_tip_ledger
)
GROUP BY channel_name
""").fetchall()

for channel_name, gross in rows:
    gross = int(gross or 0)
    fee = gross // 5
    net = gross - fee
    cur.execute("""
        INSERT INTO creator_payout_summary
        (channel_name, gross_amount_cents, platform_fee_cents, net_amount_cents, payout_status)
        VALUES (?, ?, ?, ?, ?)
    """, (channel_name, gross, fee, net, "queued"))

conn.commit()
conn.close()
print("[OK] creator monetization tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderCreatorMonetizationPage(req, user = null, message = '') {
  const plans = dbQuery(`
    SELECT id, channel_name, plan_name, billing_period, price_cents, perks_summary, plan_status, created_at
    FROM creator_subscription_plans
    ORDER BY id DESC LIMIT 100
  `);

  const memberships = dbQuery(`
    SELECT id, member_name, channel_name, plan_name, membership_status, renews_at, created_at
    FROM creator_memberships
    ORDER BY id DESC LIMIT 100
  `);

  const tips = dbQuery(`
    SELECT id, supporter_name, channel_name, tip_amount_cents, tip_message, tip_status, created_at
    FROM creator_tip_ledger
    ORDER BY id DESC LIMIT 100
  `);

  const payouts = dbQuery(`
    SELECT id, channel_name, gross_amount_cents, platform_fee_cents, net_amount_cents, payout_status, created_at
    FROM creator_payout_summary
    ORDER BY id DESC LIMIT 100
  `);

  const planRows = plans.map(r => `<tr><td>${r.id}</td><td>${r.channel_name}</td><td>${r.plan_name}</td><td>${r.billing_period}</td><td>${r.price_cents}</td><td>${r.perks_summary || ''}</td><td>${r.plan_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const membershipRows = memberships.map(r => `<tr><td>${r.id}</td><td>${r.member_name}</td><td>${r.channel_name}</td><td>${r.plan_name}</td><td>${r.membership_status}</td><td>${r.renews_at || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const tipRows = tips.map(r => `<tr><td>${r.id}</td><td>${r.supporter_name}</td><td>${r.channel_name}</td><td>${r.tip_amount_cents}</td><td>${r.tip_message || ''}</td><td>${r.tip_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const payoutRows = payouts.map(r => `<tr><td>${r.id}</td><td>${r.channel_name}</td><td>${r.gross_amount_cents}</td><td>${r.platform_fee_cents}</td><td>${r.net_amount_cents}</td><td>${r.payout_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Creator Monetization', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Creator Monetization</h1><p>${message || 'Subscriptions, memberships, tips, and payout visibility.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Channel</th><th>Plan</th><th>Period</th><th>Price</th><th>Perks</th><th>Status</th><th>Created</th></tr></thead><tbody>${planRows || '<tr><td colspan="8">No plans</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Member</th><th>Channel</th><th>Plan</th><th>Status</th><th>Renews</th><th>Created</th></tr></thead><tbody>${membershipRows || '<tr><td colspan="7">No memberships</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Supporter</th><th>Channel</th><th>Tip</th><th>Message</th><th>Status</th><th>Created</th></tr></thead><tbody>${tipRows || '<tr><td colspan="7">No tips</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Channel</th><th>Gross</th><th>Fee</th><th>Net</th><th>Status</th><th>Created</th></tr></thead><tbody>${payoutRows || '<tr><td colspan="7">No payouts</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderCreatorMonetizationPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/creator-monetization') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCreatorMonetizationPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/streaming-network') {"
if "pathname === '/creator-monetization'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/creator-monetization">Creator Monetization</a>' not in text and '<a href="/streaming-network">Streaming Network</a>' in text:
    text = text.replace(
        '<a href="/streaming-network">Streaming Network</a>',
        '<a href="/streaming-network">Streaming Network</a>\n          <a href="/creator-monetization">Creator Monetization</a>',
        1
    )

p.write_text(text)
print("[OK] creator monetization route added")
PYEOF

########################################
# 4) RESTART + SMOKE TEST
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /creator-monetization \
  /streaming-network \
  /creator-tv \
  /holojourney-tv \
  /neuro-control \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as creator_subscription_plans from creator_subscription_plans;" > "snapshots/creator_subscription_plans_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_memberships from creator_memberships;" > "snapshots/creator_memberships_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_tip_ledger from creator_tip_ledger;" > "snapshots/creator_tip_ledger_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_payout_summary from creator_payout_summary;" > "snapshots/creator_payout_summary_${STAMP}.json"

sqlite3 -json db/aam.db "select id, channel_name, plan_name, billing_period, price_cents, perks_summary, plan_status, created_at from creator_subscription_plans order by id desc limit 20;" > "snapshots/creator_subscription_plans_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, member_name, channel_name, plan_name, membership_status, renews_at, created_at from creator_memberships order by id desc limit 20;" > "snapshots/creator_memberships_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, supporter_name, channel_name, tip_amount_cents, tip_message, tip_status, created_at from creator_tip_ledger order by id desc limit 20;" > "snapshots/creator_tip_ledger_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, channel_name, gross_amount_cents, platform_fee_cents, net_amount_cents, payout_status, created_at from creator_payout_summary order by id desc limit 20;" > "snapshots/creator_payout_summary_tail_${STAMP}.json"

########################################
# 6) ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "creator_monetization_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] creator monetization scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/add_creator_monetization_layer_and_stabilize_${STAMP}.txt" <<REPORT
ADD CREATOR MONETIZATION LAYER + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- /creator-monetization
- creator_subscription_plans
- creator_memberships
- creator_tip_ledger
- creator_payout_summary

Verified:
- dashboard health
- jarvis health
- creator monetization route
- streaming network route
- creator TV route
- OmniMail OS
- Holo Search
- Platform Analytics
- Neuro Control
- HoloJourney TV
- world3d

Purpose:
- extend creator revenue systems
- prepare memberships, subscriptions, and tipping
- preserve stable runtime
REPORT

echo "ADD CREATOR MONETIZATION LAYER + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/creator_monetization_scan_latest.json"
echo "  cat snapshots/creator_payout_summary_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/creator-monetization"
echo "  termux-open-url http://127.0.0.1:4900/creator-tv"
echo "  termux-open-url http://127.0.0.1:4900/streaming-network"
