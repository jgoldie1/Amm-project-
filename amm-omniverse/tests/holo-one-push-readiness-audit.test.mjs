import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {buildHoloReadinessReport,HOLO_SERVICES} from '../src/foundation/holoOnePushReadinessReport.js'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
test('one push reports all services without inventing real tests',()=>{
 const report=buildHoloReadinessReport(service=>({passed:0,total:3,missing:['providerAuthorized','identityVerified','humanEscalation']}),new Date('2026-11-22T12:00:00Z'))
 assert.equal(report.services.length,12)
 assert.equal(report.publicLaunchReady,false)
 assert.equal(report.liveProviderChecksPerformed,false)
 assert.equal(report.realTransactionsPerformed,false)
 assert.equal(report.providerAuthorizations,0)
 assert.equal(report.generatedAt,'2026-11-22T12:00:00.000Z')
 assert.equal(new Set(HOLO_SERVICES).size,HOLO_SERVICES.length)
})
test('private provider registry has RLS, explicit service role access and no public grants',()=>{
 const sql=read('../docs/holo-service-passport-registry-proposed.sql')
 assert.match(sql,/holo_service_passport_authorizations/)
 assert.match(sql,/enable row level security/)
 assert.match(sql,/revoke all on public\.holo_service_passport_authorizations from public,anon,authenticated/)
 assert.match(sql,/to service_role/)
 assert.match(sql,/consent_document_ref/)
 assert.match(sql,/guardian_covenant_ref/)
})
test('one-hand audit generates downloadable report, never represents approval',()=>{
 const hub=read('../src/components/HoloServicesHub.tsx')
 assert.match(hub,/RUN ONE-PUSH READINESS AUDIT/)
 assert.match(hub,/DOWNLOAD JSON REPORT/)
 assert.match(hub,/TRYAMM_HoloServices_Readiness_Audit\.json/)
 assert.match(hub,/No live provider validations performed/)
})
