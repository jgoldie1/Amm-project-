export type Vector3 = { x: number; y: number; z: number };
export type Quaternion = { x: number; y: number; z: number; w: number };

export type PlayerInput = {
  seq: number;
  clientTimeMs: number;
  moveX: number;
  moveZ: number;
  lookYaw: number;
  sprint: boolean;
  action?: 'interact' | 'rescue' | 'jump' | 'none';
};

export type PlayerSnapshot = {
  playerId: string;
  position: Vector3;
  velocity: Vector3;
  rotation: Quaternion;
  lastProcessedInputSeq: number;
  districtId: string;
  missionId?: string;
};

export type WorldSnapshot = {
  roomId: string;
  tick: number;
  serverTimeMs: number;
  players: PlayerSnapshot[];
  missionState?: Record<string, unknown>;
};

export type AuthenticatedSession = {
  userId: string;
  accessToken: string;
  sessionId: string;
};

export type MatchRequest = {
  mode: 'shared_city' | 'district_rescue_coop' | 'user_world';
  region?: string;
  districtId?: string;
  partyId?: string;
  maxPlayers?: number;
};

export type MatchAssignment = {
  roomId: string;
  mode: MatchRequest['mode'];
  reconnectToken: string;
  expiresAt: string;
};

export type Checkpoint = {
  userId: string;
  worldId: string;
  districtId: string;
  missionId?: string;
  position: Vector3;
  rotation: Quaternion;
  progression: Record<string, unknown>;
  savedAt: string;
  version: number;
};

export const SERVER_TICK_RATE_HZ = 20;
export const SERVER_TICK_MS = 1000 / SERVER_TICK_RATE_HZ;
export const SNAPSHOT_RATE_HZ = 10;
export const SNAPSHOT_INTERVAL_TICKS = SERVER_TICK_RATE_HZ / SNAPSHOT_RATE_HZ;

export function clampInput(input: PlayerInput): PlayerInput {
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
  return {
    ...input,
    moveX: clamp(input.moveX, -1, 1),
    moveZ: clamp(input.moveZ, -1, 1),
    lookYaw: Number.isFinite(input.lookYaw) ? input.lookYaw : 0,
    sprint: Boolean(input.sprint),
    action: input.action ?? 'none',
  };
}

export type AuthoritativePlayer = PlayerSnapshot & {
  pendingInputs: PlayerInput[];
  lastInputAtMs: number;
};

export function simulatePlayerTick(player: AuthoritativePlayer, dtSeconds: number): AuthoritativePlayer {
  const next = { ...player, pendingInputs: [...player.pendingInputs] };
  const input = next.pendingInputs.shift();
  if (!input) {
    next.velocity = { x: 0, y: next.velocity.y, z: 0 };
    return next;
  }

  const safe = clampInput(input);
  const magnitude = Math.hypot(safe.moveX, safe.moveZ) || 1;
  const speed = safe.sprint ? 7.5 : 4.5;
  const vx = (safe.moveX / magnitude) * speed;
  const vz = (safe.moveZ / magnitude) * speed;

  next.velocity = { x: vx, y: next.velocity.y, z: vz };
  next.position = {
    x: next.position.x + vx * dtSeconds,
    y: next.position.y,
    z: next.position.z + vz * dtSeconds,
  };
  next.lastProcessedInputSeq = safe.seq;
  return next;
}

export class FixedTickRoomRuntime {
  readonly roomId: string;
  private tick = 0;
  private players = new Map<string, AuthoritativePlayer>();

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  upsertPlayer(snapshot: PlayerSnapshot, nowMs = Date.now()) {
    const existing = this.players.get(snapshot.playerId);
    this.players.set(snapshot.playerId, {
      ...(existing ?? snapshot),
      ...snapshot,
      pendingInputs: existing?.pendingInputs ?? [],
      lastInputAtMs: nowMs,
    });
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  enqueueInput(playerId: string, input: PlayerInput, nowMs = Date.now()) {
    const player = this.players.get(playerId);
    if (!player) return false;
    const safe = clampInput(input);
    if (safe.seq <= player.lastProcessedInputSeq) return false;
    if (player.pendingInputs.some((queued) => queued.seq === safe.seq)) return false;
    player.pendingInputs.push(safe);
    player.pendingInputs.sort((a, b) => a.seq - b.seq);
    if (player.pendingInputs.length > 120) player.pendingInputs.splice(0, player.pendingInputs.length - 120);
    player.lastInputAtMs = nowMs;
    return true;
  }

  step(serverTimeMs = Date.now()): WorldSnapshot | null {
    this.tick += 1;
    const dt = SERVER_TICK_MS / 1000;
    for (const [id, player] of this.players.entries()) {
      this.players.set(id, simulatePlayerTick(player, dt));
    }

    if (this.tick % SNAPSHOT_INTERVAL_TICKS !== 0) return null;
    return {
      roomId: this.roomId,
      tick: this.tick,
      serverTimeMs,
      players: [...this.players.values()].map(({ pendingInputs: _pending, lastInputAtMs: _lastInput, ...snapshot }) => snapshot),
    };
  }
}

export type MultiplayerTransportEvents = {
  authenticate: AuthenticatedSession;
  matchmake: MatchRequest;
  match_assignment: MatchAssignment;
  join_room: { roomId: string; reconnectToken?: string };
  player_input: PlayerInput;
  world_snapshot: WorldSnapshot;
  checkpoint_save: Checkpoint;
  checkpoint_saved: { savedAt: string; version: number };
  reconnect_state: { roomId: string; checkpoint?: Checkpoint; snapshot?: WorldSnapshot };
};

// Transport implementation may use Socket.IO or standards-based WebSocket.
// Authentication, room membership, checkpoint writes and all authoritative state
// must be validated server-side against the user's authenticated Supabase identity.
