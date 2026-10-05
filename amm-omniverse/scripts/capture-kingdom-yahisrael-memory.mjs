import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,statSync,writeFileSync} from 'node:fs'
import path from 'node:path'
import {spawnSync} from 'node:child_process'

const root=process.cwd()
const base=String(process.env.TRYAMM_BASE_URL||'https://tryamm.online').replace(/\/$/,'')
const out=path.resolve(process.argv[2]||'release-evidence/googolplex-memory/kingdom-yahisrael')
mkdirSync(out,{recursive:true})
const files=[
 'src/data/KingdomYahisraelRecoveryRegistry.ts',
 'src/data/SystemVsKingdomRecoveryManifest.ts',
 'src/components/KingdomYahisraelCenter.tsx',
 'src/components/JudahSplash.tsx',
 'src/components/LionOfJudahHolo.tsx',
 'src/components/EthiopianBibleMetaverse.tsx',
 'src/components/StreetVerseFaithChronoPortal.tsx',
 'src/components/FaithChronoLauncher.tsx',
 'src/components/FaithMetaverseBibleWorldMap.tsx',
 'src/components/FaithHoloBook.tsx',
 'src/components/FaithScriptureReader.tsx',
 'src/components/KingdomWorkbookCenter.tsx',
 'src/data/KingdomWorkbookRegistry.ts',
 'src/components/SetApartPassportReceipts.tsx',
 'src/data/FaithVerseStudyLibrary.ts',
 'src/components/KingdomsPressHub.tsx',
 'src/components/KingdomsPressOperations.tsx',
 'src/components/KingdomDistrictRoute.tsx',
 'src/runtime/KingdomStreetVerseBridge.ts',
 'src/data/SevenLightsCanonRegistry.ts',
 'public/streetverse-kingdom/index.html',
 'public/streetverse-kingdom/01-core-world.js',
 'public/streetverse-kingdom/02-physics-traffic.js',
 'public/streetverse-kingdom/03-spawn-phone.js',
 'public/streetverse-kingdom/04-radial-input.js',
 'public/streetverse-kingdom/05-player-camera-hud.js',
 'public/streetverse-kingdom/06-loop.js',
 'public/streetverse-kingdom/07-yahisrael-living-world.js',
]
const hash=file=>createHash('sha256').update(readFileSync(path.join(root,file))).digest('hex')
const manifest={
 schema:'tryamm.googolplex.kingdom-yahisrael-memory.v1',
 capturedAt:new Date().toISOString(),
 canonicalFrontDoor:'/kingdom-of-yahisrael',
 playableKingdom:'/kingdom',
 faithVerse:'/faithverse',
 brand:'Kingdom of Yahisrael • Judah — Where Heaven Meets Earth',
 requiredMarkers:['METAVERSE BIBLE','ETHIOPIAN FAITH WORLD','81-BOOK','PALEO','STRONGS','FAITH CHRONO','YAHISRAEL','WHERE HEAVEN MEETS EARTH','JUDAH GATE','FAITHVERSE','KINGDOM WORKBOOK','HEBREW SCHOOL','KINGDOM GARDEN','KINGDOMS PRESS','ALL AMERICAN NETWORK','SET APART','SEVEN LIGHTS'],
 files:Object.fromEntries(files.map(file=>[file,{sha256:hash(file),bytes:statSync(path.join(root,file)).size}])),
 regressionRule:'Kingdom convergence is not green if the front door, FaithVerse, Kingdom District, Judah identity, Scripture study, Press, story canon or same-origin bridge protection disappears.',
}
writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
const run=args=>{const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',args,{stdio:'inherit',env:process.env});if(result.status!==0)process.exit(result.status||1)}
if(String(process.env.TRYAMM_CAPTURE_KINGDOM_YAHISRAEL_SCREENSHOTS||'').toLowerCase()==='true'){
 const pw=['--yes','playwright@1.55.0'];run([...pw,'install','chromium'])
 for(const shot of [
  {name:'yahisrael-mobile-390x844.png',route:'/kingdom-of-yahisrael',size:'390,844',wait:'4000'},
  {name:'yahisrael-desktop-1440x900.png',route:'/kingdom-of-yahisrael',size:'1440,900',wait:'4000'},
  {name:'faithverse-mobile-390x844.png',route:'/faithverse',size:'390,844',wait:'4000'},
  {name:'kingdom-workbook-mobile-390x844.png',route:'/kingdom-workbook',size:'390,844',wait:'4000'},
  {name:'kingdom-playable-mobile-390x844.png',route:'/kingdom',size:'390,844',wait:'5000'},
 ])run([...pw,'screenshot','--browser','chromium','--viewport-size',shot.size,'--wait-for-timeout',shot.wait,base+shot.route,path.join(out,shot.name)])
}
console.log(JSON.stringify({ok:true,out,files:files.length,screenshotMode:String(process.env.TRYAMM_CAPTURE_KINGDOM_YAHISRAEL_SCREENSHOTS||'false')},null,2))