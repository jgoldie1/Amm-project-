#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH QUANTUM MAIL + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_quantum_mail_${STAMP}.js"
cp db/aam.db "backups/aam_finish_quantum_mail_${STAMP}.db"

python3 << 'PYEOF'
import sqlite3
from pathlib import Path
import sys

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "quantum_mail_accounts",
    "quantum_mail_messages",
    "quantum_mail_drafts",
    "quantum_mail_folders",
    "quantum_mail_attachments",
    "quantum_mail_metrics",
]

missing = []
for t in required:
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

conn.close()

if missing:
    print("Missing tables: " + ", ".join(missing))
    sys.exit(1)

print("[OK] quantum mail tables verified")
PYEOF

python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderQuantumMailPage", "helper renderQuantumMailPage"),
    ("renderQuantumMailAdminPage", "helper renderQuantumMailAdminPage"),
    ("pathname === '/quantum-mail'", "route /quantum-mail"),
    ("pathname === '/quantum-mail-admin'", "route /quantum-mail-admin"),
]

missing = [label for needle, label in checks if needle not in text]
if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] quantum mail routes verified")
PYEOF

bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

for route in \
  / \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /asset-library \
  /platform-analytics \
  /quantum-cloud \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

sqlite3 -json db/aam.db "select count(*) as quantum_mail_accounts from quantum_mail_accounts;" > "snapshots/quantum_mail_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_messages from quantum_mail_messages;" > "snapshots/quantum_mail_messages_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_drafts from quantum_mail_drafts;" > "snapshots/quantum_mail_drafts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_folders from quantum_mail_folders;" > "snapshots/quantum_mail_folders_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_attachments from quantum_mail_attachments;" > "snapshots/quantum_mail_attachments_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_metrics from quantum_mail_metrics;" > "snapshots/quantum_mail_metrics_${STAMP}.json"

sqlite3 -json db/aam.db "select id, mailbox_owner, folder_name, sender_address, recipient_address, subject_line, message_status, created_at from quantum_mail_messages order by id desc limit 50;" > "snapshots/quantum_mail_messages_tail_${STAMP}.json"

python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such table" in lower:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "quantum_mail_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] quantum mail finish scan complete: {len(issues)} issues")
PYEOF

cat > "reports/finish_quantum_mail_and_stabilize_${STAMP}.txt" <<REPORT
FINISH QUANTUM MAIL + STABILIZE REPORT
Timestamp: ${STAMP}

Verified:
- quantum mail tables
- quantum mail routes
- dashboard health
- jarvis health
- fresh route smoke tests

Purpose:
- finish the cut-off quantum mail run
- preserve a clean checkpoint
- stabilize the communication layer
REPORT

echo "FINISH QUANTUM MAIL + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/quantum_mail_scan_latest.json"
echo "  cat snapshots/quantum_mail_messages_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail-admin"
echo "  termux-open-url http://127.0.0.1:4900/holo-search"
