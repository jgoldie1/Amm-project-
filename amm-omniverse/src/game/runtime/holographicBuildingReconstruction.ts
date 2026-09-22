export type BuildingSourceKind =
  | 'blueprint'
  | 'floor-plan'
  | 'front-photo'
  | 'rear-photo'
  | 'left-photo'
  | 'right-photo'
  | 'aerial-reference'
  | 'scan'
  | 'measurement';

export interface BuildingSource {
  id: string;
  kind: BuildingSourceKind;
  uri: string;
  authorized: boolean;
  capturedAt?: string;
  notes?: string;
}

export interface BuildingLevel {
  id: string;
  label: string;
  elevationM: number;
  heightM: number;
  roomIds: string[];
}

export type BuildingBehaviorKind =
  | 'door'
  | 'window'
  | 'stairs'
  | 'elevator'
  | 'toilet'
  | 'sink'
  | 'shower'
  | 'light'
  | 'hvac'
  | 'television'
  | 'speaker'
  | 'appliance'
  | 'animal-zone'
  | 'adult-private-zone'
  | 'business'
  | 'job'
  | 'mission';

export interface BuildingBehaviorNode {
  id: string;
  kind: BuildingBehaviorKind;
  roomId?: string;
  levelId?: string;
  interactive: boolean;
  soundProfile?: string;
  accessibility?: {
    wheelchairReachable?: boolean;
    oneHandOperable?: boolean;
    captionsRequired?: boolean;
    visualCueRequired?: boolean;
  };
  metadata?: Record<string, string | number | boolean>;
}

export interface BuildingBehaviorEdge {
  from: string;
  to: string;
  relation:
    | 'connects'
    | 'controls'
    | 'powers'
    | 'supplies-water'
    | 'drains-to'
    | 'plays-in'
    | 'navigates-to'
    | 'requires-consent';
}

export interface BuildingPassport {
  id: string;
  name: string;
  city: string;
  communityArea?: string;
  addressLabel?: string;
  sourceProvenance: BuildingSource[];
  levels: BuildingLevel[];
  behaviors: BuildingBehaviorNode[];
  behaviorEdges: BuildingBehaviorEdge[];
  reconstruction: {
    geometryConfidence: number;
    facadeConfidence: number;
    interiorConfidence: number;
    uncertainRegions: string[];
    generatedAt?: string;
  };
  optimization: {
    mobileTriangleBudget: number;
    desktopTriangleBudget: number;
    textureBudgetMb: number;
    lodLevels: number;
    streamingCell?: string;
  };
  safety: {
    emergencyExitNodeIds: string[];
    accessibleRouteNodeIds: string[];
    adultPrivateZonesRequireVerifiedAdultConsent: boolean;
  };
}

export const BUILDING_RECONSTRUCTION_STAGES = [
  'INGEST_AUTHORIZED_SOURCES',
  'NORMALIZE_SCALE_AND_ORIENTATION',
  'EXTRACT_FOOTPRINT_AND_FLOORS',
  'RECONSTRUCT_STRUCTURE',
  'RECONSTRUCT_FACADE',
  'GENERATE_ROOMS',
  'GENERATE_STAIRS_AND_ELEVATORS',
  'GENERATE_DOORS_AND_WINDOWS',
  'GENERATE_UTILITY_GRAPHS',
  'GENERATE_ACOUSTICS_AND_LIGHTING',
  'GENERATE_INTERACTION_POINTS',
  'GENERATE_NAVIGATION_AND_ACCESSIBILITY',
  'GENERATE_COLLISION',
  'GENERATE_LODS_AND_STREAMING',
  'ATTACH_LIVING_CITY_SEMANTICS',
  'ATTACH_TIME_MACHINE_LAYERS',
  'GUARDIAN_QA',
  'FOUNDER_PREVIEW',
] as const;

export type BuildingReconstructionStage =
  (typeof BUILDING_RECONSTRUCTION_STAGES)[number];

export interface ReconstructionJob {
  id: string;
  passportId: string;
  requestedStage?: BuildingReconstructionStage;
  status: 'queued' | 'running' | 'needs-review' | 'passed' | 'failed';
  stage: BuildingReconstructionStage;
  warnings: string[];
  changedRegions: string[];
  performance?: {
    triangleCount: number;
    textureMb: number;
    estimatedMobileFps?: number;
  };
}

export function validateBuildingPassport(passport: BuildingPassport): string[] {
  const errors: string[] = [];
  if (!passport.id.trim()) errors.push('Building Passport requires an id.');
  if (!passport.name.trim()) errors.push('Building Passport requires a name.');
  if (!passport.city.trim()) errors.push('Building Passport requires a city.');
  if (!passport.sourceProvenance.some((source) => source.authorized)) {
    errors.push('At least one authorized reconstruction source is required.');
  }
  if (passport.levels.length === 0) errors.push('At least one building level is required.');
  if (passport.optimization.lodLevels < 1) errors.push('At least one LOD is required.');
  if (passport.optimization.mobileTriangleBudget <= 0) {
    errors.push('A positive mobile triangle budget is required.');
  }
  if (!passport.safety.adultPrivateZonesRequireVerifiedAdultConsent) {
    errors.push('Adult private zones must preserve verified-adult consent boundaries.');
  }
  return errors;
}

export function canPublishReconstruction(
  passport: BuildingPassport,
  job: ReconstructionJob,
): boolean {
  return (
    validateBuildingPassport(passport).length === 0 &&
    job.status === 'passed' &&
    job.stage === 'FOUNDER_PREVIEW' &&
    job.warnings.length === 0
  );
}
