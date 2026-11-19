'use strict'
const assert = require('node:assert/strict')
const { CONTROL_IDS, evaluateAction, assessLaunch } = require('../lib/tryamm-compliance-policy')
const approved = [
  { domain:'public',action:'public_info' },
  { domain:'care_navigation',action:'nonclinical_navigation' },
  { domain:'trading_simulation',action:'simulation_trade' },
  { domain:'commerce',action:'draft_marketing' }
]
for (const request of approved) assert.equal(evaluateAction(request).allowed,true,JSON.stringify(request))
for (const action of [
  'clinical_visit','diagnosis','clinical_triage','prescribe','health_ai_advice',
  'patient_record_access','patient_record_export','live_trade','auto_trade',
  'withdraw','transfer_funds','financial_advice','brokerage_account_link',
  'sign_contract','legal_advice','submit_regulatory_filing','represent_as_attorney',
  'charge_customer','publish_campaign','bind_partner'
]) {
  assert.equal(evaluateAction({domain:'commerce',action}).allowed,false,action)
}
for (const domain of ['clinical','brokerage','legal']) {
  assert.equal(evaluateAction({domain,action:'unexpected'}).allowed,false,domain)
}
assert.equal(evaluateAction({domain:'care_navigation',action:'nonclinical_navigation',containsSensitiveData:true}).allowed,false)
assert.equal(evaluateAction({domain:'public',action:'unexpected'}).allowed,false)
assert.equal(assessLaunch({}).ready,false)
assert.equal(assessLaunch({}).missing.length,CONTROL_IDS.length)
assert.equal(new Set(CONTROL_IDS).size, CONTROL_IDS.length)
console.log('TRYAMM compliance policy checks passed; clinical/financial/legal release gates remain closed.')
