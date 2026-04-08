#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS AE REVENUE + BLOCKCHAIN + SCALING START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_pass_ae_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_pass_ae_${STAMP}.js"

########################################
# 1) CREATE TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS payment_gateway_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gateway_name TEXT,
  gateway_group TEXT,
  gateway_scope TEXT,
  settlement_mode TEXT,
  gateway_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS token_system_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_name TEXT,
  token_symbol TEXT,
  token_scope TEXT,
  token_mode TEXT,
  token_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monetization_plan_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_name TEXT,
  plan_group TEXT,
  revenue_scope TEXT,
  pricing_mode TEXT,
  plan_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployment_target_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_name TEXT,
  target_group TEXT,
  environment_scope TEXT,
  deployment_mode TEXT,
  target_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scaling_profile_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT,
  profile_group TEXT,
  scaling_scope TEXT,
  scaling_mode TEXT,
  profile_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payout_rail_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rail_name TEXT,
  rail_group TEXT,
  payout_scope TEXT,
  payout_mode TEXT,
  rail_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payment_gateway_registry (gateway_name, gateway_group, gateway_scope, settlement_mode, gateway_status)
SELECT 'Primary Payment Gateway','platform_payments','subscriptions+tipping+checkout','fiat_first','active'
WHERE NOT EXISTS (SELECT 1 FROM payment_gateway_registry WHERE gateway_name='Primary Payment Gateway');

INSERT INTO token_system_registry (token_name, token_symbol, token_scope, token_mode, token_status)
SELECT 'All American Token','AAMT','ecosystem_rewards_and_access','ledger_ready','active'
WHERE NOT EXISTS (SELECT 1 FROM token_system_registry WHERE token_symbol='AAMT');

INSERT INTO monetization_plan_registry (plan_name, plan_group, revenue_scope, pricing_mode, plan_status)
SELECT 'Creator Premium Plan','creator_revenue','creator_tools+publishing+streaming','subscription','active'
WHERE NOT EXISTS (SELECT 1 FROM monetization_plan_registry WHERE plan_name='Creator Premium Plan');

INSERT INTO monetization_plan_registry (plan_name, plan_group, revenue_scope, pricing_mode, plan_status)
SELECT 'Marketplace Pro Plan','marketplace_revenue','gig+ai+storefront+streaming','subscription+fees','active'
WHERE NOT EXISTS (SELECT 1 FROM monetization_plan_registry WHERE plan_name='Marketplace Pro Plan');

INSERT INTO deployment_target_registry (target_name, target_group, environment_scope, deployment_mode, target_status)
SELECT 'Beta Cloud Target','deployment','beta_environment','container_web','active'
WHERE NOT EXISTS (SELECT 1 FROM deployment_target_registry WHERE target_name='Beta Cloud Target');

INSERT INTO scaling_profile_registry (profile_name, profile_group, scaling_scope, scaling_mode, profile_status)
SELECT 'Core Beta Scale','beta_scale','dashboard+creator+payments+ai','vertical_then_horizontal','active'
WHERE NOT EXISTS (SELECT 1 FROM scaling_profile_registry WHERE profile_name='Core Beta Scale');

INSERT INTO payout_rail_registry (rail_name, rail_group, payout_scope, payout_mode, rail_status)
SELECT 'Creator Payout Rail','creator_payouts','tips+royalties+subscriptions','scheduled_settlement','active'
WHERE NOT EXISTS (SELECT 1 FROM payout_rail_registry WHERE rail_name='Creator Payout Rail');
SQL

########################################
# 2) PATCH UI + ROUTES
########################################
python3 <<'PY2EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper_sig = "function renderRevenueBlockchainHubPage(req, user = null, message = '') {"
if helper_sig not in text:
    helper = r"""
function renderRevenueBlockchainHubPage(req, user = null, message = '') {
  return htmlPage('Revenue Blockchain Hub', `
    <main class="portal-main premium-main accessible-main">
      <section>
        <h1>Revenue + Blockchain + Scaling</h1>
        <p>${esc(message || 'Payments, token system, monetization, deployment, and scaling are live.')}</p>
      </section>
      <section>
        <h2>Core Actions</h2>
        <form method="POST" action="/revenue/payment-safe" style="margin-bottom:12px;"><button type="submit">Create Payment Gateway</button></form>
        <form method="POST" action="/revenue/token-safe" style="margin-bottom:12px;"><button type="submit">Create Token System</button></form>
        <form method="POST" action="/revenue/monetization-safe" style="margin-bottom:12px;"><button type="submit">Create Monetization Plan</button></form>
        <form method="POST" action="/revenue/deployment-safe" style="margin-bottom:12px;"><button type="submit">Create Deployment Target</button></form>
        <form method="POST" action="/revenue/scaling-safe" style="margin-bottom:12px;"><button type="submit">Create Scaling Profile</button></form>
        <form method="POST" action="/revenue/payout-safe" style="margin-bottom:12px;"><button type="submit">Create Payout Rail</button></form>
      </section>
      <section>
        <h2>What This Layer Does</h2>
        <p>Turns the platform into a money-capable operating system with payment rails, token readiness, monetization plans, deployment planning, and scaling profiles.</p>
      </section>
    </main>
  `, user);
}
"""
    anchor = "function renderCommandCenterPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

