export type ConstructMode = 'AR' | 'PROJECTION' | 'VOLUMETRIC' | 'HAPTIC' | 'ROBOTIC' | 'HYBRID'
export type ConstructPrimitive = 'box' | 'sphere' | 'panel' | 'vehicle-shell' | 'custom'

export type Vec3 = { x: number; y: number; z: number }

export type ConstructRequest = {
  id: string
  prompt: string
  requestedMode?: ConstructMode
  primitive?: ConstructPrimitive
  dimensionsM?: { width: number; height: number; depth: number }
  maxMassKg?: number
  environment: 'desktop' | 'room' | 'vehicle' | 'outdoor'
  userConfirmedPhysicalMotion?: boolean
  materialHint?: string
  colorHex?: string
  targetPositionM?: Vec3
  tactileIntensity01?: number
  maxForceN?: number
}

export type ConstructSafetyResult = {
  allowed: boolean
  reasons: string[]
  requiresHumanApproval: boolean
}

export type ConstructGeometry = {
  primitive: ConstructPrimitive
  dimensionsM: { width: number; height: number; depth: number }
  positionM: Vec3
}

export type ConstructMaterial = {
  colorHex: string
  materialHint: string
  opacity01: number
}

export type ConstructPhysics = {
  collisionEnabled: boolean
  dynamic: boolean
  maxMassKg: number
  maxForceN: number
}

export type ConstructTracking = {
  handTracking: boolean
  anchor: 'world' | 'user' | 'vehicle'
}

export type ConstructHaptics = {
  enabled: boolean
  intensity01: number
  profile: 'boundary' | 'button' | 'surface' | 'custom'
}

export type ConstructResourceBudget = {
  visualW: number
  computeW: number
  hapticsW: number
  actuationW: number
  mobilityW: number
  thermalW: number
  totalW: number
}

export type ConstructPlan = {
  id: string
  prompt: string
  mode: ConstructMode
  environment: ConstructRequest['environment']
  scene: ConstructGeometry
  material: ConstructMaterial
  physics: ConstructPhysics
  tracking: ConstructTracking
  haptics: ConstructHaptics
  resources: ConstructResourceBudget
  safety: ConstructSafetyResult
  adapters: string[]
  createdAt: string
}

const physicalModes: ConstructMode[] = ['HAPTIC', 'ROBOTIC', 'HYBRID']

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function inferHapticProfile(prompt: string): ConstructHaptics['profile'] {
  const value = prompt.toLowerCase()
  if (value.includes('button')) return 'button'
  if (value.includes('panel') || value.includes('surface')) return 'surface'
  if (value.includes('cube') || value.includes('sphere') || value.includes('wheel')) return 'boundary'
  return 'custom'
}

function estimateResourceBudget(mode: ConstructMode): ConstructResourceBudget {
  const visualW = mode === 'HAPTIC' || mode === 'ROBOTIC' ? 10 : 40
  const computeW = mode === 'AR' ? 35 : 60
  const hapticsW = mode === 'HAPTIC' || mode === 'HYBRID' ? 120 : 0
  const actuationW = mode === 'ROBOTIC' || mode === 'HYBRID' ? 250 : 0
  const mobilityW = 0
  const thermalW = Math.ceil((visualW + computeW + hapticsW + actuationW + mobilityW) * 0.2)
  return { visualW, computeW, hapticsW, actuationW, mobilityW, thermalW, totalW: visualW + computeW + hapticsW + actuationW + mobilityW + thermalW }
}

export function evaluateConstructSafety(request: ConstructRequest): ConstructSafetyResult {
  const reasons: string[] = []
  const mode = request.requestedMode ?? 'AR'
  const requiresHumanApproval = physicalModes.includes(mode) || request.environment === 'vehicle'

  if (!request.prompt.trim()) reasons.push('Construct prompt is required.')
  if (request.maxMassKg != null && request.maxMassKg < 0) reasons.push('Mass cannot be negative.')
  if (request.dimensionsM && Object.values(request.dimensionsM).some(value => value <= 0 || value > 20)) reasons.push('Prototype dimensions must be greater than zero and no larger than 20 m per axis.')
  if (request.tactileIntensity01 != null && (request.tactileIntensity01 < 0 || request.tactileIntensity01 > 1)) reasons.push('Tactile intensity must be between 0 and 1.')
  if (request.maxForceN != null && (request.maxForceN < 0 || request.maxForceN > 500)) reasons.push('Prototype force request must be between 0 and 500 N.')
  if (physicalModes.includes(mode) && request.userConfirmedPhysicalMotion !== true) reasons.push('Physical-motion constructs require explicit user confirmation before execution.')

  return { allowed: reasons.length === 0, reasons, requiresHumanApproval }
}

export function buildConstructPlan(request: ConstructRequest): ConstructPlan {
  const mode = request.requestedMode ?? 'AR'
  const safety = evaluateConstructSafety(request)
  const adapters = mode === 'AR' ? ['screen-xr'] : mode === 'PROJECTION' ? ['projector'] : mode === 'HAPTIC' ? ['haptics'] : mode === 'ROBOTIC' ? ['robotics'] : mode === 'HYBRID' ? ['screen-xr', 'robotics', 'haptics'] : ['volumetric-display']
  const hapticsEnabled = mode === 'HAPTIC' || mode === 'HYBRID'

  return {
    id: request.id,
    prompt: request.prompt,
    mode,
    environment: request.environment,
    scene: {
      primitive: request.primitive ?? (request.environment === 'vehicle' ? 'vehicle-shell' : 'custom'),
      dimensionsM: request.dimensionsM ?? { width: 1, height: 1, depth: 1 },
      positionM: request.targetPositionM ?? { x: 0, y: 0, z: -1 },
    },
    material: {
      colorHex: request.colorHex ?? '#3b82f6',
      materialHint: request.materialHint ?? 'programmable-construct-surface',
      opacity01: 1,
    },
    physics: {
      collisionEnabled: true,
      dynamic: mode === 'ROBOTIC' || mode === 'HYBRID',
      maxMassKg: request.maxMassKg ?? 0,
      maxForceN: request.maxForceN ?? 0,
    },
    tracking: {
      handTracking: mode !== 'PROJECTION',
      anchor: request.environment === 'vehicle' ? 'vehicle' : request.environment === 'desktop' ? 'user' : 'world',
    },
    haptics: {
      enabled: hapticsEnabled,
      intensity01: clamp01(request.tactileIntensity01 ?? (hapticsEnabled ? 0.35 : 0)),
      profile: inferHapticProfile(request.prompt),
    },
    resources: estimateResourceBudget(mode),
    safety,
    adapters,
    createdAt: new Date().toISOString(),
  }
}
