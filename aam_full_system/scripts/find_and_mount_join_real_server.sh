#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== FIND REAL 4900 SERVER ==="
grep -Rni "4900\|Dashboard running on 4900\|service.: .aam-dashboard.\|express.static" . --include="*.js" --include="*.mjs" 2>/dev/null | head -n 80

echo
echo "=== CANDIDATE FILES ==="
find . -maxdepth 3 -type f \( -name "*.js" -o -name "*.mjs" \) | sort | grep -E "dashboard|server|index|app"

echo
echo "=== CHECK WHICH FILE WRITES DASHBOARD LOG ==="
grep -Rni "Dashboard running on 4900" . --include="*.js" --include="*.mjs" 2>/dev/null || true

TARGET=$(grep -Ril "Dashboard running on 4900" . --include="*.js" --include="*.mjs" 2>/dev/null | head -n 1)

if [ -z "$TARGET" ]; then
  echo "Could not auto-find real dashboard server file"
  exit 1
fi

echo
echo "REAL TARGET: $TARGET"

python <<PY
from pathlib import Path
p = Path("$TARGET")
text = p.read_text()

if "const { attachJoinApi } = require('./join_api');" not in text:
    text = text.replace(
        "const express = require('express');",
        "const express = require('express');\nconst { attachJoinApi } = require('./join_api');",
        1
    )

if "attachJoinApi(app);" not in text and "const app = express();" in text:
    text = text.replace(
        "const app = express();",
        "const app = express();\nattachJoinApi(app);",
        1
    )

if "app.use('/join', express.static('public/join'));" not in text:
    if "app.use(express.static('public'));" in text:
        text = text.replace(
            "app.use(express.static('public'));",
            "app.use(express.static('public'));\napp.use('/join', express.static('public/join'));",
            1
        )
    elif "app.use(bodyParser.json());" in text:
        text = text.replace(
            "app.use(bodyParser.json());",
            "app.use(bodyParser.json());\napp.use('/join', express.static('public/join'));",
            1
        )

p.write_text(text)
print("patched:", p)
PY

echo
echo "=== VERIFY TARGET CONTENT ==="
grep -n "attachJoinApi\|/join\|join-api" "$TARGET" || true
node -c "$TARGET"
node -c apps/join_api.js

echo
echo "=== RESTART ==="
bash scripts/safe_restart.sh
bash scripts/fix_life_world_startup.sh

echo
echo "=== TEST ==="
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Join Now" || true
echo
curl -s -X POST http://127.0.0.1:4900/join-api \
  -H "Content-Type: application/json" \
  -d '{"username":"beta_user_test","referrer":"all_american_creator"}'
echo
