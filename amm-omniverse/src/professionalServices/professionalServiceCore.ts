export type ServiceVertical = 'telelaw' | 'telehealth' | 'teletax' | 'teleinsurance' | 'telerealty' | 'remote_notary' | 'tutoring' | 'interpreting' | 'hr_recruiting' | 'cyber_support' | 'beauty_consult';

export type ProfessionalCredential = {
  providerId: string;
  vertical: ServiceVertical;
  jurisdiction: string;
  credentialType: string;
  credentialIdMasked: string;
  verified: boolean;
  verifiedAt?: string;
  expiresAt?: string;
  source?: string;
};

export type ProfessionalProfile = {
  id: string;
  displayName: string;
  verticals: ServiceVertical[];
  jurisdictions: string[];
  languages: string[];
  interpreterSupported: boolean;
  signLanguageSupported: boolean;
  captionsSupported: boolean;
  secureSessionSupported: boolean;
  priceFromMinor?: number;
  currency?: string;
  availability: Array<{ startsAt: string; endsAt: string }>;
  credentials: ProfessionalCredential[];
};

export type ServiceRequest = {
  id: string;
  vertical: ServiceVertical;
  jurisdiction: string;
  language: string;
  needsInterpreter: boolean;
  needsSignLanguage: boolean;
  needsCaptions: boolean;
  accessibilityNeeds: string[];
  budgetMinor?: number;
  currency?: string;
  requestedAt: string;
  urgency: 'routine' | 'soon' | 'urgent';
};

export type MatchDecision = {
  providerId: string;
  eligible: boolean;
  reasons: string[];
  missing: string[];
};

export function evaluateProfessionalMatch(request: ServiceRequest, provider: ProfessionalProfile): MatchDecision {
  const reasons: string[] = [];
  const missing: string[] = [];
  const jurisdictionOk = provider.jurisdictions.includes(request.jurisdiction);
  if (jurisdictionOk) reasons.push('Relevant jurisdiction supported');
  else missing.push('Relevant jurisdiction not supported');

  const credentialOk = provider.credentials.some((c) => c.vertical === request.vertical && c.jurisdiction === request.jurisdiction && c.verified && (!c.expiresAt || new Date(c.expiresAt) > new Date()));
  if (credentialOk) reasons.push('Credential verified for requested service/jurisdiction');
  else missing.push('Verified current credential required');

  if (provider.languages.includes(request.language)) reasons.push('Requested language supported');
  else if (request.needsInterpreter && provider.interpreterSupported) reasons.push('Interpreter pathway available');
  else missing.push('Requested language/interpreter path unavailable');

  if (request.needsSignLanguage && !provider.signLanguageSupported) missing.push('Sign-language provider/integration unavailable');
  if (request.needsCaptions && !provider.captionsSupported) missing.push('Captions unavailable');
  if (!provider.secureSessionSupported) missing.push('Secure session unavailable');
  if (request.budgetMinor && provider.priceFromMinor && provider.priceFromMinor > request.budgetMinor) missing.push('Starting price exceeds budget');

  return { providerId: provider.id, eligible: missing.length === 0, reasons, missing };
}

export type CommunicationPipeline = {
  uiLanguage: string;
  machineTranslation: 'off' | 'assistive';
  captions: 'off' | 'auto' | 'human_reviewed';
  humanInterpreter: 'not_needed' | 'requested' | 'assigned';
  signLanguageProvider: 'not_needed' | 'requested' | 'assigned';
};

export function buildCommunicationPipeline(input: {
  uiLanguage: string;
  needsTranslation: boolean;
  needsCaptions: boolean;
  needsInterpreter: boolean;
  needsSignLanguage: boolean;
}): CommunicationPipeline {
  return {
    uiLanguage: input.uiLanguage,
    machineTranslation: input.needsTranslation ? 'assistive' : 'off',
    captions: input.needsCaptions ? 'auto' : 'off',
    humanInterpreter: input.needsInterpreter ? 'requested' : 'not_needed',
    signLanguageProvider: input.needsSignLanguage ? 'requested' : 'not_needed',
  };
}

export type SessionPlan = {
  requestId: string;
  providerId: string;
  secureSessionRequired: true;
  locationBasis: string;
  jurisdiction: string;
  communication: CommunicationPipeline;
  priceEstimateMinor?: number;
  currency?: string;
  status: 'matching' | 'ready_to_book' | 'needs_interpreter' | 'needs_verification' | 'unavailable';
};

// Production principles:
// - TRYAMM is a platform/marketplace unless separately licensed; licensed advice/services remain with verified professionals.
// - Machine translation and automatic captions are assistive; consequential legal/medical/tax communications may require qualified human interpretation.
// - Jurisdiction and professional credential checks are mandatory before presenting a provider as eligible for regulated work.
// - Emergency/crisis situations must route to appropriate emergency/public services rather than ordinary marketplace booking.
