#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

python <<'PY'
from pathlib import Path

p = Path("apps/dashboard.js")
text = p.read_text()

old = """    if (req.method === 'GET' && pathname.startsWith('/people/')) {
      const authUser = requireAuth(req, res, ['root', 'admin', 'operator', 'viewer']);
      if (!authUser) return;

    console.log('DEBUG_PATHNAME', req.method, pathname, req.url);
    if (pathname === '/join' || pathname === '/join/') {
      return serveJoinPage(res);
    }

    if (pathname === '/join-api' && req.method === 'POST') {
      return handleJoinApi(req, res);
    }

    const personId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPersonDetail(personId, authUser));
    }
"""

new = """    if (req.method === 'GET' && pathname.startsWith('/people/')) {
      const authUser = requireAuth(req, res, ['root', 'admin', 'operator', 'viewer']);
      if (!authUser) return;

      const personId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPersonDetail(personId, authUser));
    }

    if (pathname === '/join' || pathname === '/join/') {
      return serveJoinPage(res);
    }

    if (pathname === '/join-api' && req.method === 'POST') {
      return handleJoinApi(req, res);
    }
"""

if old in text:
    text = text.replace(old, new, 1)
else:
    raise SystemExit("Expected route block not found exactly")

text = text.replace("    console.log('DEBUG_PATHNAME', req.method, pathname, req.url);\n", "")

p.write_text(text)
print("dashboard.js route scope fixed")
PY

node -c apps/dashboard.js
bash scripts/safe_restart.sh
bash scripts/fix_life_world_startup.sh

echo
echo "=== TEST JOIN PAGE ==="
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Join Now" || true

echo
echo "=== TEST JOIN API ==="
curl -s -X POST http://127.0.0.1:4900/join-api \
  -H "Content-Type: application/json" \
  -d '{"username":"beta_user_test","referrer":"all_american_creator"}'
echo

echo
echo "=== REFERRAL FILE ==="
cat data/referrals/joins.json 2>/dev/null || true
