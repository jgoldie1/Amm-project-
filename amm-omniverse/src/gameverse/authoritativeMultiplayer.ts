export type PlayerId = string;
export type SessionId = string;
export type WorldId = string;

export type Vec3 = { x: number; y: number; z: number };

export type PlayerProgression = {
  level: number;
  xp: number;
  beans: number;
  health: number;
  position: Vec3;
  faithDeck: string[];
  holographicDeck: string[];
  inventory: string[];
  collectibles: string[];
  achievements: string[];
  lastCheckpoint?: string;
};

export type PlayerCloudSave = {
  userId: string;
  gameId: string;
  worldId: WorldId;
  saveVersion: number;
  state: PlayerProgression;
  updatedAt: string;
  deviceId?: string;
};

export type PlayerInput = {
  sequence: number;
  clientTime: number;
  move?: { x: number; z: number };
  lookYaw?: number;
  sprint?: boolean;
  jump?: boolean;
  action?: 'attack' | 'interact' | 'use_item' | 'enter_vehicle' | 'exit_vehicle';
  targetId?: string;
};

export type AuthoritativePlayerState = {
  playerId: PlayerId;
  position: Vec3;
  velocity: Vec3;
  health: number;
  lastProcessedInput: number;
  connected: boolean;
  lastSeenAt: number;
};

export type WorldSnapshot = {
  sessionId: SessionId;
  worldId: WorldId;
  tick: number;
  serverTime: number;
  players: AuthoritativePlayerState[];
  worldEvents: WorldEvent[];
};

export type WorldEvent = {
  id: string;
  type: 'mission_started' | 'mission_completed' | 'checkpoint' | 'pickup' | 'combat' | 'vehicle' | 'npc' | 'system';
  actorId?: string;
  targetId?: string;
  payload?: Record<string, string | number | boolean | null>;
  createdAt: number;
};

export type ReconnectTicket = {
  userId: string;
  sessionId: SessionId;
  worldId: WorldId;
  issuedAt: number;
  expiresAt: number;
  lastAcknowledgedTick: number;
};

export type MatchSession = {
  id: SessionId;
  worldId: WorldId;
  capacity: number;
  state: 'forming' | 'active' | 'ending' | 'closed';
  createdAt: number;
  players: Map<PlayerId, AuthoritativePlayerState>;
  events: WorldEvent[];
  tick: number;
};

const MAX_SPEED = 8;
const SPRINT_MULTIPLIER = 1.5;
const INPUT_DT = 1 / 30;

export function createSession(id: string, worldId: string, capacity = 32): MatchSession {
  return { id, worldId, capacity, state: 'forming', createdAt: Date.now(), players: new Map(), events: [], tick: 0 };
}

export function joinSession(session: MatchSession, playerId: string, spawn: Vec3 = { x: 0, y: 0, z: 0 }) {
  if (session.players.size >= session.capacity) throw new Error('SESSION_FULL');
  if (session.players.has(playerId)) return session.players.get(playerId)!;
  const state: AuthoritativePlayerState = {
    playerId,
    position: spawn,
    velocity: { x: 0, y: 0, z: 0 },
    health: 100,
    lastProcessedInput: 0,
    connected: true,
    lastSeenAt: Date.now(),
  };
  session.players.set(playerId, state);
  if (session.state === 'forming') session.state = 'active';
  return state;
}

export function applyAuthoritativeInput(session: MatchSession, playerId: string, input: PlayerInput) {
  const player = session.players.get(playerId);
  if (!player) throw new Error('PLAYER_NOT_IN_SESSION');
  if (input.sequence <= player.lastProcessedInput) return player;

  const mag = input.move ? Math.hypot(input.move.x, input.move.z) : 0;
  const nx = mag > 1 ? input.move!.x / mag : input.move?.x ?? 0;
  const nz = mag > 1 ? input.move!.z / mag : input.move?.z ?? 0;
  const speed = MAX_SPEED * (input.sprint ? SPRINT_MULTIPLIER : 1);

  player.velocity = { x: nx * speed, y: player.velocity.y, z: nz * speed };
  player.position = {
    x: player.position.x + player.velocity.x * INPUT_DT,
    y: player.position.y,
    z: player.position.z + player.velocity.z * INPUT_DT,
  };
  player.lastProcessedInput = input.sequence;
  player.lastSeenAt = Date.now();
  return player;
}

export function serverTick(session: MatchSession): WorldSnapshot {
  session.tick += 1;
  return {
    sessionId: session.id,
    worldId: session.worldId,
    tick: session.tick,
    serverTime: Date.now(),
    players: [...session.players.values()].map((p) => ({ ...p, position: { ...p.position }, velocity: { ...p.velocity } })),
    worldEvents: session.events.slice(-100),
  };
}

export function markDisconnected(session: MatchSession, playerId: string) {
  const player = session.players.get(playerId);
  if (!player) return;
  player.connected = false;
  player.lastSeenAt = Date.now();
}

export function makeReconnectTicket(session: MatchSession, userId: string, ttlMs = 120_000): ReconnectTicket {
  return {
    userId,
    sessionId: session.id,
    worldId: session.worldId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
    lastAcknowledgedTick: session.tick,
  };
}

export function restoreFromCloud(save: PlayerCloudSave): PlayerProgression {
  return {
    level: Math.max(1, save.state.level),
    xp: Math.max(0, save.state.xp),
    beans: Math.max(0, save.state.beans),
    health: Math.min(100, Math.max(0, save.state.health)),
    position: { ...save.state.position },
    faithDeck: [...save.state.faithDeck],
    holographicDeck: [...save.state.holographicDeck],
    inventory: [...save.state.inventory],
    collectibles: [...save.state.collectibles],
    achievements: [...save.state.achievements],
    lastCheckpoint: save.state.lastCheckpoint,
  };
}

export function shouldPersistProgress(event: WorldEvent) {
  return ['mission_completed', 'checkpoint', 'pickup'].includes(event.type);
}

// Production requirements:
// - session and combat state live on an authenticated server process, never the browser.
// - client sends intent/input; server validates movement/combat and broadcasts snapshots.
// - durable progress writes to Supabase/Postgres game_saves + normalized progression tables with RLS.
// - reconnect tickets are signed/opaque server tokens; this plain type is only the domain model.
// - snapshots should be delivered via Socket.IO/WebSocket/WebTransport provider adapter.
// - add interest management/zone sharding before high player counts.
// - reuse existing Three.js renderer/avatar/camera/scene and worlds.json loader; do not create parallel renderer/netcode stacks.
