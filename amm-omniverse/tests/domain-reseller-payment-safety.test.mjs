import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8')

test('Registrar never accepts browser-declared payment as verified',()=>{
 const api=read('api/domains/provision.js')
 assert.doesNotMatch(api,/paymentVerified\s*:\s*Boolean\(req\.body\?\.paymentVerified\)/)
 assert.match(api,/paymentVerified:false/)
 assert.match(api,/server_side_order_reconciliation_required/)
 assert.match(api,/PAYMENT_VERIFICATION_REQUIRED/)
 assert.match(api,/REGISTRAR_ADAPTER_REQUIRED/)
})
test('Registrar does not trust browser-specified hosting destination',()=>{
 const api=read('api/domains/provision.js')
 assert.doesNotMatch(api,/req\.body\?\.hostingTarget/)
 assert.match(api,/process\.env\.TRYAMM_APP_URL/)
 assert.match(api,/valid registrable domain required/)
})
test('Domain readiness is authenticated, read-only, and never exposes secrets',()=>{
 const status=read('api/domains/status.js')
 assert.match(status,/requireUser\(req,res\)/)
 assert.match(status,/req\.method!=='GET'/)
 assert.match(status,/mode:'PREPARATION_ONLY'/)
 assert.match(status,/canChargeForDomains:false/)
 assert.match(status,/canRegisterDomains:false/)
 assert.match(status,/canChangeDns:false/)
 assert.doesNotMatch(status,/\.json\(\{[^]*?API_KEY\s*:/)
})
test('Website-builder domain screen discloses no charge and has a status check',()=>{
 const ui=read('src/components/AIWebsiteBusinessBuilder.tsx')
 assert.match(ui,/PREPARE DOMAIN \(NO CHARGE\)/)
 assert.match(ui,/CHECK RESELLER CONNECTION/)
 assert.match(ui,/\/api\/domains\/status/)
 assert.match(ui,/No domain charge or purchase is available/)
 assert.doesNotMatch(ui,/>PAY \+ CONNECT DOMAIN</)
})
test('Existing domain workflow still requires registrar registration and DNS/SSL verification',()=>{
 const svc=read('src/services/domainProvisioning.ts')
 for(const marker of ['DOMAIN SEARCH','REGISTRAR PURCHASE','NAMESERVER / DNS CONFIG','SSL CERTIFICATE','SITE HEALTH CHECK','LIVE','registrarApiRequired:true','paymentMustBeVerifiedBeforeRegistration:true'])assert.ok(svc.includes(marker),marker)
})
