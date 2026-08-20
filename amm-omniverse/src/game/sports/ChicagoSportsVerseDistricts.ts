export type SportsVerseDistrict = {
  id: string
  referenceName: string
  sport: string[]
  districtRole: string
  jobs: string[]
  missions: string[]
  eventEffects: string[]
  rightsMode: 'location-reference' | 'licensed-content-required'
}

// Venue names are geographic/cultural references. Team marks, player likenesses,
// league footage, uniforms and other protected commercial assets remain rights-gated.
export const CHICAGO_SPORTSVERSE_DISTRICTS: SportsVerseDistrict[] = [
  {
    id: 'soldier-field', referenceName: 'Soldier Field', sport: ['football','soccer','major events'],
    districtRole: 'Lakefront stadium and event anchor',
    jobs: ['event operations','security','EMS','food service','rideshare','parking','broadcast crew','hospitality'],
    missions: ['Game Day Gridlock','Lakefront Tailgate Economy','Night Match Broadcast','Stadium Emergency Drill'],
    eventEffects: ['lakefront traffic surge','hotel demand','vendor demand','transit surge','creator audience surge'],
    rightsMode: 'location-reference',
  },
  {
    id: 'united-center', referenceName: 'United Center', sport: ['basketball','hockey','concerts'],
    districtRole: 'West Side arena economy',
    jobs: ['arena operations','concessions','security','broadcast','merchandise','transportation','hospitality'],
    missions: ['Arena Rush','Courtside Creator Night','Concert Changeover','West Side Vendor Run'],
    eventEffects: ['rideshare demand','restaurant demand','merchandise demand','nightlife traffic'],
    rightsMode: 'location-reference',
  },
  {
    id: 'rate-field', referenceName: 'Rate Field / South Side baseball district', sport: ['baseball'],
    districtRole: 'South Side baseball and neighborhood commerce anchor',
    jobs: ['stadium staff','vendors','parking','security','broadcast','food service','transportation'],
    missions: ['South Side Game Day','Vendor Supply Run','Extra Innings Transit','Neighborhood Watch Party'],
    eventEffects: ['local foot traffic','food demand','parking demand','creator content'],
    rightsMode: 'location-reference',
  },
  {
    id: 'wrigley-field', referenceName: 'Wrigley Field / Wrigleyville', sport: ['baseball','concerts'],
    districtRole: 'North Side stadium, nightlife and tourism district',
    jobs: ['hospitality','restaurants','security','vendors','broadcast','rideshare','tourism'],
    missions: ['Red Line Game Day','Wrigleyville Night Shift','Rooftop Broadcast','Concert Weekend'],
    eventEffects: ['CTA surge','nightlife surge','hotel demand','tourism','restaurant demand'],
    rightsMode: 'location-reference',
  },
]

export const SPORTSVERSE_BEACH_EVENTS = [
  'North Avenue Beach volleyball tournament',
  'Lakefront 5K and marathon training missions',
  'Beach soccer weekend',
  'Adaptive sports festival',
  'Youth sports clinic with synthetic NPC participants',
  'Jet ski and sailing time trials where permitted by the game rules',
  'Creator fitness livestream challenge',
] as const

export const SPORTS_EVENT_ECONOMY = [
  'EVENT SCHEDULE',
  'FANS + TOURISTS ARRIVE',
  'TRAFFIC + TRANSIT LOAD CHANGES',
  'RIDESHARE + PARKING + HOTEL DEMAND',
  'VENDOR + RESTAURANT SALES',
  'SECURITY + EMS + EVENT JOBS',
  'CREATOR + BROADCAST CONTENT',
  'ALL AMERICAN MARKETPLACE TRANSACTIONS',
  'WORLD MEMORY RECORDS THE EVENT AND PLAYER ROLE',
] as const
