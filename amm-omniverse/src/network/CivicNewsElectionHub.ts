export const CIVIC_NEWS_ELECTION_HUB = {
  purpose: 'Neutral, source-backed civic information for TRYAMM / All American Network. Not candidate persuasion or targeted political advertising.',
  modules: [
    'official election calendar',
    'registration status/help links',
    'polling-place and hours links',
    'vote-by-mail and early-voting information',
    'sample-ballot and official candidate/source links',
    'election-security and misinformation reporting links',
    'results dashboard sourced to official election authorities',
    'accessibility and language support',
    'newsroom corrections log',
  ],
  editorialRules: [
    'label opinion separately from factual reporting',
    'cite primary official sources for dates, eligibility, polling hours and results',
    'do not fabricate endorsements',
    'do not target voters with persuasive political messaging',
    'do not imply TRYAMM is an election authority',
    'publish corrections visibly',
  ],
  networkPath: 'ALL AMERICAN NETWORK → CIVIC HUB → VERIFIED SOURCE → NEWS EXPLAINER → ACCESSIBILITY/TRANSLATION → USER CHOOSES OFFICIAL RESOURCE',
} as const
