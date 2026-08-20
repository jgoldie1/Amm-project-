export type LakefrontZone = {
  id: string
  name: string
  activities: string[]
  jobs: string[]
  secrets: string[]
}

export const CHICAGO_LAKEFRONT_ZONES: LakefrontZone[] = [
  { id:'lsd-drive', name:'Lake Shore Drive Corridor', activities:['scenic driving','traffic missions','rideshare','bike events','night cruising','weather transitions'], jobs:['traffic coordinator','rideshare driver','roadside assistance','event transport'], secrets:['midnight skyline route','hidden photo overlook'] },
  { id:'lakefront-beaches', name:'Lakefront Beaches', activities:['swimming simulation','volleyball','fitness','food vendors','music pop-ups','sunset events'], jobs:['lifeguard simulation','vendor','security','event staff','cleanup crew'], secrets:['sunrise challenge','lost-and-found story chain'] },
  { id:'navy-pier-style', name:'Pier & Entertainment District', activities:['rides','food','live shows','boat tours','creator events','family attractions'], jobs:['ride operator','tour guide','restaurant worker','performer','maintenance'], secrets:['after-hours attraction','hidden performer audition'] },
  { id:'harbors', name:'Harbors & Marina Network', activities:['boat ownership','charters','fishing','sailing','water taxi','marine rescue'], jobs:['captain','deckhand','mechanic','dock worker','tour operator'], secrets:['night harbor signal','rare boat unlock'] },
  { id:'festival-mile', name:'Summer Festival Mile', activities:['concerts','food festivals','art fairs','sports activations','brand events','creator markets'], jobs:['promoter','stagehand','artist','vendor','security','AV crew','cleanup'], secrets:['VIP creator stage','underground radio broadcast'] },
]

export const LAKEFRONT_SUMMER_EVENTS = [
  'Sunrise fitness series',
  'Lakefront food and creator market',
  'Chicago music weekend',
  'Night ride and car culture showcase',
  'Beach sports tournament',
  'Boat and water-taxi missions',
  'Fireworks and synchronized city event',
  'Storm-response emergency scenario',
  'Family museum-to-lakefront discovery route',
] as const

export const LAKEFRONT_WORLD_EFFECTS = {
  seasonalCrowds: true,
  dynamicWeather: true,
  trafficDemand: true,
  businessDemandBoost: true,
  tourismJobs: true,
  creatorStreamingMoments: true,
  policeFireEmsDispatch: true,
  multiplayerEvents: true,
  accessibilityAlternateRoutes: true,
} as const
