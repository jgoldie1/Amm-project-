import fs from 'node:fs'

const engine=fs.readFileSync(new URL('../src/data/GenieBottleAssetTransformationEngine.ts',import.meta.url),'utf8')
const production=fs.readFileSync(new URL('../src/data/StreetVerseChicagoProductionAssetTournament.ts',import.meta.url),'utf8')
const script=fs.readFileSync(new URL('../scripts/streetverse-asset-tournament.mjs',import.meta.url),'utf8')

const must=(ok,msg)=>{if(!ok)throw new Error('GENIE ASSET TOURNAMENT CONTRACT FAIL: '+msg)}
for(const id of ['sample-a-reality-restore','sample-b-chicago-documentary','sample-c-holo-reality-fusion','sample-d-cinematic-hero']){
  must(engine.includes(id),'missing four-sample candidate '+id)
}
must(engine.includes('exactly-four-samples-required'),'selection must require exactly four candidates')
must(engine.includes('Oracle rights/source review'),'Oracle rights/source gate missing')
must(engine.includes('Quantum Crawler'),'Quantum Crawler reference discovery missing')
must(engine.includes('Mind Over Matter'),'Mind Over Matter transformation/originality gate missing')
must(engine.includes('maxParallelSamples:4'),'four-way Quantum buffer missing')
must(engine.includes('contentAddressedCache:true'),'Quantum cache/buffer missing')
must(engine.includes('artifactUrl:null'),'recipe winner must not pretend an artifact exists')
must(engine.includes('assetPassportCertified:false'),'Asset Passport fail-closed state missing')
must(engine.includes('humanVisualReview:false'),'human visual review gate missing')
must(engine.includes('productionPublishAllowed:false'),'production publish must fail closed before evidence')
must(engine.includes('without copying protected assets'),'commercial-game copying guardrail missing')
must(engine.includes('Holographic rendering enhances certified gameplay geometry'),'holographic truth rule missing')
must(production.includes('CIRCLE_PARK_PRODUCTION_ASSET_WAVE'),'Chicago production asset wave missing')
must(production.includes('holographic-interaction-and-ar-anchor-kit'),'holographic production kit missing')
must(script.includes('sample-c-holo-reality-fusion'),'tournament evidence script missing reviewed winner')
console.log('GENIE ASSET TOURNAMENT CONTRACT PASS: four candidates -> scored winner -> evidence-gated production promotion')
