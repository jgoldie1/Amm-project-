'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const port = 19000 + Math.floor(Math.random() * 500);
const dataFile = path.join(os.tmpdir(), `tryamm-smoke-${process.pid}-${Date.now()}.json`);
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['-r', './lib/content-engine-preload.js', 'server.js'], {
  cwd: path.resolve(__dirname, '..'),
  env: {
    ...process.env,
    PORT: String(port),
    APP_URL: base,
    DATA_FILE: dataFile,
    NODE_ENV: 'test',
    OPENAI_API_KEY: '',
    HOLOGPT_API_URL: '',
    HOLOGPT_API_KEY: '',
    HOLOGPT_MODEL: '',
    OLLAMA_BASE_URL: '',
    OLLAMA_MODEL: '',
    STUBBS_EXECUTIVE_URL: '',
    SUPABASE_URL: '',
    SUPABASE_SERVICE_ROLE_KEY: ''
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk.toString(); });

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function json(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function waitForHealth() {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    try {
      const { response, body } = await json(`${base}/api/health`);
      if (response.ok && body.ok) return body;
    } catch {}
    await sleep(150);
  }
  throw new Error(`server did not become healthy; stderr=${stderr}`);
}

(async () => {
  try {
    const health = await waitForHealth();
    assert.strictEqual(health.ok, true);

    const email = `smoke-${Date.now()}@example.test`;
    const register = await json(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName: 'Runtime Smoke', password: 'smoke-password-123' })
    });
    assert.strictEqual(register.response.status, 201, JSON.stringify(register.body));
    assert(register.body.token, 'registration token missing');

    const holoHealth = await json(`${base}/api/hologpt/health`);
    assert.strictEqual(holoHealth.response.status, 200, JSON.stringify(holoHealth.body));
    assert.strictEqual(holoHealth.body.provider, 'local-degraded');

    const chat = await json(`${base}/api/hologpt/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${register.body.token}`
      },
      body: JSON.stringify({ message: 'Check deployment readiness.', page: '/smoke' })
    });
    assert.strictEqual(chat.response.status, 200, JSON.stringify(chat.body));
    assert.strictEqual(chat.body.ok, true);
    assert.strictEqual(chat.body.degraded, true);
    assert(chat.body.answer && chat.body.answer.length > 80, 'HoloGPT degraded response is unexpectedly empty');

    const unknown = await json(`${base}/api/this-route-does-not-exist`);
    assert.strictEqual(unknown.response.status, 404);

    console.log('TryAMM HTTP runtime smoke passed');
  } finally {
    child.kill('SIGTERM');
    try { fs.unlinkSync(dataFile); } catch {}
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
