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

const BUILD_SHA_PATTERN = /^[0-9a-f]{7,64}$/i;

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

  const expectedBuildSha = evidence.expectedBuildSha.trim();
  const runBuildSha = evidence.run.buildSha?.trim() ?? '';

  if (!expectedBuildSha) {
    missingEvidence.push('expectedBuildSha');
  } else if (expectedBuildSha !== evidence.expectedBuildSha || !BUILD_SHA_PATTERN.test(expectedBuildSha)) {
    missingEvidence.push('expectedBuildShaInvalid');
  }

  if (!runBuildSha) {
    missingEvidence.push('run.buildSha');
  } else if (runBuildSha !== evidence.run.buildSha || !BUILD_SHA_PATTERN.test(runBuildSha)) {
    missingEvidence.push('run.buildShaInvalid');
  }

  if (expectedBuildSha && runBuildSha && expectedBuildSha !== runBuildSha) {
    missingEvidence.push('buildShaMismatch');
  }

  if (evidence.evidenceRefs.length === 0) {
    missingEvidence.push('evidenceRefs');
  } else {
    for (const [index, evidenceRef] of evidence.evidenceRefs.entries()) {
      const normalizedEvidenceRef = evidenceRef.trim();
      if (!normalizedEvidenceRef) {
        missingEvidence.push(`evidenceRef:${index}`);
      } else if (normalizedEvidenceRef !== evidenceRef) {
        missingEvidence.push(`evidenceRefInvalid:${index}`);
      }
    }
  }

  const verifiedAt = evidence.verifiedAt.trim();
  if (!verifiedAt) {
    missingEvidence.push('verifiedAt');
  } else if (Number.isNaN(Date.parse(verifiedAt))) {
    missingEvidence.push('verifiedAtInvalid');
  }

  const criticalFindingIds = evidence.run.findings
    .filter((finding) => finding.severity === 'critical')
    .map((finding) => finding.id);

  for (const finding of evidence.run.findings) {
    const normalizedFindingEvidenceRef = finding.evidenceRef?.trim() ?? '';
    if (!normalizedFindingEvidenceRef) {
      missingEvidence.push(`findingEvidenceRef:${finding.id}`);
    } else if (normalizedFindingEvidenceRef !== finding.evidenceRef) {
      missingEvidence.push(`findingEvidenceRefInvalid:${finding.id}`);
    }
  }

  return {
    allowed: missingEvidence.length === 0 && criticalFindingIds.length === 0,
    missingEvidence,
    criticalFindingIds,
  };
};
