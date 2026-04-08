#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX CRYPTO DUPLICATE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

cp apps/dashboard.js "backups/dashboard_before_crypto_fix_${STAMP}.js"
cp db/aam.db "backups/aam_before_crypto_fix_${STAMP}.db"

python3 << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

# Keep only the first crypto require
matches = list(re.finditer(r"const crypto = require\('crypto'\);", text))
if len(matches) > 1:
    first_start = matches[0].start()
    first_end = matches[0].end()
    before = text[:first_end]
    after = text[first_end:]
    after = re.sub(r"\n?const crypto = require\('crypto'\);", "", after)
    text = before + after

# Keep only the first fs require if duplicated
matches_fs = list(re.finditer(r"const fs = require\('fs'\);", text))
if len(matches_fs) > 1:
    first_start = matches_fs[0].start()
    first_end = matches_fs[0].end()
    before = text[:first_end]
    after = text[first_end:]
    after = re.sub(r"\n?const fs = require\('fs'\);", "", after)
    text = before + after

# Keep only the first path require if duplicated
matches_path = list(re.finditer(r"const path = require\('path'\);", text))
if len(matches_path) > 1:
    first_start = matches_path[0].start()
    first_end = matches_path[0].end()
    before = text[:first_end]
    after = text[first_end:]
    after = re.sub(r"\n?const path = require\('path'\);", "", after)
    text = before + after

p.write_text(text)
print("[OK] duplicate require cleanup complete")
PYEOF

bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "snapshots/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "snapshots/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "snapshots/socket_health_${STAMP}.json" || true

cat > "reports/crypto_duplicate_fix_${STAMP}.txt" <<REPORT
CRYPTO DUPLICATE FIX REPORT
Timestamp: ${STAMP}

Fixed:
- duplicate const crypto require
- duplicate const fs require if present
- duplicate const path require if present

Then:
- JS syntax checked
- services restarted
- health snapshots collected
REPORT

echo "FIX CRYPTO DUPLICATE + STABILIZE COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heir-login"
echo "  termux-open-url http://127.0.0.1:4900/executive-dashboard"
echo "  termux-open-url http://127.0.0.1:4900/heir-logout"
