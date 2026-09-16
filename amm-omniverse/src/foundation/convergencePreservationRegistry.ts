export type PreservationFamily =
  | 'creator-media'
  | 'academies-jobs'
  | 'commerce'
  | 'telecom'
  | 'food-storehouse'
  | 'music-entertainment'
  | 'payments-ledgers'
  | 'mobility-delivery'
  | 'streetverse-worlds'
  | 'ai-holo'
  | 'accessibility'
  | 'family-legacy'
  | 'founder-admin';

export const CONVERGENCE_PRESERVATION_REGISTRY: Record<PreservationFamily, readonly string[]> = {
  'creator-media': [
    'Creator Portal', 'LIVE', 'PK', 'Reels', 'Creator Media', 'Omni Radio', 'CTV/OTT/FAST', 'Holo Ads',
  ],
  'academies-jobs': [
    'Streamers Academy', 'All American University', 'Youth Media Academy', 'Jacobie Vision Cyber Academy',
    'HoloStyle Fashion Academy', 'Music/Record Label Academy', '64-Track Studio', 'MiddleVerse Jobs',
    'Skills/Talent Passport', 'TRYAMM Opportunity Center', 'Create My Business', 'Hire From StreetVerse',
  ],
  commerce: [
    'All American Store', 'All American Beauty', 'Marketplace', 'Business Passport', 'Virtual Warehouse', 'LIVE/PK Commerce',
  ],
  telecom: ['Holo FON', 'carrier offer engine', 'provider bill-pay handoff'],
  'food-storehouse': ['YAHAVAH Food', 'Eat Wild', 'Storehouse', 'Holo Fridge', 'Cold Vault'],
  'music-entertainment': ['Holo Music', '64-Track Studio', 'Artist Network', 'Omni Radio'],
  'payments-ledgers': ['Aniyah Pay', 'earnings ledger', 'agent attribution', 'server-authoritative settlement'],
  'mobility-delivery': ['Holo Delivery', 'Holo Ride Share', 'Holo Drone'],
  'streetverse-worlds': ['StreetVerse', 'Chicago 77', 'missions', 'resident economy', 'world factory'],
  'ai-holo': ['HoloGPT', 'Command Nexus', 'Universal Intent Controller'],
  accessibility: ['voice UI', 'captions', 'translation', 'keyboard/switch access', 'accessible employment'],
  'family-legacy': ['Jacobie Vision', 'Isaiah AI TV', 'Aniyah 64-Track Studio', 'Aniyah cross-border platform'],
  'founder-admin': ['Founder Command Center', 'Admin Agent', 'Automan', 'release evidence'],
} as const;

export const PRESERVATION_RULES = {
  protectedSystemsMayNotSilentlyDisappear: true,
  newerMainSafetyContractsWinOverDivergentHistoricalCode: true,
  recoverByCapabilityNotWholesaleCherryPick: true,
  statusMustBeEvidenceBacked: true,
  allowedStatuses: ['LIVE', 'READY', 'BUILDING', 'LOCKED', 'COMING SOON'] as const,
} as const;

export const requiredPreservationNames = () =>
  Object.values(CONVERGENCE_PRESERVATION_REGISTRY).flat();
