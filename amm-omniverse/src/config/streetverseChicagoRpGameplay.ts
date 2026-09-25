export type RpMissionChoice='A'|'B'|'C'
export type ChicagoRpEventType='community'|'creator'|'business'|'mobility'|'vehicle'|'sports'|'nightlife'|'resilience'|'mystery'|'faith'

export const STREETVERSE_RP_CHOICE_MODEL={
  A:{label:'ACTION',description:'Physical gameplay, driving, rescue, timed objective or high-energy route.'},
  B:{label:'BUILD / BUSINESS',description:'Commerce, negotiation, repair, delivery, ownership, team or community route.'},
  C:{label:'LEARN / TEST',description:'Lesson, investigation, puzzle, skill test, certification or knowledge route.'},
} as const

export const STREETVERSE_CHICAGO_EVENT_MODEL={
  alwaysOn:{
    neighborhoodMicroEvents:1,
    activeCityEvent:1,
    playerTriggeredEvents:true,
  },
  weeklyMajorEvent:1,
  eventFamilies:[
    {id:'creator-night',type:'creator' as ChicagoRpEventType,label:'Chicago Creator Night',loops:['perform','record','reel','live','sponsor']},
    {id:'business-day',type:'business' as ChicagoRpEventType,label:'Neighborhood Business Day',loops:['scout','open-store','deliver','promote','sell']},
    {id:'transit-rush',type:'mobility' as ChicagoRpEventType,label:'Transit Rush',loops:['L-operator','commute','transfer','accessibility','delivery']},
    {id:'car-culture',type:'vehicle' as ChicagoRpEventType,label:'Chicago Car Culture & Salvage Expo',loops:['show','repair','salvage','auction','sanctioned-race']},
    {id:'lakefront-fest',type:'community' as ChicagoRpEventType,label:'Lakefront Community Festival',loops:['food','music','sports','creator','family']},
    {id:'after-dark',type:'nightlife' as ChicagoRpEventType,label:'After Dark',loops:['venue','creator','rideshare','security','social']},
    {id:'resilience-week',type:'resilience' as ChicagoRpEventType,label:'OmniResilience Recovery Week',loops:['supplies','transit','business-recovery','truth-check','community-aid']},
    {id:'city-mystery',type:'mystery' as ChicagoRpEventType,label:'Chicago City Mystery',loops:['clues','interviews','vertical-layers','choice','reveal']},
    {id:'sports-weekend',type:'sports' as ChicagoRpEventType,label:'Chicago Sports Weekend',loops:['basketball','track','creator','crowd','business']},
    {id:'faith-community',type:'faith' as ChicagoRpEventType,label:'Faith & Community Day',loops:['service','music','community','food','creator']},
  ],
} as const

export const STREETVERSE_RP_PROGRESSION={
  bonds:{
    persistent:true,
    categories:['resident','crew','family','business','mentor','creator','neighborhood'],
    unlocks:['dialogue','discounts','missions','crew-assists','business-intros','safehouse-access','story-scenes'],
  },
  permanentBoosts:[
    {id:'city-memory',label:'City Memory',effect:'Previously discovered routes and public connectors remain revealed.'},
    {id:'trusted-local',label:'Trusted Local',effect:'Higher relationship starting point with allied neighborhood NPCs.'},
    {id:'creator-instinct',label:'Creator Instinct',effect:'Additional highlight markers after major mission moments.'},
    {id:'wheelman',label:'Wheelman',effect:'Improved game handling assist and faster vehicle familiarity progression.'},
    {id:'merchant-network',label:'Merchant Network',effect:'Additional business introductions and sourcing opportunities.'},
    {id:'transit-master',label:'Transit Master',effect:'Faster in-game route planning between unlocked transit nodes.'},
    {id:'resilience-trained',label:'Resilience Trained',effect:'Additional crisis-response mission options and preparation bonuses.'},
  ],
  rule:'Permanent boosts improve convenience, access or roleplay depth; they must not create pay-to-win real-money advantages.',
} as const

export const STREETVERSE_EASTER_EGGS={
  categories:['Chicago-history-inspired','TRYAMM-lore','family-legacy','music','science-fiction','vertical-city','creator','resilience'],
  rewardTypes:['cosmetic','lore-card','secret-room','alternate-dialogue','mission-variant','title','vehicle-livery','creator-prop'],
  permanentDiscoveryLog:true,
  noRestrictedRealWorldAccessDirections:true,
} as const

export const STREETVERSE_VEHICLE_SALVAGE={
  inWorldName:'StreetVerse Chop Shop / Salvage Garage',
  publicSystemLabel:'Vehicle Salvage & Custom Garage',
  vehicleSources:['player-owned','mission-tagged-fictional','auction','abandoned-game-world','insurance-salvage-simulation'],
  actions:['inspect','tow','repair','rebuild','customize','part-out','sell-parts','auction','resell-rebuilt'],
  economy:'server-authoritative',
  rules:[
    'No real-world VIN tampering instructions.',
    'No real-world theft or evasion guidance.',
    'Vehicles and ownership states are fictional game data.',
    'Sale, payout and inventory values are server-authoritative.',
  ],
} as const

export const STREETVERSE_ONE_HAND_RP={
  supportedSides:['left','right'],
  minimumTouchTargetPx:52,
  quickActions:['INTERACT','MISSION','PHONE','VEHICLE','EMOTE','CAMERA'],
  assists:['auto-run','camera-recenter','nearest-interactable-focus','hold-to-open-action-wheel','voice-command-hook','reduced-motion'],
  choiceButtons:['A','B','C'] as RpMissionChoice[],
} as const
