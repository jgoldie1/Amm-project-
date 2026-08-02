'use strict';
const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('lib/hybrid-persistence.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');
const payments = fs.readFileSync('nigeria-payments.js', 'utf8');

assert(source.includes('createHybridPersistence'), 'Hybrid persistence factory missing');
assert(source.includes("experience_profiles"), 'Experience profile persistence missing');
assert(source.includes("teleport_sessions"), 'Teleport persistence missing');
assert(source.includes("payment_intents"), 'Payment intent persistence missing');
assert(source.includes("webhook_events"), 'Webhook persistence missing');
assert(source.includes("ledger_entries"), 'Ledger persistence missing');
assert(source.includes("audit_events"), 'Audit persistence missing');
assert(source.includes("local-fallback"), 'Local fallback mode missing');
assert(kernel.includes('persistence.experienceProfile'), 'Kernel profile persistence not wired');
assert(kernel.includes('persistence.teleport'), 'Kernel teleport persistence not wired');
assert(payments.includes('persistence.paymentIntent'), 'Payment intent persistence not wired');
assert(payments.includes('persistence.ledgerEntries'), 'Ledger persistence not wired');
assert(payments.includes('persistence.webhook'), 'Webhook persistence not wired');
assert(payments.includes('persistence.payout'), 'Payout persistence not wired');
console.log('hybrid-persistence-smoke: ok');
