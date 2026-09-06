import { VISION_QA_AREAS, type VisionQaArea, type VisionQaFinding, type VisionQaRun } from './visionQaFoundation';

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
const VISION_QA_AREA_SET = new Set<string>(VISION_QA_AREAS);

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
  if (typeof evidence !== 'object' || evidence === null || Array.isArray(evidence)) {
    return {
      allowed: false,
      missingEvidence: ['evidenceInvalid'],
      criticalFindingIds: [],
    };
  }

  const missingEvidence: string[] = [];
  const inspected = new Set<VisionQaArea>();

  if (!Array.isArray(evidence.inspectedAreas)) {
    missingEvidence.push('inspectedAreasInvalid');
  } else {
    for (const [index, inspectedArea] of evidence.inspectedAreas.entries()) {
      if (typeof inspectedArea !== 'string' || !VISION_QA_AREA_SET.has(inspectedArea)) {
        missingEvidence.push(`inspectedAreaInvalid:${index}`);
      } else if (inspected.has(inspectedArea as VisionQaArea)) {
        missingEvidence.push(`inspectedAreaDuplicate:${inspectedArea}`);
      } else {
        inspected.add(inspectedArea as VisionQaArea);
      }
    }
  }

  for (const area of ILLINOIS_VISION_QA_REQUIRED_AREAS) {
    if (!inspected.has(area)) missingEvidence.push(`inspectedArea:${area}`);
  }

  const expectedBuildSha = typeof evidence.expectedBuildSha === 'string'
    ? evidence.expectedBuildSha.trim()
    : '';
  const runBuildShaValue = evidence.run?.buildSha;
  const runBuildSha = typeof runBuildShaValue === 'string'
    ? runBuildShaValue.trim()
    : '';

  if (typeof evidence.expectedBuildSha !== 'string') {
    missingEvidence.push('expectedBuildShaInvalid');
  } else if (!expectedBuildSha) {
    missingEvidence.push('expectedBuildSha');
  } else if (expectedBuildSha !== evidence.expectedBuildSha || !BUILD_SHA_PATTERN.test(expectedBuildSha)) {
    missingEvidence.push('expectedBuildShaInvalid');
  }

  if (typeof runBuildShaValue !== 'string') {
    missingEvidence.push('run.buildShaInvalid');
  } else if (!runBuildSha) {
    missingEvidence.push('run.buildSha');
  } else if (runBuildSha !== runBuildShaValue || !BUILD_SHA_PATTERN.test(runBuildSha)) {
    missingEvidence.push('run.buildShaInvalid');
  }

  if (expectedBuildSha && runBuildSha && expectedBuildSha !== runBuildSha) {
    missingEvidence.push('buildShaMismatch');
  }

  const evidenceRefSet = new Set<string>();
  if (!Array.isArray(evidence.evidenceRefs)) {
    missingEvidence.push('evidenceRefsInvalid');
  } else if (evidence.evidenceRefs.length === 0) {
    missingEvidence.push('evidenceRefs');
  } else {
    for (const [index, evidenceRef] of evidence.evidenceRefs.entries()) {
      if (typeof evidenceRef !== 'string') {
        missingEvidence.push(`evidenceRefInvalid:${index}`);
        continue;
      }

      const normalizedEvidenceRef = evidenceRef.trim();
      if (!normalizedEvidenceRef) {
        missingEvidence.push(`evidenceRef:${index}`);
      } else if (normalizedEvidenceRef !== evidenceRef) {
        missingEvidence.push(`evidenceRefInvalid:${index}`);
      } else if (evidenceRefSet.has(evidenceRef)) {
        missingEvidence.push(`evidenceRefDuplicate:${evidenceRef}`);
      } else {
        evidenceRefSet.add(evidenceRef);
      }
    }
  }

  if (typeof evidence.verifiedAt !== 'string') {
    missingEvidence.push('verifiedAtInvalid');
  } else {
    const verifiedAt = evidence.verifiedAt.trim();
    if (!verifiedAt) {
      missingEvidence.push('verifiedAt');
    } else {
      const verifiedAtMs = Date.parse(verifiedAt);
      if (Number.isNaN(verifiedAtMs)) {
        missingEvidence.push('verifiedAtInvalid');
      } else if (verifiedAt !== evidence.verifiedAt || new Date(verifiedAtMs).toISOString() !== verifiedAt) {
        missingEvidence.push('verifiedAtInvalid');
      }
    }
  }

  const findingIdSet = new Set<string>();
  const runFindings = Array.isArray(evidence.run?.findings)
    ? evidence.run.findings.filter((finding, index): finding is VisionQaFinding => {
        if (typeof finding !== 'object' || finding === null || Array.isArray(finding)) {
          missingEvidence.push(`run.findingInvalid:${index}`);
          return false;
        }

        if (typeof finding.id !== 'string' || !finding.id.trim() || finding.id.trim() !== finding.id) {
          missingEvidence.push(`run.findingIdInvalid:${index}`);
          return false;
        }

        if (findingIdSet.has(finding.id)) {
          missingEvidence.push(`run.findingIdDuplicate:${finding.id}`);
          return false;
        }
        findingIdSet.add(finding.id);

        if (!VISION_QA_AREA_SET.has(finding.area)) {
          missingEvidence.push(`run.findingAreaInvalid:${index}`);
          return false;
        }

        if (finding.severity !== 'info' && finding.severity !== 'warning' && finding.severity !== 'critical') {
          missingEvidence.push(`run.findingSeverityInvalid:${index}`);
          return false;
        }

        return true;
      })
    : [];

  if (!Array.isArray(evidence.run?.findings)) {
    missingEvidence.push('run.findingsInvalid');
  }

  const criticalFindingIds = runFindings
    .filter((finding) => finding.severity === 'critical')
    .map((finding) => finding.id);

  for (const finding of runFindings) {
    if (finding.evidenceRef != null && typeof finding.evidenceRef !== 'string') {
      missingEvidence.push(`findingEvidenceRefInvalid:${finding.id}`);
      continue;
    }

    const normalizedFindingEvidenceRef = finding.evidenceRef?.trim() ?? '';
    if (!normalizedFindingEvidenceRef) {
      missingEvidence.push(`findingEvidenceRef:${finding.id}`);
    } else if (normalizedFindingEvidenceRef !== finding.evidenceRef) {
      missingEvidence.push(`findingEvidenceRefInvalid:${finding.id}`);
    } else if (!evidenceRefSet.has(normalizedFindingEvidenceRef)) {
      missingEvidence.push(`findingEvidenceRefUnlinked:${finding.id}`);
    }
  }

  return {
    allowed: missingEvidence.length === 0 && criticalFindingIds.length === 0,
    missingEvidence,
    criticalFindingIds,
  };
};
