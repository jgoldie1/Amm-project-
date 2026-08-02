'use strict';
const assert = require('assert');
const fs = require('fs');

const supabase = require('../lib/supabase-rest');
const providers = require('../lib/africa-provider-clients');
const healthSource = fs.readFileSync(require.resolve('../integration-health'), 'utf8');

assert.strictEqual(supabase.configured(), false, 'Supabase should be unconfigured in CI without secrets');
assert.strictEqual(providers.paystackConfigured(), false, 'Paystack should be unconfigured in CI without secrets');
assert.strictEqual(providers.flutterwaveConfigured(), false, 'Flutterwave should be unconfigured in CI without secrets');
assert.match(healthSource, /\/api\/integrations\/health/, 'Integration health route must exist');
assert.match(fs.readFileSync(require.resolve('../platform-kernel'), 'utf8'), /integration-health/, 'Kernel must register integration health');

console.log('Integration adapter smoke checks passed');
