export type IllinoisRegionId = 'chicago' | 'mount-vernon' | 'herrin' | 'peoria' | 'greenville'

export type RegionProfile = {
  id: IllinoisRegionId
  name: string
  county: string
  identity: string
  anchors: string[]
  jobs: string[]
  missionArcs: MissionArc[]
  deathAuthority: { kind: 'medical-examiner' | 'coroner'; label: string }
}

export type MissionArc = {
  id: string
  title: string
  backstory: string
  roles: string[]
  chapters: string[]
  rewards: string[]
}

export const ILLINOIS_REGIONS: RegionProfile[] = [
  {
    id: 'chicago',
    name: 'Chicago Edition',
    county: 'Cook County',
    identity: 'Dense global city: neighborhoods, nightlife, culture, commerce, transit, courts, city services and a living creator economy.',
    anchors: ['Downtown core', 'Neighborhood commercial corridors', 'StreetVerse District 01', 'Museums and immersive attractions', 'Transit hubs', 'Lakefront and parks'],
    jobs: ['Police officer', '911 dispatcher', 'Fire/EMS', 'CTA-style transit operator', 'Attorney', 'Court clerk', 'Public defender', 'Prosecutor', 'Building inspector', 'Restaurant operator', 'Retail owner', 'Creator/performer', 'Delivery driver', 'Rideshare driver', 'Security professional', 'Funeral director', 'Death-care transport', 'Cemetery services'],
    deathAuthority: { kind: 'medical-examiner', label: 'Cook County Medical Examiner pathway' },
    missionArcs: [
      {
        id: 'chi-second-shift',
        title: 'Second Shift Chicago',
        backstory: 'A neighborhood commercial strip is losing foot traffic after several closures. Players rebuild trust through legitimate jobs, events, inspections, deliveries and creator programming.',
        roles: ['Business owner', 'Courier', 'Inspector', 'Creator', 'Security', 'Transit operator'],
        chapters: ['Survey the block', 'Help three storefronts reopen', 'Run a safe night event', 'Resolve a transit disruption', 'Reach sustainable customer traffic'],
        rewards: ['District reputation', 'Storefront upgrades', 'Job referrals', 'Creator venue unlocks']
      },
      {
        id: 'chi-evidence-matters',
        title: 'Evidence Matters',
        backstory: 'A synthetic city incident tests whether players can preserve evidence, protect civilians and move a case through the correct legal process without shortcutting due process.',
        roles: ['Officer', 'Dispatcher', 'Detective', 'Attorney', 'Court clerk'],
        chapters: ['Dispatch response', 'Scene safety', 'Evidence review', 'Charging decision', 'Court outcome'],
        rewards: ['Civic XP', 'Justice-career reputation', 'Advanced dispatch missions']
      }
    ]
  },
  {
    id: 'mount-vernon',
    name: 'Mount Vernon',
    county: 'Jefferson County',
    identity: 'Southern Illinois regional hub with logistics, healthcare, small business, public service and interstate travel missions.',
    anchors: ['Downtown', 'Regional retail and service corridors', 'Healthcare', 'Interstate/logistics routes', 'Jefferson County civic services'],
    jobs: ['Small business owner', 'Truck/dispatch operator', 'Warehouse worker', 'Healthcare support', 'Sheriff/county public safety', 'Coroner transport', 'Funeral services', 'Mechanic', 'Property services', 'Restaurant worker'],
    deathAuthority: { kind: 'coroner', label: 'Jefferson County Coroner pathway' },
    missionArcs: [
      {
        id: 'mv-crossroads',
        title: 'Crossroads Economy',
        backstory: 'A family logistics business is one missed contract away from closing. Players can save it through dispatching, vehicle maintenance, supplier negotiations and customer service.',
        roles: ['Dispatcher', 'Driver', 'Mechanic', 'Business manager'],
        chapters: ['Recover the route', 'Repair the fleet', 'Win a regional delivery contract', 'Hire two local workers', 'Expand to another Illinois region'],
        rewards: ['Fleet slot', 'Regional trade route', 'Business reputation']
      }
    ]
  },
  {
    id: 'herrin',
    name: 'Herrin',
    county: 'Williamson County',
    identity: 'Community-focused Southern Illinois world centered on schools, youth sports, local commerce, construction, healthcare and county services.',
    anchors: ['Herrin commercial areas', 'Schools and sports facilities', 'Parks', 'Williamson County services', 'Regional healthcare and trades'],
    jobs: ['Coach', 'Sports official', 'Retail owner', 'Restaurant worker', 'Construction trade', 'Home services', 'County public safety', 'Coroner transport', 'Funeral services', 'Media creator'],
    deathAuthority: { kind: 'coroner', label: 'Williamson County Coroner pathway' },
    missionArcs: [
      {
        id: 'herrin-friday-night',
        title: 'Friday Night Build-Up',
        backstory: 'A major community sports weekend becomes a full local-economy event. Players coordinate vendors, traffic, security, media, hospitality and cleanup.',
        roles: ['Coach', 'Vendor', 'Security', 'Creator', 'Traffic coordinator', 'Restaurant operator'],
        chapters: ['Prepare the venue', 'Approve vendors', 'Move the crowd safely', 'Cover the event', 'Close and clean the district'],
        rewards: ['Community reputation', 'Sports missions', 'Vendor traffic boost']
      }
    ]
  },
  {
    id: 'peoria',
    name: 'Peoria',
    county: 'Peoria County',
    identity: 'Central Illinois river-city economy with healthcare, manufacturing, logistics, civic careers, culture and regional business.',
    anchors: ['Downtown/riverfront', 'Healthcare', 'Manufacturing/logistics', 'County government', 'Arts and entertainment'],
    jobs: ['Healthcare worker', 'Manufacturing technician', 'Logistics coordinator', 'Coroner office support', 'Morgue coordinator simulation', 'Funeral services', 'Attorney', 'Court staff', 'Small business owner', 'Event producer'],
    deathAuthority: { kind: 'coroner', label: 'Peoria County Coroner and morgue pathway' },
    missionArcs: [
      {
        id: 'peoria-river-shift',
        title: 'River Shift',
        backstory: 'A chain of supply and healthcare missions connects manufacturing, riverfront commerce and emergency response across one long shift.',
        roles: ['Logistics coordinator', 'Technician', 'Healthcare worker', 'Dispatcher'],
        chapters: ['Load the shift', 'Resolve a supply delay', 'Support a hospital delivery', 'Handle an emergency detour', 'Finish the contract'],
        rewards: ['Regional logistics certification', 'Employer reputation', 'New contract board']
      }
    ]
  },
  {
    id: 'greenville',
    name: 'Greenville + University District',
    county: 'Bond County',
    identity: 'College-town and surrounding-area world combining student life, athletics, small business, arts, rural services and regional travel.',
    anchors: ['Greenville University area', 'Athletic facilities', 'Downtown Greenville', 'Bond County government', 'Surrounding rural communities'],
    jobs: ['Student worker', 'Tutor', 'Coach', 'Athletics/event staff', 'Campus safety simulation', 'Restaurant worker', 'Retail owner', 'Creative arts worker', 'Transit driver', 'County services', 'Coroner transport', 'Funeral services'],
    deathAuthority: { kind: 'coroner', label: 'Bond County Coroner pathway' },
    missionArcs: [
      {
        id: 'gu-first-semester',
        title: 'First Semester',
        backstory: 'A new student arrives with limited money, no network and a goal to build a future. Every job, class-support mission, sport, friendship and business decision changes the path forward.',
        roles: ['Student', 'Tutor', 'Athletics staff', 'Creator', 'Part-time worker', 'Entrepreneur'],
        chapters: ['Move in', 'Find a campus job', 'Join a team or organization', 'Help a downtown business', 'Build a portfolio', 'Choose a career pathway'],
        rewards: ['Education XP', 'Career references', 'Internship board', 'Startup storefront eligibility']
      },
      {
        id: 'bond-county-loop',
        title: 'County Loop',
        backstory: 'Students and residents collaborate on a rural-service challenge that requires transit, small business, public safety and community support across the surrounding area.',
        roles: ['Transit driver', 'Volunteer', 'Business owner', 'County worker'],
        chapters: ['Map the service gap', 'Move supplies', 'Support a local event', 'Connect residents', 'Report the outcome'],
        rewards: ['County reputation', 'Rural route unlock', 'Community job board']
      }
    ]
  }
]

export function getIllinoisRegion(id: IllinoisRegionId) {
  return ILLINOIS_REGIONS.find(region => region.id === id) ?? ILLINOIS_REGIONS[0]
}

export const REGIONAL_TRAVEL_GRAPH: Record<IllinoisRegionId, IllinoisRegionId[]> = {
  chicago: ['peoria', 'greenville', 'mount-vernon'],
  peoria: ['chicago', 'greenville'],
  greenville: ['chicago', 'peoria', 'mount-vernon', 'herrin'],
  'mount-vernon': ['greenville', 'herrin', 'chicago'],
  herrin: ['mount-vernon', 'greenville']
}
