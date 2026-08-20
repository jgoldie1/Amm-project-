export type IndianaHub = {
  id: string
  name: string
  identity: string
  travel: string[]
  jobs: string[]
  missions: string[]
}

export const INDIANA_LIVING_WORLD = {
  id: 'indiana-living-world',
  name: 'Indiana Living World',
  region: 'Great Lakes + Midwest',
  systems: ['StreetVerse', 'Stubbs AI', 'Eve Director', 'World Memory', 'Lottie 2.0', 'Commerce OS', 'Sports OS', 'Creator OS', 'accessibility', 'translation', 'cloud-save', 'multiplayer'],
  hubs: [
    { id: 'gary', name: 'Gary + Northwest Indiana', identity: 'Chicago-connected industrial, music, freight and neighborhood corridor.', travel: ['car','bus','rail','trucking'], jobs: ['freight','manufacturing','music/events','hospitality','local business'], missions: ['Chicago-Gary commuter run','freight recovery','music history creator route','neighborhood business launch'] },
    { id: 'indianapolis', name: 'Indianapolis', identity: 'State capital, sports, conventions, healthcare, logistics and motorsport.', travel: ['car','bus','rail','plane','trucking'], jobs: ['sports/events','logistics','healthcare-support','hospitality','public-service'], missions: ['major event logistics','sports weekend','convention creator coverage','statewide freight dispatch'] },
    { id: 'south-bend', name: 'South Bend', identity: 'Education, manufacturing, sports and regional services.', travel: ['car','bus','rail'], jobs: ['education','manufacturing','sports/events','local services'], missions: ['campus event support','regional delivery','small business modernization'] },
    { id: 'fort-wayne', name: 'Fort Wayne', identity: 'Manufacturing, logistics, healthcare and family business.', travel: ['car','bus','trucking'], jobs: ['manufacturing','warehouse','healthcare-support','trades'], missions: ['warehouse optimization','family business expansion','regional parts run'] },
    { id: 'bloomington', name: 'Bloomington', identity: 'College, arts, technology and creator economy.', travel: ['car','bus'], jobs: ['education','creator','music/events','technology'], missions: ['student creator project','festival production','startup prototype delivery'] },
    { id: 'columbus-in', name: 'Columbus, Indiana', identity: 'Architecture, advanced manufacturing, design, logistics and family/community business.', travel: ['car','bus','trucking'], jobs: ['manufacturing','design','architecture-support','logistics','local business'], missions: ['design heritage tour','advanced manufacturing delivery','Indianapolis-Columbus business run','community business modernization'] },
    { id: 'evansville', name: 'Evansville', identity: 'Ohio River trade, healthcare, manufacturing and regional logistics.', travel: ['car','bus','trucking','river'], jobs: ['logistics','manufacturing','healthcare-support','hospitality'], missions: ['river commerce route','regional freight transfer','community event support'] },
  ] as IndianaHub[],
  rules: { preservePlayerState: true, chicagoRulesDoNotAutoApply: true, stateSpecificCivicAdapterRequired: true, realWorldBookingsRequireVerifiedProviders: true, teenSafeRouting: true },
} as const

export const INDIANA_CHICAGO_LINKS = [
  'Chicago ↔ Gary/Northwest Indiana daily commuter and freight corridor',
  'Chicago ↔ Indianapolis business, sports and convention corridor',
  'Chicago ↔ South Bend education and sports corridor',
  'Indianapolis ↔ Columbus architecture, manufacturing and business corridor',
  'Illinois ↔ Indiana moving, trucking, creator-tour and family-travel missions',
] as const

export function getIndianaHub(id: string) { return INDIANA_LIVING_WORLD.hubs.find(hub => hub.id === id) }
