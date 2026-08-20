export type RealityClass =
  | 'virtual_asset'
  | 'simulation'
  | 'learning_only'
  | 'contractual_real_world'
  | 'regulated_real_world'
  | 'manufacturing_candidate'
  | 'manufacturing_approved';

export type TimeMachineMode =
  | 'historical_replay'
  | 'business_scenario'
  | 'community_scenario'
  | 'career_scenario'
  | 'design_iteration'
  | 'game_world_replay';

export type TimeMachineScenario = {
  id: string;
  title: string;
  mode: TimeMachineMode;
  createdAt: string;
  sourceSnapshotId?: string;
  assumptions: string[];
  variables: Record<string, string | number | boolean>;
  realityClass: 'simulation';
  disclaimer: string;
};

export type TimeMachineResult = {
  scenarioId: string;
  generatedAt: string;
  projectedOutcomes: Record<string, string | number | boolean>;
  confidence?: 'low' | 'medium' | 'high';
  evidenceRefs?: string[];
  canAffectRealWorld: false;
};

export const createTimeMachineScenario = (
  input: Omit<TimeMachineScenario, 'id' | 'createdAt' | 'realityClass' | 'disclaimer'>,
): TimeMachineScenario => ({
  ...input,
  id: globalThis.crypto?.randomUUID?.() ?? `tm-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  createdAt: new Date().toISOString(),
  realityClass: 'simulation',
  disclaimer: 'Simulation only. TRYAMM Time Machine replays, explores, or projects scenarios; it does not change real history or guarantee future outcomes.',
});

export type VirtualLandRecord = {
  id: string;
  worldId: string;
  ownerAccountId: string;
  coordinates?: { x: number; y: number; z?: number };
  realityClass: 'virtual_asset';
  legalProperty: false;
};

export type SimulatedJobRecord = {
  id: string;
  title: string;
  employerName?: string;
  realityClass: 'simulation' | 'learning_only';
  employmentContract: false;
  compensation?: { kind: 'game_currency' | 'simulated_money'; amount: number; currencyLabel: string };
};

export type GameMoneyRecord = {
  walletId: string;
  balance: number;
  currencyLabel: string;
  realityClass: 'virtual_asset';
  redeemableForCash: false;
};

export type DigitalFurnitureRecord = {
  id: string;
  designFileRef?: string;
  realityClass: 'virtual_asset' | 'manufacturing_candidate' | 'manufacturing_approved';
  structuralReviewStatus: 'not_started' | 'simulation_only' | 'engineering_review_required' | 'approved';
  materialsReviewStatus: 'not_started' | 'required' | 'approved';
  manufacturingReady: boolean;
};

export function canManufactureFurniture(record: DigitalFurnitureRecord) {
  return record.realityClass === 'manufacturing_approved'
    && record.structuralReviewStatus === 'approved'
    && record.materialsReviewStatus === 'approved'
    && record.manufacturingReady;
}

export type RealityBoundary = {
  subjectId: string;
  class: RealityClass;
  label: string;
  requiresExternalEvidence: boolean;
  externalEvidenceTypes?: string[];
};

export function describeRealityBoundary(boundary: RealityBoundary) {
  const external = boundary.requiresExternalEvidence
    ? ` External evidence required: ${(boundary.externalEvidenceTypes ?? []).join(', ') || 'applicable authority/provider evidence'}.`
    : '';
  return `${boundary.label} is classified as ${boundary.class}.${external}`;
}

// Guardrails:
// - virtual land is never represented as legal real-estate title.
// - simulated jobs are never represented as employment contracts.
// - game currency is never represented as cash unless a separately authorized redemption rail exists.
// - digital furniture cannot move to manufacturing without required safety/material/engineering approvals.
// - Time Machine is replay/simulation/projection only; it does not alter real history or guarantee future events.
