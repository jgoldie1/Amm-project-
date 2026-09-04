export type ConstructShape = 'cube' | 'sphere' | 'button' | 'steering-wheel'
export type ConstructMode = 'simulation' | 'prototype'

export interface ConstructRequest {
  id: string
  shape: ConstructShape
  sizeMm: { x: number; y: number; z: number }
  positionMm: { x: number; y: number; z: number }
  visual?: { color?: string; opacity?: number }
  haptics?: { enabled?: boolean; intensity?: number }
  mode?: ConstructMode
}

export interface ConstructFrame {
  requestId: string
  geometry: ConstructRequest['shape']
  boundsMm: ConstructRequest['sizeMm']
  positionMm: ConstructRequest['positionMm']
  visual: { color: string; opacity: number }
  haptics: { enabled: boolean; intensity: number }
  safety: { allowed: boolean; reasons: string[] }
  generatedAt: string
}

export interface ConstructHardwareTelemetry {
  estopClear: boolean
  outputsEnabled: boolean
  uptimeMs: number
  maxPwm: number
  receivedAt: string
}

const MAX_DIMENSION_MM = 610
const MAX_HAPTIC_INTENSITY = 0.35
const HARDWARE_TELEMETRY_MAX_AGE_MS = 1500
const EXPECTED_FIRMWARE_MAX_PWM = 90
let latestHardwareTelemetry: ConstructHardwareTelemetry | null = null
const emit = (name: string, detail: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }))

export function validateConstructRequest(input: ConstructRequest) {
  const reasons: string[] = []
  const dims = Object.values(input.sizeMm)
  if (dims.some((v) => !Number.isFinite(v) || v <= 0 || v > MAX_DIMENSION_MM)) reasons.push('size-out-of-prototype-envelope')
  if (Object.values(input.positionMm).some((v) => !Number.isFinite(v))) reasons.push('invalid-position')
  const intensity = input.haptics?.intensity ?? 0
  if (intensity < 0 || intensity > MAX_HAPTIC_INTENSITY) reasons.push('haptic-intensity-out-of-safe-software-envelope')
  return { allowed: reasons.length === 0, reasons }
}

export function compileConstruct(input: ConstructRequest): ConstructFrame {
  const safety = validateConstructRequest(input)
  const frame: ConstructFrame = {
    requestId: input.id,
    geometry: input.shape,
    boundsMm: input.sizeMm,
    positionMm: input.positionMm,
    visual: { color: input.visual?.color ?? '#4cc9ff', opacity: input.visual?.opacity ?? 0.75 },
    haptics: { enabled: input.haptics?.enabled === true && safety.allowed, intensity: Math.min(input.haptics?.intensity ?? 0, MAX_HAPTIC_INTENSITY) },
    safety,
    generatedAt: new Date().toISOString(),
  }
  emit('tryamm:secs:frame', frame)
  return frame
}

export function ingestConstructPrototypeLine(line: string) {
  const value = line.trim()
  if (!value.startsWith('SECS:STATUS:')) return { accepted: false, reason: 'unsupported-prototype-line' }

  const fields: Record<string, string> = {}
  for (const entry of value.slice('SECS:STATUS:'.length).split(';')) {
    const separator = entry.indexOf('=')
    if (separator <= 0) continue
    fields[entry.slice(0, separator)] = entry.slice(separator + 1)
  }

  const uptimeMs = Number(fields.UPTIME_MS)
  const maxPwm = Number(fields.MAX_PWM)
  if (!Number.isFinite(uptimeMs) || uptimeMs < 0 || !Number.isFinite(maxPwm) || maxPwm <= 0) {
    return { accepted: false, reason: 'invalid-hardware-telemetry' }
  }

  latestHardwareTelemetry = {
    estopClear: fields.ESTOP === 'CLEAR',
    outputsEnabled: fields.OUTPUTS === 'ON',
    uptimeMs,
    maxPwm,
    receivedAt: new Date().toISOString(),
  }
  emit('tryamm:secs:hardware-telemetry', latestHardwareTelemetry)
  emit('tryamm:secs:hardware-readiness', getConstructHardwareReadiness())
  return { accepted: true, telemetry: latestHardwareTelemetry }
}

