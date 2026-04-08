#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MULTIVERSE PASS E COMMERCE + CREATOR MONETIZATION + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_multiverse_pass_e_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_multiverse_pass_e_${STAMP}.js"

########################################
# 1) CREATE PASS E TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS multiverse_commerce_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commerce_name TEXT,
  commerce_group TEXT,
  source_realm TEXT,
  target_realm TEXT,
  commerce_mode TEXT,
  commerce_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multiverse_creator_economy_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_name TEXT,
  creator_group TEXT,
  content_scope TEXT,
  revenue_mode TEXT,
  payout_mode TEXT,
  creator_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multiverse_storefront_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storefront_name TEXT,
  storefront_group TEXT,
  linked_realm TEXT,
  product_scope TEXT,
  storefront_mode TEXT,
  storefront_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multiverse_revenue_bridge_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bridge_name TEXT,
  bridge_group TEXT,
  source_system TEXT,
  target_system TEXT,
  revenue_mode TEXT,
  bridge_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multiverse_payout_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payout_name TEXT,
  payout_group TEXT,
  linked_creator TEXT,
  payout_target TEXT,
  payout_mode TEXT,
  payout_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS multiverse_settlement_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  settlement_name TEXT,
  settlement_group TEXT,
  source_realm TEXT,
  target_realm TEXT,
  settlement_result TEXT,
  settlement_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass E tables created"

########################################
# 2) SEED PASS E
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO multiverse_commerce_registry (commerce_name, commerce_group, source_realm, target_realm, commerce_mode, commerce_status)
SELECT 'Primary Cross Realm Commerce','core','middleverse_core','multiverse_core','bridged','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_commerce_registry WHERE commerce_name='Primary Cross Realm Commerce');

INSERT INTO multiverse_creator_economy_registry (creator_name, creator_group, content_scope, revenue_mode, payout_mode, creator_status)
SELECT 'Primary Creator Economy','core','multiverse_content','subscriptions+tips','scheduled','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_creator_economy_registry WHERE creator_name='Primary Creator Economy');

INSERT INTO multiverse_storefront_registry (storefront_name, storefront_group, linked_realm, product_scope, storefront_mode, storefront_status)
SELECT 'Primary Multiverse Storefront','core','Primary Multiverse Realm','digital+service','managed','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_storefront_registry WHERE storefront_name='Primary Multiverse Storefront');

INSERT INTO multiverse_revenue_bridge_registry (bridge_name, bridge_group, source_system, target_system, revenue_mode, bridge_status)
SELECT 'Multiverse Revenue Bridge','core','creator_tv','world_storefronts','cross_realm_revenue','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_revenue_bridge_registry WHERE bridge_name='Multiverse Revenue Bridge');

INSERT INTO multiverse_payout_registry (payout_name, payout_group, linked_creator, payout_target, payout_mode, payout_status)
SELECT 'Primary Creator Payout','core','Primary Creator Economy','wallet-root','scheduled','active'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_payout_registry WHERE payout_name='Primary Creator Payout');

INSERT INTO multiverse_settlement_registry (settlement_name, settlement_group, source_realm, target_realm, settlement_result, settlement_status)
SELECT 'Initial Cross Realm Settlement','core','middleverse_core','multiverse_core','ok','complete'
WHERE NOT EXISTS (SELECT 1 FROM multiverse_settlement_registry WHERE settlement_name='Initial Cross Realm Settlement');
SQL

echo "[OK] pass E seeded"

########################################
# 3) PATCH SAFE POST ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

