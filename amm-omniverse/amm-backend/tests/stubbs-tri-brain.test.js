const assert = require('assert')
const { classifyRisk, spiderSense, normalizeBrain, compareBrains } = require('../lib/stubbs-tri-brain')

assert.equal(classifyRisk(0), 'GREEN')
assert.equal(classifyRisk(30), 'YELLOW')
assert.equal(classifyRisk(60), 'ORANGE')
assert.equal(classifyRisk(80), 'RED')

const safe = spiderSense({})
assert.equal(safe.band, 'GREEN')

const threat = spiderSense({ promptInjection:true, secretAccess:true, privilegeEscalation:true })
assert.equal(threat.band, 'RED')
assert.equal(threat.action, 'block')

const a = normalizeBrain({ answer:'The build is ready.', conclusionKey:'build-ready', confidence:.92, evidenceIds:['e1'] })
const b = normalizeBrain({ answer:'Independent checks support release.', conclusionKey:'build-ready', confidence:.90, evidenceIds:['e1','e2'] })
assert.equal(compareBrains(a,b).agree, true)

const c = normalizeBrain({ answer:'Do not release.', conclusionKey:'build-blocked', confidence:.95, evidenceIds:['e3'] })
assert.equal(compareBrains(a,c).agree, false)

console.log('Stubbs tri-brain tests: PASS')
