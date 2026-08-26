import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const engine = path.join(root, 'src/platform/construct/constructEngine.ts')
const adapters = path.join(root, 'src/platform/construct/deviceAdapters.ts')
const gates = path.join(root, 'src/platform/release/productionGates.ts')
const center = path.join(root, 'src/components/NextDevelopmentTargetCenter.tsx')

for (const file of [engine, adapters, gates, center]) {
  if (!fs.existsSync(file)) throw new Error(`Missing required development-target file: ${file}`)
}

const engineText = fs.readFileSync(engine, 'utf8')
const gatesText = fs.readFileSync(gates, 'utf8')
const centerText = fs.readFileSync(center, 'utf8')

for (const required of ['evaluateConstructSafety', 'buildConstructPlan', 'userConfirmedPhysicalMotion']) {
  if (!engineText.includes(required)) throw new Error(`Construct Engine contract missing ${required}`)
}

for (const required of ['phone-controller', 'save-rejoin', 'hologpt-provider', 'payments-payouts', 'telecom-esim', 'broadcast-distribution']) {
  if (!gatesText.includes(required)) throw new Error(`Production gate missing ${required}`)
}

for (const required of ['Construct Engine v0.1', 'BMO-class Desktop Prototype', 'Room-scale Construct Demonstration', 'Automan-class Low-speed Vehicle']) {
  if (!centerText.includes(required)) throw new Error(`Development Target UI missing ${required}`)
}

console.log('Construct Engine v0.1 and development-target contracts: OK')
