import fs from 'node:fs'
import vm from 'node:vm'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const living=read('../public/streetverse-kingdom/07-yahisrael-living-world.js')
const people=read('../public/streetverse-kingdom/02-physics-traffic.js')
const phone=read('../public/streetverse-kingdom/03-spawn-phone.js')
const input=read('../public/streetverse-kingdom/04-radial-input.js')
const hud=read('../public/streetverse-kingdom/05-player-camera-hud.js')
const bible=read('../src/components/EthiopianBibleMetaverse.tsx')
const main=read('../src/main.tsx')
const center=read('../src/components/KingdomYahisraelCenter.tsx')
const slots=read('../src/data/KingdomYahisraelArchitectureSlots.ts')
const upgrade=read('../src/runtime/KingdomYahisraelArchitectureUpgradeRuntime.ts')
const assetReadme=read('../public/tryamm-assets/meshy/kingdom/README.md')

for(const [name,code] of [['living',living],['people',people],['phone',phone],['input',input],['hud',hud]])new vm.Script(code,{filename:name+'.js'})

for(const x of [
 'KY_CITIZEN_SPECS','YAHISRAEL_CITIZEN_COUNT','Assembly Elder','Service Coordinator','Kingdom Merchant','Family Historian',
 'Hebrew Teacher','Scripture Student','Garden Steward','Kingdoms Press Editor','Broadcast Host'
])if(!living.includes(x))throw new Error('Kingdom population missing '+x)

for(const x of [
 'kyHall({id:','Walkable shell','kyBench(','kyTable(','kyShelf(','kyChair(','kyCameraRig(','kyHoloLectern(',
 'METAVERSE BIBLE','BOOK OF REMEMBRANCE','AI CAFÉ','ALL AMERICAN NETWORK'
])if(!living.includes(x))throw new Error('Kingdom interior architecture missing '+x)

for(const x of [
 'KY_ACTIVITIES','nearestKingdomActivity','completeKingdomActivity','assembly-reflection','community-service','market-stewardship',
 'family-covenant','metaverse-bible-study','garden-service','publish-remembrance','kingdom-broadcast',
 "completion:'external'","completion:'local'"
])if(!living.includes(x))throw new Error('Kingdom activity/mission system missing '+x)

if(!input.includes('nearestKingdomActivity(4.5)')||!input.includes('completeKingdomActivity(a)'))throw new Error('One-button Kingdom activity interaction missing')
if(!hud.includes('nearestKingdomActivity')||!hud.includes('ka.shortLabel'))throw new Error('Kingdom activity HUD prompt missing')
for(const x of ['YAHISRAEL_CITIZEN_COUNT','YAHISRAEL_ACTIVITY_PROGRESS','LOCAL ACTIVITIES COMPLETE'])if(!phone.includes(x))throw new Error('Yahisrael phone living-world status missing '+x)

for(const x of [
 "'SV_NPC_CHILD_01.glb'","'SV_NPC_TEEN_01.glb'",'options.targetHeight','options.file','options.ageLane'
])if(!people.includes(x))throw new Error('Age/role production human loader missing '+x)

for(const x of ['/metaverse-bible','KINGDOM OF YAHISRAEL • METAVERSE BIBLE','KINGDOM HEBREW SCHOOL','RETURN TO HEBREW SCHOOL','FAITH CHRONO / TIME MACHINE'])if(!(main+bible).includes(x))throw new Error('Metaverse Bible Kingdom integration missing '+x)

for(const x of [
 'KY_ASSEMBLY_PRAYER_COURT.glb','KY_SERVANTS_SERVICE_CENTER.glb','KY_FAMILY_LEGACY_HALL.glb',
 'KY_METAVERSE_BIBLE_HEBREW_SCHOOL.glb','KY_KINGDOMS_PRESS_AI_CAFE.glb','KY_ALL_AMERICAN_NETWORK_BROADCAST.glb',
 "providerState:'missing-production-glb'","productionClaimRequiresGlbEvidence:true"
])if(!slots.includes(x))throw new Error('Kingdom production architecture slot missing '+x)

for(const x of ['tryamm:mind-over-matter-original-request','tryamm:holoforge-request','requiresHumanReview:true','qualityTier:\'premium\''])if(!upgrade.includes(x))throw new Error('Photoreal architecture upgrade pipeline missing '+x)
for(const x of ['PRODUCTION ARCHITECTURE','QUEUE ORIGINAL PRODUCTION GLBs','PRODUCTION GLB: PENDING'])if(!center.includes(x))throw new Error('Kingdom architecture status UI missing '+x)
if(!assetReadme.includes('The procedural Kingdom geometry is a fallback')||!assetReadme.includes('original or properly licensed materials/textures'))throw new Error('Production architecture evidence boundary missing')

console.log('Kingdom population + interiors + Metaverse Bible + architecture contract: PASS')
