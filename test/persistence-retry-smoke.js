'use strict';

const assert = require('assert');
const fs = require('fs');

const retry = fs.readFileSync('lib/persistence-retry-queue.js', 'utf8');
const hybrid = fs.readFileSync('lib/hybrid-persistence.js', 'utf8');
const health = fs.readFileSync('integration-health.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');
const rls = fs.readFileSync('supabase/migrations/20260802_tryamm_rls.sql', 'utf8');

assert(retry.includes('persistenceRetryQueue'), 'retry queue storage missing');
assert(retry.includes("status: 'pending'"), 'retry queue pending state missing');
assert(hybrid.includes('retryPending'), 'hybrid retry processor missing');
assert(hybrid.includes('retryId'), 'fallback retry identifier missing');
assert(health.includes('/api/admin/integrations/persistence/retry'), 'admin retry endpoint missing');
assert(kernel.includes("persistence });"), 'persistence not passed to integration health');
assert(rls.includes('enable row level security'), 'RLS enable statements missing');
assert(/auth\.uid\(\)/.test(rls) && /user_id/.test(rls) && /to authenticated/i.test(rls), 'owner policies missing');
assert(!/on public\.(ledger_entries|webhook_events|audit_events) for (insert|update|delete)/i.test(rls), 'sensitive financial tables must not expose direct authenticated write policies');

console.log('Persistence retry and RLS smoke test passed');
