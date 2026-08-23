export type AgentPermissionLevel = 'read' | 'suggest' | 'prepare' | 'request_approval' | 'execute';

export type HighRiskAction =
  | 'move_money'
  | 'change_payout_destination'
  | 'publish_content'
  | 'accept_contract'
  | 'delete_account'
  | 'send_external_message'
  | 'share_sensitive_data'
  | 'change_role'
  | 'change_feature_gate';

export type AgentGrant = {
  agentId: string;
  accountId: string;
  level: AgentPermissionLevel;
  allowedActions: string[];
  expiresAt?: string;
  revokedAt?: string;
};

export type AuthorizationDecision = {
  allowed: boolean;
  requiresHumanApproval: boolean;
  reason: string;
};

const levels: AgentPermissionLevel[] = ['read', 'suggest', 'prepare', 'request_approval', 'execute'];
const highRisk = new Set<HighRiskAction>([
  'move_money','change_payout_destination','publish_content','accept_contract','delete_account',
  'send_external_message','share_sensitive_data','change_role','change_feature_gate',
]);

export function authorizeAgentAction(
  grant: AgentGrant | undefined,
  action: string,
  now = new Date(),
): AuthorizationDecision {
  if (!grant) return { allowed: false, requiresHumanApproval: false, reason: 'No active agent grant.' };
  if (grant.revokedAt) return { allowed: false, requiresHumanApproval: false, reason: 'Agent grant was revoked.' };
  if (grant.expiresAt && new Date(grant.expiresAt) <= now) {
    return { allowed: false, requiresHumanApproval: false, reason: 'Agent grant expired.' };
  }
  if (!grant.allowedActions.includes(action) && !grant.allowedActions.includes('*')) {
    return { allowed: false, requiresHumanApproval: false, reason: 'Action is outside the granted scope.' };
  }
  const level = levels.indexOf(grant.level);
  if (level < levels.indexOf('prepare')) {
    return { allowed: true, requiresHumanApproval: false, reason: `Allowed at ${grant.level} level without execution.` };
  }
  if (highRisk.has(action as HighRiskAction)) {
    return {
      allowed: level >= levels.indexOf('request_approval'),
      requiresHumanApproval: true,
      reason: 'High-risk action requires explicit human approval before execution.',
    };
  }
  if (grant.level !== 'execute') {
    return { allowed: true, requiresHumanApproval: true, reason: 'Prepared action requires approval before execution.' };
  }
  return { allowed: true, requiresHumanApproval: false, reason: 'Action is within explicit execution scope.' };
}

export type AuditEvent = {
  id: string;
  occurredAt: string;
  actorType: 'user' | 'agent' | 'service' | 'admin';
  actorId: string;
  accountId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  correlationId: string;
  authorizationBasis?: string;
  result: 'allowed' | 'denied' | 'pending_approval' | 'success' | 'failure';
  metadata?: Record<string, string | number | boolean | null>;
};

export function createAuditEvent(input: Omit<AuditEvent, 'id' | 'occurredAt'>): AuditEvent {
  return {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? `audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    occurredAt: new Date().toISOString(),
  };
}

export type FeatureGateName =
  | 'REAL_MONEY'
  | 'REAL_PAYOUTS'
  | 'PAID_PRIZE_COMPETITIONS'
  | 'CARD_ISSUING'
  | 'TAP_TO_PAY'
  | 'CROSS_BORDER_TRANSFERS'
  | 'GOVERNMENT_ID_INTEGRATION'
  | 'HEALTHCARE_REGULATED_DATA'
  | 'AUTONOMOUS_HIGH_IMPACT_AGENT_ACTIONS';

export type FeatureGate = {
  name: FeatureGateName;
  enabled: boolean;
  environment: 'development' | 'preview' | 'production';
  approvedBy?: string;
  approvedAt?: string;
  evidence?: string[];
};

export const defaultHighRiskFeatureGates = (environment: FeatureGate['environment']): FeatureGate[] =>
  ([
    'REAL_MONEY','REAL_PAYOUTS','PAID_PRIZE_COMPETITIONS','CARD_ISSUING','TAP_TO_PAY',
    'CROSS_BORDER_TRANSFERS','GOVERNMENT_ID_INTEGRATION','HEALTHCARE_REGULATED_DATA',
    'AUTONOMOUS_HIGH_IMPACT_AGENT_ACTIONS',
  ] as FeatureGateName[]).map((name) => ({ name, enabled: false, environment }));

export function canEnableFeatureGate(gate: FeatureGate): { allowed: boolean; reason: string } {
  if (!gate.enabled) return { allowed: true, reason: 'Feature remains disabled.' };
  if (gate.environment !== 'production') return { allowed: true, reason: 'Non-production feature activation.' };
  if (!gate.approvedBy || !gate.approvedAt || !gate.evidence?.length) {
    return { allowed: false, reason: 'Production activation requires approver, timestamp and evidence.' };
  }
  return { allowed: true, reason: 'Production activation evidence is present.' };
}

// Production persistence must be server-side/append-only with authenticated authorization.
// This module intentionally provides domain rules only; local/client state must never be
// treated as authority for money, roles, identity, audit records or production feature gates.
