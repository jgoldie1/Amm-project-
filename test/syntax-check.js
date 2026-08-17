'use strict';
const {spawnSync}=require('child_process');
const files=[
  'server.js',
  'lib/quantum-internet-routes.js','lib/quantum-intelligence.js','lib/quantum-crawler.js','lib/quantum-index-store.js','lib/quantum-persistent-index.js','lib/quantum-multimodal-index.js',
  'lib/holographic-internet.js','lib/holographic-display-capabilities.js','lib/multiview-3d.js','lib/quantum-audio-scene.js','lib/holo-tv-platform.js','lib/holo-room-orchestrator.js','lib/holo-multiuser-room.js','lib/spatial-continuity.js','lib/holo-presence.js','lib/volumetric-presence.js','lib/holographic-runtime.js','lib/holographic-runtime-routes.js','lib/holo-ice-routes.js','lib/holo-sfu.js','lib/holo-sfu-routes.js',
  'lib/marketplace-routes.js','lib/marketplace-order-routes.js','lib/stripe-webhook-routes.js','lib/transaction-core.js','lib/outbox-worker.js','lib/provider-registry.js','lib/provider-http-adapter.js','lib/warehouse-network.js','lib/warehouse-routing.js',
  'lib/ip-command-center.js','lib/ip-portfolio.js','lib/ai-legal-compliance.js','lib/regulatory-graph.js','lib/compliance-readiness.js','lib/credential-vault.js','lib/trust-network.js','lib/trust-risk.js','lib/dispute-resolution.js','lib/claims-holds.js','lib/governance-routes.js','lib/platform-readiness.js','lib/operations-routes.js','lib/domain-events.js','lib/content-engine-preload.js',
  'public/merchant-studio.js','public/marketplace.js','public/marketplace-store.js','public/holo-media-transport.js','public/holo-runtime-demo.js',
  'test/marketplace-routes-smoke.js','test/marketplace-order-routes-smoke.js','test/holo-media-transport-smoke.js','test/holographic-runtime-routes-smoke.js','test/warehouse-network-smoke.js','test/warehouse-routing-smoke.js','test/ip-command-center-smoke.js','test/ip-portfolio-smoke.js','test/ai-legal-compliance-smoke.js','test/regulatory-graph-smoke.js','test/compliance-readiness-smoke.js','test/credential-vault-smoke.js','test/trust-network-smoke.js','test/trust-risk-smoke.js','test/dispute-resolution-smoke.js','test/claims-holds-smoke.js','test/governance-routes-smoke.js','test/platform-readiness-smoke.js','test/domain-events-smoke.js','test/distinguished-hardening-smoke.js'
];
let failed=0;
for(const file of files){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status===0){console.log(`syntax PASS ${file}`);continue;}
  failed++;
  const detail=(result.stderr||result.stdout||'syntax check failed').trim().replace(/\r?\n/g,'%0A');
  console.error(`::error file=${file},title=JavaScript syntax check failed::${detail}`);
}
if(failed){console.error(`Syntax check failed for ${failed} file(s).`);process.exit(1);}
console.log(`Syntax check PASS (${files.length} files)`);
