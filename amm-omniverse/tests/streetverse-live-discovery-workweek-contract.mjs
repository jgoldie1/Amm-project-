import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const presence=read('src/components/StreetVerseRealtimePresence.tsx')
const rail=read('src/components/StreetVerseWhoOnlineRail.tsx')
const workweek=read('src/runtime/CreatorWorkweekRuntime.ts')
const growth=read('src/components/StreetVerseCreatorGrowthPanel.tsx')
const overlays=read('src/components/StreetVerseFullWorldOverlays.tsx')
const main=read('src/main.tsx')
const liveProduct=read('src/runtime/OmniLiveProductRuntime.ts')
const pkg=JSON.parse(read('package.json'))
const must=(ok,msg)=>{if(!ok)throw new Error('LIVE DISCOVERY WORKWEEK CONTRACT FAIL: '+msg)}

for(const token of ['displayName','avatarUrl','live:boolean','streamRoom','creatorMode','tryamm:live-session','tryamm:live-session-end'])must(presence.includes(token),'presence missing '+token)
for(const token of ["WHO'S ONLINE",'tryamm:streetverse-multiplayer-presence','🔴 GO LIVE','WATCH','MEET','tryamm:streetverse-player-action-send'])must(rail.includes(token),'Who Online rail missing '+token)
for(const token of ['liveMinutes','liveSessions','reelsPublished','missionsCompleted','breaksTaken','targetHours','discoveryScore','weeklyCapHours:40','discoveryDoesNotIncreaseAfterHours:30','tryamm:creator-repurpose-prompt'])must(workweek.includes(token),'workweek missing '+token)
must(workweek.includes("addEventListener('tryamm:live-session-end',onLive)"),'workweek does not close ended LIVE sessions')
must(growth.includes('CREATOR WORKWEEK'),'Creator Pass lacks workweek UI')
must(growth.includes('30h'),'Creator Pass lacks sustainable discovery plateau')
must(overlays.includes('<StreetVerseWhoOnlineRail/>'),'Who Online rail not mounted in StreetVerse')
must(main.includes("CreatorWorkweekRuntime"),'Creator Workweek runtime not globally installed')
must(liveProduct.includes('noFakeViewers:true'),'Omni LIVE invariant noFakeViewers missing')
must(String(pkg.scripts?.build||'').includes('streetverse-live-discovery-workweek-contract.mjs'),'production build does not run live discovery contract')

console.log('STREETVERSE LIVE DISCOVERY + CREATOR WORKWEEK CONTRACT PASS')
