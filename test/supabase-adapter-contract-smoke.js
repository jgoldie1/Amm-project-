'use strict';

const assert = require('assert');
const adapter = require('../lib/supabase-rest');

assert.strictEqual(typeof adapter.createSupabaseRest, 'function');
const client = adapter.createSupabaseRest();
for (const method of ['configured','request','insert','upsert','select','patch']) {
  assert.strictEqual(typeof client[method], 'function', `${method} must be available on Supabase client`);
}
assert.strictEqual(client.configured(), false, 'CI should remain unconfigured without secrets');
console.log('Supabase adapter contract smoke checks passed');
