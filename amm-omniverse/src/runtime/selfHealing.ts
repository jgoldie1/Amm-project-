export type HealthSignal = {
  id: string;
  service: string;
  metric: 'availability' | 'latency' | 'error_rate' | 'queue_depth' | 'build_status' | 'dependency_health' | 'cost_spike';
  value: number;
  threshold: number;
  observedAt: string;
  severity: 'info' | 'warning' | 'critical';
};

export type RepairAction =
  | 'retry'
  | 'restart_worker'
  | 'clear_noncritical_cache'
  | 'disable_feature_flag'
  | 'rollback_release'
  | 'failover_provider'
  | 'degrade_gracefully'
  | 'open_incident'
  | 'request_human_review';

export type RepairPlan = {
  id: string;
  service: string;
  triggerSignalIds: string[];
  actions: RepairAction[];
  requiresHumanApproval: boolean;
  rollbackTarget?: string;
  createdAt: string;
  status: 'proposed' | 'approved' | 'executing' | 'recovered' | 'failed' | 'rolled_back';
};

export type RecoveryPolicy = {
  service: string;
  autoActions: RepairAction[];
  approvalRequiredActions: RepairAction[];
  maxAutoRetries: number;
  cooldownSeconds: number;
};

const alwaysApproval: RepairAction[] = ['rollback_release', 'failover_provider'];

export function proposeRepair(signals: HealthSignal[], policy: RecoveryPolicy): RepairPlan | null {
  const relevant = signals.filter((s) => s.service === policy.service && s.severity !== 'info');
  if (!relevant.length) return null;

  const critical = relevant.some((s) => s.severity === 'critical');
  const actions: RepairAction[] = critical
    ? ['degrade_gracefully', 'disable_feature_flag', 'open_incident', 'request_human_review']
    : ['retry'];

  const unique = [...new Set(actions)];
  const requiresHumanApproval = unique.some((a) => alwaysApproval.includes(a) || policy.approvalRequiredActions.includes(a));

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `repair-${Date.now()}`,
    service: policy.service,
    triggerSignalIds: relevant.map((s) => s.id),
    actions: unique,
    requiresHumanApproval,
    createdAt: new Date().toISOString(),
    status: 'proposed',
  };
}

export function canAutoExecute(action: RepairAction, policy: RecoveryPolicy) {
  if (alwaysApproval.includes(action)) return false;
  if (policy.approvalRequiredActions.includes(action)) return false;
  return policy.autoActions.includes(action);
}

export type ReleaseHealth = {
  releaseId: string;
  baselineErrorRate: number;
  currentErrorRate: number;
  baselineLatencyMs: number;
  currentLatencyMs: number;
  criticalJourneysPassing: boolean;
};

export function shouldRecommendRollback(health: ReleaseHealth) {
  const errorRegression = health.currentErrorRate > Math.max(health.baselineErrorRate * 2, health.baselineErrorRate + 0.02);
  const latencyRegression = health.currentLatencyMs > Math.max(health.baselineLatencyMs * 1.75, health.baselineLatencyMs + 500);
  return !health.criticalJourneysPassing || errorRegression || latencyRegression;
}

// "Self-healing" means bounded operational recovery, not autonomous code mutation in production.
// Automatic repairs must be reversible and low-risk. Code patches are created/tested in a sandbox/
// branch, reviewed, and deployed through normal release gates. Money, identity, legal, clinical,
// security-policy, and other high-impact controls may never be silently rewritten by the repair loop.
