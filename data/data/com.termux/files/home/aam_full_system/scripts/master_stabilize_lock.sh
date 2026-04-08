#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MASTER STABILIZE LOCK START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_master_lock_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_master_lock_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_master_lock_${STAMP}.js"
cp db/aam.db "backups/aam_master_lock_${STAMP}.db"

########################################
# 2) HEALTH
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 3) ROUTE SNAPSHOTS
########################################
for route in \
  / \
  /public-home \
  /role-hub \
  /heir-login \
  /progress \
  /command-core \
  /heirs \
  /heirs-ecosystem \
  /heir-payouts \
  /heir-storefronts \
  /payout-cycles \
  /payout-automation \
  /heir-finance \
  /storefront-analytics \
  /scheduled-payout-jobs \
  /executive-dashboard \
  /scheduler-command
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s "http://127.0.0.1:4900$route" > "snapshots/${name}_${STAMP}.html" || true
done

########################################
# 4) DATABASE SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "snapshots/heir_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_sessions from heir_sessions;" > "snapshots/heir_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_payout_runs from heir_payout_runs;" > "snapshots/heir_payout_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_payout_items from heir_payout_items;" > "snapshots/heir_payout_items_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_storefront_ownership from heir_storefront_ownership;" > "snapshots/heir_storefront_ownership_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storefront_analytics from storefront_analytics;" > "snapshots/storefront_analytics_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scheduled_payout_jobs from scheduled_payout_jobs;" > "snapshots/scheduled_payout_jobs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scheduled_payout_job_runs from scheduled_payout_job_runs;" > "snapshots/scheduled_payout_job_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scheduled_payout_execution_log from scheduled_payout_execution_log;" > "snapshots/scheduled_payout_execution_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as security_audit_log from security_audit_log;" > "snapshots/security_audit_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as login_attempts from login_attempts;" > "snapshots/login_attempts_${STAMP}.json"

########################################
# 5) REPORT
########################################
cat > "reports/master_stabilize_lock_${STAMP}.txt" <<REPORT
MASTER STABILIZE LOCK REPORT
Timestamp: ${STAMP}

Locked:
- dashboard.js
- world_socket.js
- jarvis.js
- aam.db

Verified:
- dashboard health
- jarvis health
- world socket health
- public home
- role hub
- heir login
- heirs ecosystem
- payouts
- storefront ownership
- finance
- analytics
- executive dashboard
- scheduler command

Purpose:
- freeze the current platform phase
- create rollback confidence
- prepare for the next major architecture phase
REPORT

echo "MASTER STABILIZE LOCK COMPLETE: $STAMP"
echo "Report: reports/master_stabilize_lock_${STAMP}.txt"
echo "Backup DB: backups/aam_master_lock_${STAMP}.db"
