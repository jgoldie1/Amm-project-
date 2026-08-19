export type GameReadiness = 'playable' | 'degraded' | 'unavailable' | 'maintenance';

export type RegionalHealth = {
  region: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs?: number;
  checkedAt: string;
  message?: string;
};

export type GameManifestEntry = {
  id: string;
  title: string;
  version: string;
  experience: 'demo' | 'beta' | 'full';
  enabled: boolean;
  clientModule?: string;
  assetBaseUrl?: string;
  multiplayerRequired?: boolean;
  requiredRegions?: string[];
  minimumHealth?: 'healthy' | 'degraded';
  maintenanceMessage?: string;
};

export type GameManifest = {
  version: string;
  generatedAt: string;
  defaultGameId: string;
  games: GameManifestEntry[];
};

export type PlayableGateResult = {
  allowed: boolean;
  readiness: GameReadiness;
  game?: GameManifestEntry;
  health?: RegionalHealth;
  reason: string;
};

const DEFAULT_MANIFEST_URL = '/game-manifest.json';
const DEFAULT_HEALTH_URL = '/api/game-health';

async function fetchJson<T>(url: string, timeoutMs = 3500): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return await response.json() as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function loadGameManifest(url = DEFAULT_MANIFEST_URL): Promise<GameManifest> {
  return fetchJson<GameManifest>(url);
}

export async function fetchRegionalHealth(region = 'auto', url = DEFAULT_HEALTH_URL): Promise<RegionalHealth> {
  const separator = url.includes('?') ? '&' : '?';
  return fetchJson<RegionalHealth>(`${url}${separator}region=${encodeURIComponent(region)}`, 2500);
}

export function evaluatePlayableGate(
  manifest: GameManifest,
  health: RegionalHealth,
  gameId?: string,
): PlayableGateResult {
  const id = gameId || manifest.defaultGameId;
  const game = manifest.games.find((candidate) => candidate.id === id);
  if (!game) return { allowed: false, readiness: 'unavailable', health, reason: 'Game is not present in the current manifest.' };
  if (!game.enabled) return { allowed: false, readiness: 'maintenance', game, health, reason: game.maintenanceMessage || 'This experience is currently disabled.' };
  if (health.status === 'down') return { allowed: false, readiness: 'unavailable', game, health, reason: health.message || 'Game services are unavailable in this region.' };
  if (game.minimumHealth === 'healthy' && health.status !== 'healthy') {
    return { allowed: false, readiness: 'degraded', game, health, reason: health.message || 'Regional game services are degraded.' };
  }
  if (game.multiplayerRequired && !game.requiredRegions?.includes(health.region) && game.requiredRegions?.length) {
    return { allowed: false, readiness: 'unavailable', game, health, reason: 'Authoritative multiplayer is not enabled for this region yet.' };
  }
  return {
    allowed: true,
    readiness: health.status === 'degraded' ? 'degraded' : 'playable',
    game,
    health,
    reason: health.status === 'degraded' ? 'Playable with degraded regional services.' : 'Playable demo is ready.',
  };
}

export async function bootstrapPlayableGame(input: {
  gameId?: string;
  region?: string;
  manifestUrl?: string;
  healthUrl?: string;
} = {}): Promise<PlayableGateResult> {
  try {
    const [manifest, health] = await Promise.all([
      loadGameManifest(input.manifestUrl),
      fetchRegionalHealth(input.region, input.healthUrl),
    ]);
    return evaluatePlayableGate(manifest, health, input.gameId);
  } catch (error) {
    return {
      allowed: false,
      readiness: 'unavailable',
      reason: error instanceof Error ? `Launch check failed: ${error.message}` : 'Launch check failed.',
    };
  }
}
