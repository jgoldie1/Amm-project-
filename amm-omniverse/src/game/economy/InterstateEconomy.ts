export type TransportMode = 'airport' | 'rail' | 'bus' | 'trucking' | 'rideshare' | 'hotel' | 'moving' | 'touring'

export type InterstateHub = {
  id: string
  name: string
  regions: string[]
  modes: TransportMode[]
  jobs: string[]
  missionLoops: string[]
}

export const INTERSTATE_HUBS: InterstateHub[] = [
  {
    id: 'great-lakes-midwest',
    name: 'Great Lakes + Midwest Corridor',
    regions: ['Chicago', 'Gary + Northwest Indiana', 'Indianapolis', 'South Bend', 'Fort Wayne', 'Bloomington', 'Evansville', 'Detroit + Southeast Michigan', 'Peoria', 'Greenville', 'St. Louis', 'Mount Vernon', 'Herrin'],
    modes: ['airport', 'rail', 'bus', 'trucking', 'rideshare', 'hotel', 'moving', 'touring'],
    jobs: ['Airport ground worker', 'Rail attendant', 'Bus driver', 'Truck driver', 'Freight dispatcher', 'Rideshare driver', 'Hotel worker', 'Mover', 'Tour manager'],
    missionLoops: ['Move freight between cities', 'Relocate a household', 'Transport a sports team', 'Run a creator tour', 'Cover a weather reroute', 'Deliver urgent business inventory', 'Run Chicago ↔ Northwest Indiana commuter and freight missions']
  },
  {
    id: 'indiana-state-network',
    name: 'Indiana State Network',
    regions: ['Gary + Northwest Indiana', 'Indianapolis', 'South Bend', 'Fort Wayne', 'Bloomington', 'Evansville'],
    modes: ['airport', 'rail', 'bus', 'trucking', 'rideshare', 'hotel', 'moving', 'touring'],
    jobs: ['Freight dispatcher', 'Manufacturing worker', 'Sports/event worker', 'Hospitality worker', 'Creator', 'Mover', 'Rideshare driver', 'Public-service support'],
    missionLoops: ['Chicago-Gary daily route', 'Indianapolis sports/event logistics', 'South Bend campus trip', 'Fort Wayne manufacturing delivery', 'Bloomington creator tour', 'Evansville river-commerce transfer']
  },
  {
    id: 'southern-route',
    name: 'Southern Interstate Corridor',
    regions: ['St. Louis', 'Tennessee Launch Network', 'Atlanta', 'Florida Launch Network'],
    modes: ['airport', 'rail', 'bus', 'trucking', 'rideshare', 'hotel', 'moving', 'touring'],
    jobs: ['Tour bus driver', 'Promoter', 'Truck dispatcher', 'Hotel manager', 'Airport worker', 'Mover', 'Event logistics coordinator'],
    missionLoops: ['Music tour', 'Seasonal hospitality surge', 'Sports travel', 'Small-business expansion', 'Freight recovery', 'Festival logistics']
  },
  {
    id: 'california-network',
    name: 'California North–South Network',
    regions: ['San Diego', 'Southern California', 'Hollywood', 'Silver Lake', 'North Hollywood', 'Encino + Havenhurst', 'Ventura County', 'San Jose + Silicon Valley', 'Northern California'],
    modes: ['airport', 'rail', 'bus', 'trucking', 'rideshare', 'hotel', 'moving', 'touring'],
    jobs: ['Production driver', 'Rideshare driver', 'Freight coordinator', 'Hotel worker', 'Tour manager', 'Mover', 'Airport worker', 'Rail worker'],
    missionLoops: ['Move a film crew', 'Deliver a startup prototype', 'Run a creator tour', 'Relocate a family', 'Move restaurant inventory', 'Connect Northern and Southern California markets']
  },
  {
    id: 'east-coast',
    name: 'East Coast Gateway',
    regions: ['Atlanta', 'Florida Launch Network', 'New York City'],
    modes: ['airport', 'rail', 'bus', 'trucking', 'rideshare', 'hotel', 'moving', 'touring'],
    jobs: ['Airport worker', 'Rail worker', 'Long-haul driver', 'Dispatcher', 'Hospitality worker', 'Mover', 'Tour coordinator'],
    missionLoops: ['NYC market launch', 'East Coast freight run', 'Creator press tour', 'Business relocation', 'Seasonal travel surge']
  }
]

export const INTERSTATE_ECONOMY_LOOP = [
  'Accept job/contract',
  'Plan route and transport mode',
  'Load people, inventory or equipment',
  'Travel through regional checkpoints',
  'Handle traffic, weather, fuel/charge, delay and customer-service events',
  'Deliver safely and on time',
  'Earn job XP/reputation and eligible in-game compensation',
  'Unlock higher-value routes, employers or business expansion'
] as const

export const CALIFORNIA_REGIONAL_CLUSTERS = [
  {
    id: 'southern-california',
    name: 'Southern California',
    includes: ['San Diego', 'Hollywood', 'Silver Lake', 'North Hollywood', 'Encino + Havenhurst', 'Ventura County'],
    identity: 'Film, television, creators, tourism, ports, hospitality, logistics, technology, neighborhood business and coastal travel.'
  },
  {
    id: 'silver-lake',
    name: 'Silver Lake',
    includes: ['Silver Lake', 'Eastside creator corridors', 'Local restaurants', 'Music/arts venues', 'Residential services'],
    identity: 'Creator, music, food, design, nightlife and neighborhood entrepreneurship missions.'
  },
  {
    id: 'northern-california',
    name: 'Northern California',
    includes: ['San Jose + Silicon Valley', 'Bay Area travel hub', 'Regional tech/manufacturing/logistics routes'],
    identity: 'Technology, hardware, AI, startups, advanced manufacturing, education, logistics and regional services.'
  }
] as const

export const INTERSTATE_MONETIZATION_BOUNDARIES = [
  'Real-world travel or transportation bookings require verified providers, insurance/licensing checks and applicable marketplace rules.',
  'In-game simulated fares and wages must remain separate from real payable balances unless the Money Engine explicitly authorizes a real transaction.',
  'TRYAMM can monetize eligible marketplace bookings, Business Pro tools, ads/promotions, logistics software and recruiting tools where lawful.',
  'Government, emergency and court duties are not commission-bearing marketplace transactions.'
] as const
