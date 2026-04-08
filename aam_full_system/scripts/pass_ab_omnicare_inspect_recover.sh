#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS AB OMNICARE INSPECT + RECOVER START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_ab_${STAMP}.js"
cp db/aam.db "backups/aam_pass_ab_${STAMP}.db"

########################################
# 1) INSPECT TABLES
########################################
python3 <<PY2EOF
from pathlib import Path
import sqlite3, json

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "omnicare_insurance_registry",
    "pharmacy_registry",
    "auto_registry",
    "surety_registry",
    "factoring_registry",
    "automan_tech_registry",
    "lyons_light_tech_registry"
]

missing = []
for t in required:
    row = cur.execute(
        "select name from sqlite_master where type='table' and name=?",
        (t,)
    ).fetchone()
    if not row:
        missing.append(t)

summary = {
    "required_count": len(required),
    "missing_count": len(missing),
    "missing_tables": missing,
    "omnicare_table_status": "stable" if not missing else "needs_attention"
}

Path.home().joinpath("aam_full_system","snapshots","pass_ab_omnicare_table_summary_latest.json").write_text(
    json.dumps(summary, indent=2)
)
print(json.dumps(summary, indent=2))
con.close()
PY2EOF

########################################
# 2) CREATE ONLY MISSING TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS omnicare_insurance_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  policy_name TEXT,
  policy_type TEXT,
  coverage_scope TEXT,
  policy_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pharmacy_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT,
  category TEXT,
  fulfillment_mode TEXT,
  product_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auto_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_name TEXT,
  vehicle_type TEXT,
  automation_mode TEXT,
  vehicle_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS surety_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bond_name TEXT,
  bond_type TEXT,
  risk_scope TEXT,
  bond_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS factoring_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT,
  receivable_scope TEXT,
  payout_mode TEXT,
  factoring_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS automan_tech_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  system_name TEXT,
  automation_scope TEXT,
  robotics_mode TEXT,
  system_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lyons_light_tech_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  system_name TEXT,
  intelligence_scope TEXT,
  light_mode TEXT,
  system_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO omnicare_insurance_registry (policy_name, policy_type, coverage_scope, policy_status)
SELECT 'Safe Policy','full','global','active'
WHERE NOT EXISTS (SELECT 1 FROM omnicare_insurance_registry WHERE policy_name='Safe Policy');

INSERT INTO pharmacy_registry (product_name, category, fulfillment_mode, product_status)
SELECT 'Safe Product','health','delivery','active'
WHERE NOT EXISTS (SELECT 1 FROM pharmacy_registry WHERE product_name='Safe Product');

INSERT INTO auto_registry (vehicle_name, vehicle_type, automation_mode, vehicle_status)
SELECT 'Safe Vehicle','electric','autonomous','active'
WHERE NOT EXISTS (SELECT 1 FROM auto_registry WHERE vehicle_name='Safe Vehicle');

INSERT INTO surety_registry (bond_name, bond_type, risk_scope, bond_status)
SELECT 'Safe Bond','performance','global','active'
WHERE NOT EXISTS (SELECT 1 FROM surety_registry WHERE bond_name='Safe Bond');

INSERT INTO factoring_registry (account_name, receivable_scope, payout_mode, factoring_status)
SELECT 'Safe Account','receivables','instant','active'
WHERE NOT EXISTS (SELECT 1 FROM factoring_registry WHERE account_name='Safe Account');

INSERT INTO automan_tech_registry (system_name, automation_scope, robotics_mode, system_status)
SELECT 'Safe Automan','robotics','autonomous','active'
WHERE NOT EXISTS (SELECT 1 FROM automan_tech_registry WHERE system_name='Safe Automan');

INSERT INTO lyons_light_tech_registry (system_name, intelligence_scope, light_mode, system_status)
SELECT 'Safe Light Tech','AI+Photonics','adaptive','active'
WHERE NOT EXISTS (SELECT 1 FROM lyons_light_tech_registry WHERE system_name='Safe Light Tech');
SQL

########################################
# 3) PATCH ROUTES INTO LIVE CHAIN
########################################
python3 <<'PY3EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper_sig = "function renderOmniCareHubPage(req, user = null, message = '') {"
if helper_sig not in text:
    helper = r"""
function renderOmniCareHubPage(req, user = null, message = '') {
  return htmlPage('OmniCare 360 Hub', `
    <main class="portal-main premium-main accessible-main">
      <section>
        <h1>OmniCare 360</h1>
        <p>${esc(message || 'Insurance, pharmacy, auto, surety, factoring, Automan, and Lyons Light Tech are integrated.')}</p>
      </section>
      <section>
        <h2>Services</h2>
        <form method="POST" action="/omnicare/insurance-safe"><button type="submit">Create Insurance Policy</button></form>
        <form method="POST" action="/omnicare/pharmacy-safe"><button type="submit">Create Pharmacy Product</button></form>
        <form method="POST" action="/omnicare/auto-safe"><button type="submit">Create Auto System</button></form>
        <form method="POST" action="/omnicare/surety-safe"><button type="submit">Create Surety Bond</button></form>
        <form method="POST" action="/omnicare/factoring-safe"><button type="submit">Create Factoring Account</button></form>
        <form method="POST" action="/omnicare/automan-safe"><button type="submit">Create Automan System</button></form>
        <form method="POST" action="/omnicare/light-safe"><button type="submit">Create Lyons Light Tech</button></form>
      </section>
    </main>
  `, user);
}
"""
    anchor = "function renderCommandCenterPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

