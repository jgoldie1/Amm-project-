import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const registry=read('src/data/AllAmerican24x7Programming.ts')
const runtime=read('src/runtime/AllAmerican24x7ProgrammingRuntime.ts')
const panel=read('src/components/AllAmerican24x7ProgrammingPanel.tsx')
const convergence=read('src/runtime/StreetVerseBroadcastConvergenceRuntime.ts')
const queue=read('src/components/WorldToBroadcastQueue.tsx')
const studio=read('src/components/AllAmericanNetworkControlRoom.tsx')
const news=read('src/game/holographic/TryammNewsNetwork.ts')
const who=read('src/components/StreetVerseWhoOnlineRail.tsx')
const workweek=read('src/runtime/CreatorWorkweekRuntime.ts')
const pkg=JSON.parse(read('package.json'))
const must=(ok,msg)=>{if(!ok)throw new Error('ALL AMERICAN 24X7 CRYPTO BROADCAST CONTRACT FAIL: '+msg)}

for(const token of [
  "aan-crypto-education",
  "Crypto Classroom",
  "Crypto Risk & Scam Watch",
  "educationalOnly:true",
  "noPersonalizedInvestmentAdvice:true",
  "noGuaranteedReturns:true",
  "syntheticHostDisclosureRequired:true",
  "sourceLinksAndTimestampsRequiredForNews:true",
  "transactionsRemainProviderAndComplianceGated:true",
]) must(registry.includes(token),'registry missing '+token)

for(const token of [
  "noFakeLive:true",
  "noFakeAnalysts:true",
  "host-needed",
  "source-needed",
  "Educational program — not live news.",
  "Replay — not live.",
  "tryamm:all-american-network-program",
  "tryamm:all-american-fallback-program",
]) must(runtime.includes(token),'24x7 runtime missing '+token)

for(const token of [
  "Human Hosts → Replays/Education → Full Network Clock",
  "CRYPTO EDUCATION DESK",
  "Educational only — not financial advice.",
  "BUILD HOLOGPT RUNDOWN",
]) must(panel.includes(token),'programming panel missing '+token)

for(const token of [
  "tryamm:live-session",
  "tryamm:streetverse-mission-complete",
  "tryamm:business-passport-created",
  "tryamm:reel-published",
  "tryamm:sportverse-event-complete",
  "tryamm:world-to-broadcast-load",
]) must(convergence.includes(token),'world-to-broadcast missing '+token)

must(queue.includes('WORLD → BROADCAST'),'world-to-broadcast UI missing')
must(queue.includes('StreetVerse Story Desk'),'StreetVerse story desk missing')
must(studio.includes('Crypto Education Desk'),'studio format missing crypto desk')
must(studio.includes('SOURCE DESK'),'studio equipment missing source desk')
must(studio.includes('DATA WALL'),'studio equipment missing data wall')
must(studio.includes('<WorldToBroadcastQueue/>'),'studio missing world-to-broadcast queue')
must(studio.includes('<AllAmerican24x7ProgrammingPanel/>'),'studio missing 24x7 programming panel')

for(const token of [
  "scope:'crypto-education'",
  "scope:'finance-technology'",
  "cryptoEducationNotFinancialAdvice:true",
  "cryptoUndisclosedPromotionProhibited:true",
]) must(news.includes(token),'news network missing '+token)

for(const token of ["WHO'S ONLINE","🔴 GO LIVE","WATCH","MEET"]) must(who.includes(token),'Who Online rail missing '+token)
for(const token of ['targetHours:20','weeklyCapHours:40','discoveryDoesNotIncreaseAfterHours:30','BREAK_DUE']) must(workweek.includes(token),'creator workweek missing '+token)

must(String(pkg.scripts?.build||'').includes('all-american-24x7-crypto-broadcast-contract.mjs'),'production build does not run 24x7 crypto broadcast contract')

console.log('ALL AMERICAN 24X7 + CRYPTO EDUCATION + WORLD-TO-BROADCAST CONTRACT PASS')