routes = r"""
    if (req.method === 'GET' && pathname === '/revenue-blockchain-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRevenueBlockchainHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/revenue/payment-safe') {
      dbRun(`INSERT INTO payment_gateway_registry (gateway_name, gateway_group, gateway_scope, settlement_mode, gateway_status)
             VALUES ('Safe Payment Gateway','platform_payments','subscriptions+tipping+checkout','fiat_first','active')`);
      res.writeHead(302, { Location: '/revenue-blockchain-hub?msg=Payment%20gateway%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/revenue/token-safe') {
      dbRun(`INSERT INTO token_system_registry (token_name, token_symbol, token_scope, token_mode, token_status)
             VALUES ('All American Token','AAMT','ecosystem_rewards_and_access','ledger_ready','active')`);
      res.writeHead(302, { Location: '/revenue-blockchain-hub?msg=Token%20system%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/revenue/monetization-safe') {
      dbRun(`INSERT INTO monetization_plan_registry (plan_name, plan_group, revenue_scope, pricing_mode, plan_status)
             VALUES ('Safe Monetization Plan','platform_revenue','subscriptions+fees+ads','hybrid','active')`);
      res.writeHead(302, { Location: '/revenue-blockchain-hub?msg=Monetization%20plan%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/revenue/deployment-safe') {
      dbRun(`INSERT INTO deployment_target_registry (target_name, target_group, environment_scope, deployment_mode, target_status)
             VALUES ('Safe Deployment Target','deployment','beta_environment','container_web','active')`);
      res.writeHead(302, { Location: '/revenue-blockchain-hub?msg=Deployment%20target%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/revenue/scaling-safe') {
      dbRun(`INSERT INTO scaling_profile_registry (profile_name, profile_group, scaling_scope, scaling_mode, profile_status)
             VALUES ('Safe Scaling Profile','beta_scale','dashboard+creator+payments+ai','vertical_then_horizontal','active')`);
      res.writeHead(302, { Location: '/revenue-blockchain-hub?msg=Scaling%20profile%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/revenue/payout-safe') {
      dbRun(`INSERT INTO payout_rail_registry (rail_name, rail_group, payout_scope, payout_mode, rail_status)
             VALUES ('Safe Payout Rail','creator_payouts','tips+royalties+subscriptions','scheduled_settlement','active')`);
      res.writeHead(302, { Location: '/revenue-blockchain-hub?msg=Payout%20rail%20created' });
      return res.end();
    }
"""

live_anchor = """    if (req.method === 'GET' && pathname === '/homepage-showcase') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHomepageShowcase(req, null, getQueryParam(req,'msg')||''));
    }
"""

if "pathname === '/revenue-blockchain-hub'" not in text and live_anchor in text:
    text = text.replace(live_anchor, live_anchor + "\n" + routes, 1)

if '<a href="/revenue-blockchain-hub">Revenue Blockchain Hub</a>' not in text and '<a href="/command-center">Command Center</a>' in text:
    text = text.replace(
        '<a href="/command-center">Command Center</a>',
        '<a href="/command-center">Command Center</a>\n<a href="/revenue-blockchain-hub">Revenue Blockchain Hub</a>',
        1
    )

p.write_text(text)
print("[OK] revenue blockchain hub patched")
PY2EOF

########################################
# 3) RESTART
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 4) SMOKE TEST
########################################
curl -s http://127.0.0.1:4900/health > test_results/pass_ae_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_ae_jarvis_health_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/revenue-blockchain-hub > test_results/pass_ae_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/revenue/payment-safe > test_results/pass_ae_payment_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/revenue/token-safe > test_results/pass_ae_token_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/revenue/monetization-safe > test_results/pass_ae_monetization_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/revenue/deployment-safe > test_results/pass_ae_deployment_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/revenue/scaling-safe > test_results/pass_ae_scaling_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/revenue/payout-safe > test_results/pass_ae_payout_${STAMP}.txt || true

########################################
# 5) SCAN
########################################
python3 <<PY3EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_ae_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","pass_ae_revenue_blockchain_scan_latest.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
print(json.dumps(issues, indent=2))
PY3EOF

bash scripts/status.sh || true

cat > "reports/pass_ae_revenue_blockchain_scaling_${STAMP}.txt" <<REPORT
PASS AE REVENUE BLOCKCHAIN SCALING REPORT
Timestamp: ${STAMP}

Built:
- payment gateway registry
- token system registry
- monetization plan registry
- deployment target registry
- scaling profile registry
- payout rail registry
- revenue blockchain hub
- revenue safe actions

Purpose:
- prepare payment rails
- prepare token rails
- prepare monetization and payout structure
- prepare deployment and scaling structure
REPORT

echo "=== PASS AE COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_ae_revenue_blockchain_scan_latest.json"
echo "  cat reports/pass_ae_revenue_blockchain_scaling_${STAMP}.txt"
echo "  bash scripts/status.sh"
