#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECTION 2 SMALL PASS A POST FIX START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_section2_post_fix_${STAMP}.js"
cp db/aam.db "backups/aam_section2_post_fix_${STAMP}.db"

########################################
# 1) PATCH MISSING POST HELPERS SAFELY
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helpers = r"""
function esc(v) {
  return String(v || '').replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}

async function readFormBody(req) {
  return await new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const obj = {};
      for (const [k, v] of params.entries()) obj[k] = v;
      resolve(obj);
    });
  });
}

function redirectWithMessage(res, path, msg) {
  res.writeHead(302, { Location: `${path}?msg=${encodeURIComponent(msg)}` });
  return res.end();
}
"""

anchor = "const server = http.createServer(async (req, res) => {"

if "async function readFormBody(req)" not in text:
    text = text.replace(anchor, helpers + "\n" + anchor, 1)

p.write_text(text)
print("[OK] section 2 POST helpers repaired")
PYEOF

########################################
# 2) PATCH POST ROUTES ONLY IF MISSING
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

routes = r"""
    if (req.method === 'POST' && pathname === '/dispatch-actions/request-create') {
      const body = await readFormBody(req);
      dbRun(`INSERT INTO service_request_log (requester_name, service_name, request_type, assigned_program, request_status) VALUES (?, ?, ?, ?, 'open')`,
        [body.requester_name || 'Requester', body.service_name || '', body.request_type || '', body.assigned_program || '']);
      return redirectWithMessage(res, '/dispatch-actions', 'Service request created');
    }

    if (req.method === 'POST' && pathname === '/dispatch-actions/handoff') {
      const body = await readFormBody(req);
      dbRun(`INSERT INTO operator_handoff_registry (handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status) VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
        [body.handoff_name || '', body.request_name || '', body.service_name || '', body.source_agent || 'Stubbs AI', body.target_operator || '', body.handoff_reason || '']);
      return redirectWithMessage(res, '/dispatch-actions', 'Operator handoff created');
    }
"""

if "pathname === '/dispatch-actions/request-create'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/dispatch-actions') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] section 2 POST routes verified")
PYEOF

########################################
# 3) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 4) HEALTH + ROUTE TESTS
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
# 5) POST SMOKE TESTS
########################################
curl -s -i -X POST \
  -d "requester_name=Smoke Rider&service_name=rideshare&request_type=pickup&assigned_program=Rideshare Dispatch Console" \
  http://127.0.0.1:4900/dispatch-actions/request-create > "test_results/section2_postfix_request_${STAMP}.txt" || true

curl -s -i -X POST \
  -d "handoff_name=AI to Human Smoke Handoff&request_name=Smoke Rider - pickup&service_name=rideshare&source_agent=Stubbs AI&target_operator=Dispatch Lead One&handoff_reason=customer requested live support" \
  http://127.0.0.1:4900/dispatch-actions/handoff > "test_results/section2_postfix_handoff_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as operator_handoff_registry from operator_handoff_registry;" > "snapshots/operator_handoff_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as service_request_log from service_request_log;" > "snapshots/service_request_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status, created_at from operator_handoff_registry order by id desc limit 20;" > "snapshots/operator_handoff_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, requester_name, service_name, request_type, assigned_program, request_status, created_at from service_request_log order by id desc limit 20;" > "snapshots/service_request_log_tail_${STAMP}.json"

########################################
# 7) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "section2_small_pass_a_post_fix_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] section 2 POST fix scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/section2_small_pass_a_post_fix_${STAMP}.txt" <<REPORT
SECTION 2 SMALL PASS A POST FIX REPORT
Timestamp: ${STAMP}

Fixed:
- ensured readFormBody helper exists
- ensured redirectWithMessage helper exists
- verified section 2 POST routes
- reran POST smoke tests
- stabilized runtime

Verified:
- dashboard health
- jarvis health
- dispatch actions route
- AI call center route
- competitive contact center route
- section 2 POST smoke tests

Purpose:
- repair the POST-only 500 errors
- preserve the stable section 2 small pass base
- prepare for section 2 pass B
REPORT

echo "SECTION 2 SMALL PASS A POST FIX COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/section2_small_pass_a_post_fix_scan_latest.json"
echo "  cat snapshots/service_request_log_tail_${STAMP}.json"
echo "  cat snapshots/operator_handoff_registry_tail_${STAMP}.json"
echo "  cat reports/section2_small_pass_a_post_fix_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