export function getConstructHardwareReadiness(nowMs = Date.now()) {
  const reasons: string[] = []
  if (!latestHardwareTelemetry) reasons.push('hardware-telemetry-missing')
  if (latestHardwareTelemetry) {
    const receivedAtMs = Date.parse(latestHardwareTelemetry.receivedAt)
    const ageMs = nowMs - receivedAtMs
    if (!Number.isFinite(receivedAtMs) || ageMs < 0) reasons.push('hardware-telemetry-invalid-time')
    else if (ageMs > HARDWARE_TELEMETRY_MAX_AGE_MS) reasons.push('hardware-telemetry-stale')
    if (!latestHardwareTelemetry.estopClear) reasons.push('hardware-estop-not-clear')
    if (latestHardwareTelemetry.maxPwm !== EXPECTED_FIRMWARE_MAX_PWM) reasons.push('hardware-capability-mismatch')
  }
  return { ready: reasons.length === 0, reasons, telemetry: latestHardwareTelemetry }
}

export function sendConstructToPrototype(frame: ConstructFrame) {
  const hardwareReadiness = getConstructHardwareReadiness()
  const reasons = [...frame.safety.reasons, ...hardwareReadiness.reasons]
  if (!frame.safety.allowed || !hardwareReadiness.ready) {
    const denied = { sent: false, requestId: frame.requestId, reason: reasons.join(','), hardwareReadiness }
    emit('tryamm:secs:prototype-denied', denied)
    return denied
  }
  const packet = {
    version: 2,
    requestId: frame.requestId,
    geometry: frame.geometry,
    boundsMm: frame.boundsMm,
    positionMm: frame.positionMm,
    visual: frame.visual,
    haptics: frame.haptics,
    emergencyStopRequired: true,
    hardwareValidationRequired: true,
    hardwareTelemetryRequired: true,
    telemetryMaxAgeMs: HARDWARE_TELEMETRY_MAX_AGE_MS,
    hardwareSnapshot: hardwareReadiness.telemetry,
  }
  emit('tryamm:secs:prototype-command', packet)
  return { sent: true, packet }
}

export function runConstructSelfTest() {
  const samples: ConstructRequest[] = [
    { id: 'secs-cube-test', shape: 'cube', sizeMm: { x: 100, y: 100, z: 100 }, positionMm: { x: 0, y: 0, z: 250 }, haptics: { enabled: true, intensity: 0.15 } },
    { id: 'secs-button-test', shape: 'button', sizeMm: { x: 60, y: 60, z: 20 }, positionMm: { x: 0, y: 0, z: 200 }, haptics: { enabled: true, intensity: 0.1 } },
    { id: 'secs-wheel-test', shape: 'steering-wheel', sizeMm: { x: 356, y: 356, z: 60 }, positionMm: { x: 0, y: 0, z: 350 }, haptics: { enabled: false, intensity: 0 } },
  ]
  const frames = samples.map(compileConstruct)
  const result = { passed: frames.every((f) => f.safety.allowed), count: frames.length, frames }
  emit('tryamm:secs:self-test', result)
  return result
}

export function installSECSConstructRuntime() {
  const runtime = window as unknown as Record<string, unknown>
  runtime.__compileSECSConstruct = compileConstruct
  runtime.__sendSECSConstructToPrototype = sendConstructToPrototype
  runtime.__ingestSECSPrototypeLine = ingestConstructPrototypeLine
  runtime.__getSECSHardwareReadiness = getConstructHardwareReadiness
  runtime.__runSECSConstructSelfTest = runConstructSelfTest
  emit('tryamm:secs:ready', {
    status: 'software-prototype',
    chamberEnvelopeMm: { x: MAX_DIMENSION_MM, y: MAX_DIMENSION_MM, z: MAX_DIMENSION_MM },
    modes: ['simulation', 'prototype'],
    shapes: ['cube', 'sphere', 'button', 'steering-wheel'],
    closedLoopHardwareTelemetryRequired: true,
    hardwareTelemetryMaxAgeMs: HARDWARE_TELEMETRY_MAX_AGE_MS,
    hardwareClaim: 'requires physical prototype and lab validation',
  })
}
