export type FeatureStatus = 'concept' | 'specified' | 'coded' | 'integrated' | 'tested' | 'gated' | 'live';

export type LaunchArea =
  | 'account_jarvis'
  | 'money_jinpay'
  | 'marketplace_delivery'
  | 'security_trust_safety'
  | 'sustainability'
  | 'business_launch_harmony'
  | 'business_digital_twin'
  | 'student_jarvis'
  | 'community_guardian';

export type LaunchGateEvidence = {
  id: string;
  area: LaunchArea;
  requirement: string;
  status: FeatureStatus;
  blocking: boolean;
  evidence?: string[];
  notes?: string;
};

export const defaultLaunchMatrix = (): LaunchGateEvidence[] => [
  { id: 'acct-persistence', area: 'account_jarvis', requirement: 'Persistent authenticated account/profile', status: 'integrated', blocking: true },
  { id: 'acct-passport-sync', area: 'account_jarvis', requirement: 'Accessibility Passport account sync', status: 'integrated', blocking: true },
  { id: 'acct-permission-firewall', area: 'account_jarvis', requirement: 'JARVIS Permission Firewall server enforcement', status: 'coded', blocking: true },
  { id: 'acct-audit', area: 'account_jarvis', requirement: 'Server-side audit-event persistence', status: 'coded', blocking: true },
  { id: 'acct-mfa-recovery', area: 'account_jarvis', requirement: 'MFA/passkey + safe account recovery', status: 'specified', blocking: true },

  { id: 'money-ledger', area: 'money_jinpay', requirement: 'Double-entry Money Engine authoritative ledger', status: 'coded', blocking: true },
  { id: 'money-credits', area: 'money_jinpay', requirement: 'HoloGPT Credits / AI Actions separated from cash', status: 'coded', blocking: true },
  { id: 'money-gifts', area: 'money_jinpay', requirement: 'Gift/Holo Gift ledger separation and policy', status: 'specified', blocking: false },
  { id: 'money-sandbox', area: 'money_jinpay', requirement: 'Jin Pay sandbox checkout', status: 'coded', blocking: true },
  { id: 'money-production', area: 'money_jinpay', requirement: 'Approved provider + production webhooks/reconciliation', status: 'gated', blocking: true },

  { id: 'market-seller', area: 'marketplace_delivery', requirement: 'Seller onboarding and listing management', status: 'coded', blocking: true },
  { id: 'market-orders', area: 'marketplace_delivery', requirement: 'Server-side cart/order persistence', status: 'coded', blocking: true },
  { id: 'delivery-realtime', area: 'marketplace_delivery', requirement: 'Authenticated real-time delivery tracking', status: 'coded', blocking: true },
  { id: 'delivery-proof', area: 'marketplace_delivery', requirement: 'Delivery proof + dispute/refund persistence', status: 'coded', blocking: true },

  { id: 'security-rls', area: 'security_trust_safety', requirement: 'RLS/object authorization tests', status: 'specified', blocking: true },
  { id: 'security-abuse', area: 'security_trust_safety', requirement: 'Fraud/abuse/moderation tests', status: 'specified', blocking: true },
  { id: 'security-redteam', area: 'security_trust_safety', requirement: 'Red-team regression pass + incident runbook', status: 'specified', blocking: true },

  { id: 'sustain-telemetry', area: 'sustainability', requirement: 'Real eligible revenue + infrastructure-cost telemetry', status: 'coded', blocking: false },
  { id: 'sustain-1x', area: 'sustainability', requirement: 'Measured sustainability ratio >= 1.00x', status: 'gated', blocking: false },
  { id: 'sustain-3x', area: 'sustainability', requirement: 'Management target sustainability ratio >= 3.00x', status: 'gated', blocking: false },

  { id: 'biz-registrar', area: 'business_launch_harmony', requirement: 'Registrar/reseller + DNS provider integration', status: 'gated', blocking: false },
  { id: 'biz-forever', area: 'business_launch_harmony', requirement: 'Forever Website/Domain reserve + export model', status: 'coded', blocking: false },
  { id: 'biz-formation', area: 'business_launch_harmony', requirement: 'Formation/EIN workflow with authoritative external evidence', status: 'coded', blocking: false },
  { id: 'biz-harmony', area: 'business_launch_harmony', requirement: 'Stubbs Harmony builder preview/approval/publish flow', status: 'coded', blocking: false },

  { id: 'twin-schema', area: 'business_digital_twin', requirement: 'Company Digital Twin schema', status: 'coded', blocking: false },
  { id: 'twin-pulse', area: 'business_digital_twin', requirement: 'Business Pulse event ingestion', status: 'specified', blocking: false },
  { id: 'twin-simulator', area: 'business_digital_twin', requirement: 'Business Simulator experiment records/UI', status: 'coded', blocking: false },
  { id: 'twin-council', area: 'business_digital_twin', requirement: 'Agent Council orchestration + approvals', status: 'specified', blocking: false },

  { id: 'student-dashboard', area: 'student_jarvis', requirement: 'Student JARVIS dashboard', status: 'coded', blocking: false },
  { id: 'student-passport', area: 'student_jarvis', requirement: 'Learning Passport integration', status: 'coded', blocking: false },
  { id: 'student-opportunities', area: 'student_jarvis', requirement: 'Scholarship/opportunity cards + Accessibility Match', status: 'coded', blocking: false },

  { id: 'guardian-core', area: 'community_guardian', requirement: 'Non-vigilante Guardian request/worker core', status: 'coded', blocking: false },
  { id: 'guardian-training', area: 'community_guardian', requirement: 'Training/qualification + youth safeguards', status: 'coded', blocking: false },
  { id: 'guardian-local-law', area: 'community_guardian', requirement: 'Local security/labor/licensing review before paid regulated activity', status: 'gated', blocking: true },
];

const statusRank: Record<FeatureStatus, number> = {
  concept: 0,
  specified: 1,
  coded: 2,
  integrated: 3,
  tested: 4,
  gated: 5,
  live: 6,
};

export function launchReadiness(matrix: LaunchGateEvidence[], minimum: FeatureStatus = 'tested') {
  const blockers = matrix.filter((item) => item.blocking && statusRank[item.status] < statusRank[minimum]);
  const byArea = Object.fromEntries(
    [...new Set(matrix.map((item) => item.area))].map((area) => {
      const items = matrix.filter((item) => item.area === area);
      const complete = items.filter((item) => statusRank[item.status] >= statusRank[minimum]).length;
      return [area, { complete, total: items.length, ratio: items.length ? complete / items.length : 0 }];
    }),
  );
  return {
    minimum,
    launchable: blockers.length === 0,
    blockers,
    byArea,
    completedRequirements: matrix.filter((item) => statusRank[item.status] >= statusRank[minimum]).length,
    totalRequirements: matrix.length,
  };
}

export function truthfulFeatureLabel(status: FeatureStatus) {
  if (status === 'live') return 'LIVE';
  if (status === 'gated') return 'READY WHEN EXTERNAL/REGULATORY GATE CLEARS';
  if (status === 'tested') return 'TESTED';
  if (status === 'integrated') return 'INTEGRATED';
  if (status === 'coded') return 'CODED';
  if (status === 'specified') return 'SPECIFIED';
  return 'CONCEPT';
}

// This matrix is a starting code representation, not proof that every listed status is current forever.
// CI/runtime/provider evidence should update status rather than marketing text or chat claims.
