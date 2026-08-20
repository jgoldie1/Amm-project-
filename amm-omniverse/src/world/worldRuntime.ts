export type WorldKind = 'real_derived' | 'original' | 'user_created' | 'business_twin';
export type PublishState = 'draft' | 'private_test' | 'moderation_qa' | 'published' | 'update_pending' | 'rolled_back';

export type WorldDescriptor = {
  id: string;
  name: string;
  regionLabel: string;
  kind: WorldKind;
  terrainSource?: string;
  fictionalDistricts: string[];
  biomes: string[];
  roadsEnabled: boolean;
  weatherEnabled: boolean;
  dayNightEnabled: boolean;
  npcEnabled: boolean;
  wildlifeEnabled: boolean;
  businessTwinIds: string[];
  portalTargets: string[];
  publishState: PublishState;
  version: number;
};

export type MissionKind =
  | 'tutorial'
  | 'main_story'
  | 'side'
  | 'daily'
  | 'weekly'
  | 'community'
  | 'business'
  | 'creator'
  | 'education'
  | 'delivery'
  | 'exploration'
  | 'rescue_service'
  | 'sports'
  | 'racing'
  | 'combat'
  | 'ecology'
  | 'secret'
  | 'seasonal_global';

export type MissionObjective = {
  id: string;
  type: 'visit' | 'collect' | 'talk' | 'deliver' | 'solve' | 'win' | 'discover' | 'help' | 'build' | 'learn';
  targetId?: string;
  requiredCount?: number;
};

export type MissionDefinition = {
  id: string;
  worldId: string;
  title: string;
  kind: MissionKind;
  prerequisites: string[];
  objectives: MissionObjective[];
  rewards: Array<{ type: 'xp' | 'reputation' | 'cosmetic' | 'passport' | 'hologpt_credit'; amount?: number; id?: string }>;
  repeatable: boolean;
  hidden: boolean;
  accessibilityNotes?: string[];
};

export type PlayerState = {
  playerId: string;
  currentWorldId: string;
  districtId?: string;
  position?: { x: number; y: number; z: number };
  completedMissionIds: string[];
  activeMissionIds: string[];
  discoveredWorldIds: string[];
  discoveredSecretIds: string[];
  reputation: Record<string, number>;
  npcRelationships: Record<string, number>;
  inventory: Record<string, number>;
  businessMilestones: string[];
  learningMilestones: string[];
  accessibilityProfileId?: string;
  updatedAt: string;
};

export function canStartMission(state: PlayerState, mission: MissionDefinition) {
  return mission.prerequisites.every((id) => state.completedMissionIds.includes(id));
}

export function teleportPlayer(state: PlayerState, targetWorldId: string, targetDistrictId?: string): PlayerState {
  return {
    ...state,
    currentWorldId: targetWorldId,
    districtId: targetDistrictId,
    discoveredWorldIds: state.discoveredWorldIds.includes(targetWorldId)
      ? state.discoveredWorldIds
      : [...state.discoveredWorldIds, targetWorldId],
    updatedAt: new Date().toISOString(),
  };
}

export function completeMission(state: PlayerState, mission: MissionDefinition): PlayerState {
  if (!state.completedMissionIds.includes(mission.id)) state.completedMissionIds.push(mission.id);
  state.activeMissionIds = state.activeMissionIds.filter((id) => id !== mission.id);
  state.updatedAt = new Date().toISOString();
  return { ...state };
}

export function validateWorldForPublish(world: WorldDescriptor) {
  const issues: string[] = [];
  if (!world.name.trim()) issues.push('World name is required.');
  if (!world.regionLabel.trim()) issues.push('Region label is required.');
  if (world.kind === 'real_derived' && !world.terrainSource) issues.push('Real-derived terrain needs a licensed/authorized terrain source.');
  if (world.portalTargets.includes(world.id)) issues.push('A world cannot portal directly to itself.');
  return { valid: issues.length === 0, issues };
}

// Production persistence must be authoritative server-side for multiplayer/shared state.
// Real-world-derived terrain must use licensed/open/authorized data and must not copy protected game maps.
