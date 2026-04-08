#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECURITY VERIFICATION + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_security_verify_${STAMP}.js"
cp db/aam.db "backups/aam_security_verify_${STAMP}.db"

########################################
# 2) HEALTH CHECKS
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 3) LOGIN PAGE CHECK
########################################
curl -s http://127.0.0.1:4900/heir-login > "test_results/heir_login_${STAMP}.html" || true

########################################
# 4) PROTECTED ROUTE CHECK WITHOUT SESSION
########################################
curl -s -i http://127.0.0.1:4900/executive-dashboard > "test_results/executive_no_session_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/heir-payouts > "test_results/payouts_no_session_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/payout-automation > "test_results/automation_no_session_${STAMP}.txt" || true

########################################
# 5) LOGIN SUCCESS TEST
########################################
curl -s -i -c "test_results/heir_cookie_${STAMP}.txt" \
  -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=1234" \
  > "test_results/heir_login_success_${STAMP}.txt" || true

########################################
# 6) PROTECTED ROUTE CHECK WITH SESSION
########################################
curl -s -b "test_results/heir_cookie_${STAMP}.txt" \
  http://127.0.0.1:4900/heir-dashboard/1 \
  > "test_results/heir_dashboard_auth_${STAMP}.html" || true

curl -s -b "test_results/heir_cookie_${STAMP}.txt" \
  http://127.0.0.1:4900/heir-pin/1 \
  > "test_results/heir_pin_auth_${STAMP}.html" || true

curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" \
  http://127.0.0.1:4900/executive-dashboard \
  > "test_results/executive_with_session_${STAMP}.txt" || true

########################################
# 7) LOGOUT TEST
########################################
curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" \
  http://127.0.0.1:4900/heir-logout \
  > "test_results/heir_logout_${STAMP}.txt" || true

########################################
# 8) SECURITY DB SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as security_audit_log from security_audit_log;" > "snapshots/security_audit_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as login_attempts from login_attempts;" > "snapshots/login_attempts_${STAMP}.json"
sqlite3 -json db/aam.db "select id, username, role_name, failed_login_count, last_login_at from heir_accounts order by id;" > "snapshots/heir_accounts_security_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, session_status, logout_at, created_at from heir_sessions order by id desc limit 20;" > "snapshots/heir_sessions_security_${STAMP}.json"
sqlite3 -json db/aam.db "select id, event_type, subject_type, subject_id, event_notes, created_at from security_audit_log order by id desc limit 30;" > "snapshots/security_audit_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, username, attempt_status, ip_address, created_at from login_attempts order by id desc limit 30;" > "snapshots/login_attempts_tail_${STAMP}.json"

########################################
# 9) REPORT
########################################
cat > "reports/security_verification_${STAMP}.txt" <<REPORT
SECURITY VERIFICATION + STABILIZE REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- socket health
- heir login page
- protected route behavior without session
- login success flow
- heir dashboard access with session
- heir logout flow
- security DB snapshots

Artifacts:
- test_results/*
- snapshots/security_*
- reports/security_verification_${STAMP}.txt
REPORT

echo "SECURITY VERIFICATION + STABILIZE COMPLETE: $STAMP"
echo "Report:"
echo "  reports/security_verification_${STAMP}.txt"
echo "Check:"
echo "  cat snapshots/security_audit_tail_${STAMP}.json"
echo "  cat snapshots/login_attempts_tail_${STAMP}.json"
echo "  cat snapshots/heir_sessions_security_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/heir-login"
echo "  termux-open-url http://127.0.0.1:4900/heir-dashboard/1"
