#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS AC OMNICARE FINAL FIX START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_ac_${STAMP}.js"
cp db/aam.db "backups/aam_pass_ac_${STAMP}.db"

########################################
# 1) FORCE CREATE TABLES (FIX)
########################################
sqlite3 db/aam.db <<SQL
DROP TABLE IF EXISTS omnicare_insurance_registry;
DROP TABLE IF EXISTS pharmacy_registry;
DROP TABLE IF EXISTS auto_registry;

CREATE TABLE omnicare_insurance_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  policy_name TEXT,
  policy_type TEXT,
  coverage_scope TEXT,
  policy_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pharmacy_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT,
  category TEXT,
  fulfillment_mode TEXT,
  product_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auto_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_name TEXT,
  vehicle_type TEXT,
  automation_mode TEXT,
  vehicle_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO omnicare_insurance_registry (policy_name, policy_type, coverage_scope, policy_status)
VALUES ('Safe Policy','full','global','active');

INSERT INTO pharmacy_registry (product_name, category, fulfillment_mode, product_status)
VALUES ('Safe Product','health','delivery','active');

INSERT INTO auto_registry (vehicle_name, vehicle_type, automation_mode, vehicle_status)
VALUES ('Safe Vehicle','electric','autonomous','active');
SQL

########################################
# 2) HARD PATCH ROUTES (TOP PRIORITY POSITION)
########################################
python3 <<'PY2EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

# REMOVE BAD DUPLICATES FIRST
for bad in [
    "/omnicare/insurance-safe",
    "/omnicare/pharmacy-safe",
    "/omnicare/auto-safe"
]:
    text = text.replace(bad, f"{bad}_OLD")

# INSERT CLEAN ROUTES EARLY (BEFORE 404)
anchor = "res.writeHead(404"

routes = r"""
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
"""

if anchor in text:
    text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] OmniCare routes FIXED at correct position")
PY2EOF

########################################
# 3) RESTART CLEAN
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 4) SMOKE TEST (CRITICAL)
########################################
curl -s -i -X POST http://127.0.0.1:4900/omnicare/insurance-safe > test_results/pass_ac_ins_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/omnicare/pharmacy-safe > test_results/pass_ac_pharm_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/omnicare/auto-safe > test_results/pass_ac_auto_${STAMP}.txt || true

########################################
# 5) SCAN
########################################
python3 <<PY3EOF
from pathlib import Path
import json

stamp="${STAMP}"
root=Path.home()/"aam_full_system"/"test_results"
issues=[]

for f in root.glob(f"pass_ac_*_{stamp}.txt"):
    txt=f.read_text(errors="ignore").lower()
    if "not found" in txt:
        issues.append({"file":f.name,"problem":"route_missing"})
    if "500" in txt:
        issues.append({"file":f.name,"problem":"http_500"})

Path.home().joinpath("aam_full_system","snapshots","pass_ac_omnicare_fix_scan.json").write_text(json.dumps(issues,indent=2))
print("issues:",len(issues))
print(json.dumps(issues,indent=2))
PY3EOF

bash scripts/status.sh || true

echo "=== PASS AC COMPLETE ==="
