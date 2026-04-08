#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

python <<'PY'
from pathlib import Path

p = Path("apps/dashboard.js")
text = p.read_text()

# add fs/path requires if missing
if "const fs = require('fs');" not in text:
    text = "const fs = require('fs');\n" + text

if "const path = require('path');" not in text:
    text = "const path = require('path');\n" + text

p.write_text(text)
print("dashboard.js imports fixed")
PY

echo
echo "=== VERIFY FILES EXIST ==="
test -f public/join/index.html && echo "public/join/index.html: OK" || echo "public/join/index.html: MISSING"
test -f apps/join_api.js && echo "apps/join_api.js: OK" || echo "apps/join_api.js: MISSING"

echo
echo "=== VERIFY SYNTAX ==="
node -c apps/dashboard.js
node -c apps/join_api.js

echo
echo "=== RESTART + STABILIZE ==="
bash scripts/safe_restart.sh
bash scripts/fix_life_world_startup.sh

echo
echo "=== TEST JOIN PAGE ==="
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Join Now|Who invited you" || true

echo
echo "=== TEST JOIN API ==="
curl -s -X POST http://127.0.0.1:4900/join-api \
  -H "Content-Type: application/json" \
  -d '{"username":"beta_user_test","referrer":"all_american_creator"}'
echo

echo
echo "=== REFERRAL FILE ==="
cat data/referrals/joins.json 2>/dev/null || true

echo
echo "=== SMOKE TEST ==="
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "=== FREEZE CHECKPOINT ==="
mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)
curl -s http://127.0.0.1:4900/join/ > snapshots/final/join_${STAMP}.html
curl -s http://127.0.0.1:4900/ -L > snapshots/final/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ > snapshots/final/life_world_${STAMP}.html
cp data/referrals/joins.json snapshots/final/joins_${STAMP}.json 2>/dev/null || true
cp data/memory/memory_archive.json snapshots/final/memory_archive_${STAMP}.json
cp data/feedback/beta_reports.json snapshots/final/beta_reports_${STAMP}.json

echo
echo "FINAL STATUS"
echo "join_page: FIXED_OR_CHECKED"
echo "join_api: FIXED_OR_CHECKED"
echo "stack: STABLE"
echo "freeze: SAVED"
echo "checkpoint: $STAMP"
