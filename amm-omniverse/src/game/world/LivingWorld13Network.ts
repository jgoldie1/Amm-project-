export const LIVING_WORLD_13_NETWORK = {
  count: 13,
  passport: 'ONE USER → ONE AVATAR → ONE XP/LEVEL STATE → ONE INVENTORY → ONE WORLD CHECKPOINT CONTRACT → THIRTEEN LIVING WORLDS',
  additions: [
    {
      id:'my-world',
      name:'My World',
      role:'persistent personal builder/home world',
      systems:['private/public spaces','room/world builder','persistent objects','friends/guests','business storefront','creator studio','Movie Box sets','Holo Credits digital customization','World Memory'],
      loop:'BUILD → INVITE → LIVE/CREATE → SELL/SHOW → SAVE → LEAVE → WORLD CONTINUES → RETURN → EXPAND'
    },
    {
      id:'we-are-the-world',
      name:'We Are the World',
      role:'global discovery, culture, diaspora, travel and community world',
      systems:['countries/regions','Chicago/Africa/Mexico/Canada/UK/diaspora gateways','translation','global events','schools/universities','business discovery','travel/logistics','music/culture','missions','World Memory'],
      loop:'DISCOVER REGION → MEET PEOPLE → LEARN/COLLABORATE → COMPLETE MISSION/EVENT → CREATE CONTENT → TRAVEL → RETURN WITH REPUTATION'
    }
  ],
  sharedState:['identity','avatar','XP/level','reputation','inventory','owned assets','Holo Credits','Beans','creator attribution','accessibility','safety','World Memory','mission state','movie/replay refs'],
  crossWorldRules:[
    'The same identity and avatar ownership follows the player across worlds.',
    'World-specific progression may differ, but canonical account balances and owned assets remain server-authoritative.',
    'World Memory records consequential choices and return-state changes without fabricating real-world facts.',
    'Creator works preserve rights/provenance when moved between music, games, Movie Box, streaming and HoloArena.',
    'Cash prizes, service shares and payable creator earnings never live inside game inventory or Holo Credits.',
  ],
} as const

export const LIVING_WORLD_EXPANSION_EFFECT = [
  'My World gives every user a persistent home/base instead of only mission destinations.',
  'We Are the World turns separate city/country maps into one global social, education, culture and commerce network.',
  'The two worlds create strong reasons to return because the player owns spaces, relationships, reputation and history.',
  'They create natural entry points for University, Marketplace, Mobile, Music, HoloArena, Movie Box and agency/franchise systems.',
] as const
