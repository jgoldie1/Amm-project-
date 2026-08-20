import assert from 'node:assert/strict';

const REQUIRED = [
  'account_authenticated',
  'business_profile_persisted',
  'domain_dns_configured',
  'harmony_site_ready',
  'business_jarvis_ready',
  'marketplace_seller_ready',
  'sandbox_order_created',
  'sandbox_payment_recorded',
  'delivery_tracking_started',
  'delivery_completed',
  'business_dashboard_updated',
  'audit_verified',
];

function validate(stages) {
  const map = new Map(stages.map((s) => [s.stage, s]));
  const missing = REQUIRED.filter((name) => !map.get(name)?.completed);
  const invalid = REQUIRED
    .map((name) => map.get(name))
    .filter((stage) => stage?.completed && !stage.evidenceId)
    .map((stage) => `${stage.stage}: completed without evidenceId`);
  return { ready: missing.length === 0 && invalid.length === 0, missing, invalid };
}

const complete = REQUIRED.map((stage, index) => ({ stage, completed: true, evidenceId: `evidence-${index + 1}` }));
const completeResult = validate(complete);
assert.equal(completeResult.ready, true, 'complete evidenced sandbox journey should be ready');

const missingAudit = complete.filter((stage) => stage.stage !== 'audit_verified');
const missingResult = validate(missingAudit);
assert.equal(missingResult.ready, false, 'journey missing audit verification must fail');
assert.deepEqual(missingResult.missing, ['audit_verified']);

const evidenceMissing = complete.map((stage) => stage.stage === 'sandbox_payment_recorded' ? { ...stage, evidenceId: undefined } : stage);
const evidenceResult = validate(evidenceMissing);
assert.equal(evidenceResult.ready, false, 'completed stages without evidence must fail');
assert.ok(evidenceResult.invalid.some((message) => message.includes('sandbox_payment_recorded')));

console.log(`production-beta-journey: PASS (${REQUIRED.length} required stages validated)`);
