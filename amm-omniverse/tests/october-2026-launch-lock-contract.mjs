import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const lock=JSON.parse(read('config/october-2026-launch-lock.json'))
const actions=read('src/components/StreetVerseActionCarousel.tsx')
const readiness=read('api/readiness.js')
const app=read('src/main.tsx')
const pkg=JSON.parse(read('package.json'))

const must=(ok,msg)=>{if(!ok)throw new Error('OCTOBER LAUNCH LOCK FAIL: '+msg)}

must(lock?.schema==='tryamm.october-2026-launch-lock.v1','schema')
must(lock?.status==='LOCKED_RC','release status')
must(lock?.launchMode==='web-pwa-public-alpha','launch mode')
must(lock?.freeze?.enabled===true,'scope freeze')
must(Array.isArray(lock?.stopShipGates)&&lock.stopShipGates.length>=8,'stop-ship gates')
must(Array.isArray(lock?.providerGatedNonBlocking)&&lock.providerGatedNonBlocking.length>=6,'provider-gated lanes')
must(String(lock?.releaseTruth||'').includes('real working core'),'release truth')
must(actions.includes("const [open,setOpen]=useState(()=>!mobile)"),'mobile actions not play-first')
must(actions.includes("tryamm:streetverse-play-focus"),'play focus close path missing')
must(readiness.includes("requestedProfile === 'streetverse'"),'StreetVerse readiness profile missing')
must(readiness.includes("commerceReady"),'commerce gate missing')
must(readiness.includes("fullPlatformReady"),'full-platform distinction missing')
must(app.includes("StreetVerseMobileWorld"),'StreetVerse route missing')
must(String(pkg.scripts?.build||'').includes('october-2026-launch-lock-contract.mjs'),'build does not enforce launch lock')

console.log(JSON.stringify({
  release:lock.release,
  status:lock.status,
  launchMode:lock.launchMode,
  frozen:lock.freeze.enabled,
  providerGated:lock.providerGatedNonBlocking.map(x=>x.id)
},null,2))
console.log('TRYAMM OCTOBER 2026 LAUNCH LOCK CONTRACT PASS')
