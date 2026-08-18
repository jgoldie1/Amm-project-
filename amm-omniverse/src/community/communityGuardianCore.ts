export type GuardianRole =
  | 'community_guide'
  | 'safe_escort'
  | 'youth_mentor'
  | 'event_ambassador'
  | 'business_safety_liaison'
  | 'resource_navigator'
  | 'deescalation_lead'
  | 'dispatch_coordinator'
  | 'disability_access_ambassador';

export type GuardianServiceType =
  | 'safe_walk'
  | 'business_checkin'
  | 'event_support'
  | 'school_route_support'
  | 'resource_navigation'
  | 'accessibility_support'
  | 'youth_connection';

export type GuardianRequest = {
  id: string;
  accountId?: string;
  serviceType: GuardianServiceType;
  requestedAt: string;
  scheduledFor?: string;
  areaId: string;
  accessibilityNeeds?: string[];
  status: 'requested' | 'triage' | 'assigned' | 'active' | 'completed' | 'cancelled' | 'emergency_escalated';
  emergencyDetected?: boolean;
};

export type GuardianProfile = {
  id: string;
  displayName: string;
  roles: GuardianRole[];
  trainingModulesCompleted: string[];
  approvedAreas: string[];
  active: boolean;
  regulatedCredentialVerified?: boolean;
};

export type GuardianAssignment = {
  id: string;
  requestId: string;
  guardianIds: string[];
  supervisorId?: string;
  assignedAt: string;
  checkedInAt?: string;
  completedAt?: string;
};

export function canAssignGuardian(input: {
  request: GuardianRequest;
  guardian: GuardianProfile;
  requiredTraining: string[];
  jurisdictionRequiresRegulatedCredential?: boolean;
}) {
  const { request, guardian, requiredTraining, jurisdictionRequiresRegulatedCredential } = input;
  if (!guardian.active) return { allowed: false, reason: 'Guardian is inactive.' };
  if (!guardian.approvedAreas.includes(request.areaId)) return { allowed: false, reason: 'Guardian is not approved for this area.' };
  const missing = requiredTraining.filter((m) => !guardian.trainingModulesCompleted.includes(m));
  if (missing.length) return { allowed: false, reason: `Missing training: ${missing.join(', ')}` };
  if (jurisdictionRequiresRegulatedCredential && !guardian.regulatedCredentialVerified) {
    return { allowed: false, reason: 'This assignment requires a verified regulated credential.' };
  }
  if (request.emergencyDetected) return { allowed: false, reason: 'Imminent emergency must be escalated to appropriate emergency services.' };
  return { allowed: true, reason: 'Guardian is eligible for assignment.' };
}

export type GuardianContractEconomics = {
  monthlyRevenueMinor: number;
  directLaborMinor: number;
  payrollBurdenMinor: number;
  insuranceMinor: number;
  trainingMinor: number;
  supervisionMinor: number;
  technologyMinor: number;
  adminMinor: number;
  reserveMinor: number;
};

export function evaluateGuardianContract(e: GuardianContractEconomics) {
  const costs = e.directLaborMinor + e.payrollBurdenMinor + e.insuranceMinor + e.trainingMinor + e.supervisionMinor + e.technologyMinor + e.adminMinor + e.reserveMinor;
  const contributionMinor = e.monthlyRevenueMinor - costs;
  const contributionMargin = e.monthlyRevenueMinor > 0 ? contributionMinor / e.monthlyRevenueMinor : 0;
  return {
    costsMinor: costs,
    contributionMinor,
    contributionMargin,
    profitable: contributionMinor > 0,
  };
}

export type GuardianImpact = {
  safeWalksCompleted: number;
  businessCheckins: number;
  youthConnections: number;
  resourcesConnected: number;
  accessibilityIssuesResolved: number;
  hazardsReported: number;
  eventsSupported: number;
  jobsCreated: number;
};

// Safety rules:
// - no pursuit, detention, interrogation, search, punishment or police impersonation.
// - do not treat this role as licensed private security where local law requires licensing.
// - emergency situations route to appropriate public emergency services.
// - precise location and incident data are purpose-bound, minimized and access-controlled.
// - impact metrics must not become predictive-policing or social-credit scores.
