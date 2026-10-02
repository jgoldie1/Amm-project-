import fs from 'node:fs'

const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8')
const sw=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8')
const release='20261002-birthday-live-fix-v2'
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE PRODUCTION CACHE CONTRACT FAIL: '+msg)}

must(index.includes(`const SW_VERSION='${release}'`),'index service-worker version must match Oct 2 live release')
must(sw.includes(`const RELEASE = '${release}'`),'service worker release must match index')
must(index.includes("tryamm-asset-recovery-v30"),'index recovery key must rotate with release')
must(index.includes("_tryamm_recover','v30'"),'index recovery query must rotate with release')
must(sw.includes("tryamm-stale-asset-v30"),'service-worker recovery key must rotate with release')
must(sw.includes("_tryamm_recover','v30'"),'service-worker recovery query must rotate with release')
must(sw.includes("request.mode === 'navigate'"),'navigation must stay network-first')
must(sw.includes("fetch(request, { cache: 'no-store' })"),'service worker must bypass stale HTTP cache for app shell')

console.log('STREETVERSE PRODUCTION CACHE CONTRACT PASS: index + service worker release generations aligned')
