export type DistrictId = string;
export type PlayerId = string;
export type PropertyId = string;

export type PlayerWorldState = {
  playerId: PlayerId;
  worldId: string;
  districtId: DistrictId;
  position: { x: number; y: number; z: number };
  rotationY: number;
  health?: number;
  inventoryItemIds: string[];
  activeMissionIds: string[];
  relationshipIds: string[];
  propertyIds: PropertyId[];
  updatedAt: string;
};

export type DistrictManifest = {
  id: DistrictId;
  worldId: string;
  name: string;
  sceneAssetId: string;
  neighborDistrictIds: DistrictId[];
  portalIds: string[];
  spawnPoints: Record<string, { x: number; y: number; z: number; rotationY?: number }>;
  streamingPriority?: number;
};

export type DistrictPresence = {
  districtId: DistrictId;
  playerIds: PlayerId[];
  npcIds: string[];
  loadedAssetIds: string[];
  authoritativeTick: number;
};

export type MissionObjective =
  | { id: string; type: 'visit'; districtId?: string; targetId?: string; completed: boolean }
  | { id: string; type: 'collect'; itemId: string; quantity: number; current: number; completed: boolean }
  | { id: string; type: 'talk'; npcId: string; completed: boolean }
  | { id: string; type: 'deliver'; itemId: string; targetId: string; completed: boolean }
  | { id: string; type: 'own_property'; propertyType?: PropertyType; completed: boolean }
  | { id: string; type: 'custom'; key: string; expectedValue: string | number | boolean; completed: boolean };

export type MissionState = {
  id: string;
  playerId: PlayerId;
  title: string;
  objectives: MissionObjective[];
  state: 'locked' | 'active' | 'completed' | 'failed';
  rewardIds: string[];
  updatedAt: string;
};

export function evaluateMission(mission: MissionState): MissionState {
  const completed = mission.objectives.length > 0 && mission.objectives.every((o) => o.completed);
  return { ...mission, state: completed ? 'completed' : mission.state === 'locked' ? 'locked' : 'active', updatedAt: new Date().toISOString() };
}

export type NpcRelationship = {
  id: string;
  playerId: PlayerId;
  npcId: string;
  affinity: number;
  trust: number;
  respect: number;
  flags: string[];
  lastInteractionAt?: string;
};

export function updateNpcRelationship(
  relationship: NpcRelationship,
  delta: Partial<Pick<NpcRelationship, 'affinity' | 'trust' | 'respect'>>,
): NpcRelationship {
  const clamp = (n: number) => Math.max(-100, Math.min(100, n));
  return {
    ...relationship,
    affinity: clamp(relationship.affinity + (delta.affinity ?? 0)),
    trust: clamp(relationship.trust + (delta.trust ?? 0)),
    respect: clamp(relationship.respect + (delta.respect ?? 0)),
    lastInteractionAt: new Date().toISOString(),
  };
}

export type Portal = {
  id: string;
  fromDistrictId: DistrictId;
  toDistrictId: DistrictId;
  destinationSpawnKey: string;
  label: string;
  locked: boolean;
  unlockRequirementIds?: string[];
};

export type PortalTravelRequest = {
  playerId: PlayerId;
  portalId: string;
  requestedAt: string;
};

export type AssetForgeJob = {
  id: string;
  ownerId: string;
  kind: 'building' | 'room' | 'furniture' | 'vehicle' | 'prop' | 'character' | 'blueprint';
  prompt?: string;
  sourceAssetIds?: string[];
  outputFormats: Array<'gltf' | 'glb' | 'fbx' | 'obj' | 'stl' | 'step' | 'blueprint_json'>;
  state: 'draft' | 'queued' | 'generating' | 'review' | 'approved' | 'failed';
  safetyReviewRequired: boolean;
};

export type PropertyType = 'land' | 'apartment' | 'house' | 'commercial' | 'building';
export type PropertyOwnershipMode = 'game_currency' | 'earned_reward' | 'sandbox';

export type PropertyBlueprint = {
  id: string;
  propertyId: PropertyId;
  version: number;
  floorCount: number;
  roomIds: string[];
  elevatorIds: string[];
  structuralGrid?: { widthMeters: number; depthMeters: number; floorHeightMeters: number };
  assetForgeJobId?: string;
};

export type VirtualProperty = {
  id: PropertyId;
  worldId: string;
  districtId: DistrictId;
  type: PropertyType;
  name: string;
  ownerPlayerId?: PlayerId;
  ownershipMode: PropertyOwnershipMode;
  purchasable: boolean;
  priceMinor?: number;
  currencyCode?: string;
  blueprintId?: string;
  furnishingItemIds: string[];
  accessListPlayerIds: PlayerId[];
};

export type ElevatorState = {
  id: string;
  propertyId: PropertyId;
  currentFloor: number;
  targetFloor?: number;
  floors: number[];
  doors: 'open' | 'closed' | 'opening' | 'closing';
  motion: 'idle' | 'moving_up' | 'moving_down';
};

export function purchaseVirtualProperty(input: {
  property: VirtualProperty;
  playerId: PlayerId;
  availableBalanceMinor?: number;
}) {
  const { property, playerId, availableBalanceMinor = 0 } = input;
  if (!property.purchasable) return { ok: false as const, reason: 'Property is not purchasable.' };
  if (property.ownerPlayerId) return { ok: false as const, reason: 'Property is already owned.' };
  if (property.ownershipMode === 'game_currency' && (property.priceMinor ?? 0) > availableBalanceMinor) {
    return { ok: false as const, reason: 'Insufficient game balance.' };
  }
  return { ok: true as const, property: { ...property, ownerPlayerId: playerId } };
}

export type WorldPersistenceAdapter = {
  loadPlayer(playerId: PlayerId): Promise<PlayerWorldState | null>;
  savePlayer(state: PlayerWorldState): Promise<void>;
  loadDistrict(id: DistrictId): Promise<DistrictManifest | null>;
  saveMission(state: MissionState): Promise<void>;
  saveRelationship(state: NpcRelationship): Promise<void>;
  saveProperty(property: VirtualProperty): Promise<void>;
};

// Production rules:
// - multiplayer state is authoritative on the server; clients submit intent, not trusted final position/ownership.
// - district streaming separates simulation authority from visual asset loading.
// - portal travel validates unlock state and destination before server-authoritative relocation.
// - virtual property purchases remain game/sandbox transactions unless a separately approved real-money system is enabled.
// - building blueprints in-game are not represented as construction-ready architectural/engineering documents without qualified review.
