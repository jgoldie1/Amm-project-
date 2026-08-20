export type FloridaWorld = {
  id: string
  name: string
  county: string
  identity: string
  hubs: string[]
  jobs: string[]
  stories: string[]
}

export const FLORIDA_PLAYABLE_WORLDS: FloridaWorld[] = [
  {
    id: 'miami', name: 'Miami', county: 'Miami-Dade County',
    identity: 'Music, nightlife, fashion, ports, hospitality, real estate, Latin/Caribbean culture, finance and creator commerce.',
    hubs: ['Downtown/Brickell gameplay', 'Wynwood-style arts district', 'Beach/tourism corridor', 'Port/logistics', 'Music and creator venues'],
    jobs: ['DJ', 'producer', 'artist', 'hotel worker', 'chef', 'restaurant owner', 'port worker', 'driver', 'realtor/property services', 'event promoter'],
    stories: ['Sunrise to Last Call', 'Port to Party', 'Creator Weekend', 'Family Business Expansion'],
  },
  {
    id: 'hollywood-fl', name: 'Hollywood, Florida', county: 'Broward County',
    identity: 'Beachfront, hospitality, neighborhood business, family commerce, dining, events and South Florida travel.',
    hubs: ['Beach/broadwalk-style gameplay', 'Downtown business corridor', 'Hotels', 'Restaurants', 'Regional travel'],
    jobs: ['hotel worker', 'restaurant worker', 'small-business owner', 'event staff', 'driver', 'security', 'creator'],
    stories: ['Broadwalk Build-Up', 'Family Storefront', 'Summer Crowd', 'South Florida Connector'],
  },
  {
    id: 'tampa', name: 'Tampa Bay', county: 'Hillsborough County launch core',
    identity: 'Sports, port/logistics, healthcare, hospitality, finance, construction, food and Gulf Coast travel.',
    hubs: ['Downtown Tampa', 'Port/logistics', 'Sports/entertainment', 'Hospitality', 'Regional neighborhoods'],
    jobs: ['port worker', 'dispatcher', 'healthcare support', 'restaurant owner', 'sports staff', 'construction trade', 'driver', 'event producer'],
    stories: ['Bay Shift', 'Game Day Economy', 'Port Contract', 'Gulf Coast Expansion'],
  },
  {
    id: 'orlando', name: 'Orlando', county: 'Orange County',
    identity: 'Tourism, conventions, entertainment, hospitality, aviation, restaurants and family travel.',
    hubs: ['Tourism corridor', 'Convention economy', 'Airport/logistics', 'Hotels', 'Entertainment districts'],
    jobs: ['hospitality worker', 'event worker', 'driver', 'restaurant owner', 'AV technician', 'tour worker', 'creator'],
    stories: ['Convention Week', 'Tour Crew', 'Hospitality Ladder', 'Family Vacation Economy'],
  },
  {
    id: 'jacksonville', name: 'Jacksonville', county: 'Duval County',
    identity: 'Logistics, port, military-adjacent civilian economy, healthcare, sports, construction and regional commerce.',
    hubs: ['Downtown', 'Port/logistics', 'Healthcare', 'Sports', 'Neighborhood corridors'],
    jobs: ['logistics worker', 'driver', 'healthcare support', 'construction trade', 'security', 'small-business owner'],
    stories: ['North Florida Route', 'Port Day', 'Neighborhood Contract'],
  },
]

export const FLORIDA_LIFE_PATH = [
  'background/family', 'school', 'friends', 'first job', 'career or creator path', 'money', 'home', 'vehicle', 'relationships', 'business', 'employees', 'reputation', 'travel', 'legacy'
] as const

export const FAN_CREATION_POLICY = {
  originalFictionalCharactersPlayable: true,
  realPublicFiguresReferenceOnlyUntilLicensed: true,
  noVoiceCloningWithoutPermission: true,
  noInventedPrivateOrCriminalConductForRealPeople: true,
  fanPacksRequireRightsAndModerationReviewBeforeCommercialRelease: true,
} as const
