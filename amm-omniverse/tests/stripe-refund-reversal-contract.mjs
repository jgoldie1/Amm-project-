import assert from 'node:assert/strict';
import fs from 'node:fs';

const webhook=fs.readFileSync(new URL('../api/commerce/stripe-webhook.js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../supabase/migrations/20260924215500_server_authoritative_stripe_refunds.sql',import.meta.url),'utf8');
const hardening=fs.readFileSync(new URL('../supabase/migrations/20260924221500_harden_stripe_refund_failure_compensation.sql',import.meta.url),'utf8');

assert.match(webhook,/constructEvent\(raw,signature,webhookSecret\)/,'Stripe signature must be verified before refund handling');
for(const event of ['refund.created','refund.updated','refund.failed']) assert.ok(webhook.includes(event),`webhook must handle ${event}`);
assert.match(webhook,/refundStatus!=='succeeded'/,'pending refunds must not reverse ledger state');
assert.match(webhook,/apply_verified_stripe_refund_failure/,'failed refunds must use the compensating database finalizer');
assert.match(webhook,/authority:'verified_stripe_refund_failure'/,'failed refund response must identify server compensation authority');
assert.match(webhook,/apply_verified_stripe_refund/,'successful refunds must use the database finalizer');
assert.match(webhook,/authority:'verified_stripe_refund'/,'refund response must identify server authority');
assert.doesNotMatch(webhook,/req\.body.*refund/i,'browser request bodies must not authorize refund finalization');

for(const signal of [
  'create table if not exists public.commerce_refunds',
  'create table if not exists public.commerce_refund_allocations',
  'refund_exceeds_transaction',
  'refund_original_ledger_mismatch',
  'refund_reversal_unbalanced',
  "'seller_payable','platform_revenue','commerce_reserve'",
  "'stripe_clearing','credit'",
  "status='refunded'",
  'grant execute on function public.apply_verified_stripe_refund'
]) assert.ok(migration.includes(signal),`migration must include ${signal}`);

assert.match(migration,/revoke all on function public\.apply_verified_stripe_refund[\s\S]*from authenticated/,'authenticated clients must not execute the refund finalizer');
assert.match(migration,/revoke all on function public\.apply_verified_stripe_refund[\s\S]*from anon/,'anonymous clients must not execute the refund finalizer');
assert.match(migration,/v_delta_total <> p_amount_cents/,'refund reversal must balance to the verified refund amount');

console.log('Server-authoritative Stripe refund reversal contract: PASS');


for(const signal of [
  "set status='refunded'",
  'apply_verified_stripe_refund_failure',
  "'stripe-refund-failure:'||p_provider_refund_id||':restore:'",
  "'stripe_clearing','debit'",
  'refund_failure_compensation_unbalanced',
  "'preRefundStatus'",
  "set status=case when v_remaining_refunded=v_tx.amount_cents then 'refunded' else 'paid' end",
  'failure_applied_at'
]) assert.ok(hardening.includes(signal),`refund hardening must include ${signal}`);

assert.match(hardening,/revoke all on function public\.apply_verified_stripe_refund_failure[\s\S]*from authenticated/,'authenticated clients must not execute refund-failure compensation');
assert.match(hardening,/revoke all on function public\.apply_verified_stripe_refund_failure[\s\S]*from anon/,'anonymous clients must not execute refund-failure compensation');
console.log('Stripe refund failure compensation hardening: PASS');
