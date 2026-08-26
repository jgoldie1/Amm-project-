export type ConstructMode = 'AR' | 'PROJECTION' | 'VOLUMETRIC' | 'HAPTIC' | 'ROBOTIC' | 'HYBRID'

export type ConstructRequest = {
  id: string
  prompt: string
  requestedMode?: ConstructMode
  dimensionsM?: { width: number; height: number; depth: number }
  maxMassKg?: number
  environment: 'desktop' | 'room' | 'vehicle' | 'outdoor'
  userConfirmedPhysicalMotion?: boolean
}

export type ConstructSafetyResult = {
  allowed: boolean
  reasons: string[]
  requiresHumanApproval: boolean
}

export type ConstructPlan = {
  id: string
  prompt: string
  mode: ConstructMode
  environment: ConstructRequest['environment']
  scene: {
    primitive: 'box' | 'sphere' | 'panel' | 'vehicle-shell' | 'custom'
    dimensionsM: { width: number; height: number; depth: number }
  }
  safety: ConstructSafetyResult
  adapters: string[]
  createdAt: string
}

const physicalModes: ConstructMode[] = ['HAPTIC', 'ROBOTIC', 'HYBRID']

export function evaluateConstructSafety(request: ConstructRequest): ConstructSafetyResult {
  const reasons: string[] = []
  const mode = request.requestedMode ?? 'AR'
  const requiresHumanApproval = physicalModes.includes(mode) || request.environment === 'vehicle'

  if (!request.prompt.trim()) reasons.push('Construct prompt is required.')
  if (request.maxMassKg != null && request.maxMassKg < 0) reasons.push('Mass cannot be negative.')
  if (request.dimensionsM && Object.values(request.dimensionsM).some(value => value <= 0 || value > 20)) {
    reasons.push('Prototype dimensions must be greater than zero and no larger than 20 m per axis.')
  }
  if (physicalModes.includes(mode) && request.userConfirmedPhysicalMotion !== true) {
    reasons.push('Physical-motion constructs require explicit user confirmation before execution.')
  }

  return { allowed: reasons.length === 0, reasons, requiresHumanApproval }
}

export function buildConstructPlan(request: ConstructRequest): ConstructPlan {
  const mode = request.requestedMode ?? 'AR'
  const safety = evaluateConstructSafety(request)
  const adapters = mode === 'AR' ? ['screen-xr'] : mode === 'PROJECTION' ? ['projector'] : mode === 'HAPTIC' ? ['haptics'] : mode === 'ROBOTIC' ? ['robotics'] : mode === 'HYBRID' ? ['screen-xr', 'robotics', 'haptics'] : ['volumetric-display']

  return {
    id: request.id,
    prompt: request.prompt,
    mode,
    environment: request.environment,
    scene: {
      primitive: request.environment === 'vehicle' ? 'vehicle-shell' : 'custom',
      dimensionsM: request.dimensionsM ?? { width: 1, height: 1, depth: 1 },
    },
    safety,
    adapters,
    createdAt: new Date().toISOString(),
  }
}
