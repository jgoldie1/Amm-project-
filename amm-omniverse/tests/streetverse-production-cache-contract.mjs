import fs from 'node:fs'

const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8')
const sw=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE PRODUCTION CACHE CONTRACT FAIL: '+msg)}

const indexVersion=index.match(/const SW_VERSION='([^']+)'/)?.[1]
const workerVersion=sw.match(/const RELEASE = '([^']+)'/)?.[1]
must(Boolean(indexVersion),'index must declare a current service-worker release')
must(indexVersion===workerVersion,'index and worker must share one current release')
must(!/20261002|birthday-live-fix-v2/.test(indexVersion||''),'obsolete October 2 release must never return')
const appRecovery=index.match(/const KEY='(tryamm-asset-recovery-[^']+)'/)?.[1]
const swRecovery=sw.match(/const k='(tryamm-stale-asset-[^']+)'/)?.[1]
must(Boolean(appRecovery)&&Boolean(swRecovery),'stale-bundle recoveries must have unique keys')
must(index.includes("u.searchParams.set('_tryamm_recover'"),'app must preserve stale chunk recovery')
must(sw.includes("u.searchParams.set('_tryamm_recover'"),'worker must preserve stale chunk recovery')
must(sw.includes("request.mode === 'navigate'"),'navigation must remain network-first')
must(sw.includes("fetch(request, { cache: 'no-store' })"),'worker must bypass stale HTTP cache for app shell')
must(sw.includes("k.startsWith('tryamm-') && k !== CACHE_NAME"),'worker must delete older TRYAMM caches only')
must(index.includes("keys.filter(key=>key.startsWith('tryamm-'))"),'app must clear outdated TRYAMM caches')
console.log('STREETVERSE PRODUCTION CACHE CONTRACT PASS: no stale October 2 release and aligned current cache version '+indexVersion)
