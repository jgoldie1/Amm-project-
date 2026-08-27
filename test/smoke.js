'use strict';
const assert=require('assert');
const fs=require('fs');

for(const file of [
  'server.js','music-api.js','public/index.html','public/app.js','public/styles.css',
  'public/music-hub.html','public/music-hub.js','public/music-hub.css','public/community-rules.html',
  'public/founder-dashboard.html','public/founder-dashboard.js','public/founder-dashboard.css',
  'public/app-shell.html','public/app-shell.js','public/app-shell.css','public/manifest.webmanifest','public/service-worker.js',
  'lib/content-engine-routes.js','lib/operating-layer-routes.js','lib/content-engine-preload.js','lib/supabase-rest.js',
  'config/operating-layers.json','config/release-gates.json','docs/COMPANY_OPERATING_LAYERS_AND_GAP_ANALYSIS.md',
  'supabase/migrations/202608050001_content_engine.sql','render.yaml','.replit','.env.example','.gitignore'
]) assert(fs.existsSync(file),`${file} missing`);

const server=fs.readFileSync('server.js','utf8');
for(const route of ['/api/health','/api/auth/register','/api/rooms','/api/checkout','/api/admin/summary','music-api']) assert(server.includes(route),`${route} missing`);
const music=fs.readFileSync('music-api.js','utf8');
for(const route of ['/api/music/tracks','/api/music/charts/global-creators','/api/music/creator/ledger','/api/rooms/:roomId/status']) assert(music.includes(route),`${route} missing`);
const content=fs.readFileSync('lib/content-engine-routes.js','utf8');
for(const route of ['/api/content/projects','/api/content/projects/:projectId/outputs','/api/founder/dashboard']) assert(content.includes(route),`${route} missing`);

const operations=fs.readFileSync('lib/operating-layer-routes.js','utf8');
for(const route of ['/api/operations/layers','/api/operations/readiness','/api/operations/evidence','/api/blockchain/status','/api/blockchain/*']) assert(operations.includes(route),`${route} missing`);
for(const gate of ['AUDIT_HOLD','BLOCKCHAIN_AUDIT_STATUS','BLOCKCHAIN_AUDIT_REPORT_SHA256','BLOCKCHAIN_RELEASE_APPROVED_BY']) assert(operations.includes(gate),`${gate} missing`);
const model=JSON.parse(fs.readFileSync('config/operating-layers.json','utf8'));
for(const layer of ['executive','product','engineering','security','legal','finance','trust-safety','growth','data','people','resilience']) assert(model.layers.some(item=>item.id===layer),`${layer} operating layer missing`);
const gates=JSON.parse(fs.readFileSync('config/release-gates.json','utf8'));
assert.strictEqual(gates.systems.blockchain.enabled,false,'blockchain must default to disabled');
assert.strictEqual(gates.systems.blockchain.status,'AUDIT_HOLD','blockchain must remain on audit hold');
assert(gates.systems.blockchain.requiredChecks.includes('independent-smart-contract-audit'),'independent audit gate missing');

const dashboard=fs.readFileSync('public/founder-dashboard.html','utf8');
for(const feature of ['Founder Content & Build Dashboard','Add a development update','Generated content','Known limitation','Next milestone']) assert(dashboard.includes(feature),`${feature} missing`);
const shell=fs.readFileSync('public/app-shell.html','utf8');
for(const feature of ['One world. Every scale. Every time.','Creator economy','Live now','Safety Center','manifest.webmanifest']) assert(shell.includes(feature),`${feature} missing from app shell`);
const shellJs=fs.readFileSync('public/app-shell.js','utf8');
for(const feature of ['/api/rooms','serviceWorker','online','offline']) assert(shellJs.includes(feature),`${feature} missing from app shell wiring`);
const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
assert.strictEqual(manifest.display,'standalone','PWA display must be standalone');
const migration=fs.readFileSync('supabase/migrations/202608050001_content_engine.sql','utf8');
assert(migration.includes('enable row level security'),'RLS missing');
const env=fs.readFileSync('.env.example','utf8');
for(const key of ['BLOCKCHAIN_ENABLED=false','BLOCKCHAIN_AUDIT_STATUS=NOT_SUBMITTED','BLOCKCHAIN_AUDIT_REPORT_SHA256','BLOCKCHAIN_RELEASE_APPROVED_BY']) assert(env.includes(key),`${key} missing from environment template`);
const gitignore=fs.readFileSync('.gitignore','utf8');
for(const ignored of ['node_modules/','.env','data/store.json']) assert(gitignore.includes(ignored),`${ignored} should be ignored`);

console.log('TryAMM operating layers, blockchain audit hold, mobile app, content engine, deployment and safety smoke checks passed');
