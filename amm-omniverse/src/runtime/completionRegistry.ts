export type CompletionStatus = 'CONCEPT' | 'SPECIFIED' | 'CODED' | 'INTEGRATED' | 'TESTED' | 'GATED' | 'LIVE';

export type ExternalDependency = {
  type: 'provider' | 'license' | 'regulator' | 'hardware' | 'app_store' | 'legal_review' | 'insurance' | 'credential';
  name: string;
  requiredForLive: boolean;
};

export type CompletionItem = {
  id: string;
  name: string;
  status: CompletionStatus;
  internalWorkRemaining: string[];
  externalDependencies: ExternalDependency[];
  liveEvidence: string[];
};

export const completionRegistry: CompletionItem[] = [
  {
    id: 'accessibility-passport', name: 'Accessibility Passport', status: 'INTEGRATED',
    internalWorkRemaining: ['account persistence', 'cross-device sync', 'automated accessibility regression tests'],
    externalDependencies: [], liveEvidence: [],
  },
  {
    id: 'accessibility-match', name: 'Accessibility Match', status: 'CODED',
    internalWorkRemaining: ['opportunity-card UI', 'server persistence', 'match explanation tests'],
    externalDependencies: [], liveEvidence: [],
  },
  {
    id: 'student-jarvis', name: 'Student JARVIS', status: 'CODED',
    internalWorkRemaining: ['dashboard integration', 'Learning Passport wiring', 'guardian controls', 'school-provider adapters'],
    externalDependencies: [{ type: 'provider', name: 'school/SIS/LMS integrations where used', requiredForLive: false }], liveEvidence: [],
  },
  {
    id: 'business-jarvis', name: 'Business JARVIS / Adaptive Company OS', status: 'CODED',
    internalWorkRemaining: ['Company Digital Twin persistence', 'Business Pulse ingestion', 'Agent Council orchestration', 'approval queue UI'],
    externalDependencies: [], liveEvidence: [],
  },
  {
    id: 'marketplace', name: 'Holo Marketplace', status: 'INTEGRATED',
    internalWorkRemaining: ['seller onboarding', 'inventory persistence', 'order history', 'returns UI', 'fraud tests'],
    externalDependencies: [{ type: 'provider', name: 'production payment provider', requiredForLive: true }], liveEvidence: [],
  },
  {
    id: 'holo-delivery', name: 'Holo Delivery / Package Tracking', status: 'INTEGRATED',
    internalWorkRemaining: ['server order persistence', 'realtime courier events', 'map adapter', 'proof/dispute persistence', 'notifications'],
    externalDependencies: [
      { type: 'provider', name: 'maps/geocoding', requiredForLive: true },
      { type: 'insurance', name: 'delivery/courier insurance pathway', requiredForLive: true },
      { type: 'provider', name: 'courier/provider network or owned operations', requiredForLive: true },
    ], liveEvidence: [],
  },
  {
    id: 'jin-pay', name: 'Jin Pay', status: 'GATED',
    internalWorkRemaining: ['sandbox checkout', 'ledger reconciliation tests', 'refund/dispute UI', 'webhook verification'],
    externalDependencies: [{ type: 'provider', name: 'licensed payment/banking partners', requiredForLive: true }], liveEvidence: [],
  },
  {
    id: 'business-launch', name: 'Business Launch OS / Domain / EIN', status: 'CODED',
    internalWorkRemaining: ['registrar adapter', 'state filing adapters', 'IRS/EIN handoff flow', 'document vault'],
    externalDependencies: [
      { type: 'provider', name: 'ICANN-accredited registrar/reseller', requiredForLive: true },
      { type: 'regulator', name: 'state formation authorities', requiredForLive: true },
      { type: 'regulator', name: 'IRS EIN issuance', requiredForLive: true },
    ], liveEvidence: [],
  },
  {
    id: 'forever-domain', name: 'Forever Domain / Website', status: 'CODED',
    internalWorkRemaining: ['reserve accounting', 'renewal scheduler', 'domain-transfer flow', 'site export UI'],
    externalDependencies: [{ type: 'provider', name: 'domain registrar/registry', requiredForLive: true }], liveEvidence: [],
  },
  {
    id: 'sustainability', name: 'Platform Sustainability Engine', status: 'CODED',
    internalWorkRemaining: ['production revenue ingestion', 'production infrastructure-cost ingestion', '3.00x dashboard', 'alerts and forecasts'],
    externalDependencies: [], liveEvidence: [],
  },
  {
    id: 'telehealth', name: 'Telehealth Marketplace', status: 'GATED',
    internalWorkRemaining: ['provider directory', 'consent flows', 'scheduling', 'billing abstraction', 'privacy controls'],
    externalDependencies: [
      { type: 'license', name: 'licensed clinicians', requiredForLive: true },
      { type: 'legal_review', name: 'HIPAA/state telehealth compliance', requiredForLive: true },
      { type: 'provider', name: 'clearinghouse/Medicaid billing path where applicable', requiredForLive: true },
    ], liveEvidence: [],
  },
  {
    id: 'telelaw', name: 'Lawyer On Demand / Tele-Law', status: 'GATED',
    internalWorkRemaining: ['attorney marketplace', 'jurisdiction matching', 'emergency/pullover quick-connect UX', 'conflict-check handoff'],
    externalDependencies: [{ type: 'license', name: 'licensed attorneys in applicable jurisdiction', requiredForLive: true }], liveEvidence: [],
  },
  {
    id: 'tele-services', name: 'Tele-Tax / Insurance / Realty / Notary / Interpreting / HR / Cyber Support', status: 'GATED',
    internalWorkRemaining: ['service marketplace schema', 'credential verification', 'booking', 'provider payout splitting'],
    externalDependencies: [{ type: 'credential', name: 'required professional credentials by service/jurisdiction', requiredForLive: true }], liveEvidence: [],
  },
  {
    id: 'community-safety', name: 'Community Safety / Guardian-style Peace Network', status: 'SPECIFIED',
    internalWorkRemaining: ['non-confrontational safety protocol', 'training curriculum', 'incident escalation', 'privacy-safe reporting', 'community partner workflow'],
    externalDependencies: [{ type: 'legal_review', name: 'local safety/event/volunteer requirements', requiredForLive: true }], liveEvidence: [],
  },
];

export function canMarkLive(item: CompletionItem) {
  const blockingInternal = item.internalWorkRemaining.length > 0;
  const blockingExternal = item.externalDependencies.some((d) => d.requiredForLive);
  const hasEvidence = item.liveEvidence.length > 0;
  return {
    allowed: !blockingInternal && !blockingExternal && hasEvidence,
    reasons: [
      ...(blockingInternal ? ['Internal work remains.'] : []),
      ...(blockingExternal ? ['Required external dependencies remain.'] : []),
      ...(!hasEvidence ? ['No production-live evidence recorded.'] : []),
    ],
  };
}

export function summarizeCompletion(items = completionRegistry) {
  return items.reduce<Record<CompletionStatus, number>>((acc, item) => {
    acc[item.status] += 1;
    return acc;
  }, { CONCEPT: 0, SPECIFIED: 0, CODED: 0, INTEGRATED: 0, TESTED: 0, GATED: 0, LIVE: 0 });
}
