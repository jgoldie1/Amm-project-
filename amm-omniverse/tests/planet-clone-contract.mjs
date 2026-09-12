import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

const root=path.resolve(import.meta.dirname,'..')
const source=fs.readFileSync(path.join(root,'src','components','StreetVerseTwinWorld.tsx'),'utf8')
const checks=[
 ['Planet Clone title exists',/TRYAMM • PLANET CLONE/.test(source)],
 ['Planet mode includes Chicago and global expansion nodes',/LAGOS/.test(source)&&/ABUJA/.test(source)&&/TOKYO/.test(source)&&/GREENVILLE/.test(source)],
 ['Past present and future layers are preserved',/PRESENT TWIN/.test(source)&&/PAST/.test(source)&&/FUTURE/.test(source)],
 ['Business Sports Faith Supply Chain and After Dark layers are preserved',/BUSINESS/.test(source)&&/SPORTS/.test(source)&&/FAITH/.test(source)&&/SUPPLY CHAIN/.test(source)&&/AFTER DARK/.test(source)],
 ['Public operations layer is preserved',/PUBLIC OPS/.test(source)&&/EMERGENCY ALERTS/.test(source)&&/WEATHER \+ HAZARDS/.test(source)&&/TRAFFIC \+ TRANSIT/.test(source)&&/FIRE \+ EMS/.test(source)&&/INFRASTRUCTURE/.test(source)&&/DISASTER PLANNING/.test(source)&&/AGENCY DASHBOARD/.test(source)],
 ['Public operations sources are constrained',/PUBLIC_OPEN_DATA/.test(source)&&/OFFICIAL_ALERT_FEED/.test(source)&&/AUTHORIZED_AGENCY_API/.test(source)&&/AGGREGATED_SENSOR_DATA/.test(source)],
 ['Covert surveillance capabilities are explicitly prohibited',/COVERT_PERSON_TRACKING/.test(source)&&/PRIVATE_COMMUNICATION_INTERCEPTION/.test(source)&&/UNAUTHORIZED_CAMERA_ACCESS/.test(source)&&/RESTRICTED_DATABASE_ACCESS/.test(source)&&/BIOMETRIC_MASS_SURVEILLANCE/.test(source)],
 ['Individual tracking remains disabled',/individualTracking:false/.test(source)&&/MINIMIZE_AND_EXPIRE/.test(source)],
 ['Simulation boundary is explicit',/simulationBoundary/.test(source)&&/FUTURE is simulation/.test(source)],
 ['Licensed geography boundary is explicit',/authorized Map Tiles key/.test(source)&&/OpenStreetMap/.test(source)],
 ['Planet destinations bridge to StreetVerse',/tryamm:planet-clone-navigate/.test(source)&&/tryamm:twin-world-navigate/.test(source)&&/OPEN GAME WORLD/.test(source)],
 ['Global Trade and Faith World handoffs are present',/\/global-trade/.test(source)&&/\/ethiopian-bible/.test(source)],
]
const failed=checks.filter(([,ok])=>!ok)
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`)
assert.equal(failed.length,0,`Planet Clone contract failed: ${failed.map(([name])=>name).join(', ')}`)
console.log('Planet Clone recovery + public operations contract: GREEN')
