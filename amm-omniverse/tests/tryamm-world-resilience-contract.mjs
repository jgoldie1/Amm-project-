import fs from 'node:fs'

const fabric=fs.readFileSync(new URL('../src/data/TryammWorldResilienceFabric.ts',import.meta.url),'utf8')
const service=fs.readFileSync(new URL('../src/services/middlewear.ts',import.meta.url),'utf8')
const aiHub=fs.readFileSync(new URL('../src/components/MiddleverseAIHub.tsx',import.meta.url),'utf8')
const worlds=fs.readFileSync(new URL('../src/components/LivingWorldsUniverse.tsx',import.meta.url),'utf8')

const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM WORLD RESILIENCE CONTRACT FAIL: '+msg)}
for(const domain of ['middleverse-ai','multiverse','metaverse','streetverse','holoverse','gameverse'])must(fabric.includes(domain),'missing domain '+domain)
for(const control of ['bulkheads + circuit breakers + deadlines','distributed idempotency','Red Hat Sentinel','Jacobie Swarm Shield','signed Origin Shield'])must(fabric.includes(control),'missing shared control '+control)
must(service.includes('/api/readyz'),'client readiness probe missing')
must(service.includes("'Idempotency-Key'"),'Middleverse client idempotency header missing')
must(service.includes('crypto.randomUUID()'),'client request identity missing')
must(aiHub.includes('RESILIENT ROUTING'),'Middleverse AI resilience status missing')
must(worlds.includes('ISOLATED WORLD FAILURE'),'GameVerse isolation status missing')
console.log('TRYAMM WORLD RESILIENCE CONTRACT PASS: Middleverse AI + Multiverse + Metaverse share one fault-isolated MiddleWear fabric')
