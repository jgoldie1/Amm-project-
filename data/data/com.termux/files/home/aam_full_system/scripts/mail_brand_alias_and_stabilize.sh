#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MAIL BRAND ALIAS + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_mail_brand_alias_${STAMP}.js"
cp db/aam.db "backups/aam_mail_brand_alias_${STAMP}.db"

########################################
# 2) DB: BRAND REGISTRY
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS platform_brand_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  system_name TEXT NOT NULL,
  internal_name TEXT NOT NULL,
  public_name TEXT NOT NULL,
  brand_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("DELETE FROM platform_brand_registry WHERE system_name='mail_layer'")
cur.execute("""
INSERT INTO platform_brand_registry
(system_name, internal_name, public_name, brand_status)
VALUES
('mail_layer', 'Quantum Mail', 'LyonsMail', 'active')
""")

conn.commit()
conn.close()
print("[OK] platform brand registry ready")
PYEOF

########################################
# 3) PATCH DASHBOARD LABELS ONLY
########################################
python3 << 'PYEOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

text = text.replace(">Quantum Mail</a>", ">LyonsMail</a>")
text = text.replace("Quantum Mail Admin", "LyonsMail Admin")
text = text.replace("Quantum Mail", "LyonsMail")

p.write_text(text)
print("[OK] mail brand alias labels patched")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
########################################
for route in \
  / \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, system_name, internal_name, public_name, brand_status, created_at from platform_brand_registry order by id desc limit 20;" > "snapshots/platform_brand_registry_${STAMP}.json"

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
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "mail_brand_alias_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] mail brand alias scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/mail_brand_alias_and_stabilize_${STAMP}.txt" <<REPORT
MAIL BRAND ALIAS + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- platform_brand_registry
- public alias for mail layer

Branding:
- internal name stays Quantum Mail
- public name set to LyonsMail

Purpose:
- preserve working routes and tables
- reduce public naming risk
- stabilize branding before full rollout
REPORT

echo "MAIL BRAND ALIAS + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/mail_brand_alias_scan_latest.json"
echo "  cat snapshots/platform_brand_registry_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail-admin"
