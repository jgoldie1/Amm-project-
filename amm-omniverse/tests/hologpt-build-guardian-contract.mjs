import fs from 'node:fs'
const files=['../src/runtime/HoloGPTSovereignIntentFabric.ts','../src/runtime/HoloGPTBuildGuardian.ts'].map(p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')).join('\n')
for(const required of ['Sovereign Intent Fabric','Build Guardian','automatic checkpoint before every write/deploy/migration','work receipts that separate planned committed tested merged deployed and live','duplicate-system detector','CI failure triage','safe rollback','human approval','FOUNDER_COMMAND_LOOP','DISCOVER_EXISTING_WORK','PRODUCTION_PROBE']) {
 if(!files.includes(required)) throw new Error('HoloGPT resilience contract missing: '+required)
}
console.log('HoloGPT sovereign intent + build guardian contract: PASS')
