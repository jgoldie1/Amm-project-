export type ProviderKind = 'payments' | 'maps' | 'delivery' | 'registrar' | 'messaging' | 'ai' | 'opportunities' | 'storage' | 'realtime';
export type ProviderMode = 'mock' | 'sandbox' | 'production';

export type ProviderStatus = {
  kind: ProviderKind;
  providerId: string;
  mode: ProviderMode;
  configured: boolean;
  verifiedAt?: string;
  capabilities: string[];
  health: 'unknown' | 'healthy' | 'degraded' | 'down';
};

export type ProviderReadiness = {
  kind: ProviderKind;
  ready: boolean;
  blockers: string[];
};

export function evaluateProviderReadiness(status: ProviderStatus): ProviderReadiness {
  const blockers: string[] = [];
  if (!status.configured) blockers.push('Provider is not configured.');
  if (status.mode === 'production' && !status.verifiedAt) blockers.push('Production provider has not been verified.');
  if (status.health === 'down') blockers.push('Provider is currently unavailable.');
  if (status.health === 'degraded') blockers.push('Provider is degraded and should not be trusted for critical execution.');
  return { kind: status.kind, ready: blockers.length === 0, blockers };
}

export type ExternalActionRequest<TPayload = unknown> = {
  id: string;
  kind: ProviderKind;
  capability: string;
  accountId: string;
  requestedBy: string;
  payload: TPayload;
  idempotencyKey?: string;
  correlationId: string;
};

export type ExternalActionResult<TData = unknown> = {
  requestId: string;
  status: 'prepared' | 'submitted' | 'succeeded' | 'failed' | 'requires_review';
  providerId?: string;
  providerReference?: string;
  data?: TData;
  errorCode?: string;
  errorMessage?: string;
};

export interface ProviderAdapter<TPayload = unknown, TData = unknown> {
  readonly status: ProviderStatus;
  prepare(request: ExternalActionRequest<TPayload>): Promise<ExternalActionResult<TData>>;
  execute(request: ExternalActionRequest<TPayload>): Promise<ExternalActionResult<TData>>;
  healthCheck(): Promise<ProviderStatus>;
}

export class ProviderHub {
  private adapters = new Map<ProviderKind, ProviderAdapter>();

  register(adapter: ProviderAdapter) {
    this.adapters.set(adapter.status.kind, adapter);
  }

  get(kind: ProviderKind) {
    return this.adapters.get(kind);
  }

  async health() {
    return Promise.all([...this.adapters.values()].map((adapter) => adapter.healthCheck()));
  }

  async execute<TPayload, TData>(request: ExternalActionRequest<TPayload>) {
    const adapter = this.adapters.get(request.kind) as ProviderAdapter<TPayload, TData> | undefined;
    if (!adapter) throw new Error(`No provider adapter registered for ${request.kind}`);
    const readiness = evaluateProviderReadiness(adapter.status);
    if (!readiness.ready) {
      return {
        requestId: request.id,
        status: 'requires_review',
        errorCode: 'PROVIDER_NOT_READY',
        errorMessage: readiness.blockers.join(' '),
      } satisfies ExternalActionResult<TData>;
    }
    return adapter.execute(request);
  }
}

// Production secrets remain server-side. Frontend code receives only capability/readiness state,
// never registrar/payment/service-role credentials or raw provider secrets.
