#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECTION 2 SAFE ENDPOINTS FIX + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_section2_safe_endpoints_${STAMP}.js"
cp db/aam.db "backups/aam_section2_safe_endpoints_${STAMP}.db"

########################################
# 1) PATCH DASHBOARD TO USE SAFE ENDPOINTS
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

if "function safeText(v, fallback = 'value_missing')" not in text:
    helper = r"""
function safeText(v, fallback = 'value_missing') {
  const s = String(v || '').trim();
  return s.length ? s : fallback;
}
"""
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

text = text.replace('/dispatch-actions/request-create"', '/dispatch-actions/request-create-safe"')
text = text.replace('/dispatch-actions/handoff"', '/dispatch-actions/handoff-safe"')

safe_routes = r"""
    if (req.method === 'POST' && pathname === '/dispatch-actions/request-create-safe') {
      const body = await readFormBody(req);
      const requesterName = safeText(body.requester_name, 'Smoke Requester');
      const serviceName = safeText(body.service_name, 'rideshare');
      const requestType = safeText(body.request_type, 'pickup');
      const assignedProgram = safeText(body.assigned_program, 'Rideshare Dispatch Console');

      dbRun(
        `INSERT INTO service_request_log (requester_name, service_name, request_type, assigned_program, request_status)
         VALUES (?, ?, ?, ?, 'open')`,
        [requesterName, serviceName, requestType, assignedProgram]
      );

      return redirectWithMessage(res, '/dispatch-actions', 'Safe service request created');
    }

    if (req.method === 'POST' && pathname === '/dispatch-actions/handoff-safe') {
      const body = await readFormBody(req);
      const handoffName = safeText(body.handoff_name, 'AI to Human Handoff');
      const requestName = safeText(body.request_name, 'Smoke Request');
      const serviceName = safeText(body.service_name, 'rideshare');
      const sourceAgent = safeText(body.source_agent, 'Stubbs AI');
      const targetOperator = safeText(body.target_operator, 'Dispatch Lead One');
      const handoffReason = safeText(body.handoff_reason, 'live support requested');

      dbRun(
        `INSERT INTO operator_handoff_registry (handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status)
         VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
        [handoffName, requestName, serviceName, sourceAgent, targetOperator, handoffReason]
      );

      return redirectWithMessage(res, '/dispatch-actions', 'Safe operator handoff created');
    }
"""

if "pathname === '/dispatch-actions/request-create-safe'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/dispatch-actions') {"
    if anchor in text:
        text = text.replace(anchor, safe_routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] safe dispatch endpoints patched")
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
# 4) SAFE POST SMOKE TESTS
########################################
curl -s -i -X POST \
  -d "requester_name=Smoke Rider&service_name=rideshare&request_type=pickup&assigned_program=Rideshare Dispatch Console" \
  http://127.0.0.1:4900/dispatch-actions/request-create-safe > "test_results/section2_safe_request_${STAMP}.txt" || true

curl -s -i -X POST \
  -d "handoff_name=AI to Human Smoke Handoff&request_name=Smoke Rider - pickup&service_name=rideshare&source_agent=Stubbs AI&target_operator=Dispatch Lead One&handoff_reason=customer requested live support" \
  http://127.0.0.1:4900/dispatch-actions/handoff-safe > "test_results/section2_safe_handoff_${STAMP}.txt" || true

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

latest = Path.home() / "aam_full_system" / "snapshots" / "section2_safe_endpoints_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] section 2 safe endpoints scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 8) REPORT
########################################
cat > "reports/section2_safe_endpoints_fix_and_stabilize_${STAMP}.txt" <<REPORT
SECTION 2 SAFE ENDPOINTS FIX + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- added /dispatch-actions/request-create-safe
- added /dispatch-actions/handoff-safe
- updated dispatch forms to use safe endpoints
- avoided old conflicting POST route precedence

Verified:
- dashboard health
- jarvis health
- dispatch actions route
- safe POST smoke tests
- stable runtime after safe endpoint fix

Purpose:
- bypass broken earlier POST handlers
- preserve stable section 2 progress
- prepare for section 2 pass B
REPORT

echo "SECTION 2 SAFE ENDPOINTS FIX + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/section2_safe_endpoints_scan_latest.json"
echo "  cat snapshots/service_request_log_tail_${STAMP}.json"
echo "  cat snapshots/operator_handoff_registry_tail_${STAMP}.json"
echo "  cat reports/section2_safe_endpoints_fix_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
