import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const os=read('src/runtime/TryammBroadcastOSRuntime.ts')
const center=read('src/components/TryammBroadcastNetworkCenter.tsx')
const news=read('src/game/holographic/TryammNewsNetwork.ts')
const studio=read('src/runtime/BroadcastStudioRuntime.ts')
const hub=read('src/components/AllAmericanNetworkHub.tsx')
const main=read('src/main.tsx')
const workweek=read('src/runtime/CreatorWorkweekRuntime.ts')
const online=read('src/components/StreetVerseWhoOnlineRail.tsx')
const ctv=read('src/services/ctvProvider.ts')
const globalWeather=read('api/intelligence/global-weather.js')
const nws=read('api/intelligence/weather.js')
const pkg=JSON.parse(read('package.json'))

const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM BROADCAST OS CONTRACT FAIL: '+msg)}

for(const token of [
  "id:'all-american-network'",
  "id:'streetverse-local-tv'",
  "id:'isaiah-ai-tv'",
  "id:'starverse-live'",
  "id:'servants-of-christ-network'",
  "id:'sportsverse-live'",
  "id:'tryamm-reality'",
  "id:'tryamm-talk'",
  "id:'musicverse-tv'",
  "id:'tryamm-news'",
  "TRYAMM_NEWS_DESKS",
  "TRYAMM_DISTRIBUTION_MATRIX",
  "id:'roku-app'",
  "id:'roku-channel'",
  "id:'cable'",
  "id:'ota-fcc'",
  "tryamm:streetverse-mission-complete",
  "tryamm:live-session",
  "tryamm:reel-published",
  "tryamm:news-item-published",
]) must(os.includes(token),'Broadcast OS missing '+token)

for(const token of [
  "TRYAMM Local News",
  "TRYAMM National News",
  "TRYAMM International News",
  "TRYAMM Global News",
  "TRYAMM Politics & Civics",
  "TRYAMM Weather",
  "politicalCoverageRequiresNeutralEditorialSeparation:true",
  "politicalAdsMustBeClearlySeparatedFromNews:true",
]) must(news.includes(token),'news network missing '+token)

for(const token of [
  "BROADCAST OS",
  "NETWORK OF NETWORKS",
  "Who Wants to Be a Star?",
  "SportsVerse Fight Night",
  "Servants of Christ LIVE",
  "OMNINEWS / TRYAMM NEWSROOM",
  "CREATOR BROADCAST WORKWEEK",
  "weekly",
]) must(center.toLowerCase().includes(token.toLowerCase()),'control center missing '+token)

for(const token of [
  "'isaiah-ai-tv'",
  "'starverse-live'",
  "'sportsverse-live'",
  "'musicverse-tv'",
  "'tryamm-news'",
]) must(studio.includes(token),'studio routing missing '+token)

must(main.includes("TryammBroadcastNetworkCenter"),'Broadcast OS route component missing')
must(main.includes("'/network/broadcast-os'"),'Broadcast OS route missing')
must(main.includes("TryammBroadcastOSRuntime"),'Broadcast OS runtime not installed')
must(hub.includes('/network/broadcast-os'),'All American Network does not link Broadcast OS')
must(workweek.includes("targetHours:20"),'creator 20-hour target missing')
must(workweek.includes("liveMinutes>=40*60"),'creator 40-hour weekly cap missing')
must(workweek.includes("discoveryDoesNotIncreaseAfterHours:30"),'creator anti-grind cap missing')
must(online.includes("GO LIVE"),'Who Online rail does not expose GO LIVE')
must(ctv.includes("No approved CTV provider is configured yet"),'CTV provider gate missing')
must(globalWeather.includes("global_weather_provider_not_enabled"),'global weather provider gate missing')
must(nws.includes("nws_provider_not_enabled"),'NWS provider gate missing')
must(String(pkg.scripts?.build||'').includes('tryamm-broadcast-os-contract.mjs'),'production build does not run Broadcast OS contract')

console.log('TRYAMM BROADCAST OS + OMNINEWS CONTRACT PASS')
