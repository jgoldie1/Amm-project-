#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS V DASHBOARD SYNTAX REPAIR START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_v_${STAMP}.js"

########################################
# 1) REMOVE BROKEN LITERAL TOKENS
########################################
python3 <<'PY2EOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

# remove literal backslash-n tokens accidentally inserted into JS
text = text.replace("\\n\\nfunction renderCommandCenterPage", "\n\nfunction renderCommandCenterPage")
text = text.replace("\\nfunction renderCommandCenterPage", "\nfunction renderCommandCenterPage")

# extra safety cleanup for any literal escaped newlines before function defs
text = text.replace("\\n\\nfunction render", "\n\nfunction render")
text = text.replace("\\nfunction render", "\nfunction render")

p.write_text(text)
print("[OK] broken literal newline tokens repaired")
PY2EOF

########################################
# 2) JS CHECK
########################################
bash scripts/check_js.sh

########################################
# 3) CLEAN RESTART
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 4) TARGETED SMOKE TEST
########################################
curl -s http://127.0.0.1:4900/health > test_results/pass_v_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_v_jarvis_health_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/studio-lab > test_results/pass_v_studio_lab_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/creator-tv > test_results/pass_v_creator_tv_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/homepage-showcase > test_results/pass_v_homepage_showcase_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/command-center > test_results/pass_v_command_center_${STAMP}.txt || true

########################################
# 5) SCAN
########################################
python3 <<PY3EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_v_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","pass_v_syntax_repair_scan_latest.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
print(json.dumps(issues, indent=2))
PY3EOF

########################################
# 6) STATUS + REPORT
########################################
bash scripts/status.sh || true

cat > "reports/pass_v_dashboard_syntax_repair_${STAMP}.txt" <<REPORT
PASS V DASHBOARD SYNTAX REPAIR REPORT
Timestamp: ${STAMP}

Fixed:
- removed invalid literal newline tokens inserted into dashboard.js
- restored valid JavaScript syntax
- restarted dashboard and jarvis
- reran targeted smoke tests for previously failing surfaces

Purpose:
- recover from Pass U patch corruption
- restore stable runtime cleanly
REPORT

echo "=== PASS V COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_v_syntax_repair_scan_latest.json"
echo "  cat reports/pass_v_dashboard_syntax_repair_${STAMP}.txt"
echo "  bash scripts/status.sh"