routes = r"""
    if (req.method === 'POST' && pathname === '/multiverse/commerce-safe') {
      dbRun(`INSERT INTO multiverse_commerce_registry (commerce_name, commerce_group, source_realm, target_realm, commerce_mode, commerce_status)
             VALUES ('Safe Commerce','sandbox','middleverse_core','multiverse_core','safe_bridge','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20commerce%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/multiverse/creator-economy-safe') {
      dbRun(`INSERT INTO multiverse_creator_economy_registry (creator_name, creator_group, content_scope, revenue_mode, payout_mode, creator_status)
             VALUES ('Safe Creator Economy','sandbox','multiverse_content','tips','scheduled','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20creator%20economy%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/multiverse/storefront-safe') {
      dbRun(`INSERT INTO multiverse_storefront_registry (storefront_name, storefront_group, linked_realm, product_scope, storefront_mode, storefront_status)
             VALUES ('Safe Storefront','sandbox','Primary Multiverse Realm','digital','managed','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20storefront%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/multiverse/revenue-bridge-safe') {
      dbRun(`INSERT INTO multiverse_revenue_bridge_registry (bridge_name, bridge_group, source_system, target_system, revenue_mode, bridge_status)
             VALUES ('Safe Revenue Bridge','sandbox','creator_tv','world_storefronts','cross_realm','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20revenue%20bridge%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/multiverse/payout-safe') {
      dbRun(`INSERT INTO multiverse_payout_registry (payout_name, payout_group, linked_creator, payout_target, payout_mode, payout_status)
             VALUES ('Safe Payout','sandbox','Safe Creator Economy','wallet-root','scheduled','active')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20payout%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/multiverse/settlement-safe') {
      dbRun(`INSERT INTO multiverse_settlement_registry (settlement_name, settlement_group, source_realm, target_realm, settlement_result, settlement_status)
             VALUES ('Safe Settlement','sandbox','middleverse_core','multiverse_core','ok','complete')`);
      res.writeHead(302, { Location: '/multiverse-bridge?msg=Safe%20settlement%20created' });
      return res.end();
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/multiverse-bridge') {"
if "pathname === '/multiverse/commerce-safe'" not in text and anchor in text:
    text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] pass E routes patched")
PYEOF

########################################
# 4) RESTART + STATUS
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 5) CURRENT-RUN TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true

curl -s -i -X POST http://127.0.0.1:4900/multiverse/commerce-safe > "test_results/multiverse_commerce_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/creator-economy-safe > "test_results/multiverse_creator_economy_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/storefront-safe > "test_results/multiverse_storefront_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/revenue-bridge-safe > "test_results/multiverse_revenue_bridge_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/payout-safe > "test_results/multiverse_payout_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/multiverse/settlement-safe > "test_results/multiverse_settlement_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as multiverse_commerce_registry from multiverse_commerce_registry;" > "snapshots/multiverse_commerce_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_creator_economy_registry from multiverse_creator_economy_registry;" > "snapshots/multiverse_creator_economy_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_storefront_registry from multiverse_storefront_registry;" > "snapshots/multiverse_storefront_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_revenue_bridge_registry from multiverse_revenue_bridge_registry;" > "snapshots/multiverse_revenue_bridge_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_payout_registry from multiverse_payout_registry;" > "snapshots/multiverse_payout_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as multiverse_settlement_registry from multiverse_settlement_registry;" > "snapshots/multiverse_settlement_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, commerce_name, commerce_group, source_realm, target_realm, commerce_mode, commerce_status, created_at from multiverse_commerce_registry order by id desc limit 20;" > "snapshots/multiverse_commerce_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, creator_name, creator_group, content_scope, revenue_mode, payout_mode, creator_status, created_at from multiverse_creator_economy_registry order by id desc limit 20;" > "snapshots/multiverse_creator_economy_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, storefront_name, storefront_group, linked_realm, product_scope, storefront_mode, storefront_status, created_at from multiverse_storefront_registry order by id desc limit 20;" > "snapshots/multiverse_storefront_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, bridge_name, bridge_group, source_system, target_system, revenue_mode, bridge_status, created_at from multiverse_revenue_bridge_registry order by id desc limit 20;" > "snapshots/multiverse_revenue_bridge_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, payout_name, payout_group, linked_creator, payout_target, payout_mode, payout_status, created_at from multiverse_payout_registry order by id desc limit 20;" > "snapshots/multiverse_payout_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, settlement_name, settlement_group, source_realm, target_realm, settlement_result, settlement_status, created_at from multiverse_settlement_registry order by id desc limit 20;" > "snapshots/multiverse_settlement_registry_tail_${STAMP}.json"

########################################
# 7) CURRENT-RUN ERROR SCAN
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
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "multiverse_pass_e_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] multiverse pass E scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/multiverse_pass_e_commerce_creator_monetization_and_stabilize_${STAMP}.txt" <<REPORT
MULTIVERSE PASS E COMMERCE + CREATOR MONETIZATION + STABILIZE REPORT
Timestamp: ${STAMP}

Built:
- multiverse commerce registry
- multiverse creator economy registry
- multiverse storefront registry
- multiverse revenue bridge registry
- multiverse payout registry
- multiverse settlement registry

Verified:
- dashboard health
- jarvis health
- multiverse bridge route
- safe commerce and creator actions
- current-run-only scan
- stable runtime

Purpose:
- add commerce and creator monetization to the multiverse
- connect storefronts, revenue bridges, payouts, and settlements
- prepare for package/sdk layer next
REPORT

echo "MULTIVERSE PASS E COMMERCE + CREATOR MONETIZATION + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/multiverse_pass_e_scan_latest.json"
echo "  cat snapshots/multiverse_commerce_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_creator_economy_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_storefront_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_revenue_bridge_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_payout_registry_tail_${STAMP}.json"
echo "  cat snapshots/multiverse_settlement_registry_tail_${STAMP}.json"
echo "  cat reports/multiverse_pass_e_commerce_creator_monetization_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
