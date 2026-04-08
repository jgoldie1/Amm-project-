#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== FIX JOIN ROUTE 404 ==="

python <<'PY'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
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
    else:
        text = text.replace(
            "app.use(bodyParser.json());",
            "app.use(bodyParser.json());\napp.use('/join', express.static('public/join'));",
            1
        )

p.write_text(text)
print("patched:", p)
PY

echo
echo "=== VERIFY DASHBOARD FILE ==="
grep -n "attachJoinApi\|/join" apps/dashboard.js || true
node -c apps/dashboard.js
node -c apps/join_api.js

echo
echo "=== RESTART ==="
bash scripts/safe_restart.sh
bash scripts/fix_life_world_startup.sh

echo
echo "=== TEST JOIN ROUTE ==="
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Who invited you|Join Now" || true

echo
echo "=== TEST JOIN API ==="
curl -s -X POST http://127.0.0.1:4900/join-api \
  -H "Content-Type: application/json" \
  -d '{"username":"beta_user_test","referrer":"all_american_creator"}'
echo
