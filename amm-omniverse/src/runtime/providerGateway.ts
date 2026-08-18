import type { CompletionState, DependencyKind, FeatureReadiness } from './productionReadiness';

export type ProviderKind =
  | 'payments'
  | 'registrar'
  | 'maps'
  | 'delivery'
  | 'live_video'
  | 'sms_email_push'
  | 'telehealth'
  | 'medicaid_billing'
  | 'telelaw'
  | 'tax'
  | 'insurance'
  | 'realty'
  | 'remote_notary'
  | 'identity'
  | 'app_store'
  | 'drone_robot'
  | 'data';

export type ProviderCapabilityState = 'unconfigured' | 'sandbox' | 'verified' | 'production';

export type ProviderCapability = {
  id: string;
  providerName: string;
  kind: ProviderKind;
  state: ProviderCapabilityState;
  jurisdiction?: string[];
  evidence: string[];
  expiresAt?: string;
  notes?: string;
};

export type ProductionEvidence = {
  featureId: string;
  providerCapabilityIds: string[];
  legalApprovalRefs?: string[];
  regulatoryApprovalRefs?: string[];
  testEvidence?: string[];
  monitoringEvidence?: string[];
  rollbackEvidence?: string[];
};

export type GateDecision = {
  allowed: boolean;
  targetState: CompletionState;
  blockers: string[];
};

const riskNeedsProductionProvider = new Set([
  'jin-pay', 'holo-delivery', 'marketplace', 'live-streaming', 'telehealth', 'medicaid',
  'telelaw', 'tax-bookkeeping', 'insurance-realty', 'remote-notary', 'drone-robot', 'ios-android',
]);

function providerReady(capabilities: ProviderCapability[]) {
  return capabilities.some((capability) => capability.state === 'production' && capability.evidence.length > 0);
}

export function evaluateProductionGate(input: {
  feature: FeatureReadiness;
  providers: ProviderCapability[];
  evidence?: ProductionEvidence;
}): GateDecision {
  const blockers: string[] = [];
  const { feature, providers, evidence } = input;

  if (riskNeedsProductionProvider.has(feature.id) && !providerReady(providers)) {
    blockers.push('Production provider capability with evidence is required.');
  }
  if (feature.dependency === 'regulatory' && !(evidence?.regulatoryApprovalRefs?.length)) {
    blockers.push('Regulatory approval/enrollment evidence is required.');
  }
  if (feature.dependency === 'legal' && !(evidence?.legalApprovalRefs?.length)) {
    blockers.push('Legal/rights approval evidence is required.');
  }
  if (feature.highRisk && !(evidence?.testEvidence?.length)) {
    blockers.push('High-risk feature requires end-to-end test evidence.');
  }
  if (feature.highRisk && !(evidence?.monitoringEvidence?.length)) {
    blockers.push('High-risk feature requires production monitoring evidence.');
  }
  if (feature.highRisk && !(evidence?.rollbackEvidence?.length)) {
    blockers.push('High-risk feature requires rollback/kill-switch evidence.');
  }

  if (blockers.length) {
    return { allowed: false, targetState: feature.state === 'LIVE' ? 'GATED' : feature.state, blockers };
  }
  return { allowed: true, targetState: 'LIVE', blockers: [] };
}

export function minimumLaunchState(dependency: DependencyKind): CompletionState {
  if (dependency === 'none' || dependency === 'data') return 'TESTED';
  return 'GATED';
}

// This gateway stores evidence references and decisions only.
// Provider credentials/secrets must remain server-side in a secrets vault.
