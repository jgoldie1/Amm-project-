import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8')
const mobility=read('src/components/HoloMobilityLauncher.tsx')
const registry=read('src/data/standaloneSiteRegistry.ts')
const ledger=read('src/runtime/OmniverseAssetLedger.ts')
const site=read('src/components/StandaloneProductSite.tsx')

const checks=[
  ['Holo Ride Share UI',mobility.includes('Holo Ride Share')],
  ['Holo Drone UI',mobility.includes('Holo Drone')],
  ['Ride Share standalone registry',registry.includes("slug:'holo-ride-share'")],
  ['Drone standalone registry',registry.includes("slug:'holo-drone'")],
  ['Ride ledger event',ledger.includes("'RIDE_REQUEST'")],
  ['Drone ledger event',ledger.includes("'DRONE_MISSION'")],
  ['Hash-chain verifier',ledger.includes('verifyOmniverseLedger')&&ledger.includes('previousHash')&&ledger.includes('SHA-256')],
  ['Provider-gated mobility',mobility.includes('provider')&&mobility.includes('gated')],
  ['Universal lead panel mounted',site.includes('UniversalLeadPanel')],
]

const failed=checks.filter(([,ok])=>!ok)
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`)
if(failed.length){console.error(`Mobility/blockchain contract failed: ${failed.map(([name])=>name).join(', ')}`);process.exit(1)}
console.log('Mobility/blockchain contract passed')
