#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== ADD JOIN ROUTES TO CUSTOM DASHBOARD ==="

python <<'PY'
from pathlib import Path

p = Path("apps/dashboard.js")
text = p.read_text()

if "function serveJoinPage" not in text:
    insert_block = r"""
function serveJoinPage(res) {
  const file = path.join(process.cwd(), 'public', 'join', 'index.html');
  try {
    const html = fs.readFileSync(file, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('join page missing');
  }
}

function handleJoinApi(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const username = String(payload.username || '').trim();
      const referrer = String(payload.referrer || '').trim();

      if (!username) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: 'missing_username' }));
      }

      const file = path.join(process.cwd(), 'data', 'referrals', 'joins.json');
      fs.mkdirSync(path.dirname(file), { recursive: true });

      let data = { joins: [] };
      try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {}

      data.joins = data.joins || [];
      data.joins.push({
        username,
        referrer,
        createdAt: new Date().toISOString()
      });

      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, username, referrer }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'join_api_failed' }));
    }
  });
}
"""
    marker = "function parseCookies(req) {"
    text = text.replace(marker, insert_block + "\n" + marker, 1)

route_block = r"""
    if (pathname === '/join' || pathname === '/join/') {
      return serveJoinPage(res);
    }

    if (pathname === '/join-api' && req.method === 'POST') {
      return handleJoinApi(req, res);
    }

"""

if "pathname === '/join'" not in text:
    target = "const personId = Number(pathname.split('/')[2]);"
    text = text.replace(target, route_block + "    " + target, 1)

p.write_text(text)
print("dashboard.js patched")
PY

echo
echo "=== VERIFY ==="
grep -n "serveJoinPage\|handleJoinApi\|/join\|/join-api" apps/dashboard.js || true
node -c apps/dashboard.js

echo
echo "=== RESTART ==="
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
