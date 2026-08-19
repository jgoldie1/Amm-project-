import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (condition, message) => { if (!condition) throw new Error(`LIVE PERSISTENCE FAIL: ${message}`); };

const persistence = read('src/runtime/tryammPersistence.ts');
const env = read('.env.example');

for (const action of ['upsert_business','create_order','record_sandbox_payment','append_delivery_event','dashboard']) {
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

console.log('live-persistence-contract: PASS');