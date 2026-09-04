import type { VisionQaArea, VisionQaRun } from './visionQaFoundation';

export const ILLINOIS_VISION_QA_REQUIRED_AREAS: readonly VisionQaArea[] = [
  'environment-quality',
  'character-model-quality',
  'vehicle-orientation-and-physics',
  'crowd-density-and-behavior',
  'traffic-flow',
  'lighting-and-materials',
  'ui-readability',
  'accessibility-contrast-and-legibility',
  'collision-and-clipping',
  'world-population-gaps',
] as const;

export interface VisionQaReleaseEvidence {
  run: VisionQaRun;
  inspectedAreas: VisionQaArea[];
  evidenceRefs: string[];
  expectedBuildSha: string;
  verifiedAt: string;
}

export interface VisionQaReleaseDecision {
  allowed: boolean;
  missingEvidence: string[];
  criticalFindingIds: string[];
}

/**
 * Vision-assisted QA is a release-quality signal only. This gate cannot mutate
 * authoritative commerce, payment, inventory, customs, shipment, payout, or
 * settlement state.
 *
 * A run is not considered passing merely because it has zero findings. The
 * Illinois vertical slice must prove required visual coverage, evidence refs,
 * a matching build SHA, and a verification timestamp.
 */
export const evaluateIllinoisVisionQaReleaseGate = (
  evidence: VisionQaReleaseEvidence,
): VisionQaReleaseDecision => {
  const missingEvidence: string[] = [];
  const inspected = new Set(evidence.inspectedAreas);

  for (const area of ILLINOIS_VISION_QA_REQUIRED_AREAS) {
    if (!inspected.has(area)) missingEvidence.push(`inspectedArea:${area}`);
  }

  if (!evidence.expectedBuildSha.trim()) missingEvidence.push('expectedBuildSha');
  if (!evidence.run.buildSha?.trim()) missingEvidence.push('run.buildSha');
  if (
    evidence.expectedBuildSha.trim() &&
    evidence.run.buildSha?.trim() &&
    evidence.expectedBuildSha !== evidence.run.buildSha
  ) {
    missingEvidence.push('buildShaMismatch');
  }

  if (evidence.evidenceRefs.length === 0) missingEvidence.push('evidenceRefs');
  if (!evidence.verifiedAt.trim()) missingEvidence.push('verifiedAt');

  const criticalFindingIds = evidence.run.findings
    .filter((finding) => finding.severity === 'critical')
    .map((finding) => finding.id);

  for (const finding of evidence.run.findings) {
    if (!finding.evidenceRef?.trim()) {
      missingEvidence.push(`findingEvidenceRef:${finding.id}`);
    }
  }

  return {
    allowed: missingEvidence.length === 0 && criticalFindingIds.length === 0,
    missingEvidence,
    criticalFindingIds,
  };
};
