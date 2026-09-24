import assert from 'node:assert/strict';
import fs from 'node:fs';

const checkout=fs.readFileSync(new URL('../api/commerce/checkout.js',import.meta.url),'utf8');
const webhook=fs.readFileSync(new URL('../api/commerce/stripe-webhook.js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../supabase/migrations/20260924210000_release1_server_authoritative_stripe.sql',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

assert.equal(pkg.dependencies?.stripe,'^18.5.0','Omniverse runtime must include the Stripe server SDK');

for(const token of [
  "stripe.checkout.sessions.create",
  "client_reference_id:order.id",
  "tryamm_order_id:order.id",
  "tryamm_buyer_id:user.id",
  "unit_amount:x.unitAmount",
  "price_data",
  "idempotencyKey:`tryamm_checkout_${order.id}`"
]) assert(checkout.includes(token),`Server checkout missing ${token}`);

assert(!checkout.includes("req.body?.amount"),'Checkout must not accept a client-supplied amount');
assert(!checkout.includes("req.body?.price"),'Checkout must not accept a client-supplied price');
assert(!checkout.includes("status:'paid'"),'Checkout request must never mark its own order paid');
assert(!checkout.includes('commerce_entitlements'), 'Checkout request must never mint an entitlement');

assert(webhook.includes("bodyParser:false"),'Stripe webhook must preserve the raw request body');
assert(webhook.includes("stripe.webhooks.constructEvent"),'Webhook signature must be verified by Stripe SDK');
assert(webhook.includes("rpc/commerce_finalize_stripe_checkout"),'Verified Stripe success must cross the server-only finalize RPC');
assert(!webhook.includes("req.body?.paid"),'Webhook must not trust a client payment flag');

for(const token of [
  'create table if not exists public.commerce_orders',
  'create table if not exists public.commerce_payment_events',
  'create table if not exists public.commerce_transactions',
  'create table if not exists public.commerce_entitlements',
  'create or replace function public.commerce_finalize_stripe_checkout',
  'for update',
  "raise exception 'stripe_amount_mismatch'",
  "raise exception 'stripe_currency_mismatch'",
  "raise exception 'stripe_buyer_mismatch'",
  'grant execute on function public.commerce_finalize_stripe_checkout',
  'to service_role'
]) assert(migration.toLowerCase().includes(token.toLowerCase()),`Stripe authority migration missing ${token}`);

const transactionInsert=migration.indexOf('insert into public.commerce_transactions');
const entitlementInsert=migration.indexOf('insert into public.commerce_entitlements');
const ledgerPost=migration.indexOf('select public.money_engine_post(');
assert(transactionInsert>=0&&entitlementInsert>transactionInsert&&ledgerPost>entitlementInsert,'Verified payment finalization must execute transaction → entitlement → ledger in that order');

assert.match(migration,/revoke all on function public\.commerce_finalize_stripe_checkout[\s\S]*from anon;/,'Anonymous users must not execute payment finalization');
assert.match(migration,/revoke all on function public\.commerce_finalize_stripe_checkout[\s\S]*from authenticated;/,'Authenticated clients must not execute payment finalization');
assert.match(migration,/revoke insert, update, delete on public\.commerce_entitlements from anon, authenticated;/,'Clients must not directly mint or mutate entitlements');
assert.match(migration,/revoke insert, update, delete on public\.commerce_transactions from anon, authenticated;/,'Clients must not directly create or mutate transactions');

console.log('Server-authoritative Stripe checkout → verified event → transaction → entitlement → ledger contract: GREEN');
