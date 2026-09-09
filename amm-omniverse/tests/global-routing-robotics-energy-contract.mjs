import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/foundation/globalRoutingRoboticsEnergy.ts', import.meta.url), 'utf8')
const required = [
  "'communications'", "'network'", "'ai'", "'payments'", "'world'",
  'chooseEligibleRoute', 'requireCompliance', 'allowFailover',
  "RobotMode = 'simulation' | 'physical'", 'canExecutePhysicalRobotAction',
  'emergencyStopEngaged', 'safetyControllerHealthy', 'localControlAvailable',
  'BlueEnergyTelemetry', 'batteryPercent', 'temperatureC', 'estimatedEnergyCostUsd',
  'OmniComputeTelemetry', "paymentVerification: 'server-authoritative'",
  "robotEmergencyStop: 'local-safety-controller'", "blueEnergyHardwareClaims: 'evidence-required'",
  'digital-twin-robot-readiness', 'robotics-as-a-service', 'business-ai-routing',
]
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Missing Release 1 contract token: ${token}`)
}
if (/paymentVerification:\s*['"]client/i.test(source)) throw new Error('Payment verification must not become client-authoritative')
if (/robotEmergencyStop:\s*['"]generative/i.test(source)) throw new Error('Emergency stop must not depend on generative AI')
console.log('Global routing + robotics + Blue Energy contract OK')
