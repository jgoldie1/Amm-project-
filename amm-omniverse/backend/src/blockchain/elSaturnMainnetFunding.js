// El Saturn Chain audit + mainnet funding control plane.
// Financial amounts are USD-denominated planning inputs, not promises or token valuations.

export const EL_SATURN_FUNDING_BUCKETS = Object.freeze({
  securityAudit: { priority: 1, label: 'Independent smart-contract/protocol security audits' },
  remediation: { priority: 2, label: 'Audit remediation, retesting and bug bounty' },
  legalCompliance: { priority: 3, label: 'Legal, regulatory, tax and accounting review' },
  infrastructure: { priority: 4, label: 'Validators/RPC/indexers/explorer/monitoring/key management' },
  liquidityOperations: { priority: 5, label: 'Approved operational liquidity and treasury reserves' },
  launchReserve: { priority: 6, label: 'Mainnet launch and incident-response reserve' },
});

export const EL_SATURN_MAINNET_GATES = Object.freeze([
  'testnet_stable',
  'threat_model_complete',
  'independent_audit_complete',
  'critical_findings_closed',
  'high_findings_closed_or_formally_accepted',
  'retest_complete',
  'bug_bounty_ready',
  'legal_compliance_review_complete',
  'token_and_payment_classification_complete',
  'validator_rpc_monitoring_ready',
  'backup_restore_and_incident_drills_passed',
  'treasury_multisig_and_key_controls_ready',
  'launch_reserve_funded',
  'human_launch_approval',
]);

export function allocateElSaturnFunding({ amountUsd, allocations = {} }) {
  const amount = Number(amountUsd);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('amountUsd must be positive');

  const defaults = {
    securityAudit: 0.30,
    remediation: 0.15,
    legalCompliance: 0.15,
    infrastructure: 0.15,
    liquidityOperations: 0.10,
    launchReserve: 0.15,
  };
  const weights = { ...defaults, ...allocations };
  const total = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0);
  if (Math.abs(total - 1) > 0.000001) throw new Error('Funding allocation weights must total 1.0');

  return Object.fromEntries(Object.entries(weights).map(([bucket, weight]) => [bucket, Math.round(amount * weight * 100) / 100]));
}

export function evaluateElSaturnMainnetReadiness(status = {}) {
  const missing = EL_SATURN_MAINNET_GATES.filter((gate) => status[gate] !== true);
  return {
    ready: missing.length === 0,
    missing,
    gateCount: EL_SATURN_MAINNET_GATES.length,
    passedCount: EL_SATURN_MAINNET_GATES.length - missing.length,
  };
}

export function canSpendMainnetFund({ bucket, approvedByHuman = false, auditCriticalOpen = 0 }) {
  if (!EL_SATURN_FUNDING_BUCKETS[bucket]) return { allowed: false, reason: 'unknown_bucket' };
  if (!approvedByHuman) return { allowed: false, reason: 'human_approval_required' };
  if (bucket === 'liquidityOperations' && Number(auditCriticalOpen) > 0) {
    return { allowed: false, reason: 'critical_audit_findings_open' };
  }
  return { allowed: true, reason: 'approved' };
}
