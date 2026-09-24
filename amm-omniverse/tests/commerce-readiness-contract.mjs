import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../api/readiness.js', import.meta.url), 'utf8');

for (const required of [
  "present('STRIPE_SECRET_KEY')",
  "present('STRIPE_WEBHOOK_SECRET')",
  "enabled('TRYAMM_LIVE_CHARGING_ENABLED')",
  "enabled('TRYAMM_SELLER_TRANSFERS_VERIFIED')",
  "enabled('TRYAMM_RECONCILIATION_VERIFIED')",
  'commerce_payment_transactions?select=id&limit=1',
  'commerceSchemaReachable',
  'commerceSchemaStatus',
  'checkout -> verified Stripe event -> transaction -> entitlement -> ledger'
]) {
  assert.ok(source.includes(required), `readiness must include commerce signal: ${required}`);
}

assert.match(source, /commerce:\s*\{[\s\S]*ready:\s*commerceReady/, 'readiness response must expose a commerce readiness object');
assert.match(source, /Object\.values\(commerceChecks\)\.every\(Boolean\)/, 'commerce readiness must require every payment gate');
assert.match(source, /Secret values and provider response bodies are never returned\./, 'readiness must preserve the no-secret response contract');

console.log('Commerce readiness gate contract: PASS');
