import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,readdirSync,statSync,writeFileSync} from 'node:fs'
import path from 'node:path'
import {spawnSync} from 'node:child_process'

const root=process.cwd()
const base=String(process.env.TRYAMM_BASE_URL||'https://tryamm.online').replace(/\/$/,'')
const out=path.resolve(process.argv[2]||'release-evidence/googolplex-memory/kingdom')
mkdirSync(out,{recursive:true})

const files=[
 'public/streetverse-kingdom/index.html',
 'public/streetverse-kingdom/style.css',
 'public/streetverse-kingdom/01-core-world.js',
 'public/streetverse-kingdom/02-physics-traffic.js',
 'public/streetverse-kingdom/03-spawn-phone.js',
 'public/streetverse-kingdom/04-radial-input.js',
 'public/streetverse-kingdom/05-player-camera-hud.js',
 'public/streetverse-kingdom/06-loop.js',
 'public/streetverse-kingdom/tryamm-bridge.js',
 'src/components/KingdomDistrictRoute.tsx',
 'src/runtime/KingdomStreetVerseBridge.ts',
 'src/components/StreetVerseActionCarousel.tsx',
 'src/runtime/StreetVerseAbracadabraGeniiRuntime.ts',
 'src/components/StreetVerseRPOmnibar.tsx',
 'src/components/StreetVerseRPActionSearch.tsx',
]
const hash=file=>createHash('sha256').update(readFileSync(path.join(root,file))).digest('hex')
const manifest={
 schema:'tryamm.googolplex.kingdom-memory.v1',
 capturedAt:new Date().toISOString(),
 canonicalRoute:'/kingdom',
 canonicalGame:'/streetverse-kingdom/index.html',
 requiredVisualMarkers:['KINGDOM DISTRICT','Crown Heights','KD 5G','Auto-drive','Phone','RP SEARCH','ABRACADABRA GENII'],
 files:Object.fromEntries(files.map(file=>[file,{sha256:hash(file),bytes:statSync(path.join(root,file)).size}])),
 regressionRule:'A release is not Kingdom-green if the canonical game files disappear, hashes are missing, the route stops pointing to the canonical iframe, or required visual markers cannot be captured.',
}
writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')

const run=(args)=>{
 const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',args,{stdio:'inherit',env:process.env})
 if(result.status!==0)process.exit(result.status||1)
}
if(String(process.env.TRYAMM_CAPTURE_KINGDOM_SCREENSHOTS||'').toLowerCase()==='true'){
 const pw=['--yes','playwright@1.55.0']
 run([...pw,'install','chromium'])
 const url=base+'/kingdom'
 for(const shot of [
  {name:'kingdom-mobile-start-390x844.png',size:'390,844',wait:'5000'},
  {name:'kingdom-desktop-start-1440x900.png',size:'1440,900',wait:'5000'},
 ]){
   run([...pw,'screenshot','--browser','chromium','--viewport-size',shot.size,'--wait-for-timeout',shot.wait,url,path.join(out,shot.name)])
 }
}
console.log(JSON.stringify({ok:true,out,files:files.length,screenshotMode:String(process.env.TRYAMM_CAPTURE_KINGDOM_SCREENSHOTS||'false')},null,2))
