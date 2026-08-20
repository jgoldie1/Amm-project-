export type StreetVerseRegion = {
  id: string
  name: string
  country: string
  cluster: 'africa' | 'caribbean' | 'north-america' | 'diaspora'
  hubs: string[]
  industries: string[]
  missionSeeds: string[]
}

export const STREETVERSE_GLOBAL_DIASPORA: StreetVerseRegion[] = [
  {
    id: 'ng', name: 'Nigeria', country: 'Nigeria', cluster: 'africa',
    hubs: ['Lagos', 'Abuja', 'Port Harcourt'],
    industries: ['Afrobeats', 'film', 'fashion', 'fintech', 'marketplaces', 'logistics', 'food', 'technology'],
    missionSeeds: ['Lagos studio session', 'marketplace launch', 'cross-city delivery', 'festival production', 'startup pitch'],
  },
  {
    id: 'za', name: 'South Africa', country: 'South Africa', cluster: 'africa',
    hubs: ['Johannesburg', 'Cape Town', 'Durban'],
    industries: ['Amapiano', 'film', 'tourism', 'fashion', 'technology', 'logistics', 'food'],
    missionSeeds: ['Johannesburg club set', 'Cape Town production', 'Durban delivery route', 'creator collaboration'],
  },
  {
    id: 'ht', name: 'Haiti', country: 'Haiti', cluster: 'caribbean',
    hubs: ['Port-au-Prince', 'Cap-Haitien'],
    industries: ['music', 'art', 'food', 'tourism', 'crafts', 'commerce'],
    missionSeeds: ['artist showcase', 'market restoration', 'diaspora family connection', 'small-business supply run'],
  },
  {
    id: 'diaspora', name: 'Global African Diaspora', country: 'Global', cluster: 'diaspora',
    hubs: ['Chicago', 'Detroit', 'Atlanta', 'New York', 'London', 'Toronto', 'Caribbean', 'West Africa', 'Southern Africa'],
    industries: ['music', 'film', 'fashion', 'education', 'trade', 'technology', 'travel', 'creator economy'],
    missionSeeds: ['diaspora music tour', 'cross-border creator campaign', 'family-history story arc', 'international marketplace trade'],
  },
]

export type WorldContentPack = {
  id: string
  regionId: string
  title: string
  characters: string[]
  missions: string[]
  secrets: string[]
  releaseAt?: string
}

// Content packs let StreetVerse keep expanding after launch without rebuilding the core world.
export function registerWorldContentPack(pack: WorldContentPack) {
  if (!pack.id || !pack.regionId || !pack.title) throw new Error('invalid_world_content_pack')
  return { ...pack, registeredAt: new Date().toISOString(), status: 'registered' as const }
}

export const GLOBAL_MISSION_ARCS = [
  'Chicago to Lagos: creator collaboration and marketplace launch',
  'Detroit to Johannesburg: producer exchange and live-event build',
  'Chicago to Haiti: diaspora commerce and cultural-story mission',
  'Lagos to Atlanta: Afrobeats crossover tour',
  'Johannesburg to Chicago: Amapiano festival weekend',
  'Diaspora Trade Route: build verified suppliers across multiple countries',
] as const
