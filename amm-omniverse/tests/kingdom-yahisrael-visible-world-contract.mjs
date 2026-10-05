import fs from 'node:fs'
import vm from 'node:vm'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const scripts=[
 ['01-core-world.js',read('../public/streetverse-kingdom/01-core-world.js')],
 ['02-physics-traffic.js',read('../public/streetverse-kingdom/02-physics-traffic.js')],
 ['03-spawn-phone.js',read('../public/streetverse-kingdom/03-spawn-phone.js')],
 ['04-radial-input.js',read('../public/streetverse-kingdom/04-radial-input.js')],
 ['05-player-camera-hud.js',read('../public/streetverse-kingdom/05-player-camera-hud.js')],
 ['06-loop.js',read('../public/streetverse-kingdom/06-loop.js')],
 ['07-yahisrael-living-world.js',read('../public/streetverse-kingdom/07-yahisrael-living-world.js')],
 ['tryamm-bridge.js',read('../public/streetverse-kingdom/tryamm-bridge.js')],
]
for(const [name,code] of scripts){
 try{new vm.Script(code,{filename:name})}catch(error){throw new Error('Kingdom browser script parse failure '+name+': '+error.message)}
}

const core=scripts[0][1]
const phone=scripts[2][1]
const input=scripts[3][1]
const hud=scripts[4][1]
const loop=scripts[5][1]
const living=scripts[6][1]
const index=read('../public/streetverse-kingdom/index.html')
const route=read('../src/components/KingdomDistrictRoute.tsx')
const bridge=read('../src/runtime/KingdomStreetVerseBridge.ts')

if(/if \(!T\)[\s\S]{0,260}\breturn\s*;/.test(core))throw new Error('Stale top-level Kingdom return reintroduced')
if(/\}\)\(\);\s*$/.test(loop))throw new Error('Stale split-IIFE closer reintroduced')
for(const x of ['YAHISRAEL_RESERVED_BLOCKS',"'assembly-court'","'servants-center'","'kingdom-market'","'legacy-workbook'","'hebrew-school'","'garden-farm'","'press-ai-cafe'","'broadcast-house'"])if(!core.includes(x))throw new Error('Reserved Yahisrael block missing '+x)
for(const x of ['Judah Gate • Where Heaven Meets Earth','Assembly & Prayer Court','Servants of Christ Service Center','Kingdom Market','Family Legacy + Kingdom Workbook Hall','Hebrew School + Scripture House','Kingdom Garden + Community Farm','Kingdoms Press + AI Café','All American Network Broadcast House'])if(!living.includes(x))throw new Error('Visible Kingdom destination missing '+x)
for(const x of ['LANDMARKS.push','nearestKingdomDestination','visitKingdomDestination','MISSION_STARTED','KINGDOM_PORTAL_REQUEST','KY_PATH_KEY','KY_PATH_IDS','kyMarkVisited','where-heaven-meets-earth-kingdom-path'])if(!living.includes(x))throw new Error('Living Kingdom interaction missing '+x)
for(const x of ["id: 'kingdom', label: 'Yahisrael'","s === 'kingdom'","data-kdest","setKingdomDestinationWaypoint","YAHISRAEL_PATH_PROGRESS","KINGDOM PATH"])if(!phone.includes(x))throw new Error('Kingdom phone integration missing '+x)
if(!input.includes("Enter ${kd.shortName}")&&false)throw new Error('noop')
for(const x of ['nearestKingdomDestination(8)','visitKingdomDestination(d)','Route to Judah Gate'])if(!input.includes(x))throw new Error('Kingdom one-button interaction missing '+x)
for(const x of ['Enter ${kd.shortName}','Array.isArray(l.pos)'])if(!hud.includes(x))throw new Error('Kingdom HUD/map integration missing '+x)
for(const x of ['yahisrael-living-kingdom-v3','Kingdom of<br>Yahisrael','WHERE HEAVEN MEETS EARTH','07-yahisrael-living-world.js'])if(!index.includes(x))throw new Error('Canonical Kingdom shell missing '+x)
for(const x of ["'KINGDOM_DESTINATION_ENTERED'","'KINGDOM_PORTAL_REQUEST'","safeKingdomPortals:true"])if(!bridge.includes(x))throw new Error('Parent Kingdom bridge missing '+x)
for(const x of ['tryamm:kingdom-portal-request',"'/kingdom-workbook'","'/faithverse'","'/kingdoms-press'","'/servants-of-christ'","'/network'"])if(!route.includes(x))throw new Error('Safe Kingdom portal route missing '+x)
console.log('Kingdom of Yahisrael visible Living World contract: PASS')
