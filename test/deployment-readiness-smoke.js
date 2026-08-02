'use strict';
const assert = require('assert');
const { readiness } = require('../deployment-readiness');

const snapshot = { ...process.env };
try {
  process.env.NODE_ENV = 'development';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dev = readiness();
  assert.equal(dev.ok, true, 'development must remain runnable without production integrations');
  assert.equal(dev.releaseTruth, 'verified-pre-alpha');

  process.env.NODE_ENV = 'production';
  process.env.APP_URL = 'https://example.invalid';
  process.env.ADMIN_EMAIL = 'admin@example.invalid';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  const blocked = readiness();
  assert.equal(blocked.ok, false, 'production must block without durable database credentials');
  assert(blocked.blockers.includes('SUPABASE_URL'));

  process.env.SUPABASE_URL = 'https://project.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  const ready = readiness();
  assert.equal(ready.ok, true, 'production core may start when required environment is complete');
  assert.equal(ready.productionPaymentsEnabled, false, 'payments stay disabled without provider credentials');
  console.log('deployment readiness smoke passed');
} finally {
  for (const key of Object.keys(process.env)) if (!(key in snapshot)) delete process.env[key];
  Object.assign(process.env, snapshot);
}
