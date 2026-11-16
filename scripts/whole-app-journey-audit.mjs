import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root=resolve(process.cwd())
const results=[]
const evidence=(path)=>existsSync(join(root,path))
const record=(id,description,status,details)=>results.push({id,description,status,details})
const text=(path)=>evidence(path)?readFileSync(join(root,path),'utf8'):''
const groups=[
 ['root-auth','Root sign-in and protected business APIs',['server.js','lib/daily-business-boost-routes.js']],
 ['passport','Business Passport creation and directory',['public/business-boost.js','lib/daily-business-boost-routes.js']],
 ['platform-home','TRYAMM customer entry',['amm-omniverse/src/components/TryAMMHome.tsx']],
 ['streetverse','StreetVerse mobile regression',['amm-omniverse/tests/streetverse-iphone-first-journey-contract.mjs']],
 ['commerce','Server-authoritative checkout checks',['amm-omniverse/tests/server-authoritative-stripe-contract.mjs']],
 ['accessibility','One-handed navigation contract',['amm-omniverse/tests/streetverse-one-hand-integration-contract.mjs']],
 ['hologpt','HoloGPT assistant entry',['amm-omniverse/src/components/HoloGPTAssistant.tsx']],
 ['middleverse','MiddleVerse launcher',['amm-omniverse/src/components/TryAMMHome.tsx']],
 ['omnichannel','Commerce channel readiness UI',['amm-omniverse/src/components/AllAmericanOmnichannelCenter.tsx']],
 ['income','Business income ledger view',['amm-omniverse/src/components/BusinessIncomeCenter.tsx']]
]
for(const [id,description,files] of groups){
 const missing=files.filter(f=>!evidence(f))
 record(id,description,missing.length?'FAIL':'PASS',missing.length?'Missing: '+missing.join(', '):'Source files present; runtime behavior assessed by the CI test lanes')
}
const routes=text('lib/daily-business-boost-routes.js')
record('passport-post','Authenticated business creation route',/app\.post\('\/api\/business\/passport',\s*auth/.test(routes)?'PASS':'FAIL','Expected POST /api/business/passport protected by auth')
record('directory-get','Business directory route',/app\.get\('\/api\/business\/directory'/.test(routes)?'PASS':'FAIL','Expected GET /api/business/directory')
const home=text('amm-omniverse/src/components/TryAMMHome.tsx')
record('streetverse-link','StreetVerse entry button',home.includes("window.location.href='/streetverse'")?'PASS':'FAIL','Inspect homepage route to StreetVerse')
record('hologpt-link','HoloGPT entry button',home.includes('__showHoloGPT')?'PASS':'FAIL','Inspect HoloGPT launcher')
record('middleverse-link','MiddleVerse entry button',home.includes('__showMiddleverseWorkstation')?'PASS':'FAIL','Inspect MiddleVerse launcher')

// Inventory counts are deliberately NOT inferred from marketing copy or test filenames.
// Verified records must be documented in source manifests; otherwise report BLOCKED.
const manifests=[
 ['templates-111','111 selectable business-template records','config/business-factory/templates.json',111],
 ['showcase-31','31 showcase business records','config/business-factory/showcase.json',31]
]
for(const [id,description,file,expected] of manifests){
 if(!evidence(file)){record(id,description,'BLOCKED','No verified catalog manifest at '+file);continue}
 try{
  const parsed=JSON.parse(text(file))
  if(!Array.isArray(parsed)){record(id,description,'FAIL','Expected a JSON array');continue}
  const ids=parsed.map(item=>item?.id).filter(Boolean)
  const unique=new Set(ids)
  const valid=parsed.length===expected&&ids.length===expected&&unique.size===expected
  record(id,description,valid?'PASS':'FAIL','Found '+parsed.length+' rows, '+unique.size+' unique IDs; required '+expected)
 }catch(error){record(id,description,'FAIL','Invalid catalog manifest: '+String(error.message))}
}
record('launch-handoff','Selectable template -> persistent site -> published URL','BLOCKED','Requires an authenticated, isolated creation/publish test with a verified template manifest')
record('payments-live','Real payment authorization, webhook and refunds','BLOCKED','Requires sandbox provider credentials and sandbox-only end-to-end tests; no real charges')
record('customer-browser','Chromebook, iPhone, keyboard, voice and screen-reader journeys','BLOCKED','Requires browser automation against a reachable preview and assisted device acceptance')
record('disabled-freeway','Disabled People\'s Freeway end-to-end route','BLOCKED','Requires canonical route, accessibility acceptance and live backend contract')
record('backups','Backup/restore recovery','BLOCKED','Requires isolated restore proof; this test must never overwrite production')
record('tenant-isolation','Business-to-business tenant separation','BLOCKED','Verify ownership checks on every read/write, IDOR protection and cross-account access denials')
record('payment-idempotency','Payment webhook signatures and retry-safe settlement','BLOCKED','Requires sandbox duplicate/replay/refund tests and authoritative provider verification')
record('business-privacy','Customer privacy, deletion and consent','BLOCKED','Requires verified collection, retention, deletion, consent and protected record access')
record('live-provider','LIVE host/viewer connection and recording permissions','BLOCKED','Requires isolated two-device streaming test, recording consent and provider verification')
record('resilience','Production rollback, outage and rate-limit recovery','BLOCKED','Requires monitored deployment canary, rollback and abuse/limit tests')
record('notifications','Customer lead and booking delivery','BLOCKED','Requires delivery, retry, dedupe, spam and recipient verification')
record('business-pilots','Construction, LaTeasia Monroe BeautyVerse, Sculptify','BLOCKED','Requires separately owned staging businesses with bookings/forms/orders and site publishing verified')
record('showcase-safety','31-business showcase consent and asset rights','BLOCKED','Requires verified business identity, approved images and permission to publish')

const counts=Object.fromEntries(['PASS','FAIL','BLOCKED'].map(s=>[s,results.filter(x=>x.status===s).length]))
const strict=process.argv.includes('--strict')
const ready=counts.FAIL===0&&counts.BLOCKED===0
const out={schemaVersion:2,kind:'tryamm-whole-app-readiness',generatedAt:new Date().toISOString(),readyForProduction:ready,strict,counts,results}
const dir=join(root,'release-evidence')
mkdirSync(dir,{recursive:true})
writeFileSync(join(dir,'whole-app-readiness.json'),JSON.stringify(out,null,2)+'\n')
const lines=['# TRYAMM Whole-App Readiness','',`Checks: ${results.length}; PASS: ${counts.PASS}; FAIL: ${counts.FAIL}; BLOCKED: ${counts.BLOCKED}`,'','| Feature | Status | Evidence |','|---|---|---|',...results.map(r=>`| ${r.description.replaceAll('|','/')} | ${r.status} | ${r.details.replaceAll('|','/')} |`),'','PASS for source files means source existence only, not live customer functionality. BLOCKED is never interpreted as a pass. In --strict mode, either FAIL or BLOCKED prevents a release.']
writeFileSync(join(dir,'whole-app-readiness.md'),lines.join('\n')+'\n')
console.log(lines.join('\n'))
if(counts.FAIL||(strict&&!ready)){ console.error('Release held: '+counts.FAIL+' failures, '+counts.BLOCKED+' unverified blockers'); process.exitCode=1 }
