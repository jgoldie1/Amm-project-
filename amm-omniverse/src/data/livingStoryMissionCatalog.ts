export type TryammWorld = 'streetverse' | 'we-are-the-world' | 'starverse';
export type MissionStatus = 'locked' | 'building' | 'ready' | 'live';
export type MissionLane =
  | 'fire-rescue'
  | 'investigation'
  | 'community-drama'
  | 'music-career'
  | 'media-business'
  | 'global-tour'
  | 'big-boss';

export interface MissionArc {
  id: string;
  title: string;
  worlds: TryammWorld[];
  lane: MissionLane;
  status: MissionStatus;
  summary: string;
  unlocks: string[];
  monetization?: string[];
  contentGuardrails?: string[];
}

export const musicCompanies = {
  spectraEntertainment: {
    id: 'spectra-ent',
    name: 'Spectra Entertainment',
    role: 'Talent, live events, film/video, branded entertainment, touring and creator development',
  },
  allAmericanRecords: {
    id: 'all-american-records',
    name: 'All American Records',
    role: 'Original music label, artist development, releases, publishing coordination, merch and StarVerse distribution',
  },
} as const;

export const bigBosses = [
  { id: 'boss-music', title: 'Music Boss', domain: 'artists, studios, releases, tours and label competition' },
  { id: 'boss-media', title: 'Media Boss', domain: 'film, reels, broadcast, publicity and product placement' },
  { id: 'boss-business', title: 'Business Boss', domain: 'venues, commerce, sponsorships and marketplace expansion' },
  { id: 'boss-neighborhood', title: 'Neighborhood Boss', domain: 'community influence, alliances, service and reputation' },
  { id: 'boss-global', title: 'Global Boss', domain: 'international expansion across We Are the World' },
] as const;

export const livingStoryMissionCatalog: MissionArc[] = [
  {
    id: 'sv-rescue-first-response',
    title: 'First Response',
    worlds: ['streetverse'],
    lane: 'fire-rescue',
    status: 'building',
    summary: 'Respond to an original city emergency, coordinate evacuation, assist NPCs and stabilize the scene.',
    unlocks: ['rescue reputation', 'emergency-services contacts', 'city trust'],
    contentGuardrails: ['Original scenarios only', 'No copied TV plots, characters, uniforms, dialogue or logos'],
  },
  {
    id: 'sv-case-neighborhood-network',
    title: 'Neighborhood Network',
    worlds: ['streetverse'],
    lane: 'investigation',
    status: 'building',
    summary: 'Gather lawful clues, interview NPCs, follow evidence and resolve a fictional neighborhood case.',
    unlocks: ['detective reputation', 'new contacts', 'follow-on missions'],
    contentGuardrails: ['No real-person accusation mechanics', 'No copied police-show plots or characters'],
  },
  {
    id: 'sv-community-crossroads',
    title: 'Community Crossroads',
    worlds: ['streetverse', 'we-are-the-world'],
    lane: 'community-drama',
    status: 'building',
    summary: 'Choose between competing community, family and business priorities with consequences that persist.',
    unlocks: ['community alliances', 'business opportunities', 'future story branches'],
  },
  {
    id: 'sv-rapper-origin',
    title: 'Chicago Artist Origin',
    worlds: ['streetverse', 'starverse'],
    lane: 'music-career',
    status: 'building',
    summary: 'Create an original artist identity, record an original song, build a team and earn a first performance opportunity.',
    unlocks: ['studio access', 'StarVerse showcase', 'Spectra Entertainment meeting', 'All American Records development path'],
    monetization: ['ticketing', 'merch', 'creator commerce', 'sponsorship', 'licensed product placement'],
    contentGuardrails: ['Original artists and music only unless rights are documented', 'No unlicensed likeness or voice cloning'],
  },
  {
    id: 'star-label-deal',
    title: 'Build the Label',
    worlds: ['starverse', 'streetverse'],
    lane: 'media-business',
    status: 'building',
    summary: 'Develop artists through All American Records while Spectra Entertainment coordinates shows, video, film and branded opportunities.',
    unlocks: ['label roster', 'release calendar', 'venue bookings', 'brand deals', 'movie/reel placement'],
    monetization: ['music sales', 'subscriptions', 'merch', 'tickets', 'brand partnerships', 'holographic product placement'],
  },
  {
    id: 'star-boss-music',
    title: 'The Music Boss',
    worlds: ['starverse', 'streetverse'],
    lane: 'big-boss',
    status: 'locked',
    summary: 'A long-form competitive business arc where the player can out-create, out-negotiate or partner with a fictional music power broker.',
    unlocks: ['regional influence', 'headline events', 'major collaborations'],
  },
  {
    id: 'waw-world-tour',
    title: 'We Are the World Tour',
    worlds: ['we-are-the-world', 'starverse'],
    lane: 'global-tour',
    status: 'locked',
    summary: 'Expand an original artist, label or entertainment company internationally through culturally localized missions and partnerships.',
    unlocks: ['international venues', 'localized creator missions', 'global sponsors'],
    monetization: ['touring', 'cross-border marketplace', 'sponsorship', 'digital experiences'],
  },
  {
    id: 'waw-boss-global',
    title: 'The Global Boss',
    worlds: ['we-are-the-world', 'streetverse', 'starverse'],
    lane: 'big-boss',
    status: 'locked',
    summary: 'A crossover finale joining city reputation, entertainment growth, business ownership and international expansion.',
    unlocks: ['global reputation tier', 'cross-world finale', 'new seasonal story branch'],
  },
];

export const livingStoryPolicy = {
  principle: 'Use genres and mission patterns as inspiration, not protected expression.',
  prohibitedWithoutRights: [
    'copied television scripts or episode plots',
    'protected characters or show branding',
    'unlicensed real artist likenesses, voices or recordings',
    'unlicensed logos, music masters or publishing',
  ],
  productionGate: 'A mission may move to LIVE only after implementation, content-rights review, build/test, deployment and public verification.',
} as const;
