export const ALL_AMERICAN_SOCIAL_SPORTS = {
  scope: 'United States nationwide with state/city/venue chapters; international expansion can follow jurisdiction and rights review.',
  activities: [
    'bowling','spades','dominoes','billiards-pool','chess','checkers','basketball-shootout','free-throw','three-point-contest',
    'cornhole','darts-digital-safe','table-tennis','pickleball','roller-skating','dance-battle','trivia','karaoke','esports-original-games'
  ],
  bowling: {
    modes: ['casual','family','league','team','creator-celebrity','corporate','university','youth','senior','adaptive','HoloArena-bowling'],
    progression: ['LOCAL QUALIFIER','CITY','STATE','REGION','NATIONAL CHAMPIONSHIP'],
    worldMemory: ['average','high-game','high-series','team-history','rivalries','venues-visited','titles','replays'],
  },
  spades: {
    modes: ['casual','partners','family-table','agency-vs-agency','city-vs-city','state-vs-state','national-championship'],
    rules: ['publish-table-rules-before-match','server-authoritative-score','anti-collusion-signals','no-real-money-wagering-by-default'],
    progression: ['TABLE','NEIGHBORHOOD','CITY','STATE','REGION','USA FINALS'],
  },
  nationwide: {
    hierarchy: ['COUNTRY','REGION','STATE','METRO','CITY','VENUE','LEAGUE','TEAM','PLAYER'],
    examples: ['Chicago','Los Angeles','New York','Miami','Tampa','Orlando','Atlanta','Houston','Dallas','Las Vegas','Seattle','Detroit','Indianapolis','Columbus','South Bend','Kenosha'],
    discovery: ['nearby-events','travel-events','state-rankings','national-rankings','accessible-events','family-events','university-events'],
  },
  rewards: {
    lifecycle: ['PUBLISH RULES','FUND PRIZE','REGISTER','PLAY','SERVER SCORE','ANTI-CHEAT','FINALIZE','1ST/2ND/3RD','PAYOUT/REWARD LEDGER','WORLD MEMORY'],
    nonCash: ['Beans','promotional-Holo-Credits','trophies','badges','store-perks','memberships','replays'],
    cash: 'Only when separately lawful, funded, published, eligibility-checked and paid through the verified payout engine; no client-side cash minting.',
  },
  media: ['LIVE','PK-team-room','Movie Box','Lottie 2.0','replay','highlight-reel','All American Network','creator-profile','sponsor-package'],
  commerce: ['tickets','memberships','team-jerseys','original-card/deck-products','venue-merch','replay-packages','birthday/corporate-packages','sponsor-packages'],
  accessibility: ['seated/adaptive modes','captions','screen-reader UI','high-contrast','reduced-motion','one-hand/controller remap','audio cues','guardian/youth lanes'],
} as const

export const SOCIAL_SHARING_CONTRACT = {
  principle: 'Create platform-native share packages; never promise reach, ranking, virality, or endorsement from a third-party social network.',
  destinations: ['Facebook','Instagram','X','TikTok','YouTube','Twitch','other user-selected destinations'],
  package: ['vertical-highlight','landscape-highlight','score-card','achievement-card','caption-draft','rights-status','deep-link','invite-code','UTM/campaign-attribution'],
  privacy: ['explicit-publish-action','audience-choice','minor/guardian-controls','location-redaction-option','rights-check-before-export'],
} as const
