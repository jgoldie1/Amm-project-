import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = rel => fs.readFileSync(new URL(rel, import.meta.url), 'utf8');
const checkout = read('../api/commerce/checkout.js');
const webhook = read('../api/commerce/stripe-webhook.js');
const admin = read('../api/_lib/supabase-admin.js');
const migration = read('../supabase/migrations/20260924144500_server_authoritative_stripe_commerce.sql');
const pkg = JSON.parse(read('../package.json'));

assert.equal(pkg.dependencies?.stripe, '^18.5.0', 'Stripe SDK must remain a server runtime dependency');

assert.match(checkout, /stripe\.checkout\.sessions\.create\(/, 'checkout must create Stripe sessions on the server');
assert.match(checkout, /CATALOG\.get\(line\.id\)/, 'checkout pricing must come from the trusted catalog');
assert.match(checkout, /tryamm_order_id/, 'checkout must bind the Stripe session to the persisted order');
assert.match(checkout, /tryamm_buyer_id/, 'checkout must bind the Stripe session to the authenticated buyer');
assert.match(checkout, /authority:'stripe_webhook_only'/, 'checkout response must declare webhook-only purchase authority');
assert.doesNotMatch(checkout, /req\.body\?\.(price|amount|unitAmount|total)/, 'client-supplied prices must not become payment authority');

assert.match(webhook, /bodyParser:false/, 'Stripe webhook must receive the raw request body');
assert.match(webhook, /webhooks\.constructEvent\(/, 'Stripe signature must be verified by the Stripe SDK');
assert.match(webhook, /adminRpc\('apply_verified_stripe_checkout'/, 'verified Stripe events must enter the atomic server transition');
assert.match(webhook, /payment_status\|\|''\)!=='paid'/, 'unpaid sessions must not grant purchases');
assert.doesNotMatch(webhook, /req\.body\?\.id/, 'webhook authority must not come from a client-supplied event id');

assert.match(admin, /rest\/v1\/\$\{path\}/, 'admin transport must remain server-side PostgREST');
assert.match(admin, /adminRpc/, 'server must expose a service-role RPC adapter');

for (const table of ['commerce_payment_transactions','commerce_entitlements','commerce_ledger_entries']) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`), `${table} must be persisted`);
}
assert.match(migration, /for update;/i, 'order must be locked during verified payment application');
assert.match(migration, /stripe_amount_mismatch/, 'verified amount must match the server order');
assert.match(migration, /stripe_currency_mismatch/, 'verified currency must match the server order');
assert.match(migration, /commerce_ledger_unbalanced/, 'ledger postings must balance before commit');
assert.match(migration, /revoke all on function public\.apply_verified_stripe_checkout[\s\S]*from authenticated;/i, 'browser roles must not execute the payment transition');
assert.match(migration, /grant execute on function public\.apply_verified_stripe_checkout[\s\S]*to service_role;/i, 'only the service role may execute the payment transition');

console.log('Server-authoritative Stripe checkout -> verified event -> transaction -> entitlement -> ledger contract: PASS');
