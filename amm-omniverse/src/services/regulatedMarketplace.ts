export type RegulatedServiceType =
  | 'tele_law'
  | 'tele_tax_bookkeeping'
  | 'tele_insurance'
  | 'tele_realty'
  | 'remote_notary'
  | 'telehealth'
  | 'interpreting_sign_language'
  | 'hr_recruiting'
  | 'cybersecurity_support'
  | 'beauty_consultation_non_medical'
  | 'tutoring'
  | 'qualified_medicaid_provider_service';

export type VerificationState = 'unverified' | 'pending' | 'verified' | 'expired' | 'suspended';
export type PaymentModel = 'provider_sets_fee' | 'platform_subscription' | 'booking_fee' | 'referral_if_permitted' | 'sponsor_paid' | 'insurance_or_medicaid_if_eligible';

export type ProfessionalCredential = {
  type: string;
  jurisdiction?: string;
  licenseNumberLast4?: string;
  expiresAt?: string;
  verification: VerificationState;
  source?: string;
};

export type ServiceProviderProfile = {
  id: string;
  businessId?: string;
  displayName: string;
  serviceTypes: RegulatedServiceType[];
  credentials: ProfessionalCredential[];
  jurisdictions: string[];
  languages: string[];
  accessibility: {
    captions?: boolean;
    aslOrSignLanguage?: boolean;
    screenReaderCompatible?: boolean;
    textChat?: boolean;
    audioOnly?: boolean;
  };
  paymentModels: PaymentModel[];
  acceptsMedicaid?: boolean;
  medicaidEnrollmentState?: VerificationState;
  active: boolean;
};

export type ServiceRequest = {
  id: string;
  userId: string;
  serviceType: RegulatedServiceType;
  jurisdiction?: string;
  urgency: 'routine' | 'same_day' | 'urgent' | 'emergency';
  summary: string;
  createdAt: string;
  status: 'draft' | 'matching' | 'matched' | 'booked' | 'completed' | 'cancelled' | 'redirected';
};

export function canListProvider(profile: ServiceProviderProfile, type: RegulatedServiceType) {
  if (!profile.active || !profile.serviceTypes.includes(type)) return false;
  const regulated = new Set<RegulatedServiceType>(['tele_law','tele_tax_bookkeeping','tele_insurance','tele_realty','remote_notary','telehealth','qualified_medicaid_provider_service']);
  if (!regulated.has(type)) return true;
  return profile.credentials.some((c) => c.verification === 'verified');
}

export function matchProvider(request: ServiceRequest, providers: ServiceProviderProfile[]) {
  return providers
    .filter((p) => canListProvider(p, request.serviceType))
    .filter((p) => !request.jurisdiction || !p.jurisdictions.length || p.jurisdictions.includes(request.jurisdiction))
    .map((provider) => ({
      provider,
      reasons: [
        'Service type verified',
        request.jurisdiction && provider.jurisdictions.includes(request.jurisdiction) ? 'Jurisdiction match' : 'Jurisdiction requires provider confirmation',
        provider.acceptsMedicaid ? 'Provider reports Medicaid participation; eligibility/coverage must still be verified' : 'Private/self-pay or other payment path',
      ],
    }));
}

export type MedicaidBillingReadiness = {
  providerCredentialVerified: boolean;
  providerMedicaidEnrollmentVerified: boolean;
  patientEligibilityVerified: boolean;
  serviceCovered: boolean;
  telehealthAllowedIfUsed: boolean;
  requiredDocumentationPresent: boolean;
  payerRulesVerified: boolean;
};

export function canPrepareMedicaidClaim(r: MedicaidBillingReadiness) {
  const missing = Object.entries(r).filter(([, ok]) => !ok).map(([key]) => key);
  return { ready: missing.length === 0, missing };
}

export type MarketplaceRevenueRule = {
  serviceType: RegulatedServiceType;
  model: PaymentModel;
  platformFeeMinor?: number;
  platformPercentBps?: number;
  notes: string;
};

export function calculatePlatformFee(rule: MarketplaceRevenueRule, providerFeeMinor: number) {
  const fixed = rule.platformFeeMinor ?? 0;
  const variable = Math.round(providerFeeMinor * ((rule.platformPercentBps ?? 0) / 10_000));
  return Math.max(0, fixed + variable);
}

// Legal/compliance rules:
// - TRYAMM is the marketplace/technology layer unless separately licensed; it does not hold itself out as the lawyer, clinician, insurer, broker, notary or tax professional.
// - Provider credential/jurisdiction checks are required before regulated listings go live.
// - Fee-sharing/referral structures must be reviewed by service type and jurisdiction; use subscription/booking/software fees when percentage referral fees are restricted.
// - For tax preparation, paid federal return preparers need a valid PTIN; TRYAMM may support workflow but must not issue PTINs.
// - Medicaid billing is available only for appropriately qualified/enrolled providers, covered services and verified payer/state rules.
// - Health data must be isolated from advertising/social systems and handled under applicable HIPAA/privacy requirements when TRYAMM is a regulated entity/business associate.
// - Emergency medical/legal/public-safety requests must route to appropriate emergency/public services, not ordinary marketplace queues.

export type CommunityGuardianProgram = {
  id: string;
  name: string;
  model: 'safe_passage' | 'youth_mentor' | 'event_presence' | 'de_escalation_support' | 'community_walk' | 'resource_navigation';
  nonVigilante: true;
  armed: false;
  permittedActions: Array<'observe' | 'call_for_help' | 'escort_with_consent' | 'de_escalate_if_trained' | 'connect_resources' | 'document_incident_if_lawful' | 'first_aid_if_trained'>;
  prohibitedActions: Array<'pursue' | 'detain' | 'search' | 'interrogate' | 'impersonate_police' | 'use_force_except_lawful_self_defense'>;
  trainingRequired: string[];
  status: 'design' | 'partner_review' | 'pilot' | 'active' | 'paused';
};

export const defaultCommunityGuardianProgram: CommunityGuardianProgram = {
  id: 'tryamm-community-guardian',
  name: 'TRYAMM Community Guardian Network',
  model: 'safe_passage',
  nonVigilante: true,
  armed: false,
  permittedActions: ['observe','call_for_help','escort_with_consent','de_escalate_if_trained','connect_resources','document_incident_if_lawful','first_aid_if_trained'],
  prohibitedActions: ['pursue','detain','search','interrogate','impersonate_police','use_force_except_lawful_self_defense'],
  trainingRequired: ['de-escalation','first aid/CPR where available','youth safeguarding','bias/privacy','conflict boundaries','emergency escalation'],
  status: 'design',
};

export type GuardianFundingSource = 'business_sponsorship' | 'event_contract' | 'school_or_nonprofit_contract' | 'grant' | 'member_subscription' | 'community_donation';

export type GuardianMission = {
  id: string;
  programId: string;
  locationLabel: string;
  purpose: string;
  startAt: string;
  endAt: string;
  trainedParticipantsRequired: number;
  fundingSource: GuardianFundingSource;
  budgetMinor: number;
  evidenceRequired: string[];
};
