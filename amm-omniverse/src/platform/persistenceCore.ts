export type EntityStatus = 'draft' | 'active' | 'archived' | 'deleted';

export type PersistedEntity<T> = {
  id: string;
  ownerUserId: string;
  data: T;
  status: EntityStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type SaveOptions = {
  expectedVersion?: number;
  correlationId?: string;
};

export type SaveResult<T> = {
  entity: PersistedEntity<T>;
  conflict: boolean;
};

export interface PersistenceRepository<T> {
  get(id: string): Promise<PersistedEntity<T> | null>;
  listForOwner(ownerUserId: string): Promise<PersistedEntity<T>[]>;
  create(ownerUserId: string, data: T): Promise<PersistedEntity<T>>;
  save(id: string, data: T, options?: SaveOptions): Promise<SaveResult<T>>;
  archive(id: string): Promise<void>;
}

export type CoreRepositoryName =
  | 'profiles'
  | 'accessibility_passports'
  | 'learning_passports'
  | 'student_profiles'
  | 'businesses'
  | 'company_twins'
  | 'jarvis_agent_grants'
  | 'marketplace_listings'
  | 'marketplace_orders'
  | 'delivery_jobs'
  | 'delivery_events'
  | 'money_entries'
  | 'approval_requests'
  | 'audit_events'
  | 'opportunity_profiles'
  | 'applications';

export type PersistenceHealth = {
  repository: CoreRepositoryName;
  mode: 'memory' | 'local' | 'server';
  authoritative: boolean;
  reachable: boolean;
  lastVerifiedAt?: string;
};

export function assertServerAuthority(health: PersistenceHealth) {
  if (health.mode !== 'server' || !health.authoritative || !health.reachable) {
    throw new Error(`${health.repository} is not backed by a reachable authoritative server repository.`);
  }
}

export type RealtimeEnvelope<T = unknown> = {
  id: string;
  topic: string;
  entityId?: string;
  accountId?: string;
  occurredAt: string;
  version?: number;
  payload: T;
};

export interface RealtimeBus {
  publish<T>(event: RealtimeEnvelope<T>): Promise<void>;
  subscribe<T>(topic: string, handler: (event: RealtimeEnvelope<T>) => void): () => void;
}

export type RecoveryCheckpoint = {
  id: string;
  scope: 'account' | 'business' | 'platform';
  scopeId: string;
  createdAt: string;
  sourceVersion: number;
  integrityHash?: string;
  location: string;
  verifiedRestoreAt?: string;
};

export interface RecoveryStore {
  createCheckpoint(scope: RecoveryCheckpoint['scope'], scopeId: string): Promise<RecoveryCheckpoint>;
  verifyRestore(checkpointId: string): Promise<RecoveryCheckpoint>;
}

// Rule: localStorage/in-memory repositories may be used for demos and offline UX,
// but cannot be the authority for identity, permissions, balances, orders, delivery proof,
// business membership, moderation decisions, audit events, or production feature gates.
