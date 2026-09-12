import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
const root=path.resolve(import.meta.dirname,'..')
const source=fs.readFileSync(path.join(root,'src','runtime','StubbsOperationalOntology.ts'),'utf8')
const checks=[
 ['ontology exists',/Stubbs Operational Ontology/.test(source)],
 ['source lineage required',/SOURCE_LINEAGE_REQUIRED/.test(source)],
 ['least privilege required',/LEAST_PRIVILEGE_ACCESS/.test(source)],
 ['human approval exists',/HUMAN_APPROVAL_FOR_HIGH_IMPACT_ACTIONS/.test(source)],
 ['simulation separated',/SIMULATION_SEPARATED_FROM_REAL_OPERATIONS/.test(source)],
 ['covert tracking prohibited',/COVERT_PERSON_TRACKING/.test(source)],
 ['communications interception prohibited',/PRIVATE_COMMUNICATION_INTERCEPTION/.test(source)],
 ['mass biometric surveillance prohibited',/BIOMETRIC_MASS_SURVEILLANCE/.test(source)],
 ['high impact autonomous enforcement prohibited',/AUTONOMOUS_HIGH_IMPACT_ENFORCEMENT/.test(source)],
 ['authorized operational actions audited',/auditRequired: true/.test(source)&&/AUTHORIZED_API/.test(source)],
]
const failed=checks.filter(([,ok])=>!ok)
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`)
assert.equal(failed.length,0,`Operational ontology contract failed: ${failed.map(([name])=>name).join(', ')}`)
console.log('Stubbs operational ontology contract: GREEN')
