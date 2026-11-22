import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const policy=fs.readFileSync(new URL('../src/foundation/holoServiceGuardianCovenant.ts',import.meta.url),'utf8')
const component=fs.readFileSync(new URL('../src/components/HoloServicePassportCenter.tsx',import.meta.url),'utf8')
const compliance=fs.readFileSync(new URL('../src/components/TRYAMMComplianceCenter.tsx',import.meta.url),'utf8')
const evaluated=policy.replace(/^import .* from '\.\/holoServicePassport'\s*$/m,'const evaluatePassport = () => ({approved:false,missing:["not-verified"]})')
const js=ts.transpileModule(evaluated,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {TRYAMM_CONSTITUTION_RULES,evaluateGuardianCovenant,authorizeGovernedHoloAction}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
const base={humanApproved:true,humanApproverId:'admin-1',policyVersion:'constitutional-v1',policyReviewReference:'review-1',riskReviewed:true,consentCurrent:true,privacyReviewReference:'privacy-1',incidentEscalationAvailable:true,authorizationReference:'approved-action-1',auditRecordReference:'audit-1',providerResponseVerified:true,valueLedgerReference:'ledger-1',simulation:false}
test('preserves original constitution and human safety rules',()=>{
 assert.equal(TRYAMM_CONSTITUTION_RULES.noUnauthorizedLaunch,'No unauthorized launch')
 assert.equal(TRYAMM_CONSTITUTION_RULES.protectHumanLife,'Protect human life')
 assert.ok(TRYAMM_CONSTITUTION_RULES.guardianCovenant.includes('Guardian Covenant'))
})
test('all sensitive actions fail without authorization',()=>{
 for(const action of ['publish-provider','publish-farm','advertisement','dispatch-ride','dispatch-delivery','dispatch-freight','dispatch-drone','charge-payment','issue-refund'])
  assert.equal(evaluateGuardianCovenant(action,{...base,humanApproved:false}).allowed,false,action)
})
test('life-critical dispatch requires escalation and forbids simulation',()=>{
 assert.equal(evaluateGuardianCovenant('dispatch-drone',{...base,incidentEscalationAvailable:false}).allowed,false)
 assert.equal(evaluateGuardianCovenant('dispatch-ride',{...base,simulation:true}).allowed,false)
 assert.equal(evaluateGuardianCovenant('dispatch-delivery',base).allowed,true)
})
test('payment and ads require ledger and evidence',()=>{
 assert.equal(evaluateGuardianCovenant('charge-payment',{...base,valueLedgerReference:null}).allowed,false)
 assert.equal(evaluateGuardianCovenant('issue-refund',{...base,auditRecordReference:null}).allowed,false)
 assert.equal(evaluateGuardianCovenant('advertisement',{...base,valueLedgerReference:null}).allowed,false)
})
test('passport is never sufficient alone and compliance center remains available',()=>{
 assert.equal(authorizeGovernedHoloAction({},'delivery','Chicago, IL','dispatch-delivery',base).allowed,false)
 assert.ok(component.includes('TRYAMM_CONSTITUTION_RULES'))
 assert.ok(component.includes('__showCompliance'))
 assert.ok(compliance.includes('AI Law and Governance'))
})
