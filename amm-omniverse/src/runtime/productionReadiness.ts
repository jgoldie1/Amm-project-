export type CompletionState = 'CONCEPT' | 'SPECIFIED' | 'CODED' | 'INTEGRATED' | 'TESTED' | 'GATED' | 'LIVE';

export type DependencyKind = 'none' | 'provider' | 'regulatory' | 'legal' | 'hardware' | 'app_store' | 'capital' | 'data';

export type FeatureReadiness = {
  id: string;
  name: string;
  state: CompletionState;
  dependency: DependencyKind;
  productionBlocker?: string;
  evidence?: string[];
  highRisk?: boolean;
};

export const productionReadiness: FeatureReadiness[] = [
  { id: 'core-web', name: 'TRYAMM Web App Shell', state: 'INTEGRATED', dependency: 'provider', productionBlocker: 'Production deployment and regression verification required.', evidence: ['Vite/React app', 'global launchers'] },
  { id: 'accessibility-passport', name: 'Accessibility Passport', state: 'INTEGRATED', dependency: 'data', productionBlocker: 'Server/account persistence and disabled-user QA required.', evidence: ['accessibilityPassport.ts', 'global panel/CSS'] },
  { id: 'accessibility-match', name: 'Accessibility Match', state: 'CODED', dependency: 'data', productionBlocker: 'Opportunity-provider data and UI integration required.' },
  { id: 'student-jarvis', name: 'Student JARVIS', state: 'CODED', dependency: 'data', productionBlocker: 'School/LMS/provider integrations optional; dashboard integration and tests still required.' },
  { id: 'learning-passport', name: 'Learning Passport', state: 'CODED', dependency: 'none' },
  { id: 'business-jarvis', name: 'Business JARVIS / Adaptive Company OS', state: 'CODED', dependency: 'data', productionBlocker: 'Live business signal ingestion, approval persistence and end-to-end tests required.', highRisk: true },
  { id: 'company-twin', name: 'Holographic Company Digital Twin', state: 'CODED', dependency: 'data', productionBlocker: 'Production data connectors and visualization integration required.' },
  { id: 'business-simulator', name: 'Business Simulator', state: 'CODED', dependency: 'data', productionBlocker: 'Calibrated production metrics and experiment persistence required.' },
  { id: 'trust-core', name: 'JARVIS Permission Firewall / Audit / Feature Gates', state: 'CODED', dependency: 'data', productionBlocker: 'Server-authoritative persistence, RLS and security tests required.', highRisk: true },
  { id: 'marketplace', name: 'Holo Marketplace', state: 'INTEGRATED', dependency: 'provider', productionBlocker: 'Seller/order persistence, payments, returns and fraud operations required.', highRisk: true },
  { id: 'holo-delivery', name: 'Holo Delivery / Package Delivery', state: 'INTEGRATED', dependency: 'provider', productionBlocker: 'Courier/provider integration, real-time tracking persistence, insurance/compliance and production maps required.', highRisk: true },
  { id: 'jin-pay', name: 'Jin Pay', state: 'SPECIFIED', dependency: 'provider', productionBlocker: 'Licensed payment-provider integration, KYC/AML where applicable, reconciliation and dispute workflows required.', highRisk: true },
  { id: 'money-engine', name: 'Money Engine', state: 'CODED', dependency: 'provider', productionBlocker: 'Server-side double-entry persistence, payment-provider reconciliation and finance controls required.', highRisk: true },
  { id: 'hologpt-credits', name: 'HoloGPT Credits / AI Actions', state: 'CODED', dependency: 'provider', productionBlocker: 'Production metering, pricing, billing and anti-abuse required.' },
  { id: 'sustainability', name: 'Platform Sustainability Engine', state: 'CODED', dependency: 'data', productionBlocker: 'Real revenue and infrastructure-cost ingestion required before ratio can be called live.' },
  { id: 'business-launch', name: 'Formation-to-Operation-to-Growth System', state: 'CODED', dependency: 'provider', productionBlocker: 'State filing, IRS/EIN, registrar, banking and licensing provider integrations required.' },
  { id: 'domain-dns', name: 'Domain / DNS / Forever Domain Care', state: 'CODED', dependency: 'provider', productionBlocker: 'Registrar/reseller contract/API, pricing and renewal reserve operations required.' },
  { id: 'forever-website', name: 'Forever Website', state: 'CODED', dependency: 'capital', productionBlocker: 'Hosting reserve economics, export workflow and fair-use policy verification required.' },
  { id: 'stubbs-harmony', name: 'Stubbs Harmony Website Builder', state: 'CODED', dependency: 'provider', productionBlocker: 'Visual editor integration, publishing pipeline and production hosting required.' },
  { id: 'quantum-zapier', name: 'Quantum Zapier', state: 'CODED', dependency: 'provider', productionBlocker: 'Connector runtime, secrets vault, retry/idempotency and approval persistence required.', highRisk: true },
  { id: 'quantum-discord', name: 'Quantum Discord', state: 'CODED', dependency: 'provider', productionBlocker: 'Realtime community backend, moderation and scale testing required.' },
  { id: 'live-streaming', name: 'LIVE / PK / Multi-panel', state: 'GATED', dependency: 'provider', productionBlocker: 'Production LiveKit/provider credentials, moderation, scale and mobile verification required.', highRisk: true },
  { id: 'creator-studio', name: 'Creator Studio / Reels / OpenCut-style Editing', state: 'SPECIFIED', dependency: 'provider', productionBlocker: 'Editor UI, export/render pipeline, rights workflow and storage economics required.' },
  { id: 'soul-ascension', name: 'Soul Ascension', state: 'SPECIFIED', dependency: 'legal', productionBlocker: 'Production rights/music licensing, broadcast workflow and moderation required.' },
  { id: 'guardian-community', name: 'Community Guardian / Violence Prevention', state: 'SPECIFIED', dependency: 'legal', productionBlocker: 'Local partners, safeguarding rules, insurance and escalation protocols required.', highRisk: true },
  { id: 'telehealth', name: 'Telehealth Marketplace', state: 'GATED', dependency: 'regulatory', productionBlocker: 'Licensed providers, HIPAA-capable vendor architecture, state rules and payer contracts required.', highRisk: true },
  { id: 'medicaid', name: 'Medicaid Billing', state: 'GATED', dependency: 'regulatory', productionBlocker: 'Enrolled/credentialed billing providers, payer enrollment, coding/compliance and jurisdiction-specific approval required.', highRisk: true },
  { id: 'telelaw', name: 'Tele-Law / Lawyer On Demand', state: 'GATED', dependency: 'regulatory', productionBlocker: 'Attorney marketplace structure, state ethics/fee-sharing rules, conflicts and engagement workflows required.', highRisk: true },
  { id: 'tax-bookkeeping', name: 'Tele-Tax / Bookkeeping', state: 'GATED', dependency: 'regulatory', productionBlocker: 'PTIN/credentialed preparers where required, tax-service compliance and professional engagement terms required.', highRisk: true },
  { id: 'insurance-realty', name: 'Tele-Insurance / Tele-Realty', state: 'GATED', dependency: 'regulatory', productionBlocker: 'Licensed agents/brokers, state-by-state rules and compensation structure required.', highRisk: true },
  { id: 'remote-notary', name: 'Remote Notarization', state: 'GATED', dependency: 'regulatory', productionBlocker: 'State availability, commissioned notaries and compliant identity/video/record retention required.', highRisk: true },
  { id: 'vehicle-jarvis', name: 'Vehicle JARVIS', state: 'CODED', dependency: 'hardware', productionBlocker: 'OEM/vehicle APIs and safety-certified integrations required for vehicle control.', highRisk: true },
  { id: 'drone-robot', name: 'Drone / Robot Delivery', state: 'GATED', dependency: 'regulatory', productionBlocker: 'Approved operators/providers, aviation/sidewalk regulations, insurance and safety integrations required.', highRisk: true },
  { id: 'ios-android', name: 'Android / iPhone Production Packages', state: 'GATED', dependency: 'app_store', productionBlocker: 'Signed builds, store assets, privacy disclosures, review and approval required.' },
];

export function readinessSummary(features = productionReadiness) {
  const counts = features.reduce<Record<CompletionState, number>>((acc, feature) => {
    acc[feature.state] = (acc[feature.state] ?? 0) + 1;
    return acc;
  }, { CONCEPT: 0, SPECIFIED: 0, CODED: 0, INTEGRATED: 0, TESTED: 0, GATED: 0, LIVE: 0 });
  const total = features.length;
  const weighted = features.reduce((sum, feature) => {
    const weights: Record<CompletionState, number> = { CONCEPT: 0.05, SPECIFIED: 0.15, CODED: 0.4, INTEGRATED: 0.6, TESTED: 0.8, GATED: 0.85, LIVE: 1 };
    return sum + weights[feature.state];
  }, 0);
  return { counts, total, weightedCompletionPercent: Math.round((weighted / total) * 100) };
}
