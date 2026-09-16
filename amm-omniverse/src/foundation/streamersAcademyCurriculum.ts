export type StreamersModule = {
  id: string;
  title: string;
  outcome: string;
  practice: string;
};

export const STREAMERS_ACADEMY_CURRICULUM: readonly StreamersModule[] = [
  { id: 'studio-basics', title: 'Camera, Lighting & Audio', outcome: 'Build a clean accessible creator setup', practice: 'Record and review a short studio segment' },
  { id: 'live-host', title: 'LIVE Hosting', outcome: 'Plan, host and close a moderated LIVE', practice: 'StreetVerse LIVE simulation' },
  { id: 'pk-panel', title: 'PK & Panels', outcome: 'Run fair panels and PK formats', practice: 'Moderated PK simulation' },
  { id: 'reels', title: 'Reels & Editing', outcome: 'Capture, edit, caption and package short media', practice: 'Create portfolio Reel' },
  { id: 'radio-podcast', title: 'Podcast & Omni Radio', outcome: 'Produce interviews and audio programming', practice: 'Publish sandbox episode package' },
  { id: 'music', title: 'Holo Music & 64-Track Studio', outcome: 'Build a music production portfolio', practice: 'Create session project' },
  { id: 'safety', title: 'Safety, Moderation & Consent', outcome: 'Apply moderation and consent boundaries', practice: 'Scenario assessment' },
  { id: 'rights', title: 'Copyright & Rights Basics', outcome: 'Recognize licensing and attribution needs', practice: 'Rights checklist exercise' },
  { id: 'commerce', title: 'LIVE Commerce', outcome: 'Present products without bypassing commerce authority', practice: 'Sandbox storefront LIVE' },
  { id: 'sponsors', title: 'Sponsors & Product Placement', outcome: 'Build disclosure-ready sponsor packages', practice: 'Sponsor pitch project' },
  { id: 'ads', title: 'Holo Ads', outcome: 'Create campaign-ready creator inventory', practice: 'Ad creative project' },
  { id: 'distribution', title: 'CTV / OTT / FAST Distribution', outcome: 'Package media for multi-platform distribution', practice: 'Distribution plan' },
  { id: 'long-form', title: 'Long-Form Holo Drama', outcome: 'Plan episodes, movies and branded entertainment', practice: 'Production bible project' },
  { id: 'business', title: 'Creator Business', outcome: 'Move from portfolio to opportunity or business', practice: 'Create My Business readiness project' },
] as const;

export const STREAMERS_GRADUATION_PATHS = [
  'Creator Portal',
  'LIVE / PK Host',
  'Reel Creator',
  'Omni Radio / Podcast',
  'Holo Music / 64-Track Studio',
  'Holo Ads / Sponsor Creator',
  'CTV / OTT / FAST Production',
  'MiddleVerse Media Job',
  'Creator Agency',
  'Create My Business',
] as const;

export const STREAMERS_TRUTH = {
  courseCompletionIsAccreditedDegree: false,
  thirdPartyCredentialRequiresIssuerVerification: true,
  realEarningsRequireAuthoritativeLedger: true,
  sponsorDealRequiresAgreement: true,
  accessibilityBuiltIn: true,
} as const;
