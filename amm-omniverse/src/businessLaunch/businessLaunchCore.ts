export type BusinessEntityType = 'sole_proprietor' | 'llc' | 'corporation' | 'nonprofit' | 'partnership' | 'unsure';
export type LaunchStepStatus = 'not_started' | 'in_progress' | 'waiting_external' | 'complete' | 'blocked';

export type BusinessLaunchProfile = {
  id: string;
  ownerAccountId: string;
  legalName?: string;
  publicBrandName?: string;
  entityType: BusinessEntityType;
  formationState?: string;
  industry?: string;
  domain?: string;
  einStatus: LaunchStepStatus;
  formationStatus: LaunchStepStatus;
  domainStatus: LaunchStepStatus;
  dnsStatus: LaunchStepStatus;
  websiteStatus: LaunchStepStatus;
  bankingReadinessStatus: LaunchStepStatus;
  complianceStatus: LaunchStepStatus;
};

export type DomainRegistration = {
  fqdn: string;
  registrarProviderId?: string;
  registrationState: 'available' | 'reserved' | 'registered' | 'transfer_pending' | 'expired' | 'unknown';
  autoRenew: boolean;
  expiresAt?: string;
  ownerAccountId: string;
};

export type DnsRecord = {
  id: string;
  domain: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'SRV' | 'CAA';
  name: string;
  value: string;
  ttl: number;
  status: 'draft' | 'pending_provider' | 'active' | 'failed';
};

export type EinWorkflow = {
  businessLaunchId: string;
  eligibilityState: 'unknown' | 'likely_eligible' | 'needs_review' | 'not_applicable';
  responsiblePartyReady: boolean;
  legalNameReady: boolean;
  entityTypeReady: boolean;
  formationStateReady: boolean;
  externalSubmissionRequired: true;
  status: LaunchStepStatus;
  notes?: string[];
};

export type LaunchChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  status: LaunchStepStatus;
  source: 'tryamm' | 'state' | 'irs' | 'registrar' | 'bank' | 'other';
};

export function buildLaunchChecklist(profile: BusinessLaunchProfile): LaunchChecklistItem[] {
  return [
    { id: 'name', label: 'Choose and verify business name', required: true, status: profile.legalName ? 'complete' : 'not_started', source: 'state' },
    { id: 'entity', label: 'Choose entity structure', required: true, status: profile.entityType === 'unsure' ? 'in_progress' : 'complete', source: 'tryamm' },
    { id: 'formation', label: 'State formation/registration', required: true, status: profile.formationStatus, source: 'state' },
    { id: 'ein', label: 'EIN readiness and IRS submission', required: true, status: profile.einStatus, source: 'irs' },
    { id: 'domain', label: 'Domain registration', required: false, status: profile.domainStatus, source: 'registrar' },
    { id: 'dns', label: 'DNS + email/web routing', required: false, status: profile.dnsStatus, source: 'registrar' },
    { id: 'site', label: 'Stubbs Harmony website/store', required: false, status: profile.websiteStatus, source: 'tryamm' },
    { id: 'bank', label: 'Business banking readiness', required: false, status: profile.bankingReadinessStatus, source: 'bank' },
    { id: 'compliance', label: 'Licenses/compliance calendar', required: true, status: profile.complianceStatus, source: 'other' },
  ];
}

// TRYAMM can guide, prepare data, validate completeness and connect to approved providers.
// It must not claim state approval, IRS EIN issuance, bank approval or domain registration
// until authoritative provider evidence is returned.
