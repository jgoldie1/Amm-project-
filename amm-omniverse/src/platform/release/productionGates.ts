export type GateState = 'PASS' | 'BLOCKED' | 'NEEDS_EXTERNAL' | 'NEEDS_DEVICE'

export type ProductionGate = {
  id: string
  label: string
  state: GateState
  evidenceRequired: string[]
}

export const productionGates: ProductionGate[] = [
  {
    id: 'phone-controller',
    label: 'Physical phone/controller verification',
    state: 'NEEDS_DEVICE',
    evidenceRequired: ['Real iOS/Android device run', 'Movement/input test', 'Accessibility test', 'Console/runtime error capture'],
  },
  {
    id: 'save-rejoin',
    label: 'Save and rejoin verification',
    state: 'BLOCKED',
    evidenceRequired: ['Server-side world state', 'Session restore contract', 'Second-session/device rejoin test'],
  },
  {
    id: 'xr-worlds',
    label: 'XR/world implementation verification',
    state: 'NEEDS_DEVICE',
    evidenceRequired: ['Capability detection', 'XR-capable device test', 'Fallback rendering', 'World completion matrix'],
  },
  {
    id: 'hologpt-provider',
    label: 'Production HoloGPT provider',
    state: 'NEEDS_EXTERNAL',
    evidenceRequired: ['Provider credential', 'Health check', 'Timeout/fallback test', 'Usage/error telemetry'],
  },
  {
    id: 'payments-payouts',
    label: 'Payments and creator payouts',
    state: 'NEEDS_EXTERNAL',
    evidenceRequired: ['Sandbox purchase', 'Server verification', 'Ledger entry', 'Payable balance', 'Payout eligibility test'],
  },
  {
    id: 'telecom-esim',
    label: 'Telecom/eSIM activation',
    state: 'NEEDS_EXTERNAL',
    evidenceRequired: ['Carrier/provider agreement', 'API credentials', 'Activation test', 'Billing/support flow'],
  },
  {
    id: 'broadcast-distribution',
    label: 'External broadcast/distribution',
    state: 'NEEDS_EXTERNAL',
    evidenceRequired: ['Distribution provider', 'Credentials', 'Ingest test', 'Rights metadata', 'Delivery receipt'],
  },
]

export function releaseReady(gates = productionGates) {
  return gates.every(gate => gate.state === 'PASS')
}
