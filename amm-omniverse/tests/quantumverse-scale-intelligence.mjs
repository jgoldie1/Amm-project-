import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const core = path.join(root, 'src/platform/quantumverse/scaleIntelligence.ts')
const adapters = path.join(root, 'src/platform/quantumverse/instrumentAdapters.ts')

for (const file of [core, adapters]) {
  if (!fs.existsSync(file)) throw new Error(`Missing QuantumVerse file: ${file}`)
}

const coreText = fs.readFileSync(core, 'utf8')
const adapterText = fs.readFileSync(adapters, 'utf8')

for (const required of ['ScaleAddress', 'ProvenanceClass', 'decideZoom', 'Resolution limit reached', 'do not synthesize hidden detail']) {
  if (!coreText.includes(required)) throw new Error(`QuantumVerse core missing ${required}`)
}

for (const required of ['digital-microscope', 'telescope', 'spectrometer', 'material-characterization']) {
  if (!adapterText.includes(required)) throw new Error(`QuantumVerse adapters missing ${required}`)
}

console.log('QuantumVerse scale intelligence contracts: OK')
