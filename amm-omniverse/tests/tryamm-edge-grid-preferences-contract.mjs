import fs from 'node:fs'
const prefs=fs.readFileSync(new URL('../src/runtime/TryammEdgeGridPreferences.ts',import.meta.url),'utf8')
const worker=fs.readFileSync(new URL('../src/runtime/TryammPocketEdgeWorker.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM EDGE GRID PREFERENCES CONTRACT FAIL: '+msg)}
must(prefs.includes('paidGridOptIn:false'),'paid grid must default off')
must(prefs.includes('chargingOnlyForPaidWork:true'),'paid work must default charging-only')
must(prefs.includes('wifiOnlyForPaidWork:true'),'paid work must default Wi-Fi-only')
must(prefs.includes("blockers.push('wifi-state-unavailable')"),'unknown network must fail closed when Wi-Fi-only is enabled')
must(prefs.includes('privateDataSharing:false'),'private-data sharing prohibition missing')
must(worker.includes('paidGridEligibility'),'worker must enforce paid-grid preferences')
must(worker.includes('work_order_id'),'worker must distinguish funded jobs from personal jobs')
console.log('TRYAMM EDGE GRID PREFERENCES CONTRACT PASS: separate paid opt-in + charging/Wi-Fi/battery/work-class controls')
