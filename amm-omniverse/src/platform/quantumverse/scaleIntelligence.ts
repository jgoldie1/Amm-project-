export type ProvenanceClass =
  | 'OBSERVED'
  | 'MEASURED'
  | 'CALIBRATED'
  | 'RECONSTRUCTED'
  | 'DIGITAL_TWIN'
  | 'SCIENTIFIC_SIMULATION'
  | 'AI_ASSISTED_ANALYSIS'
  | 'ARTISTIC_VISUALIZATION'
  | 'HYPOTHETICAL'

export type ScaleDomain =
  | 'cosmic'
  | 'planetary'
  | 'city'
  | 'building'
  | 'machine'
  | 'component'
  | 'material'
  | 'microstructure'
  | 'nanostructure'

export type ScaleAddress = {
  objectId: string
  domain: ScaleDomain
  metersPerUnit?: number
  parentObjectId?: string
  datasetId: string
  provenance: ProvenanceClass[]
  observedAt?: string
  sourceLabel: string
  confidence?: number
  minResolvedFeatureMeters?: number
}

export type ZoomDecision = {
  allowed: boolean
  next?: ScaleAddress
  reason: string
  requiresDifferentDataset: boolean
}

export function canResolveScale(current: ScaleAddress, requestedFeatureMeters: number): boolean {
  if (!Number.isFinite(requestedFeatureMeters) || requestedFeatureMeters <= 0) return false
  if (current.minResolvedFeatureMeters == null) return true
  return requestedFeatureMeters >= current.minResolvedFeatureMeters
}

export function decideZoom(current: ScaleAddress, requestedFeatureMeters: number, candidate?: ScaleAddress): ZoomDecision {
  if (canResolveScale(current, requestedFeatureMeters)) {
    return { allowed: true, next: current, reason: 'Current dataset can represent the requested scale.', requiresDifferentDataset: false }
  }

  if (candidate && canResolveScale(candidate, requestedFeatureMeters)) {
    return { allowed: true, next: candidate, reason: `Resolution limit reached; switching to ${candidate.sourceLabel}.`, requiresDifferentDataset: true }
  }

  return {
    allowed: false,
    reason: 'Resolution limit reached. No verified higher-resolution dataset is available; do not synthesize hidden detail as observation.',
    requiresDifferentDataset: true,
  }
}

export function provenanceLabel(address: ScaleAddress) {
  return `${address.provenance.join(' + ')} • ${address.sourceLabel}`
}
