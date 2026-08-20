import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (condition, message) => { if (!condition) throw new Error(`LIVE PERSISTENCE FAIL: ${message}`); };

const persistence = read('src/runtime/tryammPersistence.ts');
const journey = read('src/coreJourney/coreJourneyService.ts');
const launcher = read('src/components/CoreJourneyLauncher.tsx');
const edge = read('supabase/functions/tryamm-core/index.ts');
const env = read('.env.example');

for (const action of ['upsert_business','create_order','record_sandbox_payment','append_delivery_event','record_audit_event','dashboard']) {
  must(persistence.includes(`'${action}'`), `tryamm-core action ${action} must remain wired`);
}

for (const table of ['tryamm_orders','tryamm_sandbox_payments','tryamm_delivery_events','tryamm_audit_events']) {
  must(persistence.includes(table), `${table} read/realtime evidence path must remain wired`);
}

must(persistence.includes("functions.invoke('tryamm-core'"), 'browser writes must flow through authenticated tryamm-core Edge Function');
must(persistence.includes('idempotencyKey'), 'order/payment writes must expose idempotency keys');
must(persistence.includes("table: 'tryamm_orders'"), 'order realtime subscription must exist');
must(persistence.includes("table: 'tryamm_delivery_events'"), 'delivery realtime subscription must exist');
must(persistence.includes('loadTryammDashboard'), 'dashboard aggregation client must exist');
must(env.includes('VITE_SUPABASE_PUBLISHABLE_KEY'), 'modern Supabase publishable key must be documented');
must(!persistence.includes('SUPABASE_SERVICE_ROLE_KEY'), 'service-role key must never appear in browser persistence module');

for (const serverWrite of ['saveBusiness(', 'createSandboxOrder(', 'recordSandboxPayment(', 'appendDeliveryEvent(', 'recordAuditEvent(']) {
  must(journey.includes(serverWrite), `core journey must use authoritative helper ${serverWrite}`);
}
for (const forbiddenDirectWrite of [
  ".from('tryamm_businesses').insert",
  ".from('tryamm_orders').insert",
  ".from('tryamm_sandbox_payments').insert",
  ".from('tryamm_delivery_events').insert",
  ".from('tryamm_audit_events').insert",
]) {
  must(!journey.includes(forbiddenDirectWrite), `core journey must not directly write protected table via ${forbiddenDirectWrite}`);
}

must(journey.includes('loadTryammDashboard()'), 'core journey service must expose authoritative dashboard aggregation');
must(journey.includes('subscribeToOrderJourney'), 'core journey service must expose realtime order/delivery subscription');
must(launcher.includes('Completed steps this session: {doneCount}/9'), 'visible core journey must contain nine evidenced steps');
must(launcher.includes("['delivered','Delivered successfully',0]"), 'visible delivery journey must reach delivered state');
must(launcher.includes('loadBusinessDashboard()'), 'visible journey must validate dashboard aggregation');
must(launcher.includes('subscribeJourney(order.id'), 'visible journey must subscribe to realtime order/delivery events');
must(launcher.includes("events.at(-1)?.state!=='delivered'"), 'visible journey must verify persisted delivery completion');

must(edge.includes('approved_checkout_required'), 'sandbox payment must require approved JARVIS checkout evidence');
must(edge.includes('invalid_delivery_transition'), 'delivery state machine must reject invalid transitions');
must(edge.includes("status: 'recorded'"), 'sandbox Money Engine must persist recorded status server-side');
must(edge.includes('ownedBusinesses'), 'dashboard must aggregate business-owner activity');
must(edge.includes("await audit('success'"), 'successful authoritative actions must persist audit evidence');

console.log('live-persistence-contract: PASS');