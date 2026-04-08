#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SET MARKETPLACE FEE 20 + FINISH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_fee20_${STAMP}.js"
cp db/aam.db "backups/aam_fee20_${STAMP}.db"

########################################
# 2) SET PLATFORM FEE TO 20%
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS platform_fee_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fee_name TEXT NOT NULL,
  fee_type TEXT DEFAULT 'sale_percent',
  fee_value INTEGER DEFAULT 20,
  rule_scope TEXT DEFAULT 'creator_marketplace',
  rule_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
UPDATE platform_fee_rules
SET rule_status='inactive'
WHERE rule_scope='creator_marketplace'
""")

cur.execute("""
INSERT INTO platform_fee_rules
(fee_name, fee_type, fee_value, rule_scope, rule_status)
VALUES ('Marketplace Fee', 'sale_percent', 20, 'creator_marketplace', 'active')
""")

conn.commit()
conn.close()
print("[OK] platform fee set to 20 percent")
PYEOF

########################################
# 3) VERIFY / RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 4) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, fee_name, fee_type, fee_value, rule_scope, rule_status, created_at from platform_fee_rules where rule_scope='creator_marketplace' order by id desc limit 10;" > "snapshots/platform_fee_rules_${STAMP}.json"

########################################
# 5) FRESH-ONLY ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.json")):
    txt = f.read_text(errors="ignore").lower()
    if '"ok": true' not in txt and "dashboard_health" in f.name:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if '"ok": true' not in txt and "jarvis_health" in f.name:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "marketplace_fee20_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] marketplace fee20 scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) REPORT
########################################
cat > "reports/set_marketplace_fee_20_and_finish_${STAMP}.txt" <<REPORT
SET MARKETPLACE FEE 20 + FINISH REPORT
Timestamp: ${STAMP}

Fixed:
- creator marketplace platform fee now set to 20 percent

Purpose:
- increase platform share from marketplace sales
- preserve current runtime stability
- finish cleanly after interrupted script
REPORT

echo "SET MARKETPLACE FEE 20 + FINISH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/platform_fee_rules_${STAMP}.json"
echo "  cat snapshots/marketplace_fee20_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/creator-marketplace"
echo "  termux-open-url http://127.0.0.1:4900/fomo-engine"
echo "  termux-open-url http://127.0.0.1:4900/world-selector"
