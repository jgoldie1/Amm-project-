#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

python <<'PY'
from pathlib import Path

p = Path("apps/dashboard.js")
text = p.read_text()

# remove debug log if present
text = text.replace("    console.log('DEBUG_PATHNAME', req.method, pathname, req.url);\n", "")
text = text.replace("console.log('DEBUG_PATHNAME', req.method, pathname, req.url);\n", "")

join_block = """
    if (pathname === '/join' || pathname === '/join/') {
      return serveJoinPage(res);
    }

    if (pathname === '/join-api' && req.method === 'POST') {
      return handleJoinApi(req, res);
    }

"""

# remove existing join block anywhere so we can reinsert cleanly
while "if (pathname === '/join' || pathname === '/join/')" in text:
    start = text.index("if (pathname === '/join' || pathname === '/join/')")
    end = text.index("if (pathname === '/join-api' && req.method === 'POST')", start)
    end = text.index("}", end) + 1
    # trim surrounding whitespace/newlines
    while end < len(text) and text[end] in "\r\n ":
        end += 1
    text = text[:start] + text[end:]

# insert join routes BEFORE the /people/ detail block
needle = "    if (req.method === 'GET' && pathname.startsWith('/people/')) {"
if needle not in text:
    raise SystemExit("Could not find /people/ route marker")

text = text.replace(needle, join_block + needle, 1)

p.write_text(text)
print("dashboard.js route scope fixed")
PY

echo
echo "=== VERIFY PATCH ==="
grep -n "serveJoinPage\|handleJoinApi\|/join\|/join-api" apps/dashboard.js || true
node -c apps/dashboard.js

echo
echo "=== RESTART + STABILIZE ==="
bash scripts/safe_restart.sh
bash scripts/fix_life_world_startup.sh

echo
echo "=== SMOKE TEST ==="
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

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
echo "join_route: CHECKED"
echo "join_api: CHECKED"
echo "stack: STABLE"
echo "freeze: SAVED"
echo "checkpoint: $STAMP"