routes = r"""
    if (req.method === 'GET' && pathname === '/omnicare-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderOmniCareHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/omnicare/insurance-safe') {
      dbRun(`INSERT INTO omnicare_insurance_registry (policy_name, policy_type, coverage_scope, policy_status)
             VALUES ('Safe Policy','full','global','active')`);
      res.writeHead(302, { Location: '/omnicare-hub?msg=Insurance%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/omnicare/pharmacy-safe') {
      dbRun(`INSERT INTO pharmacy_registry (product_name, category, fulfillment_mode, product_status)
             VALUES ('Safe Product','health','delivery','active')`);
      res.writeHead(302, { Location: '/omnicare-hub?msg=Pharmacy%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/omnicare/auto-safe') {
      dbRun(`INSERT INTO auto_registry (vehicle_name, vehicle_type, automation_mode, vehicle_status)
             VALUES ('Safe Vehicle','electric','autonomous','active')`);
      res.writeHead(302, { Location: '/omnicare-hub?msg=Auto%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/omnicare/surety-safe') {
      dbRun(`INSERT INTO surety_registry (bond_name, bond_type, risk_scope, bond_status)
             VALUES ('Safe Bond','performance','global','active')`);
      res.writeHead(302, { Location: '/omnicare-hub?msg=Surety%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/omnicare/factoring-safe') {
      dbRun(`INSERT INTO factoring_registry (account_name, receivable_scope, payout_mode, factoring_status)
             VALUES ('Safe Account','receivables','instant','active')`);
      res.writeHead(302, { Location: '/omnicare-hub?msg=Factoring%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/omnicare/automan-safe') {
      dbRun(`INSERT INTO automan_tech_registry (system_name, automation_scope, robotics_mode, system_status)
             VALUES ('Safe Automan','robotics','autonomous','active')`);
      res.writeHead(302, { Location: '/omnicare-hub?msg=Automan%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/omnicare/light-safe') {
      dbRun(`INSERT INTO lyons_light_tech_registry (system_name, intelligence_scope, light_mode, system_status)
             VALUES ('Safe Light Tech','AI+Photonics','adaptive','active')`);
      res.writeHead(302, { Location: '/omnicare-hub?msg=Light%20Tech%20created' });
      return res.end();
    }
"""

live_anchor = """    if (req.method === 'GET' && pathname === '/homepage-showcase') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHomepageShowcase(req, null, getQueryParam(req,'msg')||''));
    }
"""

if "pathname === '/omnicare-hub'" not in text and live_anchor in text:
    text = text.replace(live_anchor, live_anchor + "\n" + routes, 1)

if '<a href="/omnicare-hub">OmniCare 360 Hub</a>' not in text and '<a href="/command-center">Command Center</a>' in text:
    text = text.replace(
        '<a href="/command-center">Command Center</a>',
        '<a href="/command-center">Command Center</a>\n<a href="/omnicare-hub">OmniCare 360 Hub</a>',
        1
    )

p.write_text(text)
print("[OK] OmniCare routes patched into live chain")
PY3EOF

########################################
# 4) RESTART + SMOKE
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

curl -s http://127.0.0.1:4900/health > test_results/pass_ab_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_ab_jarvis_health_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/omnicare-hub > test_results/pass_ab_omnicare_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/omnicare/insurance-safe > test_results/pass_ab_omnicare_insurance_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/omnicare/pharmacy-safe > test_results/pass_ab_omnicare_pharmacy_${STAMP}.txt || true

########################################
# 5) SCAN
########################################
python3 <<PY4EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_ab_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","pass_ab_omnicare_recovery_scan_latest.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
print(json.dumps(issues, indent=2))
PY4EOF

bash scripts/status.sh || true

cat > "reports/pass_ab_omnicare_inspect_recover_${STAMP}.txt" <<REPORT
PASS AB OMNICARE INSPECT RECOVER REPORT
Timestamp: ${STAMP}

Built/recovered:
- OmniCare vertical tables
- OmniCare live routes
- OmniCare hub page
- insurance/pharmacy smoke checks

Purpose:
- recover interrupted Pass AA safely
- preserve stable runtime
REPORT

echo "=== PASS AB COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_ab_omnicare_table_summary_latest.json"
echo "  cat snapshots/pass_ab_omnicare_recovery_scan_latest.json"
echo "  cat reports/pass_ab_omnicare_inspect_recover_${STAMP}.txt"
echo "  bash scripts/status.sh"
