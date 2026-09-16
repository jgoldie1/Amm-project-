export const ACADEMY_CREATOR_INTEGRATIONS = {
  creatorPortal: ['Streamers Academy', 'Skills/Talent Passport', 'portfolio', 'LIVE', 'PK', 'Reels'],
  omniRadio: ['Youth Media Academy', 'Streamers Academy', 'DJ/radio', 'podcasting', 'interviewing'],
  holoMusic: ['Music/Record Label Academy', '64-Track Studio', 'Artist Network', 'creator portfolio'],
  holoAds: ['sponsorship', 'product placement', 'campaign creative', 'creator attribution'],
  distribution: ['CTV', 'OTT', 'FAST', 'multi-platform', 'long-form media'],
  middleVerseJobs: ['verified skills', 'accessible jobs', 'work-from-home support', 'employer interest'],
  businessFactory: ['Create My Business', 'Business Passport', 'territory', 'storefront', 'hiring'],
  streetVerse: ['practice labs', 'missions', 'Chicago 77 demand', 'business opportunities'],
} as const;

export const INTEGRATION_AUTHORITY = {
  portfolioMayContainSandboxProjects: true,
  sandboxProjectIsNotRealEmployment: true,
  sponsorPlacementRequiresDisclosureAndAgreement: true,
  distributionAvailabilityRequiresProviderEvidence: true,
  earningsRequireAuthoritativeLedger: true,
} as const;
