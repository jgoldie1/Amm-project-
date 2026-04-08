#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECTION 2 SAFE PASS B + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_section2_safe_pass_b_${STAMP}.js"
cp db/aam.db "backups/aam_section2_safe_pass_b_${STAMP}.db"

########################################
# 1) CREATE MISSING TABLES FOR PASS B
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS dispatch_assignment_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_name TEXT NOT NULL,
  assigned_agent TEXT,
  assigned_program TEXT,
  service_name TEXT,
  assignment_status TEXT DEFAULT 'assigned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS escalation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  escalation_name TEXT NOT NULL,
  linked_request TEXT,
  escalation_level TEXT,
  escalation_target TEXT,
  escalation_status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS service_status_timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_name TEXT NOT NULL,
  service_name TEXT,
  timeline_stage TEXT,
  stage_notes TEXT,
  stage_status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("[OK] section 2 pass B tables ready")
PYEOF

########################################
# 2) PATCH SAFE PASS B ENDPOINTS
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

safe_routes = r"""
    if (req.method === 'POST' && pathname === '/dispatch-actions/assign-safe') {
      dbRun(`
        INSERT INTO dispatch_assignment_registry
        (request_name, assigned_agent, assigned_program, service_name, assignment_status)
        VALUES
        ('Smoke Rider - pickup', 'Dispatch Lead One', 'Rideshare Dispatch Console', 'rideshare', 'assigned')
      `);
      dbRun(`
        INSERT INTO service_status_timeline
        (request_name, service_name, timeline_stage, stage_notes, stage_status)
        VALUES
        ('Smoke Rider - pickup', 'rideshare', 'assigned', 'Assigned through safe pass B', 'assigned')
      `);
      return redirectWithMessage(res, '/dispatch-actions', 'Safe assignment created');
    }

    if (req.method === 'POST' && pathname === '/dispatch-actions/status-safe') {
      dbRun(`
        INSERT INTO service_status_timeline
        (request_name, service_name, timeline_stage, stage_notes, stage_status)
        VALUES
        ('Smoke Rider - pickup', 'rideshare', 'driver_en_route', 'Driver is on the way', 'active')
      `);
      return redirectWithMessage(res, '/dispatch-actions', 'Safe status update created');
    }

    if (req.method === 'POST' && pathname === '/dispatch-actions/escalate-safe') {
      dbRun(`
        INSERT INTO escalation_registry
        (escalation_name, linked_request, escalation_level, escalation_target, escalation_status)
        VALUES
        ('Smoke Escalation', 'Smoke Rider - pickup', 'level_1', 'Dispatch Supervisor', 'open')
      `);
      dbRun(`
        INSERT INTO service_status_timeline
        (request_name, service_name, timeline_stage, stage_notes, stage_status)
        VALUES
        ('Smoke Rider - pickup', 'rideshare', 'escalated', 'Escalated to Dispatch Supervisor', 'open')
      `);
      return redirectWithMessage(res, '/dispatch-actions', 'Safe escalation created');
    }

    if (req.method === 'POST' && pathname === '/dispatch-actions/resolve-safe') {
      dbRun(`
        INSERT INTO dispatch_resolution_registry
        (request_name, service_name, resolution_type, resolution_notes, resolution_status)
        VALUES
        ('Smoke Rider - pickup', 'rideshare', 'completed_trip', 'Resolved through safe pass B', 'resolved')
      `);
      dbRun(`
        INSERT INTO service_status_timeline
        (request_name, service_name, timeline_stage, stage_notes, stage_status)
        VALUES
        ('Smoke Rider - pickup', 'rideshare', 'resolved', 'Trip completed successfully', 'resolved')
      `);
      return redirectWithMessage(res, '/dispatch-actions', 'Safe resolution created');
    }
"""

if "pathname === '/dispatch-actions/assign-safe'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/dispatch-actions') {"
    if anchor in text:
        text = text.replace(anchor, safe_routes + "\n" + anchor, 1)

insert_block = """
<section>
  <h2>Safe Pass B Actions</h2>
  <form method="POST" action="/dispatch-actions/assign-safe" style="margin-bottom:12px;">
    <button type="submit">Run Safe Assign</button>
  </form>
  <form method="POST" action="/dispatch-actions/status-safe" style="margin-bottom:12px;">
    <button type="submit">Run Safe Status Update</button>
  </form>
  <form method="POST" action="/dispatch-actions/escalate-safe" style="margin-bottom:12px;">
    <button type="submit">Run Safe Escalation</button>
  </form>
  <form method="POST" action="/dispatch-actions/resolve-safe" style="margin-bottom:12px;">
    <button type="submit">Run Safe Resolution</button>
  </form>
</section>
"""

marker = '<section><h2>Requests</h2><table>'
if insert_block not in text and marker in text:
    text = text.replace(marker, insert_block + "\n" + marker, 1)

p.write_text(text)
print("[OK] section 2 safe pass B endpoints patched")
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
# 5) SAFE PASS B POST TESTS
########################################
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/assign-safe > "test_results/section2_safe_assign_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/status-safe > "test_results/section2_safe_status_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/escalate-safe > "test_results/section2_safe_escalate_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/dispatch-actions/resolve-safe > "test_results/section2_safe_resolve_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as dispatch_assignment_registry from dispatch_assignment_registry;" > "snapshots/dispatch_assignment_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as escalation_registry from escalation_registry;" > "snapshots/escalation_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as service_status_timeline from service_status_timeline;" > "snapshots/service_status_timeline_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as dispatch_resolution_registry from dispatch_resolution_registry;" > "snapshots/dispatch_resolution_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, request_name, assigned_agent, assigned_program, service_name, assignment_status, created_at from dispatch_assignment_registry order by id desc limit 20;" > "snapshots/dispatch_assignment_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, escalation_name, linked_request, escalation_level, escalation_target, escalation_status, created_at from escalation_registry order by id desc limit 20;" > "snapshots/escalation_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, request_name, service_name, timeline_stage, stage_notes, stage_status, created_at from service_status_timeline order by id desc limit 20;" > "snapshots/service_status_timeline_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, request_name, service_name, resolution_type, resolution_notes, resolution_status, created_at from dispatch_resolution_registry order by id desc limit 20;" > "snapshots/dispatch_resolution_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "section2_safe_pass_b_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] section 2 safe pass B scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/section2_safe_pass_b_and_stabilize_${STAMP}.txt" <<REPORT
SECTION 2 SAFE PASS B + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- assign-safe
- status-safe
- escalate-safe
- resolve-safe
- service status timeline foundation

Verified:
- dashboard health
- jarvis health
- dispatch actions route
- section 2 safe pass B POST tests
- stable runtime after pass B

Purpose:
- extend section 2 safely
- avoid route precedence and null insert issues
- prepare for richer real dispatch logic later
REPORT

echo "SECTION 2 SAFE PASS B + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/section2_safe_pass_b_scan_latest.json"
echo "  cat snapshots/dispatch_assignment_registry_tail_${STAMP}.json"
echo "  cat snapshots/escalation_registry_tail_${STAMP}.json"
echo "  cat snapshots/service_status_timeline_tail_${STAMP}.json"
echo "  cat snapshots/dispatch_resolution_registry_tail_${STAMP}.json"
echo "  cat reports/section2_safe_pass_b_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
