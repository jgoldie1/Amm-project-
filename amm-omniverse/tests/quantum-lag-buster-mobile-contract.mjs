import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const policy=readFileSync(new URL('../src/runtime/StreetVerseQuantumLagBuster.ts',import.meta.url),'utf8')
const ui=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('Quantum Lag Buster reuses existing source with bounded recommendations',()=>{
 for(const term of ['QUANTUM_LAG_BUSTER','fps<20','fps<40','automaticChanges:false','preserveMissions:true','permissionRequiredForGraphicsChange:true'])assert.ok(policy.includes(term),term)
})
test('one-hand diagnostic shows advice but never silently changes graphics',()=>{
 assert.ok(ui.includes('adviseQuantumLagBuster(diagnostic.frame?.fps??null)'))
 assert.ok(ui.includes('Quantum Lag Buster:'))
 assert.doesNotMatch(policy,/localStorage\.clear\(|\bfetch\(/)
})
