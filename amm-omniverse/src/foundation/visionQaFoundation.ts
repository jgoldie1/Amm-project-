export const VISION_QA_AREAS = [
  'environment-quality',
  'character-model-quality',
  'facial-animation',
  'vehicle-orientation-and-physics',
  'crowd-density-and-behavior',
  'traffic-flow',
  'lighting-and-materials',
  'vfx-quality',
  'ui-readability',
  'accessibility-contrast-and-legibility',
  'collision-and-clipping',
  'animation-artifacts',
  'world-population-gaps',
  'visual-regressions',
] as const;

export type VisionQaArea = (typeof VISION_QA_AREAS)[number];

export interface VisionQaFinding {
  id: string;
  area: VisionQaArea;
  severity: 'info' | 'warning' | 'critical';
  summary: string;
  evidenceRef?: string;
  frameTime?: number;
  worldRegion?: string;
  suggestedFix?: string;
  verifiedByHuman: boolean;
}

export interface VisionQaRun {
  id: string;
  createdAt: string;
  source: 'screenshot' | 'video-frame' | 'live-capture' | 'asset-preview';
  buildSha?: string;
  findings: VisionQaFinding[];
}

/**
 * Vision-assisted QA is advisory. It can flag visual/gameplay defects,
 * but it must never mutate authoritative commerce, payment, inventory,
 * customs, shipment, payout, or settlement state.
 */
export const VISION_QA_CAN_MUTATE_COMMERCE_TRUTH = false as const;

export const countCriticalVisionFindings = (run: VisionQaRun): number =>
  run.findings.filter((finding) => finding.severity === 'critical').length;

export const visionQaReleaseGatePasses = (run: VisionQaRun): boolean =>
  countCriticalVisionFindings(run) === 0;
