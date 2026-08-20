export type LaunchRegionId =
  | 'detroit-mi'
  | 'st-louis-mo'
  | 'tennessee-hub'
  | 'san-diego-ca'
  | 'hollywood-ca'
  | 'san-jose-ca'
  | 'north-hollywood-ca'
  | 'ventura-county-ca'
  | 'encino-havenhurst-ca'
  | 'atlanta-ga'
  | 'florida-hub'
  | 'new-york-city-ny'

export type LaunchRegionProfile = {
  id: LaunchRegionId
  name: string
  state: string
  countyOrEquivalent: string
  identity: string
  anchors: string[]
  jobs: string[]
  starterStories: Array<{
    title: string
    backstory: string
    roles: string[]
    chapters: string[]
  }>
  businessAdapter: string
  civicAdapter: string
}

export const GLOBAL_LAUNCH_REGIONS: LaunchRegionProfile[] = [
  {
    id: 'detroit-mi',
    name: 'Detroit + Southeast Michigan',
    state: 'Michigan',
    countyOrEquivalent: 'Wayne County launch core',
    identity: 'Motor-city, music, manufacturing, logistics, neighborhoods, sports, healthcare, mobility and small-business rebuilding.',
    anchors: ['Downtown Detroit', 'Neighborhood corridors', 'Auto/manufacturing', 'Music and creator venues', 'Sports district', 'Detroit River', 'Southeast Michigan travel'],
    jobs: ['Auto technician', 'EV technician', 'Factory/logistics worker', 'Truck dispatcher', 'Music producer', 'Venue staff', 'Security', 'Healthcare support', 'Restaurant operator', 'Retail owner', 'Real-estate services', 'Transit worker'],
    starterStories: [{
      title: 'Motor City Rebuild',
      backstory: 'A family commercial block sits between old industry and a new mobility corridor. Players can rebuild it through jobs, music, auto work, storefronts and neighborhood missions.',
      roles: ['Mechanic', 'Entrepreneur', 'Creator', 'Dispatcher', 'Contractor'],
      chapters: ['Recover the garage', 'Book the first music night', 'Hire local workers', 'Win a fleet contract', 'Expand across Southeast Michigan']
    }],
    businessAdapter: 'Michigan/local licensing + verified business-claim adapter',
    civicAdapter: 'Detroit/Wayne County/Michigan jurisdiction adapter'
  },
  {
    id: 'st-louis-mo',
    name: 'St. Louis',
    state: 'Missouri',
    countyOrEquivalent: 'City of St. Louis launch core',
    identity: 'River-city world with logistics, healthcare, sports, music, neighborhoods, food, construction and interstate commerce.',
    anchors: ['Downtown', 'Riverfront', 'Neighborhood business corridors', 'Sports/entertainment', 'Healthcare', 'Freight/logistics'],
    jobs: ['Logistics worker', 'Truck driver', 'Dispatcher', 'Healthcare support', 'Chef', 'Restaurant owner', 'Music creator', 'Security', 'Construction trade', 'Event producer'],
    starterStories: [{
      title: 'Gateway Shift',
      backstory: 'A delayed shipment threatens several small businesses before a major weekend event. Players coordinate freight, staffing, vendors and neighborhood traffic.',
      roles: ['Dispatcher', 'Driver', 'Vendor', 'Event worker'],
      chapters: ['Find the load', 'Reroute freight', 'Staff the district', 'Run the event', 'Settle the contracts']
    }],
    businessAdapter: 'St. Louis/Missouri business adapter',
    civicAdapter: 'St. Louis/Missouri jurisdiction adapter'
  },
  {
    id: 'tennessee-hub',
    name: 'Tennessee Launch Network',
    state: 'Tennessee',
    countyOrEquivalent: 'State hub; city adapters added beneath it',
    identity: 'Music, tourism, healthcare, logistics, manufacturing, sports, food and regional travel across Tennessee.',
    anchors: ['Nashville lane', 'Memphis lane', 'Knoxville lane', 'Chattanooga lane', 'Regional highways', 'Music/tourism venues'],
    jobs: ['Musician', 'Studio worker', 'Tour worker', 'Healthcare support', 'Warehouse worker', 'Driver', 'Hospitality worker', 'Restaurant owner', 'Event security', 'Construction trade'],
    starterStories: [{
      title: 'Tennessee Road Run',
      backstory: 'A creator-and-commerce tour crosses multiple Tennessee markets. Success requires booking, transport, staffing, local licensing and customer traffic.',
      roles: ['Artist', 'Manager', 'Driver', 'Vendor', 'Promoter'],
      chapters: ['Book the route', 'Prepare inventory', 'Move the crew', 'Run three city stops', 'Close the tour books']
    }],
    businessAdapter: 'Tennessee state + local city licensing adapters',
    civicAdapter: 'Tennessee state + local jurisdiction adapters'
  },
  {
    id: 'san-diego-ca',
    name: 'San Diego',
    state: 'California',
    countyOrEquivalent: 'San Diego County',
    identity: 'Coastal, tourism, defense-adjacent civilian economy, biotech, border commerce, nightlife, beaches and regional mobility.',
    anchors: ['Downtown', 'Beach districts', 'Port', 'Tourism corridors', 'Biotech/innovation', 'Border-region commerce'],
    jobs: ['Hospitality worker', 'Restaurant owner', 'Biotech support', 'Port/logistics worker', 'Creator', 'Tour operator', 'Rideshare driver', 'Security', 'Property services'],
    starterStories: [{
      title: 'Pacific Shift',
      backstory: 'A beach event, port delivery and creator launch collide on the same weekend, forcing players to balance traffic, staffing and customer demand.',
      roles: ['Promoter', 'Driver', 'Vendor', 'Creator', 'Security'],
      chapters: ['Prepare permits', 'Move the shipment', 'Open the venue', 'Handle peak traffic', 'Finish the launch']
    }],
    businessAdapter: 'San Diego/California business adapter',
    civicAdapter: 'San Diego County/California jurisdiction adapter'
  },
  {
    id: 'hollywood-ca',
    name: 'Hollywood',
    state: 'California',
    countyOrEquivalent: 'Los Angeles County / City of Los Angeles',
    identity: 'Film, television, creator economy, nightlife, tourism, production services, fashion and entertainment business.',
    anchors: ['Studio district gameplay', 'Creator venues', 'Nightlife', 'Tourism', 'Production lots simulation', 'Retail corridors'],
    jobs: ['Actor', 'Production assistant', 'Camera operator', 'Editor', 'Producer', 'Security', 'Stylist', 'Makeup artist', 'Venue worker', 'Restaurant owner', 'Tour worker'],
    starterStories: [{
      title: 'Call Time',
      backstory: 'A low-budget production has one day to finish a scene while a creator event opens nearby. Players decide whether to work crew, perform, promote or run the businesses supporting both.',
      roles: ['Actor', 'PA', 'Camera', 'Editor', 'Vendor'],
      chapters: ['Make call time', 'Solve a location problem', 'Finish the shoot', 'Launch the event', 'Deliver the final cut']
    }],
    businessAdapter: 'Los Angeles/California business adapter',
    civicAdapter: 'Los Angeles/California jurisdiction adapter'
  },
  {
    id: 'san-jose-ca',
    name: 'San Jose + Silicon Valley',
    state: 'California',
    countyOrEquivalent: 'Santa Clara County',
    identity: 'Technology, startups, hardware, AI, services, logistics, education and high-skill workforce simulation.',
    anchors: ['Downtown San Jose', 'Startup corridor', 'Hardware labs simulation', 'Transit', 'Universities/education', 'Regional neighborhoods'],
    jobs: ['Software developer', 'AI operator', 'Hardware technician', 'Startup founder', 'Sales', 'IT support', 'Delivery/logistics', 'Restaurant worker', 'Security'],
    starterStories: [{
      title: 'Prototype Friday',
      backstory: 'A tiny startup must get a prototype ready before a regional demo while keeping payroll, hardware, customer support and delivery moving.',
      roles: ['Founder', 'Developer', 'Technician', 'Sales', 'Courier'],
      chapters: ['Fix the prototype', 'Find a supplier', 'Win a pilot customer', 'Run the demo', 'Hire the first employee']
    }],
    businessAdapter: 'San Jose/Santa Clara/California business adapter',
    civicAdapter: 'San Jose/Santa Clara/California jurisdiction adapter'
  },
  {
    id: 'north-hollywood-ca',
    name: 'North Hollywood',
    state: 'California',
    countyOrEquivalent: 'Los Angeles County / City of Los Angeles',
    identity: 'Arts district, studios, theater, apartments, small business, transit and creator-life missions.',
    anchors: ['NoHo arts district gameplay', 'Transit hub', 'Studios', 'Theater', 'Restaurants', 'Residential services'],
    jobs: ['Actor', 'Theater worker', 'Studio worker', 'Editor', 'Transit worker', 'Restaurant staff', 'Property manager', 'Security'],
    starterStories: [{
      title: 'NoHo Night',
      backstory: 'A theater premiere and creator showcase compete for the same audience. Players help both succeed through transit, promotion, staffing and local business partnerships.',
      roles: ['Performer', 'Promoter', 'Transit worker', 'Business owner'],
      chapters: ['Book the space', 'Promote locally', 'Handle arrivals', 'Run both shows', 'Build repeat traffic']
    }],
    businessAdapter: 'Los Angeles/California business adapter',
    civicAdapter: 'Los Angeles/California jurisdiction adapter'
  },
  {
    id: 'ventura-county-ca',
    name: 'Ventura County',
    state: 'California',
    countyOrEquivalent: 'Ventura County',
    identity: 'Coastal cities, agriculture, logistics, tourism, small business, film-location services and suburban/rural travel.',
    anchors: ['Ventura coast', 'Oxnard lane', 'Agricultural areas', 'Port/logistics', 'Tourism', 'Film-location services'],
    jobs: ['Farm worker/manager simulation', 'Logistics worker', 'Tour operator', 'Restaurant owner', 'Film-location worker', 'Mechanic', 'Property services', 'Emergency services'],
    starterStories: [{
      title: 'County Line',
      backstory: 'A weather disruption threatens farms, deliveries and a location shoot on the same day. Players coordinate recovery while keeping small businesses supplied.',
      roles: ['Dispatcher', 'Farm manager', 'Driver', 'Production worker'],
      chapters: ['Assess the disruption', 'Prioritize deliveries', 'Protect the event', 'Restore supply routes', 'Close the emergency']
    }],
    businessAdapter: 'Ventura County/California business adapter',
    civicAdapter: 'Ventura County/California jurisdiction adapter'
  },
  {
    id: 'encino-havenhurst-ca',
    name: 'Encino + Havenhurst Corridor',
    state: 'California',
    countyOrEquivalent: 'Los Angeles County / City of Los Angeles',
    identity: 'Residential-commercial valley corridor with professional services, restaurants, property, wellness, media and local mobility.',
    anchors: ['Ventura Boulevard gameplay', 'Encino commercial corridor', 'Havenhurst-area residential services', 'Restaurants', 'Professional offices', 'Parks'],
    jobs: ['Restaurant operator', 'Property manager', 'Home-services worker', 'Wellness-business worker', 'Media creator', 'Rideshare driver', 'Security', 'Retail worker'],
    starterStories: [{
      title: 'Valley Client List',
      backstory: 'A small service business starts with one client and one vehicle. Players grow it through reliable jobs, reviews, staffing and neighborhood partnerships.',
      roles: ['Owner', 'Technician', 'Driver', 'Marketer'],
      chapters: ['Book the first client', 'Earn five-star service', 'Hire help', 'Add a second route', 'Open a storefront']
    }],
    businessAdapter: 'Los Angeles/California business adapter',
    civicAdapter: 'Los Angeles/California jurisdiction adapter'
  },
  {
    id: 'atlanta-ga',
    name: 'Atlanta',
    state: 'Georgia',
    countyOrEquivalent: 'Fulton County launch core',
    identity: 'Music, film, logistics, aviation, tech, sports, hospitality, entrepreneurship and regional culture.',
    anchors: ['Downtown/Midtown gameplay', 'Film/music production', 'Airport/logistics', 'Sports/entertainment', 'Neighborhood business corridors'],
    jobs: ['Music producer', 'Film crew', 'Airport/logistics worker', 'Driver', 'Startup worker', 'Restaurant owner', 'Event security', 'Sports staff'],
    starterStories: [{
      title: 'ATL Takeoff',
      backstory: 'A music release, film pickup shoot and cargo delay collide. Players build a network across creative and logistics careers.',
      roles: ['Producer', 'Crew', 'Dispatcher', 'Promoter'],
      chapters: ['Book the session', 'Move the gear', 'Recover the shipment', 'Run the release event', 'Sign the next contract']
    }],
    businessAdapter: 'Atlanta/Georgia business adapter',
    civicAdapter: 'Atlanta/Fulton/Georgia jurisdiction adapter'
  },
  {
    id: 'florida-hub',
    name: 'Florida Launch Network',
    state: 'Florida',
    countyOrEquivalent: 'State hub; Miami/Orlando/Tampa/Jacksonville adapters can branch beneath it',
    identity: 'Tourism, hospitality, ports, aviation, entertainment, real estate, healthcare, logistics and coastal regional travel.',
    anchors: ['Miami lane', 'Orlando lane', 'Tampa Bay lane', 'Jacksonville lane', 'Ports', 'Theme/entertainment economy simulation'],
    jobs: ['Hospitality worker', 'Restaurant owner', 'Port worker', 'Aviation worker', 'Tour operator', 'Event worker', 'Healthcare support', 'Property services', 'Driver'],
    starterStories: [{
      title: 'Sunshine Circuit',
      backstory: 'A small business tries to operate across several Florida markets during peak tourism season.',
      roles: ['Owner', 'Driver', 'Hospitality worker', 'Promoter'],
      chapters: ['Choose the first market', 'Hire seasonal staff', 'Manage peak traffic', 'Open a second location', 'Build the statewide route']
    }],
    businessAdapter: 'Florida state + local city/county adapters',
    civicAdapter: 'Florida state + local jurisdiction adapters'
  },
  {
    id: 'new-york-city-ny',
    name: 'New York City',
    state: 'New York',
    countyOrEquivalent: 'Five-borough launch network',
    identity: 'Dense transit, finance, media, food, retail, nightlife, culture, tourism and neighborhood entrepreneurship.',
    anchors: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island', 'Subway/transit simulation', 'Media/creator economy'],
    jobs: ['Transit worker', 'Restaurant worker', 'Retail owner', 'Finance/office worker', 'Media creator', 'Film crew', 'Delivery worker', 'Rideshare driver', 'Security', 'Hospitality worker'],
    starterStories: [{
      title: 'Five Borough Hustle',
      backstory: 'A new arrival builds a legal career and business network one shift, borough and customer at a time.',
      roles: ['Worker', 'Entrepreneur', 'Creator', 'Courier'],
      chapters: ['Find the first shift', 'Learn the transit network', 'Build customer reputation', 'Claim a storefront', 'Expand to a second borough']
    }],
    businessAdapter: 'NYC/New York licensing and verified business adapter',
    civicAdapter: 'NYC borough/New York jurisdiction adapter'
  }
]

