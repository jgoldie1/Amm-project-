import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = rel => fs.readFileSync(new URL(rel, import.meta.url), 'utf8');
const checkout = read('../api/commerce/checkout.js');
const webhook = read('../api/commerce/stripe-webhook.js');
const admin = read('../api/_lib/supabase-admin.js');
const migration = read('../supabase/migrations/20260924144500_server_authoritative_stripe_commerce.sql');
const hardening = read('../supabase/migrations/20260924151000_harden_stripe_checkout_authority.sql');
const authoritySql = `${migration}\n${hardening}`;
const pkg = JSON.parse(read('../package.json'));
const lock = JSON.parse(read('../package-lock.json'));

assert.equal(pkg.dependencies?.stripe, '^18.5.0', 'Stripe SDK must remain a server runtime dependency');
assert.equal(lock.packages?.['']?.dependencies?.stripe, '^18.5.0', 'package-lock root must pin the Stripe dependency declared by package.json');
assert.ok(lock.packages?.['node_modules/stripe']?.version, 'package-lock must contain the installed Stripe package');

assert.match(checkout, /stripe\.checkout\.sessions\.create\(/, 'checkout must create Stripe sessions on the server');
assert.match(checkout, /CATALOG\.get\(line\.id\)/, 'checkout pricing must come from the trusted catalog');
assert.match(checkout, /tryamm_order_id/, 'checkout must bind the Stripe session to the persisted order');
assert.match(checkout, /tryamm_buyer_id/, 'checkout must bind the Stripe session to the authenticated buyer');
assert.match(checkout, /authority:'stripe_webhook_only'/, 'checkout response must declare webhook-only purchase authority');
assert.doesNotMatch(checkout, /req\.body\?\.(price|amount|unitAmount|total)/, 'client-supplied prices must not become payment authority');
assert.match(checkout, /validatePersistedOrder/, 'persisted order items and allocations must be revalidated before checkout');
assert.match(checkout, /persisted_order_snapshot_mismatch/, 'partial order persistence must fail closed');
assert.match(checkout, /checkout\.sessions\.retrieve\(/, 'existing Stripe sessions must be inspected before creating another charge');
assert.match(checkout, /client_reference_id\|\|''\)\!==String\(order\.id\)/, 'reused Stripe sessions must match the persisted order client_reference_id');
assert.match(checkout, /PAYMENT_PROCESSING/, 'completed or paid Stripe sessions must stay in processing rather than create a duplicate charge');
assert.match(checkout, /CHECKOUT_STATUS_UNAVAILABLE/, 'Stripe retrieval failures must be retryable without creating a duplicate charge');
assert.match(checkout, /provider_session_id:'is\.null'/, 'Stripe session binding must not overwrite an existing session');
assert.match(checkout, /stripe_session_binding_failed/, 'checkout URL must not be returned unless session binding is durable');

assert.match(webhook, /bodyParser:false/, 'Stripe webhook must receive the raw request body');
assert.match(webhook, /webhooks\.constructEvent\(/, 'Stripe signature must be verified by the Stripe SDK');
assert.match(webhook, /adminRpc\('apply_verified_stripe_checkout'/, 'verified Stripe events must enter the atomic server transition');
assert.match(webhook, /payment_status\|\|''\)!=='paid'/, 'unpaid sessions must not grant purchases');
assert.doesNotMatch(webhook, /req\.body\?\.id/, 'webhook authority must not come from a client-supplied event id');
assert.match(webhook, /stripe_client_reference_mismatch/, 'verified webhook must match Stripe client_reference_id to the TRYAMM order');
assert.match(webhook, /provider_session_id:\`eq\.\$\{String\(session\.id\|\|''\)\}\`/, 'failed-payment updates must be bound to the stored Stripe session');
assert.match(webhook, /minimalPayload/, 'payment event persistence should minimize retained Stripe payload data');

assert.match(admin, /rest\/v1\/\$\{path\}/, 'admin transport must remain server-side PostgREST');
assert.match(admin, /adminRpc/, 'server must expose a service-role RPC adapter');

for (const table of ['commerce_payment_transactions','commerce_entitlements','commerce_ledger_entries']) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`), `${table} must be persisted`);
}
assert.match(authoritySql, /security invoker/i, 'payment transition must run with the service-role caller privileges, not SECURITY DEFINER');
assert.match(authoritySql, /for update;/i, 'order must be locked during verified payment application');
assert.match(authoritySql, /stripe_amount_mismatch/, 'verified amount must match the server order');
assert.match(authoritySql, /stripe_currency_mismatch/, 'verified currency must match the server order');
assert.match(authoritySql, /commerce_ledger_unbalanced/, 'ledger postings must balance before commit');
assert.match(hardening, /stripe_session_mismatch/, 'finalization must match the persisted Stripe Checkout Session');
assert.match(hardening, /order_items_mismatch/, 'finalization must reject missing or arithmetically inconsistent order items');
assert.match(hardening, /seller_allocation_breakdown_mismatch/, 'seller allocations must reconcile to the item seller breakdown');
assert.match(hardening, /full join\s*\(\s*select seller_key,gross_cents,seller_net_cents,platform_fee_cents\s*from public\.commerce_seller_allocations\s*where order_id=p_order_id\s*\) a\s*on a\.seller_key=i\.seller_key/i, 'allocation reconciliation must filter seller allocations to the current order before the full join');
assert.match(hardening, /entitlement_count_mismatch/, 'every paid order item must produce exactly one entitlement before commit');
assert.match(authoritySql, /revoke all on function public\.apply_verified_stripe_checkout[\s\S]*from authenticated;/i, 'browser roles must not execute the payment transition');
assert.match(authoritySql, /grant execute on function public\.apply_verified_stripe_checkout[\s\S]*to service_role;/i, 'only the service role may execute the payment transition');

console.log('Server-authoritative Stripe checkout -> verified event -> transaction -> entitlement -> ledger contract: PASS');
