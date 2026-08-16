const assert = require('assert')
const { chooseAgent, requiresApproval } = require('../agents/quantum-agent-runtime')

assert.equal(chooseAgent('run a security review of auth and RLS'), 'security')
assert.equal(chooseAgent('check the CI regression suite'), 'qa')
assert.equal(chooseAgent('design a Mars mission and NPCs'), 'world_builder')
assert.equal(chooseAgent('review treasury reserves and bills'), 'treasury')
assert.equal(requiresApproval('production deploy the convergence branch'), true)
assert.equal(requiresApproval('run a harmless QA analysis'), false)

console.log('agent runtime routing tests passed')
