import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(c,m)=>{if(!c)throw new Error(`CAPABILITY CONVERGENCE FAIL: ${m}`)}
const registry=read('src/platform/CapabilityRegistry.ts')
for(const token of ['Supabase Auth/session boundary','StreetVerse life/biography persistence','TRYAMM Money Engine','TRYAMM Movie Box','Holo Credit wallet/ledger','Accessibility Passport','Jacobie Vision Security','Agency Growth + Founder Priority','All American University runtime','TRYAMM HoloArena'])must(registry.includes(token),token)
for(const rule of ['STOP DUPLICATING FEATURES','REUSE EXISTING SYSTEMS','ONE CONTRACT PER CAPABILITY','THIN UI ADAPTERS','SHARED BACKEND','AUTOMATED SMOKE','PARALLEL CI','MERGE ONLY GREEN LANES'])must(registry.includes(rule),rule)
const ids=['auth','world-memory','money-engine','movie-box','holo-credits','accessibility','jacobie-vision','agency','university','holoarena']
for(const id of ids){const count=(registry.match(new RegExp(`id:'${id}'`,'g'))||[]).length;must(count===1,`${id} must have exactly one canonical registry entry, found ${count}`)}
must(registry.includes('No UI or game module mints payable money.'),'money authority')
must(registry.includes('One movie project model'),'movie box authority')
must(registry.includes('One agency identity and attribution graph.'),'agency authority')
must(registry.includes('One venue session runtime'),'HoloArena authority')
console.log('✅ canonical capability convergence contract passed')
