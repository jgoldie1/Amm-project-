import fs from 'node:fs'
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
const source=fs.readFileSync(new URL('../src/foundation/yahavahFarmPublicationPolicy.ts',import.meta.url),'utf8')
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {canPublishFarm,publicFarm,maySellFarmProducts,mayUseFarmMedia}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'))
const base={
 farmId:'farm-1',farmName:'Consenting Pilot Farm',city:'Chicago',state:'IL',
 products:['Produce'],website:'https://example.org',
 consentGranted:true,consentExpiresAt:'2027-01-01T00:00:00Z',
 approvedAt:'2026-11-21T00:00:00Z',approvedBy:'admin',
 identityVerifiedAt:'2026-11-21T00:00:00Z',rightsVerifiedAt:'2026-11-21T00:00:00Z',
 withdrawnAt:null,publicListingAllowed:true,mediaPermission:false,
 supplierPurchaseAgreement:false,foodComplianceVerified:false,fulfillmentVerified:false,
}
const at=new Date('2026-11-22T00:00:00Z')
test('listing needs positive opt-in, verified rights, nonexpired approval and URL',()=>{
 assert.equal(canPublishFarm(base,at),true)
 for(const [key,value] of Object.entries({
  consentGranted:false,consentExpiresAt:'2026-11-21T00:00:00Z',
  approvedAt:null,approvedBy:null,identityVerifiedAt:null,
  rightsVerifiedAt:null,withdrawnAt:'2026-11-22T00:00:00Z',
  publicListingAllowed:false,website:'javascript:alert(1)'
 })){assert.equal(canPublishFarm({...base,[key]:value},at),false,key)}
})
test('private contacts never leave the safe public projection',()=>{
 const p=publicFarm({...base,contact_private:{email:'private@example.com'},verification_notes_private:'secret'},at)
 assert.ok(p)
 assert.deepEqual(Object.keys(p).sort(),['city','farmId','farmName','products','state','website'].sort())
})
test('media and sale require distinct verified approvals',()=>{
 assert.equal(mayUseFarmMedia(base,at),false)
 assert.equal(mayUseFarmMedia({...base,mediaPermission:true},at),true)
 assert.equal(maySellFarmProducts(base,at),false)
 assert.equal(maySellFarmProducts({...base,supplierPurchaseAgreement:true,foodComplianceVerified:true,fulfillmentVerified:true},at),true)
 assert.equal(maySellFarmProducts({...base,supplierPurchaseAgreement:true,foodComplianceVerified:false,fulfillmentVerified:true},at),false)
})
test('SQL registry is private by default',()=>{
 const sql=fs.readFileSync(new URL('../docs/yahavah-farm-registry-proposed.sql',import.meta.url),'utf8')
 for(const token of ['enable row level security','revoke all on table public.yahavah_farm_registry from public, anon, authenticated','grant select, insert, update, delete on public.yahavah_farm_registry to service_role','consent_document_ref','withdrawn_at'])assert.ok(sql.includes(token),token)
 assert.doesNotMatch(sql,/grant\s+all\s+on\s+table\s+public\.yahavah_farm_registry\s+to\s+anon/i)
})
