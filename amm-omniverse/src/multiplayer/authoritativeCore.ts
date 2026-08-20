export type Vec3 = { x: number; y: number; z: number };

export type PlayerAuthoritativeState = {
  playerId: string;
  sessionId: string;
  zoneId: string;
  position: Vec3;
  velocity: Vec3;
  rotationY: number;
  health: number;
  maxHealth: number;
  xp: number;
  beans: number;
  inventory: string[];
  collectibles: string[];
  faithDeck: string[];
  holographicDeck: string[];
  missionIds: string[];
  updatedAt: string;
  serverTick: number;
};

export type ClientInput = {
  seq: number;
  sessionId: string;
  move: Vec3;
  rotationY?: number;
  action?: 'interact' | 'jump' | 'use' | 'mission_action';
  actionTargetId?: string;
  sentAt: string;
};

export type InputValidation = {
  accepted: boolean;
  reason?: string;
  sanitizedMove: Vec3;
};

export function validateClientInput(input: ClientInput, maxMagnitude = 1.05): InputValidation {
  const mag = Math.hypot(input.move.x, input.move.y, input.move.z);
  if (!Number.isFinite(mag)) return { accepted: false, reason: 'Invalid movement vector.', sanitizedMove: { x: 0, y: 0, z: 0 } };
  if (mag > maxMagnitude) {
    const scale = maxMagnitude / Math.max(mag, 0.0001);
    return {
      accepted: true,
      reason: 'Movement clamped to server envelope.',
      sanitizedMove: { x: input.move.x * scale, y: input.move.y * scale, z: input.move.z * scale },
    };
  }
  return { accepted: true, sanitizedMove: input.move };
}

export type WorldSnapshot = {
  snapshotId: string;
  serverTick: number;
  zoneId: string;
  generatedAt: string;
  acknowledgedInputSeqByPlayer: Record<string, number>;
  players: PlayerAuthoritativeState[];
  districtMission?: DistrictRescueState;
};

export type DistrictRescueState = {
  missionId: 'district-rescue';
  zoneId: string;
  phase: 'forming' | 'active' | 'success' | 'failed';
  objectives: Array<{ id: string; label: string; current: number; target: number; complete: boolean }>;
  participantPlayerIds: string[];
  startedAt?: string;
  completedAt?: string;
  rewardGrantedPlayerIds: string[];
  revision: number;
};

export function applyDistrictObjective(
  mission: DistrictRescueState,
  objectiveId: string,
  amount = 1,
): DistrictRescueState {
  if (mission.phase !== 'active') return mission;
  const objectives = mission.objectives.map((objective) => {
    if (objective.id !== objectiveId || objective.complete) return objective;
    const current = Math.min(objective.target, objective.current + Math.max(0, amount));
    return { ...objective, current, complete: current >= objective.target };
  });
  const success = objectives.length > 0 && objectives.every((o) => o.complete);
  return {
    ...mission,
    objectives,
    phase: success ? 'success' : mission.phase,
    completedAt: success ? new Date().toISOString() : mission.completedAt,
    revision: mission.revision + 1,
  };
}

export type CloudCheckpoint = {
  playerId: string;
  accountId: string;
  deviceId: string;
  zoneId: string;
  stateRevision: number;
  state: Pick<PlayerAuthoritativeState,
    'position' | 'health' | 'xp' | 'beans' | 'inventory' | 'collectibles' | 'faithDeck' | 'holographicDeck' | 'missionIds'
  >;
  savedAt: string;
};

export type Party = {
  partyId: string;
  leaderPlayerId: string;
  memberPlayerIds: string[];
  maxMembers: number;
  zoneId?: string;
  matchmakingState: 'idle' | 'searching' | 'matched' | 'joining';
};

export type ReconnectTicket = {
  sessionId: string;
  playerId: string;
  zoneId: string;
  lastAckedInputSeq: number;
  expiresAt: string;
  checkpointRevision?: number;
};

export function canResumeSession(ticket: ReconnectTicket, now = new Date()) {
  return new Date(ticket.expiresAt) > now;
}

export type ClientReconciliationResult = {
  correctedPosition: Vec3;
  serverTick: number;
  replayFromInputSeq: number;
};

export function reconcileClient(
  localPosition: Vec3,
  authoritative: PlayerAuthoritativeState,
  ackedInputSeq: number,
  correctionThreshold = 0.25,
): ClientReconciliationResult {
  const error = Math.hypot(
    localPosition.x - authoritative.position.x,
    localPosition.y - authoritative.position.y,
    localPosition.z - authoritative.position.z,
  );
  return {
    correctedPosition: error >= correctionThreshold ? authoritative.position : localPosition,
    serverTick: authoritative.serverTick,
    replayFromInputSeq: ackedInputSeq + 1,
  };
}

// Integration contract:
// - Authentication is resolved server-side before a session is accepted.
// - Supabase RLS/cloud persistence stores checkpoints but never authorizes gameplay claims from the client.
// - Socket.IO/WebSocket is transport only; server tick is authoritative.
// - rewards, XP, Beans, health, inventory and District Rescue completion are server-issued only.
// - external map/satellite providers render context; they do not own gameplay truth.
