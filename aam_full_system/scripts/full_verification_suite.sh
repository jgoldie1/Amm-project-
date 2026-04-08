#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FULL VERIFICATION SUITE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

pass() { echo "[PASS] $1"; }
fail() { echo "[FAIL] $1"; }

########################################
# 1) SERVICE HEALTH
########################################
echo "== Service Health =="
if curl -fsS http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json"; then
  pass "Dashboard health"
else
  fail "Dashboard health"
fi

if curl -fsS http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json"; then
  pass "Jarvis health"
else
  fail "Jarvis health"
fi

if curl -fsS http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json"; then
  pass "World socket health"
else
  fail "World socket health"
fi

########################################
# 2) HTML ROUTE CHECKS
########################################
echo "== HTML Route Checks =="

check_html_route () {
  NAME="$1"
  URL="$2"
  OUT="test_results/${NAME}_${STAMP}.html"

  if curl -fsS "$URL" > "$OUT"; then
    if grep -qi "<html" "$OUT"; then
      pass "$NAME"
    else
      fail "$NAME (no html tag found)"
    fi
  else
    fail "$NAME"
  fi
}

check_html_route "home" "http://127.0.0.1:4900/"
check_html_route "progress" "http://127.0.0.1:4900/progress"
check_html_route "command_core" "http://127.0.0.1:4900/command-core"
check_html_route "heirs" "http://127.0.0.1:4900/heirs"
check_html_route "heirs_ecosystem" "http://127.0.0.1:4900/heirs-ecosystem"
check_html_route "heir_operations" "http://127.0.0.1:4900/heir-operations"
check_html_route "heir_login" "http://127.0.0.1:4900/heir-login"
check_html_route "heir_dashboard_1" "http://127.0.0.1:4900/heir-dashboard/1"
check_html_route "heir_pin_1" "http://127.0.0.1:4900/heir-pin/1"
check_html_route "world_explorer" "http://127.0.0.1:4900/world-explorer"
check_html_route "storefront_explorer" "http://127.0.0.1:4900/storefront-explorer"
check_html_route "wallet_center" "http://127.0.0.1:4900/wallet-center"
check_html_route "access_center" "http://127.0.0.1:4900/access-center"
check_html_route "creator_hub" "http://127.0.0.1:4900/creator-hub"

########################################
# 3) LOGIN FLOW TESTS
########################################
echo "== Heir Login Flow Tests =="

LOGIN_OUT="test_results/heir_login_post_${STAMP}.txt"
if curl -s -i -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=1234" > "$LOGIN_OUT"; then
  if grep -qi "Location: /heir-dashboard/" "$LOGIN_OUT"; then
    pass "Heir login POST redirect"
  else
    fail "Heir login POST redirect missing"
  fi
else
  fail "Heir login POST request"
fi

BAD_LOGIN_OUT="test_results/heir_login_bad_${STAMP}.html"
if curl -s -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=9999" > "$BAD_LOGIN_OUT"; then
  if grep -qi "Login failed" "$BAD_LOGIN_OUT"; then
    pass "Heir login failure handling"
  else
    fail "Heir login failure handling missing"
  fi
else
  fail "Heir bad login request"
fi

########################################
# 4) WORLD SOCKET API TESTS
########################################
echo "== World Socket API Tests =="

check_json_route () {
  NAME="$1"
  URL="$2"
  OUT="test_results/${NAME}_${STAMP}.json"

  if curl -fsS "$URL" > "$OUT"; then
    if grep -qi '"ok"' "$OUT"; then
      pass "$NAME"
    else
      fail "$NAME (no ok field)"
    fi
  else
    fail "$NAME"
  fi
}

check_json_route "socket_sync_scene_1" "http://127.0.0.1:5090/sync/1"
check_json_route "socket_emit_test" "http://127.0.0.1:5090/emit?sceneId=1&avatarId=1&eventType=verification_test&payload=%7B%22suite%22%3Atrue%7D"
check_json_route "socket_check_access" "http://127.0.0.1:5090/check-access?sceneId=1&ownerType=avatar&ownerId=1"

########################################
# 5) DATABASE INTEGRITY CHECKS
########################################
echo "== Database Integrity Checks =="

sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "test_results/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "test_results/heir_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallets from heir_wallets;" > "test_results/heir_wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_earnings from heir_earnings;" > "test_results/heir_earnings_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_revenue_rules from heir_revenue_rules;" > "test_results/heir_revenue_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_preferences from heir_preferences;" > "test_results/heir_preferences_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scenes from scene_registry;" > "test_results/scenes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storefronts from world_storefronts;" > "test_results/storefronts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as settlements from world_order_settlements;" > "test_results/settlements_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallet_tx from wallet_transactions;" > "test_results/wallet_tx_${STAMP}.json"

pass "Database count snapshots collected"

########################################
# 6) JS + APP STATUS
########################################
echo "== JS + App Status =="
if bash scripts/check_js.sh > "test_results/js_check_${STAMP}.txt"; then
  pass "JS syntax check"
else
  fail "JS syntax check"
fi

bash scripts/status.sh > "test_results/app_status_${STAMP}.txt" || true
pass "App status snapshot collected"

########################################
# 7) REPORT
########################################
cat > "reports/full_verification_suite_${STAMP}.txt" <<REPORT
FULL VERIFICATION SUITE REPORT
Timestamp: ${STAMP}

What was tested:
- dashboard health
- jarvis health
- socket health
- public and core HTML routes
- heir login success/failure flow
- world socket sync/access/event routes
- DB integrity count snapshots
- JS syntax
- app status snapshot

Artifacts:
- test_results/*
- reports/full_verification_suite_${STAMP}.txt
REPORT

echo "FULL VERIFICATION SUITE COMPLETE: $STAMP"
echo "Report:"
echo "  reports/full_verification_suite_${STAMP}.txt"
echo "Results folder:"
echo "  test_results/"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/progress"
echo "  termux-open-url http://127.0.0.1:4900/heirs-ecosystem"
