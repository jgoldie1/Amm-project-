'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const port = 19500 + Math.floor(Math.random() * 400);
const dataFile = path.join(os.tmpdir(), `tryamm-family-smoke-${process.pid}-${Date.now()}.json`);
const base = `http://127.0.0.1:${port}`;
const adminEmail = `family-admin-${Date.now()}@example.test`;
const child = spawn(process.execPath, ['-r', './lib/content-engine-preload.js', 'server.js'], {
  cwd: path.resolve(__dirname, '..'),
  env: {
    ...process.env,
    PORT: String(port),
    APP_URL: base,
    ADMIN_EMAIL: adminEmail,
    DATA_FILE: dataFile,
    NODE_ENV: 'test',
    SUPABASE_URL: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    STRIPE_SECRET_KEY: '',
    OPENAI_API_KEY: ''
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk.toString(); });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function json(pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, options);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}
async function waitForHealth() {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    try {
      const result = await json('/api/health');
      if (result.response.ok) return;
    } catch {}
    await sleep(150);
  }
  throw new Error(`family enterprise server did not become healthy; stderr=${stderr}`);
}

(async () => {
  try {
    await waitForHealth();
    const register = await json('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, displayName: 'Family Admin', password: 'family-smoke-password-123' })
    });
    assert.strictEqual(register.response.status, 201, JSON.stringify(register.body));
    assert.strictEqual(register.body.user.role, 'admin');
    const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${register.body.token}` };

    const overview = await json('/api/family-enterprise/overview', { headers: authHeaders });
    assert.strictEqual(overview.response.status, 200, JSON.stringify(overview.body));
    assert(overview.body.enterprises.some(item => item.id === 'aniyah-64-track'));
    assert(overview.body.enterprises.some(item => item.id === 'jacobie-vision'));
    assert(overview.body.enterprises.some(item => item.id === 'isaiah-ai-tv'));
    assert.strictEqual(overview.body.guardrails.familyTreeMembershipDoesNotGrantOwnership, true);

    const created = await json('/api/family-enterprise/members', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        displayName: 'Private Family Profile',
        relationship: 'family',
        careerGoal: 'Open / self-directed',
        rights: { educationAccess: true }
      })
    });
    assert.strictEqual(created.response.status, 201, JSON.stringify(created.body));
    assert.strictEqual(created.body.member.rights.educationAccess, true);
    assert.strictEqual(created.body.member.rights.economicOwnership, false);
    assert.strictEqual(created.body.member.careerFlexible, true);

    const refreshed = await json('/api/family-enterprise/overview', { headers: authHeaders });
    assert.strictEqual(refreshed.body.counts.members, 1);

    const anonymous = await json('/api/family-enterprise/overview');
    assert.strictEqual(anonymous.response.status, 401);

    console.log('TRYAMM family enterprise smoke passed');
  } finally {
    child.kill('SIGTERM');
    try { fs.unlinkSync(dataFile); } catch {}
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
