import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (condition, message) => { if (!condition) throw new Error(`AUTH ACCEPTANCE FAIL: ${message}`); };

const persistence = read('src/runtime/tryammPersistence.ts');
const journey = read('src/coreJourney/coreJourneyService.ts');
const edge = read('supabase/functions/tryamm-core/index.ts');

for (const action of ['request_approval','approve_request']) {
  must(persistence.includes(`'${action}'`), `browser core action ${action} must be declared`);
  must(edge.includes(`action === '${action}'`), `server core action ${action} must be implemented`);
}

must(journey.includes('requestApproval({ action, payload })'), 'JARVIS approval request must use authenticated core helper');
must(journey.includes('approveRequest({ id })'), 'JARVIS approval decision must use authenticated core helper');
must(!journey.includes("from('tryamm_approval_requests').insert"), 'browser must not insert approval requests directly');
must(!journey.includes("from('tryamm_approval_requests').update"), 'browser must not approve requests directly');
must(edge.includes("user_id: user.id"), 'server approval writes must bind records to authenticated user');
must(edge.includes("existing.user_id !== user.id"), 'approval decision must reject non-owner access');
must(edge.includes("approval_not_pending"), 'server must reject replayed/non-pending approval decisions');
must(edge.includes("jarvis.approval.requested"), 'approval request must persist audit evidence');
must(edge.includes("jarvis.approval.approved"), 'approval decision must persist audit evidence');
must(edge.includes("approval.action !== 'authorize_sandbox_checkout'"), 'sandbox payment must remain bound to specific approved action');
must(edge.includes('approval.payload?.orderId !== orderId'), 'sandbox payment approval must remain bound to exact order');

for (const table of ['tryamm_orders','tryamm_sandbox_payments','tryamm_delivery_events','tryamm_audit_events']) {
  must(persistence.includes(`from('${table}')`), `authenticated owner reload path missing ${table}`);
}
must(persistence.includes('readOrderJourney'), 'reload/read-by-owner journey helper must remain available');
must(persistence.includes('subscribeToOrderJourney'), 'realtime order journey must remain available');
must(journey.includes('loadPassport'), 'passport reload path must remain available');
must(journey.includes('loadBusinessDashboard'), 'business dashboard reload path must remain available');
must(journey.includes('listAuditEvidence'), 'persisted audit evidence read path must remain available');

console.log('authenticated-acceptance-contract: PASS');
