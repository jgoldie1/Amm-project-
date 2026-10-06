import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const now=read('src/components/StreetVerseNowDrawer.tsx')
const presence=read('src/components/StreetVerseRealtimePresence.tsx')
const liveStatus=read('api/live/status.js')
const pkg=JSON.parse(read('package.json'))
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE NOW/LIVE CONTRACT FAIL: '+msg)}

for(const token of [
  "import StreetVerseRealtimePresence",
  "import StreetVerseNowDrawer",
  "<StreetVerseRealtimePresence/><StreetVerseNowDrawer/>",
  "['now','● NOW / LIVE']",
  "target==='now'",
]) must(world.includes(token),'mobile world missing '+token)

for(const token of [
  "tryamm:streetverse-multiplayer-presence",
  "tryamm:streetverse-now-open",
  "WATCH",
  "MEET",
  "⚔ PK",
  "🎙 COHOST",
  "🔴 GO LIVE",
  "/api/live/status",
  "readyForPublic",
]) must(now.includes(token),'NOW drawer missing '+token)

for(const token of [
  "streetverse:chicago:district-01",
  "sb.channel",
  "presence",
  "player-motion",
  "tryamm:live-session",
  "streamRoom",
]) must(presence.includes(token),'realtime presence missing '+token)

for(const token of [
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "readyForPublic:configured",
  "credentials-required",
]) must(liveStatus.includes(token),'LIVE provider gate missing '+token)

must(!now.includes('Math.random()'),'NOW discovery must not fabricate viewers/online people')
must(String(pkg.scripts?.build||'').includes('streetverse-now-live-convergence-contract.mjs'),'production build does not run NOW/LIVE contract')

console.log('STREETVERSE NOW + LIVE CONVERGENCE CONTRACT PASS')
