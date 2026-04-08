#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS AA OMNICARE + INDUSTRY HUBS START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_aa_${STAMP}.js"

########################################
# 1) CREATE TABLES
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
SQL

echo "[OK] all industry tables created"

########################################
# 2) PATCH DASHBOARD
########################################
python3 <<'PY2EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderOmniCareHubPage(req, user = null, message = '') {
  return htmlPage('OmniCare 360 Hub', `
    <main class="portal-main premium-main accessible-main">
      <section>
        <h1>OmniCare 360</h1>
        <p>${esc(message || 'Insurance, pharmacy, auto, and financial systems integrated.')}</p>
      </section>

      <section>
        <h2>Services</h2>
        <form method="POST" action="/omnicare/insurance-safe"><button>Create Insurance Policy</button></form>
        <form method="POST" action="/omnicare/pharmacy-safe"><button>Create Pharmacy Product</button></form>
        <form method="POST" action="/omnicare/auto-safe"><button>Create Auto System</button></form>
        <form method="POST" action="/omnicare/surety-safe"><button>Create Surety Bond</button></form>
        <form method="POST" action="/omnicare/factoring-safe"><button>Create Factoring Account</button></form>
        <form method="POST" action="/omnicare/automan-safe"><button>Create Automan System</button></form>
        <form method="POST" action="/omnicare/light-safe"><button>Create Lyons Light Tech</button></form>
      </section>
    </main>
  `, user);
}
"""

if "renderOmniCareHubPage" not in text:
    anchor = "function renderCommandCenterPage"
    text = text.replace(anchor, helper + "\n\n" + anchor, 1)

route = r"""
    if (req.method === 'GET' && pathname === '/omnicare-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderOmniCareHubPage(req, null, getQueryParam(req,'msg')||''));
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

if "pathname === '/omnicare-hub'" not in text:
    anchor = "pathname === '/command-center'"
    text = text.replace(anchor, route + "\n" + anchor, 1)

p.write_text(text)
print("[OK] OmniCare hub patched")
PY2EOF

########################################
# 3) RESTART
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 4) SMOKE TEST
########################################
curl -s -i http://127.0.0.1:4900/omnicare-hub > test_results/pass_aa_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/omnicare/insurance-safe > test_results/pass_aa_ins_${STAMP}.txt || true

########################################
# 5) STATUS
########################################
bash scripts/status.sh || true

echo "=== PASS AA COMPLETE ==="
