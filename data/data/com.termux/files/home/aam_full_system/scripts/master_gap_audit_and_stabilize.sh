#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MASTER GAP AUDIT + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) HARD BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_gap_audit_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_gap_audit_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_gap_audit_${STAMP}.js"
cp db/aam.db "backups/aam_gap_audit_${STAMP}.db"

########################################
# 2) CORE HEALTH
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 3) ROUTE SMOKE TESTS
########################################
for route in \
  / \
  /public-home \
  /member-home \
  /role-hub \
  /heir-login \
  /progress \
  /command-core \
  /heirs \
  /heirs-ecosystem \
  /heir-operations \
  /heir-payouts \
  /heir-storefronts \
  /payout-cycles \
  /payout-automation \
  /heir-finance \
  /storefront-analytics \
  /scheduled-payout-jobs \
  /executive-dashboard \
  /scheduler-command \
  /world-explorer \
  /storefront-explorer \
  /wallet-center \
  /access-center \
  /creator-hub
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 4) SECURITY FLOW TESTS
########################################
curl -s -i -c "test_results/heir_cookie_${STAMP}.txt" \
  -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=1234" \
  > "test_results/heir_login_success_${STAMP}.txt" || true

curl -s -i \
  -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=9999" \
  > "test_results/heir_login_failure_${STAMP}.txt" || true

curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" \
  "http://127.0.0.1:4900/heir-dashboard/1" \
  > "test_results/heir_dashboard_auth_${STAMP}.txt" || true

curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" \
  "http://127.0.0.1:4900/heir-logout" \
  > "test_results/heir_logout_${STAMP}.txt" || true

########################################
# 5) WORLD / SOCKET TESTS
########################################
curl -s "http://127.0.0.1:5090/sync/1" > "test_results/socket_sync_1_${STAMP}.json" || true
curl -s "http://127.0.0.1:5090/check-access?sceneId=1&ownerType=avatar&ownerId=1" > "test_results/socket_access_1_${STAMP}.json" || true
curl -s "http://127.0.0.1:5090/emit?sceneId=1&avatarId=1&eventType=gap_audit_test&payload=%7B%22stamp%22%3A%22${STAMP}%22%7D" > "test_results/socket_emit_${STAMP}.json" || true

########################################
# 6) DATABASE COUNTS
########################################
sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "snapshots/heir_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_sessions from heir_sessions;" > "snapshots/heir_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallets from heir_wallets;" > "snapshots/heir_wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_earnings from heir_earnings;" > "snapshots/heir_earnings_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_revenue_rules from heir_revenue_rules;" > "snapshots/heir_revenue_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_payout_runs from heir_payout_runs;" > "snapshots/heir_payout_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_payout_items from heir_payout_items;" > "snapshots/heir_payout_items_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallet_mirror_tx from heir_wallet_mirror_tx;" > "snapshots/heir_wallet_mirror_tx_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_storefront_ownership from heir_storefront_ownership;" > "snapshots/heir_storefront_ownership_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storefront_analytics from storefront_analytics;" > "snapshots/storefront_analytics_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_cycles from payout_cycles;" > "snapshots/payout_cycles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_cycle_runs from payout_cycle_runs;" > "snapshots/payout_cycle_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_automation_rules from payout_automation_rules;" > "snapshots/payout_automation_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_automation_runs from payout_automation_runs;" > "snapshots/payout_automation_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scheduled_payout_jobs from scheduled_payout_jobs;" > "snapshots/scheduled_payout_jobs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scheduled_payout_job_runs from scheduled_payout_job_runs;" > "snapshots/scheduled_payout_job_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scheduled_payout_execution_log from scheduled_payout_execution_log;" > "snapshots/scheduled_payout_execution_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_balance_snapshots from heir_balance_snapshots;" > "snapshots/heir_balance_snapshots_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as security_audit_log from security_audit_log;" > "snapshots/security_audit_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as login_attempts from login_attempts;" > "snapshots/login_attempts_${STAMP}.json"

########################################
# 7) GAP / RISK SNAPSHOTS
########################################
sqlite3 -json db/aam.db "
select hr.id, hr.name,
  (select count(*) from heir_accounts ha where ha.heir_id=hr.id) as accounts,
  (select count(*) from heir_wallets hw where hw.heir_id=hr.id) as wallets,
  (select count(*) from heir_earnings he where he.heir_id=hr.id) as earnings_rows,
  (select count(*) from heir_storefront_ownership hso where hso.heir_id=hr.id) as ownership_rows,
  (select count(*) from heir_revenue_rules hrr where hrr.heir_id=hr.id) as revenue_rule_rows
from heirs_registry hr
order by hr.id;
" > "snapshots/heir_gap_matrix_${STAMP}.json"

sqlite3 -json db/aam.db "
select id, event_type, subject_type, subject_id, event_notes, created_at
from security_audit_log
order by id desc
limit 50;
" > "snapshots/security_audit_tail_${STAMP}.json"

sqlite3 -json db/aam.db "
select id, username, attempt_status, ip_address, created_at
from login_attempts
order by id desc
limit 50;
" > "snapshots/login_attempts_tail_${STAMP}.json"

sqlite3 -json db/aam.db "
select id, heir_id, session_status, logout_at, created_at
from heir_sessions
order by id desc
limit 50;
" > "snapshots/heir_sessions_tail_${STAMP}.json"

########################################
# 8) SIMPLE HTML PRESENCE CHECKS
########################################
python3 << 'PYEOF'
from pathlib import Path
root = Path.home() / "aam_full_system" / "test_results"
bad = []
for f in root.glob("*.txt"):
    try:
        txt = f.read_text(errors="ignore")
    except Exception:
        continue
    if "HTTP/1.1 500" in txt or "Cannot GET" in txt or "ReferenceError" in txt or "SyntaxError" in txt:
        bad.append({"file": f.name, "problem": "route_error"})
(Path.home() / "aam_full_system" / "snapshots" / "route_error_scan_latest.json").write_text(__import__("json").dumps(bad, indent=2))
print(f"[OK] route error scan complete: {len(bad)} issues")
PYEOF

########################################
# 9) FINAL REPORT
########################################
cat > "reports/master_gap_audit_${STAMP}.txt" <<REPORT
MASTER GAP AUDIT + STABILIZE REPORT
Timestamp: ${STAMP}

What was tested:
- service health
- JS syntax
- public routes
- member routes
- operator routes
- login success/failure flow
- logout flow
- socket sync/access/event flow
- database counts
- heir coverage matrix
- security audit activity
- login attempt activity
- basic route error scan

Purpose:
- detect critical gaps
- freeze current stable state
- create rollback confidence
- prepare final completion work
REPORT

echo "MASTER GAP AUDIT + STABILIZE COMPLETE: $STAMP"
echo "Report:"
echo "  reports/master_gap_audit_${STAMP}.txt"
echo "Check:"
echo "  cat snapshots/route_error_scan_latest.json"
echo "  cat snapshots/heir_gap_matrix_${STAMP}.json"
echo "  cat snapshots/security_audit_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/role-hub"
echo "  termux-open-url http://127.0.0.1:4900/executive-dashboard"
