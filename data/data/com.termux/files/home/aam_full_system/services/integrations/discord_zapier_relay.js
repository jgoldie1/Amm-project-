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
