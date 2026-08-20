import type { DistrictEvidenceBundle, EvidenceArtifact, EvidenceKind } from './districtEvidenceCollector'

export interface RuntimeProbeContext {
  districtId: string
  commitSha: string
  buildId: string
  nowIso: string
}

export interface PerformanceSnapshot {
  fps: number
  p95FrameMs: number
  inputLatencyMs: number
  gpuMemoryMb?: number
  networkRttMs?: number
  xrLatencyMs?: number
  droppedFramePct?: number
}

function artifact(ctx: RuntimeProbeContext, kind: EvidenceKind, status: 'PASS'|'FAIL'|'UNPROVEN', metrics: Record<string, number|string|boolean> = {}, source: EvidenceArtifact['source'] = 'runtime_probe'): EvidenceArtifact {
  return {
    id: `${kind}:${ctx.buildId}:${ctx.nowIso}`,
    kind,
    status,
    createdAt: ctx.nowIso,
    source,
    commitSha: ctx.commitSha,
    buildId: ctx.buildId,
    metrics,
  }
}

export function probeMobilePerformance(ctx: RuntimeProbeContext, snapshot: PerformanceSnapshot) {
  const pass = snapshot.fps >= 30 && snapshot.p95FrameMs <= 33.4 && snapshot.inputLatencyMs <= 120 && (snapshot.droppedFramePct ?? 0) <= 5
  return artifact(ctx, 'mobile_performance', pass ? 'PASS' : 'FAIL', snapshot)
}

export function probeXrPerformance(ctx: RuntimeProbeContext, snapshot: PerformanceSnapshot) {
  const pass = snapshot.fps >= 72 && snapshot.p95FrameMs <= 13.9 && snapshot.inputLatencyMs <= 50 && (snapshot.xrLatencyMs ?? 0) <= 35 && (snapshot.droppedFramePct ?? 0) <= 3
  return artifact(ctx, 'xr_performance', pass ? 'PASS' : 'FAIL', snapshot)
}

export function probeTwoDeviceLive(ctx: RuntimeProbeContext, aSessionId?: string, bSessionId?: string, connected = false, audioOk = false, videoOk = false) {
  const distinct = Boolean(aSessionId && bSessionId && aSessionId !== bSessionId)
  const pass = distinct && connected && audioOk && videoOk
  const result = artifact(ctx, 'two_device_live', pass ? 'PASS' : 'FAIL', { distinctSessions: distinct, connected, audioOk, videoOk }, 'device_test')
  result.sessionId = aSessionId && bSessionId ? `${aSessionId}|${bSessionId}` : undefined
  return result
}

export function probeSaveRejoin(ctx: RuntimeProbeContext, savedRevision: string, rejoinedRevision: string, inventoryMatch: boolean, positionRestored: boolean) {
  const pass = savedRevision === rejoinedRevision && inventoryMatch && positionRestored
  return artifact(ctx, 'save_rejoin', pass ? 'PASS' : 'FAIL', { savedRevision, rejoinedRevision, inventoryMatch, positionRestored })
}

export function probePanicMode(ctx: RuntimeProbeContext, triggered: boolean, unsafeAutomationStopped: boolean, playerControlPreserved: boolean, voiceSafetyPreserved: boolean) {
  const pass = triggered && unsafeAutomationStopped && playerControlPreserved && voiceSafetyPreserved
  return artifact(ctx, 'panic_mode', pass ? 'PASS' : 'FAIL', { triggered, unsafeAutomationStopped, playerControlPreserved, voiceSafetyPreserved })
}

export function probeCommerceSandbox(ctx: RuntimeProbeContext, receiptId?: string, amountCents = 0, currency = '', entitlementGranted = false, duplicatePrevented = false) {
  const pass = Boolean(receiptId) && amountCents === 1000 && currency === 'USD' && entitlementGranted && duplicatePrevented
  return artifact(ctx, 'commerce_sandbox', pass ? 'PASS' : 'FAIL', { receiptPresent: Boolean(receiptId), amountCents, currency, entitlementGranted, duplicatePrevented }, 'provider_test')
}

export function probeRenderQa(ctx: RuntimeProbeContext, darkerSkinDetailPreserved: boolean, noHighlightClipping: boolean, teethNatural: boolean, hairEdgesStable: boolean, lightingScenariosPassed: number) {
  const pass = darkerSkinDetailPreserved && noHighlightClipping && teethNatural && hairEdgesStable && lightingScenariosPassed >= 7
  return artifact(ctx, 'black_poc_render_qa', pass ? 'PASS' : 'FAIL', { darkerSkinDetailPreserved, noHighlightClipping, teethNatural, hairEdgesStable, lightingScenariosPassed }, 'manual_qa')
}

export function appendEvidence(bundle: DistrictEvidenceBundle, ...items: EvidenceArtifact[]): DistrictEvidenceBundle {
  return { ...bundle, artifacts: [...bundle.artifacts, ...items] }
}
