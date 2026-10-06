import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const registry=read('src/data/AllAmericanNetworkPrimeRegistry.ts')
const newsroom=read('src/runtime/AllAmericanNetworkPrimeNewsroomRuntime.ts')
const prime=read('src/components/AllAmericanNetworkPrimeDeck.tsx')
const hub=read('src/components/AllAmericanNetworkHub.tsx')
const studio=read('src/components/AllAmericanNetworkControlRoom.tsx')
const os=read('src/components/TryammBroadcastNetworkCenter.tsx')
const main=read('src/main.tsx')
const pkg=JSON.parse(read('package.json'))
const must=(ok,msg)=>{if(!ok)throw new Error('ALL AMERICAN NETWORK PRIME CONTRACT FAIL: '+msg)}

for(const token of ['ALL_AMERICAN_24_7_CLOCK','cryptoEducationOnly:true','noGuaranteedReturns:true','noPersonalizedFinancialAdvice:true','sourceAttributionRequired:true','unverifiedScraperResultsCannotBecomeBreakingNews:true'])must(registry.includes(token),'registry missing '+token)
must((registry.match(/startHour:/g)||[]).length>=10,'24/7 clock has too few scheduled blocks')
for(const token of ['/api/oracle/search?q=','/api/intelligence/global-weather?action=status','location=chicago','verification','configured'])must(newsroom.includes(token),'newsroom missing '+token)
for(const token of ['ALL AMERICAN NETWORK','One network.','ORACLE NEWSROOM','CHICAGO WEATHER DESK','CRYPTO CLASSROOM','PRODUCTION FLOOR','StreetVerse LIVE','MusicVerse LIVE'])must(prime.includes(token),'prime UI missing '+token)
must(prime.includes('Oracle feed is not verified/configured yet.'),'Prime UI lacks fail-closed news state')
must(prime.includes('Education only—no guaranteed returns and no personalized financial advice.'),'Prime UI lacks crypto risk disclosure')
must(hub.includes('<AllAmericanNetworkPrimeDeck/>'),'Network hub does not mount Prime viewer')
for(const token of ['global-news-weather','crypto-classroom'])must(studio.includes(token),'studio missing '+token)
for(const token of ['global-news-weather','crypto-classroom'])must(os.includes(token),'Broadcast OS missing '+token)
must(main.includes('AllAmericanNetworkPrimeNewsroomRuntime'),'Prime newsroom runtime not installed')
must(String(pkg.scripts?.build||'').includes('all-american-network-prime-contract.mjs'),'production build does not run Prime contract')

console.log('ALL AMERICAN NETWORK PRIME CONTRACT PASS')