import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const runtime=read('src/runtime/CreatorVerseRoomRuntime.ts')
const ui=read('src/components/CreatorVerseRoomCenter.tsx')
const main=read('src/main.tsx')
const launch=read('src/components/GlobalLaunchBar.tsx')
const pocket=read('src/runtime/TryammPocketEdgeRuntime.ts')
const worker=read('src/runtime/TryammPocketEdgeWorker.ts')
const pkg=JSON.parse(read('package.json'))
const must=(ok,msg)=>{if(!ok)throw new Error('CREATORVERSE CONTRACT FAIL: '+msg)}

for(const token of [
  "brandStatus:CreatorVerseBrandStatus",
  "thirdPartyBrandingRequiresRights:true",
  "celebrityLikenessRequiresAuthorization:true",
  "hiddenMining:false",
  "crowdComputeOptIn:true",
  "pocketHeavyBuild:false",
  "authoritativeMoneyServerOnly:true",
  "authoritativeWorldStateServerOnly:true",
  "edgeResultsRequireVerification:true",
  "maxParticipants:Math.max(10,Math.min(50000",
  "tryamm:holo-verse-transit-request",
  "tryamm:live-session",
  "tryamm:creatorverse-crowd-build-plan",
  "readEdgeGridPreferences",
]) must(runtime.includes(token),'runtime missing '+token)

for(const token of [
  'CREATORVERSE ROOMS',
  'Brand owned',
  'Brand licensed',
  'Rights pending',
  'HOLO FLY IN',
  '🔴 GO LIVE',
  '⚡ CROWD BUILD',
  'Capacity:',
  '15000',
]) must(ui.includes(token),'UI missing '+token)

must(main.includes("CreatorVerseRoomCenter"),'CreatorVerse route not wired')
must(main.includes("CreatorVerseRoomRuntime"),'CreatorVerse runtime not installed')
must(launch.includes("['CREATORVERSE','/creatorverse']"),'CreatorVerse global launcher missing')
must(pocket.includes('noBackgroundMining:true'),'Pocket Edge hidden mining guard missing')
must(worker.includes('hiddenPageExecution:false'),'Pocket Edge hidden-page guard missing')
must(worker.includes('lowBatteryPause:true'),'Pocket Edge low-battery guard missing')
must(String(pkg.scripts?.build||'').includes('creatorverse-room-crowdbuild-contract.mjs'),'production build does not run CreatorVerse contract')

console.log('CREATORVERSE ROOMS + CROWD BUILD CONTRACT PASS')
