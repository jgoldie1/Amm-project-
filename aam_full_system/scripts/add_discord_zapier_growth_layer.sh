#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== ADD DISCORD + ZAPIER GROWTH LAYER ==="

mkdir -p data/integrations services/integrations logs

echo
echo "[1] WRITE INTEGRATION CONFIG"
cat > data/integrations/discord_zapier_config.json <<'EOF'
{
  "discord": {
    "enabled": true,
    "server_role": "beta_growth_hub",
    "channels": {
      "announcements": "#announcements",
      "new_users": "#new-users",
      "referrals": "#referrals",
      "episodes": "#episodes",
      "debates": "#debates"
    },
    "webhook_url": "PASTE_DISCORD_WEBHOOK_URL_HERE"
  },
  "zapier": {
    "enabled": true,
    "incoming_webhook_url": "PASTE_ZAPIER_WEBHOOK_URL_HERE",
    "events": [
      "new_user_signup",
      "new_referral",
      "new_episode",
      "new_debate",
      "new_gift_event"
    ]
  }
}
EOF

echo
echo "[2] WRITE EVENT RELAY"
cat > services/integrations/discord_zapier_relay.js <<'JS'
const fs = require('fs');
const https = require('https');
const http = require('http');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function postJson(url, payload) {
  return new Promise((resolve) => {
    if (!url || url.includes('PASTE_')) {
      return resolve({ ok: false, skipped: true, reason: 'missing webhook url' });
    }

    const u = new URL(url);
    const data = JSON.stringify(payload);
    const lib = u.protocol === 'https:' ? https : http;

    const req = lib.request({
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ ok: true, status: res.statusCode, body }));
    });

    req.on('error', (err) => resolve({ ok: false, error: String(err) }));
    req.write(data);
    req.end();
  });
}

async function main() {
  const cfg = readJson('data/integrations/discord_zapier_config.json', {});
  const event = process.argv[2] || 'test_event';
  const details = process.argv.slice(3).join(' ') || 'no details';

  const payload = {
    event,
    details,
    at: new Date().toISOString()
  };

  const discordPayload = {
    content: `**${event}**\n${details}\n${payload.at}`
  };

  const zapierPayload = payload;

  const discordRes = await postJson(cfg.discord?.webhook_url, discordPayload);
  const zapierRes = await postJson(cfg.zapier?.incoming_webhook_url, zapierPayload);

  console.log(JSON.stringify({
    ok: true,
    event,
    discord: discordRes,
    zapier: zapierRes
  }, null, 2));
}

main();
JS

echo
echo "[3] WRITE GROWTH EVENT LOG"
cat > services/integrations/log_growth_event.js <<'JS'
const fs = require('fs');
const path = require('path');

const file = path.join('data', 'integrations', 'growth_events.json');
let data = { events: [] };

try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch {}

const event = {
  type: process.argv[2] || 'test_event',
  detail: process.argv.slice(3).join(' ') || 'no detail',
  at: new Date().toISOString()
};

data.events.push(event);
fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(JSON.stringify({ ok: true, logged: event }, null, 2));
JS

echo
echo "[4] VERIFY FILES"
python -m json.tool data/integrations/discord_zapier_config.json >/dev/null && echo "discord_zapier_config.json: OK"
node -c services/integrations/discord_zapier_relay.js
node -c services/integrations/log_growth_event.js

echo
echo "[5] SEED TEST EVENTS"
node services/integrations/log_growth_event.js new_user_signup "beta_user_002 joined with ref founding_heir"
node services/integrations/log_growth_event.js new_episode "Arrival in Bethlehem published"
node services/integrations/log_growth_event.js new_debate "Faith vs Culture scheduled"
node services/integrations/discord_zapier_relay.js new_user_signup "beta_user_002 joined with ref founding_heir"

echo
echo "[6] SMOKE + STABILIZE"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "=== DONE ==="
echo "discord_layer: READY"
echo "zapier_layer: READY"
echo "growth_events: READY"
echo "next: paste real webhook URLs into data/integrations/discord_zapier_config.json"
