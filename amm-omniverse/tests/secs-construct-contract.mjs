import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const runtimePath = path.join(root, 'src/runtime/SECSConstructRuntime.ts')
const mainPath = path.join(root, 'src/main.tsx')
const docsPath = path.join(root, '../docs/SECS_CONSTRUCT_PROTOTYPE.md')
const firmwarePath = path.join(root, '../hardware/secs-construct/firmware/src/main.cpp')

for (const file of [runtimePath, mainPath, docsPath, firmwarePath]) {
  if (!fs.existsSync(file)) throw new Error(`SECS contract missing file: ${file}`)
}

const runtime = fs.readFileSync(runtimePath, 'utf8')
const main = fs.readFileSync(mainPath, 'utf8')
const docs = fs.readFileSync(docsPath, 'utf8')
const firmware = fs.readFileSync(firmwarePath, 'utf8')

const requiredRuntimeTokens = [
  'installSECSConstructRuntime',
  'compileConstruct',
  'validateConstructRequest',
  'MAX_DIMENSION_MM',
  'MAX_HAPTIC_INTENSITY',
  'emergencyStopRequired: true',
  'hardwareValidationRequired: true',
  'runConstructSelfTest',
]

for (const token of requiredRuntimeTokens) {
  if (!runtime.includes(token)) throw new Error(`SECS runtime contract missing: ${token}`)
}

if (!main.includes("import { installSECSConstructRuntime } from './runtime/SECSConstructRuntime'")) {
  throw new Error('SECS runtime is not imported by main.tsx')
}
if (!main.includes('installSECSConstructRuntime()')) {
  throw new Error('SECS runtime is not installed at startup')
}

for (const token of ['NC E-STOP', 'hardwareValidationRequired', 'Acceptance criteria']) {
  if (!docs.includes(token)) throw new Error(`SECS engineering docs missing: ${token}`)
}

for (const token of ['ESTOP_PIN', 'COMMAND_TIMEOUT_MS', 'disableAllOutputs', 'MAX_PWM']) {
  if (!firmware.includes(token)) throw new Error(`SECS firmware safety contract missing: ${token}`)
}

console.log('SECS construct contract: PASS')
