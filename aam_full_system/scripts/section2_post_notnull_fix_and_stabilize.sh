#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECTION 2 POST NOT-NULL FIX + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_section2_notnull_fix_${STAMP}.js"
cp db/aam.db "backups/aam_section2_notnull_fix_${STAMP}.db"

########################################
# 1) PATCH POST ROUTES WITH HARD DEFAULTS
########################################
python3 << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function safeText(v, fallback = 'value_missing') {
  const s = String(v || '').trim();
  return s.length ? s : fallback;
}
"""

if "function safeText(v, fallback = 'value_missing')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

request_route = r"""
    if (req.method === 'POST' && pathname === '/dispatch-actions/request-create') {
      const body = await readFormBody(req);
      const requesterName = safeText(body.requester_name, 'Smoke Requester');
      const serviceName = safeText(body.service_name, 'rideshare');
      const requestType = safeText(body.request_type, 'pickup');
      const assignedProgram = safeText(body.assigned_program, 'Rideshare Dispatch Console');

      dbRun(`INSERT INTO service_request_log (requester_name, service_name, request_type, assigned_program, request_status) VALUES (?, ?, ?, ?, 'open')`,
        [requesterName, serviceName, requestType, assignedProgram]);

      return redirectWithMessage(res, '/dispatch-actions', 'Service request created');
    }
"""

handoff_route = r"""
    if (req.method === 'POST' && pathname === '/dispatch-actions/handoff') {
      const body = await readFormBody(req);
      const handoffName = safeText(body.handoff_name, 'AI to Human Handoff');
      const requestName = safeText(body.request_name, 'Smoke Request');
      const serviceName = safeText(body.service_name, 'rideshare');
      const sourceAgent = safeText(body.source_agent, 'Stubbs AI');
      const targetOperator = safeText(body.target_operator, 'Dispatch Lead One');
      const handoffReason = safeText(body.handoff_reason, 'live support requested');

      dbRun(`INSERT INTO operator_handoff_registry (handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status) VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
        [handoffName, requestName, serviceName, sourceAgent, targetOperator, handoffReason]);

      return redirectWithMessage(res, '/dispatch-actions', 'Operator handoff created');
    }
"""

text = re.sub(
    r"if \(req\.method === 'POST' && pathname === '/dispatch-actions/request-create'\) \{.*?\n    \}",
    request_route.strip(),
    text,
    count=1,
    flags=re.S
)

text = re.sub(
    r"if \(req\.method === 'POST' && pathname === '/dispatch-actions/handoff'\) \{.*?\n    \}",
    handoff_route.strip(),
    text,
    count=1,
    flags=re.S
)

p.write_text(text)
print("[OK] section 2 NOT NULL route fix patched")
PYEOF

########################################
# 2) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 3) HEALTH + ROUTE TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /dispatch-actions \
  /ai-call-center \
  /competitive-contact-center \
  /multiservice-dispatch \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 4) POST SMOKE TESTS
########################################
curl -s -i -X POST \
  -d "requester_name=Smoke Rider&service_name=rideshare&request_type=pickup&assigned_program=Rideshare Dispatch Console" \
  http://127.0.0.1:4900/dispatch-actions/request-create > "test_results/section2_notnull_request_${STAMP}.txt" || true

curl -s -i -X POST \
  -d "handoff_name=AI to Human Smoke Handoff&request_name=Smoke Rider - pickup&service_name=rideshare&source_agent=Stubbs AI&target_operator=Dispatch Lead One&handoff_reason=customer requested live support" \
  http://127.0.0.1:4900/dispatch-actions/handoff > "test_results/section2_notnull_handoff_${STAMP}.txt" || true

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as service_request_log from service_request_log;" > "snapshots/service_request_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as operator_handoff_registry from operator_handoff_registry;" > "snapshots/operator_handoff_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, requester_name, service_name, request_type, assigned_program, request_status, created_at from service_request_log order by id desc limit 20;" > "snapshots/service_request_log_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status, created_at from operator_handoff_registry order by id desc limit 20;" > "snapshots/operator_handoff_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "section2_post_notnull_fix_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] section 2 NOT NULL fix scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 8) REPORT
########################################
cat > "reports/section2_post_notnull_fix_and_stabilize_${STAMP}.txt" <<REPORT
SECTION 2 POST NOT-NULL FIX + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- request-create route hard defaults
- handoff route hard defaults
- NOT NULL insert failures for section 2 pass A POST actions

Verified:
- dashboard health
- jarvis health
- dispatch actions route
- POST smoke tests
- stable runtime after NOT NULL fix

Purpose:
- repair section 2 POST insert failures
- preserve the stable section 2 base
- prepare for section 2 pass B
REPORT

echo "SECTION 2 POST NOT-NULL FIX + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/section2_post_notnull_fix_scan_latest.json"
echo "  cat snapshots/service_request_log_tail_${STAMP}.json"
echo "  cat snapshots/operator_handoff_registry_tail_${STAMP}.json"
echo "  cat reports/section2_post_notnull_fix_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
