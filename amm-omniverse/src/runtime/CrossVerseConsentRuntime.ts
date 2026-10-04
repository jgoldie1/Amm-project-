export type CrossVersePlatform =
  | 'streetverse'
  | 'faithverse'
  | 'musicverse'
  | 'starverse'
  | 'sportverse'
  | 'holoverse'
  | 'tryamm-live'
  | 'tryamm-reels'
  | 'tryamm-ctv'
  | 'tryamm-fast'
  | 'tryamm-ott'
  | 'all-american-network'
  | 'hologpt';

export type ConsentUse =
  | 'likeness'
  | 'face'
  | 'voice'
  | 'motion'
  | 'live'
  | 'recorded'
  | 'ai-performance'
  | 'advertising'
  | 'promotion'
  | 'gameplay'
  | 'sponsorship'
  | 'product-placement'
  | 'paid-endorsement';

export interface CrossVerseConsentScope {
  platform: CrossVersePlatform;
  uses: ConsentUse[];
  allowed: boolean;
}

export interface ConsentEvidence {
  videoStorageUri: string;
  videoSha256: string;
  capturedAtIso: string;
  city: string;
  country?: string;
  spokenName: string;
  releaseVersion: string;
}

export interface CrossVerseConsentRecord {
  consentId: string;
  personId: string;
  characterId?: string;
  displayName: string;
  status: 'active' | 'revoked' | 'expired' | 'pending-review';
  evidence: ConsentEvidence;
  scopes: CrossVerseConsentScope[];
  createdAtIso: string;
  updatedAtIso: string;
  revokedAtIso?: string;
  notes?: string[];
}

export interface HoloGPTConsentMemoryPointer {
  consentId: string;
  personId: string;
  characterId?: string;
  storageUri: string;
  sha256: string;
  releaseVersion: string;
  status: CrossVerseConsentRecord['status'];
  allowedPlatforms: CrossVersePlatform[];
  allowedUses: ConsentUse[];
}

export const CROSSVERSE_DEFAULT_PLATFORMS: CrossVersePlatform[] = [
  'streetverse',
  'faithverse',
  'musicverse',
  'starverse',
  'sportverse',
  'holoverse',
  'tryamm-live',
  'tryamm-reels',
  'tryamm-ctv',
  'tryamm-fast',
  'tryamm-ott',
  'all-american-network',
  'hologpt',
];

export function buildCrossVerseScopes(
  platforms: readonly CrossVersePlatform[] = CROSSVERSE_DEFAULT_PLATFORMS,
  uses: readonly ConsentUse[] = ['likeness','face','voice','recorded','gameplay'],
): CrossVerseConsentScope[] {
  return platforms.map(platform=>({platform,uses:[...uses],allowed:true}));
}

export function consentAllows(
  record: CrossVerseConsentRecord,
  platform: CrossVersePlatform,
  use: ConsentUse,
): boolean {
  if(record.status!=='active')return false;
  const scope=record.scopes.find(item=>item.platform===platform);
  return Boolean(scope?.allowed&&scope.uses.includes(use));
}

export function buildHoloGPTConsentMemoryPointer(
  record: CrossVerseConsentRecord,
): HoloGPTConsentMemoryPointer {
  const activeScopes=record.scopes.filter(scope=>scope.allowed);
  return {
    consentId:record.consentId,
    personId:record.personId,
    characterId:record.characterId,
    storageUri:record.evidence.videoStorageUri,
    sha256:record.evidence.videoSha256,
    releaseVersion:record.evidence.releaseVersion,
    status:record.status,
    allowedPlatforms:activeScopes.map(scope=>scope.platform),
    allowedUses:[...new Set(activeScopes.flatMap(scope=>scope.uses))],
  };
}

export function assertCrossVerseConsent(
  record: CrossVerseConsentRecord,
  platform: CrossVersePlatform,
  use: ConsentUse,
): void {
  if(!consentAllows(record,platform,use)){
    throw new Error(`Consent denied for ${platform} / ${use} / ${record.personId}`);
  }
}

export function revokeCrossVerseConsent(
  record: CrossVerseConsentRecord,
  revokedAtIso=new Date().toISOString(),
): CrossVerseConsentRecord {
  return {
    ...record,
    status:'revoked',
    revokedAtIso,
    updatedAtIso:revokedAtIso,
    scopes:record.scopes.map(scope=>({...scope,allowed:false})),
  };
}

export const CONSENT_VIDEO_SCRIPT_FIELDS = [
  'full legal name',
  'current date',
  'current time',
  'city and state/country',
  'permission to use likeness/image/face',
  'permission to use voice/recordings',
  'permission to create an in-game character',
  'permission for explicitly selected streaming/promotional/AI uses',
] as const;


export type CommercialCompensationModel =
  | 'flat-fee'
  | 'per-impression'
  | 'per-view'
  | 'per-click'
  | 'per-conversion'
  | 'revenue-share';

export interface CommercialConsentTerms {
  consentId: string;
  personId: string;
  campaignId: string;
  brandId: string;
  allowedPlatforms: CrossVersePlatform[];
  allowedUses: Array<'sponsorship'|'product-placement'|'paid-endorsement'>;
  compensationModel: CommercialCompensationModel;
  currency: string;
  rate: number;
  revenueShareBps?: number;
  startsAtIso: string;
  endsAtIso?: string;
  approvedProductIds?: string[];
  excludedCategories?: string[];
  active: boolean;
}

export interface CommercialAttributionEvent {
  eventId: string;
  campaignId: string;
  personId: string;
  characterId?: string;
  platform: CrossVersePlatform;
  placementId: string;
  productId?: string;
  eventType: 'impression'|'view'|'click'|'conversion'|'sale';
  quantity: number;
  grossAmountMinor?: number;
  occurredAtIso: string;
}

export function commercialUseAllowed(
  record: CrossVerseConsentRecord,
  terms: CommercialConsentTerms,
  platform: CrossVersePlatform,
  use: 'sponsorship'|'product-placement'|'paid-endorsement',
): boolean {
  if(!terms.active||terms.consentId!==record.consentId||terms.personId!==record.personId)return false;
  if(!terms.allowedPlatforms.includes(platform)||!terms.allowedUses.includes(use))return false;
  return consentAllows(record,platform,use);
}

export function calculateCommercialEarningMinor(
  terms: CommercialConsentTerms,
  event: CommercialAttributionEvent,
): number {
  if(event.campaignId!==terms.campaignId||event.personId!==terms.personId)return 0;
  const quantity=Math.max(0,event.quantity||0);
  if(terms.compensationModel==='revenue-share'){
    return Math.round(Math.max(0,event.grossAmountMinor||0)*Math.max(0,terms.revenueShareBps||0)/10000);
  }
  return Math.round(Math.max(0,terms.rate)*quantity);
}
