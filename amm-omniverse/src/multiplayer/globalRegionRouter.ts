export type GlobalRegion = 'us-east' | 'us-central' | 'us-west' | 'canada' | 'japan' | 'asia-pacific' | 'china-partner' | 'europe' | 'africa' | 'south-america';

export type ServiceHealth = 'healthy' | 'degraded' | 'down' | 'unknown';

export type RegionHealth = {
  region: GlobalRegion;
  displayName: string;
  authoritativeBackend: ServiceHealth;
  matchmaking: ServiceHealth;
  saveService: ServiceHealth;
  authentication: ServiceHealth;
  currentPlayers: number;
  maxPlayers: number;
  queueSeconds?: number;
  pingMs?: number;
  supportedGameVersions: string[];
  supportedLocales: string[];
  crossPlayEnabled: boolean;
  acceptingNewSessions: boolean;
  providerVerified: boolean;
};

export type PlayerLaunchRequest = {
  playerId: string;
  gameId: string;
  gameVersion: string;
  preferredRegion?: GlobalRegion;
  locale: string;
  requireSaveService?: boolean;
  requireCrossPlay?: boolean;
  maxPingMs?: number;
};

export type RegionDecision = {
  region?: GlobalRegion;
  allowed: boolean;
  reason: string;
  warnings: string[];
  score?: number;
};

function healthScore(h: ServiceHealth) {
  if (h === 'healthy') return 25;
  if (h === 'degraded') return 10;
  if (h === 'unknown') return 0;
  return -100;
}

export function chooseSafestRegion(request: PlayerLaunchRequest, regions: RegionHealth[]): RegionDecision {
  const candidates = regions.filter((r) => {
    if (!r.providerVerified || !r.acceptingNewSessions) return false;
    if (!r.supportedGameVersions.includes(request.gameVersion)) return false;
    if (request.requireCrossPlay && !r.crossPlayEnabled) return false;
    if (request.requireSaveService && r.saveService === 'down') return false;
    if (r.authoritativeBackend === 'down' || r.authentication === 'down' || r.matchmaking === 'down') return false;
    return true;
  });

  if (!candidates.length) {
    return { allowed: false, reason: 'No verified compatible region is currently healthy enough to launch this experience.', warnings: [] };
  }

  const ranked = candidates
    .map((r) => {
      const capacityPercent = r.maxPlayers > 0 ? r.currentPlayers / r.maxPlayers : 1;
      const pingPenalty = typeof r.pingMs === 'number' ? Math.min(r.pingMs, 300) / 4 : 25;
      const capacityPenalty = capacityPercent * 40;
      const localeBonus = r.supportedLocales.includes(request.locale) ? 10 : 0;
      const preferredBonus = request.preferredRegion === r.region ? 12 : 0;
      const score =
        healthScore(r.authoritativeBackend) +
        healthScore(r.matchmaking) +
        healthScore(r.authentication) +
        healthScore(r.saveService) +
        localeBonus +
        preferredBonus -
        pingPenalty -
        capacityPenalty;
      return { region: r, score };
    })
    .sort((a, b) => b.score - a.score);

  const selected = ranked[0];
  const warnings: string[] = [];
  if (selected.region.saveService === 'degraded') warnings.push('Cloud save is degraded in this region.');
  if (selected.region.matchmaking === 'degraded') warnings.push('Matchmaking may be slower than normal.');
  if (typeof selected.region.pingMs === 'number' && request.maxPingMs && selected.region.pingMs > request.maxPingMs) {
    warnings.push(`Latency is ${selected.region.pingMs}ms, above your preferred ${request.maxPingMs}ms.`);
  }
  if (!selected.region.supportedLocales.includes(request.locale)) warnings.push('Your preferred language is not natively available on this server; translation fallback may be used.');

  return {
    region: selected.region.region,
    allowed: true,
    reason: `Selected ${selected.region.displayName} based on backend health, compatibility, capacity, latency and language support.`,
    warnings,
    score: Math.round(selected.score),
  };
}

export type TranslationRoute = {
  sourceLocale: string;
  targetLocale: string;
  mode: 'native_ui' | 'machine_translation' | 'human_interpreter' | 'captions' | 'sign_language_provider';
  providerVerified: boolean;
};

export function selectTranslationRoute(sourceLocale: string, targetLocale: string, routes: TranslationRoute[]) {
  if (sourceLocale === targetLocale) return { mode: 'native_ui' as const, providerVerified: true };
  return routes.find((r) => r.sourceLocale === sourceLocale && r.targetLocale === targetLocale && r.providerVerified);
}

// Production boundaries:
// - region health must come from authoritative server/provider telemetry, not client guesses.
// - China-specific deployment/availability may require separate local hosting, publishing, data, content and networking compliance; do not mark live without verified provider/legal readiness.
// - translation quality is not assumed perfect; high-stakes legal/medical use requires qualified human services when needed.
