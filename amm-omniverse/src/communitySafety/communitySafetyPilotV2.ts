import type { SafetyService } from './communitySafetyCore';

export type PilotV2Gate = {
  key: string;
  label: string;
  complete: boolean;
  critical: boolean;
  evidence?: string;
};

export const communitySafetyPilotV2Gates: PilotV2Gate[] = [
  { key: 'narrow_scope', label: 'Narrow pilot service and geography selected', complete: false, critical: true },
  { key: 'partner', label: 'At least one employer/campus/event/community partner ready', complete: false, critical: true },
  { key: 'member_flow', label: 'Member booking, quote, check-in and safe-arrival flow', complete: false, critical: true },
  { key: 'dispatcher', label: 'Dispatcher dashboard and assignment controls', complete: false, critical: true },
  { key: 'worker_mobile', label: 'Worker mobile en-route/check-in/service flow', complete: false, critical: true },
  { key: 'server_auth_rls', label: 'Authenticated persistence and RLS isolation', complete: false, critical: true },
  { key: 'notifications', label: 'Delay, arrival, missed check-in and incident notifications', complete: false, critical: true },
  { key: 'screening', label: 'Worker screening/background-check process', complete: false, critical: true },
  { key: 'training', label: 'De-escalation, boundaries, emergency and accessibility training', complete: false, critical: true },
  { key: 'insurance', label: 'Insurance/risk coverage verified for pilot jurisdiction and scope', complete: false, critical: true },
  { key: 'legal_scope', label: 'Local legal/licensing review complete for non-enforcement accompaniment service', complete: false, critical: true },
  { key: 'incident', label: 'Incident escalation, evidence-preservation and supervisor review process', complete: false, critical: true },
  { key: 'privacy', label: 'Location minimization, retention and masked-contact policy', complete: false, critical: true },
  { key: 'accessibility', label: 'Accessibility Passport/accommodation workflow integrated', complete: false, critical: true },
  { key: 'pricing', label: 'Pilot pricing and worker compensation approved', complete: false, critical: false },
  { key: 'contract', label: 'Partner/member terms and service-scope agreement templates', complete: false, critical: false },
  { key: 'support', label: 'Complaint, cancellation and refund/support workflow', complete: false, critical: false },
  { key: 'metrics', label: 'Pilot outcomes/evidence dashboard', complete: false, critical: false },
  { key: 'sustainability', label: 'Contribution-margin and TRYAMM 3.00x scenario modeled', complete: false, critical: false },
];

export function evaluatePilotV2Readiness(gates: PilotV2Gate[]) {
  const total = gates.length;
  const complete = gates.filter((g) => g.complete).length;
  const criticalMissing = gates.filter((g) => g.critical && !g.complete);
  const percent = total ? Math.round((complete / total) * 100) : 0;
  return {
    complete,
    total,
    percent,
    criticalMissing,
    pilotCapable: criticalMissing.length === 0 && percent >= 85,
    launchCapable: criticalMissing.length === 0 && complete === total,
  };
}

export type SafetyPilotOffer = {
  service: SafetyService;
  customerType: 'individual' | 'family' | 'employer' | 'campus' | 'event' | 'senior_disability' | 'sponsored';
  billingModel: 'per_journey' | 'membership' | 'per_shift' | 'per_event' | 'contract';
  customerPriceMinor: number;
  workerPayMinor: number;
  paymentFeeMinor: number;
  insuranceAllocationMinor: number;
  dispatchSupportMinor: number;
  technologyMinor: number;
  reserveMinor: number;
};

export function calculateSafetyPilotUnitEconomics(offer: SafetyPilotOffer) {
  const variableCostMinor =
    offer.workerPayMinor +
    offer.paymentFeeMinor +
    offer.insuranceAllocationMinor +
    offer.dispatchSupportMinor +
    offer.technologyMinor +
    offer.reserveMinor;
  const contributionMinor = offer.customerPriceMinor - variableCostMinor;
  const contributionMarginPercent = offer.customerPriceMinor > 0
    ? (contributionMinor / offer.customerPriceMinor) * 100
    : 0;
  return {
    variableCostMinor,
    contributionMinor,
    contributionMarginPercent,
    profitable: contributionMinor > 0,
  };
}

export type SafetyPilotPortfolio = {
  monthlyEligibleRevenueMinor: number;
  directAndVariableCostMinor: number;
  allocatedPlatformInfrastructureMinor: number;
};

export function calculateSafetyPilotSustainability(p: SafetyPilotPortfolio) {
  const totalOperatingCost = p.directAndVariableCostMinor + p.allocatedPlatformInfrastructureMinor;
  const sustainabilityRatio = totalOperatingCost > 0 ? p.monthlyEligibleRevenueMinor / totalOperatingCost : 0;
  return {
    totalOperatingCost,
    sustainabilityRatio,
    appSupportsItself: sustainabilityRatio >= 1,
    reserveBuilding: sustainabilityRatio >= 1.5,
    threeXGoalMet: sustainabilityRatio >= 3,
  };
}

// Non-enforcement boundary: presence + accompaniment + dispatch + de-escalation + check-in + reporting + resource routing.
// Not police, armed patrol, detention, pursuit, interrogation, search, seizure, or vigilantism.
// Imminent danger routes to appropriate emergency/public services.
