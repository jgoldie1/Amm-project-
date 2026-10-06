import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const data=read('src/data/OctoberLaunchLock.ts')
const ui=read('src/components/OctoberLaunchLockCenter.tsx')
const main=read('src/main.tsx')
const launch=read('src/components/GlobalLaunchBar.tsx')
const readiness=read('api/readiness.js')
const live=read('api/live/status.js')
const pkg=JSON.parse(read('package.json'))
const must=(ok,msg)=>{if(!ok)throw new Error('OCTOBER LAUNCH LOCK CONTRACT FAIL: '+msg)}

for(const token of [
  "schema:'tryamm.october-launch-lock.v1'",
  "mode:'PUBLIC_ALPHA'",
  "freezeNewScope:true",
  "noFakeGreen:true",
  "launchBlocker:false",
  "StreetVerse Mobile Play Mode",
  "All American Network Prime",
  "OmniCare 360 Navigation",
  "PropertyVerse / House Flip Planning",
  "Production LIVE / PK / Multi-guest",
  "Real Payments / Creator Payouts",
  "External TV / FAST / CTV Distribution",
]) must(data.includes(token),'launch registry missing '+token)

for(const token of [
  '/api/readiness?profile=streetverse',
  '/api/live/status',
  '/api/system/release',
  'PUBLIC ALPHA READY',
  'What ships in public alpha',
  'These do not block public alpha',
]) must(ui.includes(token),'launch lock UI missing '+token)

must(main.includes("OctoberLaunchLockCenter"),'launch lock route component missing')
must(main.includes("isLaunchLock"),'launch lock route predicate missing')
must(launch.includes("['LAUNCH LOCK','/launch-lock']"),'launch lock quick launcher missing')
must(readiness.includes("requestedProfile === 'streetverse'"),'StreetVerse readiness profile missing')
must(live.includes("requiredEnvironment:['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET']"),'LIVE provider gate is not explicit')
must(String(pkg.scripts?.build||'').includes('october-launch-lock-contract.mjs'),'production build does not run launch lock contract')

console.log('OCTOBER PUBLIC ALPHA LAUNCH LOCK CONTRACT PASS')