export const GLOBAL_TRAVEL_LINKS: Record<LaunchRegionId, LaunchRegionId[]> = {
  'detroit-mi': ['st-louis-mo', 'new-york-city-ny', 'atlanta-ga'],
  'st-louis-mo': ['detroit-mi', 'tennessee-hub', 'atlanta-ga'],
  'tennessee-hub': ['st-louis-mo', 'atlanta-ga', 'florida-hub'],
  'san-diego-ca': ['hollywood-ca', 'ventura-county-ca', 'san-jose-ca'],
  'hollywood-ca': ['north-hollywood-ca', 'encino-havenhurst-ca', 'ventura-county-ca', 'san-diego-ca'],
  'san-jose-ca': ['hollywood-ca', 'ventura-county-ca', 'san-diego-ca'],
  'north-hollywood-ca': ['hollywood-ca', 'encino-havenhurst-ca', 'ventura-county-ca'],
  'ventura-county-ca': ['hollywood-ca', 'north-hollywood-ca', 'san-jose-ca'],
  'encino-havenhurst-ca': ['hollywood-ca', 'north-hollywood-ca', 'ventura-county-ca'],
  'atlanta-ga': ['tennessee-hub', 'florida-hub', 'new-york-city-ny', 'st-louis-mo'],
  'florida-hub': ['atlanta-ga', 'tennessee-hub', 'new-york-city-ny'],
  'new-york-city-ny': ['detroit-mi', 'atlanta-ga', 'florida-hub']
}
