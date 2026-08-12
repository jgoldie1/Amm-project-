const assert=require('assert')
const {analyzeCommunication,shouldProtectSpend}=require('../lib/omnishield360')

const safe=analyzeCommunication({stirShaken:'pass',reputation:'good',velocityLastHour:1,transcript:'hello from your school office'})
assert.equal(safe.action,'allow')

const risky=analyzeCommunication({stirShaken:'fail',reputation:'known_bad',syntheticVoiceRisk:91,transcript:'act now and send crypto',paymentPressure:true})
assert.equal(risky.action,'block_or_quarantine')
assert(risky.score>=80)

const spend=shouldProtectSpend({attemptsLastHour:75,estimatedCostUsd:1})
assert.equal(spend.allow,false)

console.log('OmniShield 360 tests passed')
