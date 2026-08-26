import type { ConstructPlan } from './constructEngine'

export type AdapterHealth = {
  id: string
  available: boolean
  detail?: string
}

export interface ConstructDeviceAdapter {
  id: string
  health(): Promise<AdapterHealth>
  prepare(plan: ConstructPlan): Promise<void>
  execute(plan: ConstructPlan): Promise<{ accepted: boolean; executionId?: string; reason?: string }>
  stop(executionId?: string): Promise<void>
}

export class ScreenXRAdapter implements ConstructDeviceAdapter {
  id = 'screen-xr'
  async health(): Promise<AdapterHealth> {
    return { id: this.id, available: typeof window !== 'undefined', detail: 'Screen fallback is available when WebXR hardware is not.' }
  }
  async prepare(_plan: ConstructPlan) {}
  async execute(plan: ConstructPlan) {
    if (!plan.safety.allowed) return { accepted: false, reason: plan.safety.reasons.join(' ') }
    return { accepted: true, executionId: `${plan.id}:screen` }
  }
  async stop(_executionId?: string) {}
}

export class ExternalHardwareAdapter implements ConstructDeviceAdapter {
  constructor(public id: string) {}
  async health(): Promise<AdapterHealth> {
    return { id: this.id, available: false, detail: 'External hardware/provider is not connected in this runtime.' }
  }
  async prepare(_plan: ConstructPlan) {
    throw new Error(`${this.id} requires an authenticated external hardware/provider connection.`)
  }
  async execute(_plan: ConstructPlan) {
    return { accepted: false, reason: `${this.id} is not connected.` }
  }
  async stop(_executionId?: string) {}
}

export function createDefaultConstructAdapters() {
  return new Map<string, ConstructDeviceAdapter>([
    ['screen-xr', new ScreenXRAdapter()],
    ['projector', new ExternalHardwareAdapter('projector')],
    ['volumetric-display', new ExternalHardwareAdapter('volumetric-display')],
    ['haptics', new ExternalHardwareAdapter('haptics')],
    ['robotics', new ExternalHardwareAdapter('robotics')],
    ['vehicle-telemetry', new ExternalHardwareAdapter('vehicle-telemetry')],
  ])
}
