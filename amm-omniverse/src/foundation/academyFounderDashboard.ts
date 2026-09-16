export const ACADEMY_FOUNDER_DASHBOARD = {
  systems: [
    'Streamers Academy', 'All American University', 'Youth Media Academy', 'Jacobie Vision Cyber Academy',
    'HoloStyle Fashion Academy', 'Music / Record Label Academy', '64-Track Studio pathway',
    'TRYAMM Opportunity Center', 'Skills / Talent Passport', 'MiddleVerse Jobs',
  ],
  statusVocabulary: ['LIVE', 'READY', 'BUILDING', 'LOCKED', 'COMING SOON'],
  evidencePanels: [
    'code + tests', 'deployment', 'provider/employer', 'credential issuer', 'accessibility QA',
    'mobile QA', 'real business launches', 'verified hires', 'verified creator outcomes',
  ],
} as const;

export const FOUNDER_DASHBOARD_TRUTH = {
  statusRequiresEvidence: true,
  configuredDoesNotMeanLive: true,
  previewDoesNotMeanProduction: true,
  simulatedOutcomeDoesNotMeanRealOutcome: true,
} as const;
