export type ServiceName =
  | 'authoritative_multiplayer'
  | 'matchmaking'
  | 'save_service'
  | 'authentication'
  | 'live_streaming'
  | 'marketplace'
  | 'holo_delivery'
  | 'academy'
  | 'supplier_exchange'
  | 'community_spotlight'
  | 'machine_translation'
  | 'captioning'
  | 'human_interpreting'
  | 'sign_language_provider';

export type ServiceHealth = {
  service: ServiceName;
  status: 'healthy' | 'degraded' | 'offline' | 'gated' | 'unknown';
  checkedAt: string;
  latencyMs?: number;
  queueTimeSeconds?: number;
  currentCapacity?: number;
  maxCapacity?: number;
  version?: string;
  region?: string;
  languages?: string[];
  crossPlay?: Array<'web' | 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'console' | 'vr'>;
  evidence?: string[];
};

export type UserCapabilityRequest = {
  requiredServices: ServiceName[];
  preferredLanguages?: string[];
  requiredGameVersion?: string;
  platform?: ServiceHealth['crossPlay'] extends Array<infer P> ? P : never;
  maxAcceptableLatencyMs?: number;
  maxAcceptableQueueSeconds?: number;
};

export type CapabilityDecision = {
  ready: boolean;
  blockedBy: Array<{ service: ServiceName; reason: string }>;
  warnings: string[];
  matchedLanguages: string[];
};

export function evaluateCapabilityReadiness(
  request: UserCapabilityRequest,
  health: ServiceHealth[],
): CapabilityDecision {
  const blockedBy: CapabilityDecision['blockedBy'] = [];
  const warnings: string[] = [];
  const matchedLanguages = new Set<string>();

  for (const service of request.requiredServices) {
    const state = health.find((h) => h.service === service);
    if (!state) {
      blockedBy.push({ service, reason: 'No verified service health signal.' });
      continue;
    }
    if (['offline', 'gated', 'unknown'].includes(state.status)) {
      blockedBy.push({ service, reason: `Service is ${state.status}.` });
      continue;
    }
    if (state.status === 'degraded') warnings.push(`${service} is degraded.`);
    if (request.maxAcceptableLatencyMs && state.latencyMs && state.latencyMs > request.maxAcceptableLatencyMs) {
      warnings.push(`${service} latency ${state.latencyMs}ms exceeds preference.`);
    }
    if (request.maxAcceptableQueueSeconds && state.queueTimeSeconds && state.queueTimeSeconds > request.maxAcceptableQueueSeconds) {
      warnings.push(`${service} queue ${state.queueTimeSeconds}s exceeds preference.`);
    }
    if (request.platform && state.crossPlay?.length && !state.crossPlay.includes(request.platform)) {
      blockedBy.push({ service, reason: `Platform ${request.platform} is not currently supported.` });
    }
    if (request.requiredGameVersion && state.version && request.requiredGameVersion !== state.version) {
      blockedBy.push({ service, reason: `Version mismatch: requires ${request.requiredGameVersion}, service reports ${state.version}.` });
    }
    for (const lang of request.preferredLanguages ?? []) {
      if (state.languages?.includes(lang)) matchedLanguages.add(lang);
    }
  }

  return { ready: blockedBy.length === 0, blockedBy, warnings, matchedLanguages: [...matchedLanguages] };
}

export type CommunicationMode = 'native_ui' | 'machine_translation' | 'captions' | 'human_interpreter' | 'sign_language_provider';

export type CommunicationRoute = {
  modes: CommunicationMode[];
  requiresHumanProvider: boolean;
  notes: string[];
};

export function chooseCommunicationRoute(input: {
  sourceLanguage: string;
  targetLanguage: string;
  captionsRequested?: boolean;
  signLanguageRequested?: boolean;
  highStakes?: boolean;
  health: ServiceHealth[];
}): CommunicationRoute {
  const modes: CommunicationMode[] = ['native_ui'];
  const notes: string[] = [];
  let requiresHumanProvider = false;

  if (input.sourceLanguage !== input.targetLanguage) {
    const mt = input.health.find((h) => h.service === 'machine_translation');
    if (mt?.status === 'healthy' || mt?.status === 'degraded') modes.push('machine_translation');
    else notes.push('Machine translation unavailable.');
  }

  if (input.captionsRequested) {
    const captions = input.health.find((h) => h.service === 'captioning');
    if (captions?.status === 'healthy' || captions?.status === 'degraded') modes.push('captions');
    else notes.push('Captioning unavailable.');
  }

  if (input.signLanguageRequested) {
    const sign = input.health.find((h) => h.service === 'sign_language_provider');
    if (sign?.status === 'healthy' || sign?.status === 'degraded') {
      modes.push('sign_language_provider');
      requiresHumanProvider = true;
    } else notes.push('Qualified sign-language provider unavailable.');
  }

  if (input.highStakes) {
    const human = input.health.find((h) => h.service === 'human_interpreting');
    if (human?.status === 'healthy' || human?.status === 'degraded') {
      modes.push('human_interpreter');
      requiresHumanProvider = true;
      notes.push('High-stakes interaction routed toward qualified human interpreting when available.');
    } else {
      notes.push('High-stakes interaction requires provider verification before relying on machine translation alone.');
    }
  }

  return { modes: [...new Set(modes)], requiresHumanProvider, notes };
}

// Critical rule: the fabric reports what is verified NOW. It never converts a planned integration
// into a live capability. Regulated/high-stakes human interpreting and sign-language services remain
// provider-backed pathways, not claims of perfect automatic translation.
