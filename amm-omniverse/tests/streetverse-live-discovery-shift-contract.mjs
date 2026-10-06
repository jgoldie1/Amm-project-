import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const rail=read('src/components/StreetVerseOnlineLiveRail.tsx')
const shift=read('src/runtime/CreatorHostShiftRuntime.ts')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const main=read('src/main.tsx')
const pkg=JSON.parse(read('package.json'))
const must=(ok,msg)=>{if(!ok)throw new Error('LIVE DISCOVERY SHIFT CONTRACT FAIL: '+msg)}

for(const token of [
  "WHO'S ONLINE • STREETVERSE",
  "tryamm:streetverse-multiplayer-presence",
  "tryamm:live-directory-state",
  "tryamm:creator-host-shift-state",
  "WAVE",
  "DROP",
  "WATCH",
  "PK",
  "GO LIVE",
]) must(rail.includes(token),'online rail missing '+token)

for(const token of [
  "weeklyTargetHours",
  "breakEveryMinutes",
  "tryamm:creator-host-shift-start",
  "tryamm:creator-host-shift-stop",
  "tryamm:creator-host-break-due",
  "tryamm:live-session",
  "tryamm:live-session-end",
]) must(shift.includes(token),'host shift missing '+token)

must(world.includes("<StreetVerseOnlineLiveRail/>"),'StreetVerse does not mount online live rail')
must(main.includes("CreatorHostShiftRuntime"),'creator host shift runtime not installed')
must(String(pkg.scripts?.build||'').includes('streetverse-live-discovery-shift-contract.mjs'),'production build does not run live discovery contract')

console.log('STREETVERSE LIVE DISCOVERY + HOST SHIFT CONTRACT PASS')
