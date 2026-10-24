import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const tracker=read('src/components/WebsiteLaunchTracker.tsx')
const pkg=JSON.parse(read('package.json'))
for(const k of ['normalizeEntries(value:unknown)','new Set<number>()','clean.sort((a,b)=>a.id-b.id)','paymentNotApplicable','paymentExceptionReason','noPaymentApproved(entry:Entry)','tryamm.client-website-launch-backup.v2','BACK UP ALL 20 SITES (JSON)','RESTORE A JSON BACKUP','file.size>128*1024','window.confirm','setSites(restored)'])assert(tracker.includes(k),'missing portable owner backup / explicit QA proof: '+k)
assert(!tracker.includes("notes.toLowerCase().includes('no payments')"),'notes must never waive payment QA')
assert(tracker.includes("if(!restored)throw new Error('Invalid backup entries"),'reject malformed backups')
assert(tracker.includes("No site was published or independently verified."),'restoring a checklist does not publish it')
assert(pkg.scripts.build.includes('tryamm-20-website-backup-restore-contract.mjs'))
console.log('TRYAMM 20 WEBSITE BACKUP AND QA PASS: portable backup/restore, 20-slot schema, explicit nonpayment exceptions and honest verification')
