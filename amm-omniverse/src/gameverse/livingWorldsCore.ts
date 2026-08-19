export type WorldKind = 'real_world_derived' | 'fictional' | 'user_created' | 'hybrid';
export type DistrictKind = 'downtown' | 'residential' | 'industrial' | 'campus' | 'entertainment' | 'sports' | 'faith_community' | 'wilderness' | 'waterfront' | 'space' | 'user_created' | 'business_twin';
export type MissionKind = 'tutorial' | 'main' | 'side' | 'daily' | 'weekly' | 'community' | 'business' | 'creator' | 'education' | 'delivery' | 'exploration' | 'rescue_service' | 'sports' | 'racing' | 'combat' | 'ecology' | 'secret' | 'seasonal';
export type SpeciesClass = 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'fish' | 'insect' | 'arachnid' | 'pollinator' | 'farm_animal' | 'companion_animal' | 'fantasy' | 'alien';

export type LivingWorld = {
  id: string;
  name: string;
  kind: WorldKind;
  terrainSource?: string;
  districts: string[];
  portalIds: string[];
  published: boolean;
};

export type DistrictManifest = {
  id: string;
  worldId: string;
  name: string;
  kind: DistrictKind;
  entrances: string[];
  exits: string[];
  businesses: string[];
  factions: string[];
  npcPopulationTarget?: number;
  wildlifeSpeciesIds: string[];
  missionIds: string[];
  accessibilityRoutes?: string[];
  streamingBoundaryId?: string;
};

export type MissionObjective = {
  id: string;
  label: string;
  required: boolean;
  progress: number;
  target: number;
};

export type MissionDefinition = {
  id: string;
  title: string;
  kind: MissionKind;
  worldId: string;
  districtId?: string;
  prerequisites: string[];
  objectives: MissionObjective[];
  accessibilityAlternatives?: string[];
  rewardIds: string[];
  secret?: {
    discoveryModes: Array<'exploration' | 'reputation' | 'puzzle' | 'npc' | 'hidden_object' | 'world_event' | 'creator_clue' | 'business_milestone' | 'multi_world_chain'>;
    hintPolicy: 'none' | 'jarvis_optional' | 'progressive';
  };
  officialRulesGate?: boolean;
  serverAuthoritativeRewards?: boolean;
};

export type SpeciesDefinition = {
  id: string;
  commonName: string;
  speciesClass: SpeciesClass;
  habitats: string[];
  biomes: string[];
  diet?: 'herbivore' | 'carnivore' | 'omnivore' | 'nectar' | 'detritivore' | 'other';
  activeCycle?: 'day' | 'night' | 'crepuscular' | 'mixed';
  socialBehavior?: 'solitary' | 'pair' | 'herd' | 'flock' | 'pack' | 'swarm' | 'colony' | 'school';
  migratory?: boolean;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  educationalNotes?: string[];
  nonViolentInteractionSupported: boolean;
};

export type PlayerMissionState = {
  playerId: string;
  missionId: string;
  state: 'locked' | 'available' | 'active' | 'completed' | 'failed' | 'abandoned';
  objectiveProgress: Record<string, number>;
  discoveredAt?: string;
  startedAt?: string;
  completedAt?: string;
};

export function isMissionAvailable(mission: MissionDefinition, completedMissionIds: string[]) {
  return mission.prerequisites.every((id) => completedMissionIds.includes(id));
}

export function updateObjective(state: PlayerMissionState, objectiveId: string, amount: number): PlayerMissionState {
  if (state.state !== 'active') return state;
  return {
    ...state,
    objectiveProgress: {
      ...state.objectiveProgress,
      [objectiveId]: Math.max(0, (state.objectiveProgress[objectiveId] ?? 0) + amount),
    },
  };
}

export function missionComplete(mission: MissionDefinition, state: PlayerMissionState) {
  return mission.objectives
    .filter((objective) => objective.required)
    .every((objective) => (state.objectiveProgress[objective.id] ?? 0) >= objective.target);
}

export function eligibleSpeciesForBiome(species: SpeciesDefinition[], biome: string) {
  return species.filter((entry) => entry.biomes.includes(biome));
}

export type JarvisMissionContext = {
  mission: MissionDefinition;
  playerState: PlayerMissionState;
  accessibilityPreferences?: string[];
  allowHints: boolean;
};

export function buildJarvisMissionBrief(context: JarvisMissionContext) {
  const remaining = context.mission.objectives
    .filter((objective) => (context.playerState.objectiveProgress[objective.id] ?? 0) < objective.target)
    .map((objective) => ({
      id: objective.id,
      label: objective.label,
      remaining: Math.max(0, objective.target - (context.playerState.objectiveProgress[objective.id] ?? 0)),
    }));

  return {
    title: context.mission.title,
    remaining,
    accessibilityAlternatives: context.mission.accessibilityAlternatives ?? [],
    hintsAllowed: context.allowHints && context.mission.secret?.hintPolicy !== 'none',
  };
}

// Production boundaries:
// - real-world terrain/maps require licensed/permitted data sources.
// - secret mission unlocks/rewards should be server-authoritative in competitive contexts.
// - user-created worlds require moderation/publication states and rollback.
// - wildlife simulation should never encourage real-world animal cruelty.
// - shared rewards must respect each game's competitive-balance rules.
