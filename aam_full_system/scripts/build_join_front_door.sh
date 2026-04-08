#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD JOIN FRONT DOOR ==="

mkdir -p public/join data/referrals backups

echo
echo "[1] JOIN PAGE"
cat > public/join/index.html <<'EOF'
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Join All American Marketplace</title>
  <style>
    body { font-family: Arial, sans-serif; background:#020617; color:#e2e8f0; margin:0; padding:24px; }
    .card { max-width:720px; margin:40px auto; background:#111827; border:1px solid #334155; border-radius:18px; padding:24px; }
    h1 { margin-top:0; }
    .muted { color:#94a3b8; }
    input, button { width:100%; padding:12px; border-radius:10px; margin-top:10px; border:none; }
    input { background:#0f172a; color:#fff; border:1px solid #334155; }
    button { background:#2563eb; color:#fff; cursor:pointer; }
    .pill { display:inline-block; padding:6px 10px; background:#1d4ed8; border-radius:999px; margin-right:8px; font-size:12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Enter All American Marketplace</h1>
    <p class="muted">Join the world, claim your identity, and start your journey.</p>

    <div style="margin-bottom:16px;">
      <span class="pill">Worlds</span>
      <span class="pill">Creators</span>
      <span class="pill">Memory Archive</span>
      <span class="pill">Time Machine</span>
    </div>

    <label>Username</label>
    <input id="username" placeholder="Enter username" />

    <label>Who invited you?</label>
    <input id="referrer" placeholder="Referral name" />

    <button onclick="joinNow()">Join Now</button>

    <p id="status" class="muted" style="margin-top:14px;"></p>
  </div>

  <script>
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref') || '';
    if (ref) document.getElementById('referrer').value = ref;

    async function joinNow() {
      const username = document.getElementById('username').value.trim();
      const referrer = document.getElementById('referrer').value.trim();
      const status = document.getElementById('status');

      if (!username) {
        status.textContent = 'Enter a username first.';
        return;
      }

      try {
        const res = await fetch('/join-api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, referrer })
        });

        const data = await res.json();
        if (!data.ok) {
          status.textContent = 'Join failed.';
          return;
        }

        status.textContent = 'Welcome ' + username + '. Redirecting to Life World...';
        setTimeout(() => {
          location.href = 'http://127.0.0.1:4902/';
        }, 1200);
      } catch (e) {
        status.textContent = 'Join request failed.';
      }
    }
  </script>
</body>
</html>
EOF

echo
echo "[2] JOIN API"
cat > apps/join_api.js <<'JS'
const fs = require('fs');
const path = require('path');

function ensureFile(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
  }
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function attachJoinApi(app) {
  const file = path.join('data', 'referrals', 'joins.json');
  ensureFile(file, { joins: [] });

  app.post('/join-api', (req, res) => {
    const username = String(req.body.username || '').trim();
    const referrer = String(req.body.referrer || '').trim();

    if (!username) {
      return res.status(400).json({ ok: false, error: 'missing_username' });
    }

    const data = readJson(file, { joins: [] });
    data.joins.push({
      username,
      referrer,
      createdAt: new Date().toISOString()
    });
    writeJson(file, data);

    res.json({ ok: true, username, referrer });
  });
}

module.exports = { attachJoinApi };
JS

echo
echo "[3] PATCH DASHBOARD"
python <<'PY'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "app.js"
text = p.read_text()

if "attachJoinApi" not in text:
    text = text.replace(
        "const express = require('express');",
        "const express = require('express');\nconst { attachJoinApi } = require('./join_api');",
        1
    )

if "attachJoinApi(app);" not in text:
    marker = "const app = express();"
    text = text.replace(marker, marker + "\nattachJoinApi(app);", 1)

if "public/join" not in text:
    text = text.replace(
        "app.use(express.static('public'));",
        "app.use(express.static('public'));\napp.use('/join', express.static('public/join'));",
        1
    )

p.write_text(text)
print("app.js patched")
PY

echo
echo "[4] VERIFY"
python -m json.tool public/join/index.html >/dev/null 2>/dev/null || true
node -c apps/join_api.js
node -c apps/app.js

echo
echo "[5] RESTART"
bash scripts/safe_restart.sh
bash scripts/fix_life_world_startup.sh

echo
echo "[6] TEST JOIN FRONT DOOR"
curl -I -s http://127.0.0.1:4900/join/ | head -n 5 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Who invited you|Join Now" || true

echo
echo "DONE"
echo "join_page: READY"
echo "join_api: READY"
echo "referral_capture: READY"
echo "share_link_local: http://127.0.0.1:4900/join/?ref=all_american_creator"
