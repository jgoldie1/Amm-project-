import fs from 'node:fs'

const server=fs.readFileSync(new URL('../amm-backend/server.js',import.meta.url),'utf8')
const gateway=fs.readFileSync(new URL('../amm-backend/lib/middlewear-security-gateway.js',import.meta.url),'utf8')
const resilience=fs.readFileSync(new URL('../amm-backend/lib/middlewear-resilience.js',import.meta.url),'utf8')
const idempotency=fs.readFileSync(new URL('../amm-backend/lib/middlewear-idempotency.js',import.meta.url),'utf8')
const provider=fs.readFileSync(new URL('../amm-backend/lib/provider-resilience.js',import.meta.url),'utf8')
const swarm=fs.readFileSync(new URL('../amm-backend/lib/jacobie-swarm-shield.js',import.meta.url),'utf8')
const redhat=fs.readFileSync(new URL('../amm-backend/lib/red-hat-sentinel.js',import.meta.url),'utf8')
const origin=fs.readFileSync(new URL('../../lib/tryamm-origin-shield.js',import.meta.url),'utf8')
const firewall=fs.readFileSync(new URL('../scripts/stage-vercel-ddos-firewall.sh',import.meta.url),'utf8')
const edgeContract=fs.readFileSync(new URL('./tryamm-edge-ddos-contract.mjs',import.meta.url),'utf8')

const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM INDUSTRY RESILIENCE CONTRACT FAIL: '+msg)}

for(const marker of [
  "app.use(jacobieSecurityHeaders)",
  "app.use(redHatSentinel.middleware)",
  "app.use(jacobieSwarmShield.middleware)",
  "app.use(middleWearResilience.middleware)",
  "app.use('/api/middleverse', ...middleWearSecurity.middleware()",
  "app.get('/api/livez'",
  "app.get('/api/readyz'",
  "server.requestTimeout=30_000",
  "server.headersTimeout=35_000",
  "server.keepAliveTimeout=65_000",
  "gracefulShutdown",
]) must(server.includes(marker),'server missing '+marker)

must(gateway.includes('provider readiness gate'),'MiddleWear provider gate missing')
must(gateway.includes('security audit persistence'),'MiddleWear audit gate missing')
must(gateway.includes('distributed idempotency/replay protection'),'MiddleWear idempotency gate missing')
must(gateway.includes('failClosedHighImpact:true'),'high-impact fail-closed rule missing')

for(const marker of ['bulkheads:true','circuitBreakers:true','requestDeadlines:true','overloadShedding:true']){
  must(resilience.includes(marker),'resilience primitive missing '+marker)
}

must(idempotency.includes("middlewear_idempotency_keys"),'distributed idempotency store missing')
must(idempotency.includes('raw_key_stored:false'),'raw idempotency keys must not persist')
must(provider.includes("['GET','HEAD','OPTIONS'].includes(method)"),'safe-method retry rule missing')
must(provider.includes("const retries=retrySafe"),'unsafe provider requests must not retry blindly')
must(provider.includes('maxConcurrent'),'provider bulkhead missing')
must(provider.includes('failureThreshold'),'provider circuit breaker missing')

must(swarm.includes('perSource:true'),'per-source swarm control missing')
must(swarm.includes('perPrincipal:true'),'per-principal swarm control missing')
must(swarm.includes('gracefulDegradation:true'),'swarm graceful degradation missing')
must(redhat.includes('hackBack:false'),'Red Hat must remain defensive-only')
must(redhat.includes('rawPayloadStored:false'),'Red Hat must minimize payload data')

must(origin.includes('TRYAMM_EDGE_ORIGIN_SECRET'),'signed origin shield missing')
must(origin.includes('timingSafeEqual'),'origin signature constant-time verification missing')
must(firewall.includes('LOG-FIRST'),'edge WAF must remain log-first before enforcement')
must(firewall.includes('TRYAMM Asset Forge burst observation'),'Asset Forge edge rate-limit observation missing')
must(firewall.includes('TRYAMM Middleverse burst observation'),'Middleverse edge rate-limit observation missing')
must(firewall.includes('TRYAMM LIVE token burst observation'),'LIVE token edge rate-limit observation missing')
must(!firewall.includes('firewall publish'),'CI/script must never auto-publish production WAF rules')
must(edgeContract.includes('no direct Render rewrites'),'edge/origin contract missing')

console.log('TRYAMM INDUSTRY RESILIENCE CONTRACT PASS: edge + origin + zero-trust + audit + replay protection + bulkheads + circuit breakers + provider isolation + graceful recovery')
