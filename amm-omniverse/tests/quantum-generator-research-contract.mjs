import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/foundation/quantumGeneratorResearch.ts', import.meta.url), 'utf8')
const required = [
  "'theory'", "'simulation'", "'bench-test'", "'independent-replication'", "'prototype'",
  "'safety-validation'", "'certification'", "'production'",
  'MeasurementEvidence', 'inputEnergyWatts', 'outputEnergyWatts', 'calculateNetEnergy',
  'independentlyReplicated', 'safetyValidated', 'certified',
  'canAdvanceQuantumGeneratorStage', 'classifyQuantumGeneratorReadiness',
  'perpetualMotionClaimAllowed: false', 'freeEnergyClaimAllowed: false',
  'independentReplicationRequired: true', 'calibratedMeasurementRequired: true',
  'safetyValidationRequired: true', 'certificationRequiredForProduction: true',
]
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Missing Quantum Generator R&D gate: ${token}`)
}
if (/perpetualMotionClaimAllowed:\s*true/.test(source)) throw new Error('Perpetual motion claims must remain prohibited')
if (/freeEnergyClaimAllowed:\s*true/.test(source)) throw new Error('Free-energy claims must remain prohibited')
console.log('Quantum Generator R&D verification contract OK')
