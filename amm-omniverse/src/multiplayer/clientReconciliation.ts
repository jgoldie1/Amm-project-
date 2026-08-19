import type { PlayerInput, PlayerSnapshot, Vector3, WorldSnapshot } from './authoritativeMultiplayer';

export type BufferedSnapshot = {
  receivedAtMs: number;
  snapshot: WorldSnapshot;
};

export type LocalPredictionState = {
  playerId: string;
  authoritative: PlayerSnapshot;
  predictedPosition: Vector3;
  pendingInputs: PlayerInput[];
};

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function interpolateVector(a: Vector3, b: Vector3, t: number): Vector3 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

export class SnapshotInterpolator {
  private buffer: BufferedSnapshot[] = [];
  readonly interpolationDelayMs: number;

  constructor(interpolationDelayMs = 120) {
    this.interpolationDelayMs = interpolationDelayMs;
  }

  push(snapshot: WorldSnapshot, receivedAtMs = performance.now()) {
    this.buffer.push({ receivedAtMs, snapshot });
    this.buffer.sort((a, b) => a.snapshot.serverTimeMs - b.snapshot.serverTimeMs);
    if (this.buffer.length > 60) this.buffer.splice(0, this.buffer.length - 60);
  }

  sample(renderServerTimeMs: number) {
    const target = renderServerTimeMs - this.interpolationDelayMs;
    let older: BufferedSnapshot | undefined;
    let newer: BufferedSnapshot | undefined;

    for (const item of this.buffer) {
      if (item.snapshot.serverTimeMs <= target) older = item;
      if (item.snapshot.serverTimeMs >= target) {
        newer = item;
        break;
      }
    }

    if (!older) return newer?.snapshot;
    if (!newer) return older.snapshot;
    if (older.snapshot.serverTimeMs === newer.snapshot.serverTimeMs) return older.snapshot;

    const t = (target - older.snapshot.serverTimeMs) / (newer.snapshot.serverTimeMs - older.snapshot.serverTimeMs);
    const players = older.snapshot.players.map((a) => {
      const b = newer!.snapshot.players.find((candidate) => candidate.playerId === a.playerId);
      if (!b) return a;
      return { ...a, position: interpolateVector(a.position, b.position, t), velocity: interpolateVector(a.velocity, b.velocity, t) };
    });

    for (const b of newer.snapshot.players) {
      if (!players.some((player) => player.playerId === b.playerId)) players.push(b);
    }

    return { ...newer.snapshot, players };
  }
}

export function applyPredictedInput(position: Vector3, input: PlayerInput, dtSeconds: number): Vector3 {
  const magnitude = Math.hypot(input.moveX, input.moveZ) || 1;
  const speed = input.sprint ? 7.5 : 4.5;
  return {
    x: position.x + (input.moveX / magnitude) * speed * dtSeconds,
    y: position.y,
    z: position.z + (input.moveZ / magnitude) * speed * dtSeconds,
  };
}

export function reconcileLocalPlayer(
  state: LocalPredictionState,
  authoritative: PlayerSnapshot,
  dtSeconds = 1 / 60,
): LocalPredictionState {
  const pendingInputs = state.pendingInputs.filter((input) => input.seq > authoritative.lastProcessedInputSeq);
  let predictedPosition = { ...authoritative.position };
  for (const input of pendingInputs) predictedPosition = applyPredictedInput(predictedPosition, input, dtSeconds);
  return { ...state, authoritative, predictedPosition, pendingInputs };
}

export function enqueuePredictedInput(state: LocalPredictionState, input: PlayerInput, dtSeconds = 1 / 60): LocalPredictionState {
  return {
    ...state,
    pendingInputs: [...state.pendingInputs, input].slice(-120),
    predictedPosition: applyPredictedInput(state.predictedPosition, input, dtSeconds),
  };
}
