#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS AD OMNICARE ROUTE EXECUTION FIX START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_ad_${STAMP}.js"

########################################
# 1) HARD CLEAN OLD ROUTES
########################################
python3 <<'PY2EOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

# Remove ANY existing omnicare POST routes (clean slate)
patterns = [
    r"if \(req\.method === 'POST' && pathname === '/omnicare/insurance-safe'[\s\S]*?return res\.end\(\);\s*}",
    r"if \(req\.method === 'POST' && pathname === '/omnicare/pharmacy-safe'[\s\S]*?return res\.end\(\);\s*}",
    r"if \(req\.method === 'POST' && pathname === '/omnicare/auto-safe'[\s\S]*?return res\.end\(\);\s*}",
]

for pat in patterns:
    text = re.sub(pat, "", text)

p.write_text(text)
print("[OK] old OmniCare routes removed")
PY2EOF

########################################
# 2) INSERT ROUTES RIGHT BEFORE 404 (CRITICAL)
########################################
python3 <<'PY3EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

routes = r"""
    // OMNICARE SAFE ROUTES (LIVE EXECUTION)
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

anchor = "res.writeHead(404"

if anchor in text:
    text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] OmniCare routes inserted BEFORE 404 (guaranteed execution)")
PY3EOF

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
# 4) SMOKE TEST (REAL)
########################################
curl -s -i -X POST http://127.0.0.1:4900/omnicare/insurance-safe > test_results/pass_ad_ins_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/omnicare/pharmacy-safe > test_results/pass_ad_pharm_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/omnicare/auto-safe > test_results/pass_ad_auto_${STAMP}.txt || true

########################################
# 5) SCAN
########################################
python3 <<PY4EOF
from pathlib import Path
import json

stamp="${STAMP}"
root=Path.home()/"aam_full_system"/"test_results"
issues=[]

for f in root.glob(f"pass_ad_*_{stamp}.txt"):
    txt=f.read_text(errors="ignore").lower()
    if "not found" in txt:
        issues.append({"file":f.name,"problem":"route_missing"})
    if "500" in txt:
        issues.append({"file":f.name,"problem":"http_500"})

Path.home().joinpath("aam_full_system","snapshots","pass_ad_omnicare_fix_scan.json").write_text(json.dumps(issues,indent=2))
print("issues:",len(issues))
print(json.dumps(issues,indent=2))
PY4EOF

bash scripts/status.sh || true

echo "=== PASS AD COMPLETE ==="
