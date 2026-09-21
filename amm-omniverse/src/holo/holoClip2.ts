export type HoloClipSurface = 'FOUNDER_DASHBOARD' | 'STREETVERSE' | 'LIVE' | 'PK' | 'REELS' | 'CREATOR_STUDIO' | 'VERSE_DIRECTORY'

export interface HoloClip2DisplayProfile {
  id: 'HOLO_CLIP_2'
  mode: 'SOFTWARE_DISPLAY' | 'DEVICE_COMPANION'
  surfaces: readonly HoloClipSurface[]
  carousel: boolean
  liveVideo: boolean
  pkPanels: boolean
  spatialDepthEffects: boolean
  parallaxEffects: boolean
  webXRWhenSupported: boolean
  fallback2D: boolean
}

export const HOLO_CLIP_2_DISPLAY: HoloClip2DisplayProfile = Object.freeze({
  id: 'HOLO_CLIP_2',
  mode: 'SOFTWARE_DISPLAY',
  surfaces: ['FOUNDER_DASHBOARD','STREETVERSE','LIVE','PK','REELS','CREATOR_STUDIO','VERSE_DIRECTORY'] as const,
  carousel: true,
  liveVideo: true,
  pkPanels: true,
  spatialDepthEffects: true,
  parallaxEffects: true,
  webXRWhenSupported: true,
  fallback2D: true,
})

export const TRYAMM_VERSE_DIRECTORY = Object.freeze([
  {id:'FAITHVERSE',label:'FaithVerse',route:'/faithverse',status:'BUILDING',purpose:'Holographic Ethiopian Bible, Living Book Engine, study, education and Kingdom HoloPress'},
  {id:'STREETVERSE',label:'StreetVerse',route:'/streetverse',status:'LIVE',purpose:'Living cities, missions, mobility, businesses and creator economy'},
  {id:'PROPERTYVERSE',label:'PropertyVerse',route:'/propertyverse',status:'BUILDING',purpose:'Real estate, home flipping, housing, land, farms, rentals, Digital Twins and property services'},
  {id:'HOLOVERSE',label:'HoloVerse',route:'/holoverse',status:'BUILDING',purpose:'Holographic experiences, Benny, HoloGPT, spatial LIVE and interfaces'},
  {id:'MUSICVERSE',label:'MusicVerse',route:'/musicverse',status:'BUILDING',purpose:'Aniyah 64-Track Studio, Holo Music, artists, concerts, rights and music commerce'},
  {id:'STARVERSE',label:'StarVerse — Anyone Can Be a Star',route:'/starverse',status:'BUILDING',purpose:'Isaiah AI talent discovery, auditions, competitions, creator development and entertainment'},
  {id:'SPACEVERSE',label:'SpaceVerse',route:'/spaceverse',status:'BUILDING',purpose:'Space, astronomy, planets, exploration and simulation'},
  {id:'CYBERVERSE',label:'CyberVerse — Jacobie Vision',route:'/cyberverse',status:'BUILDING',purpose:'Defensive cybersecurity, education, challenges, business security and workforce pathways'},
  {id:'CREATORVERSE',label:'CreatorVerse',route:'/creatorverse',status:'BUILDING',purpose:'Reels, movies, Holo Drama, Creator Studio and publishing'},
  {id:'SPORTVERSE',label:'SportVerse',route:'/sportverse',status:'BUILDING',purpose:'Sports, training, tournaments and interactive games'},
  {id:'BUSINESSVERSE',label:'BusinessVerse',route:'/businessverse',status:'BUILDING',purpose:'Business Passport, Digital Twins, Holo Ads and business services'},
  {id:'MARKETPLACEVERSE',label:'MarketplaceVerse',route:'/marketplace',status:'BUILDING',purpose:'Stores, virtual warehouse, storage, cold vault, delivery and commerce'},
  {id:'EDUCATIONVERSE',label:'EducationVerse',route:'/educationverse',status:'BUILDING',purpose:'All American University, lessons, testing, simulations and credentials'},
  {id:'GAMEVERSE',label:'GameVerse',route:'/gameverse',status:'BUILDING',purpose:'Missions, racing, fighting, investigations and tournaments'},
  {id:'MIDDLEVERSE',label:'Middleverse',route:'/middleverse',status:'BUILDING',purpose:'Jobs, workforce training, AI call center, education and real-world opportunity'},
  {id:'METAVERSE',label:'Metaverse',route:'/metaverse',status:'BUILDING',purpose:'Shared immersive identity, avatar, social, commerce and world infrastructure'},
  {id:'MULTIVERSE',label:'Multiverse',route:'/multiverse',status:'BUILDING',purpose:'Alternate realities, story states and connected versions of worlds'},
  {id:'TIME_MACHINE',label:'Time Machine',route:'/time-machine',status:'BUILDING',purpose:'Historical, present and future world-state traversal'},
  {id:'LEGACYVERSE',label:'LegacyVerse',route:'/legacyverse',status:'PLANNED',purpose:'Family legacy, IP, estate organization, businesses and generational continuity'},
  {id:'KINGDOM',label:'Kingdom',route:'/kingdom',status:'BUILDING',purpose:'Faith, community and Kingdom experiences connected to FaithVerse'},
  {id:'MY_WORLD',label:'My World',route:'/my-world',status:'BUILDING',purpose:'Personal customizable world'},
  {id:'WE_ARE_THE_WORLD',label:'We Are the World',route:'/we-are-the-world',status:'BUILDING',purpose:'Global culture, community and shared experiences'},
  {id:'OMNIVERSE',label:'Omniverse',route:'/',status:'LIVE',purpose:'Top-level TRYAMM universe and navigation fabric'},
] as const)

export const TRYAMM_CROSS_VERSE_SYSTEMS = Object.freeze([
  {id:'VERSE_PASSPORT',label:'Verse Passport',purpose:'Shared identity, avatar, accessibility, friends, achievements, XP, profiles, inventory and entitlements'},
  {id:'ANIYAH_CROSS_BORDER',label:'Aniyah Cross-Border Payments',purpose:'Regulated-provider payment orchestration with server verification and authoritative ledger recording'},
  {id:'GLOBAL_STAYS',label:'Global Stays',purpose:'Lodging and property marketplace connections'},
  {id:'GLOBAL_MOBILITY',label:'Global Mobility',purpose:'Vehicle sharing, rental, rideshare and transportation connections'},
  {id:'FAMILY_LEGACY',label:'Family Legacy Center',purpose:'Secure legacy, IP, business and estate organization'},
  {id:'BENNY_NAVIGATOR',label:'Benny Verse Navigator',purpose:'Intent to Verse, universe, location, era and activity routing'},
] as const)

export const HOLOGRAPHIC_CAROUSEL_PANELS = Object.freeze([
  'FAITHVERSE',
  'CHARACTERS',
  'MISSIONS',
  'LIVE',
  'PK',
  'REELS',
  'STREETVERSE_WORLD',
  'VERSE_DIRECTORY',
  'TIME_MACHINE',
  'WORLD_DATA',
  'CREATOR_COMMERCE',
  'BENNY_HOLOGPT',
  'RELEASE_CENTER',
] as const)

export const HOLO_CLIP_2_INTERACTION = Object.freeze({
  swipeToRotate: true,
  tapToFocus: true,
  pinchToScale: true,
  voiceIntent: true,
  accessibilityControls: true,
  reducedMotionSupported: true,
  keyboardNavigation: true,
  screenReaderLabelsRequired: true,
})

export const HOLO_CLIP_2_LIVE_POLICY = Object.freeze({
  liveTransportRequiresProvider: true,
  pkRequiresAuthenticatedRoom: true,
  recordingRequiresUserAction: true,
  cameraMicrophoneRequirePermission: true,
  guestConsentRequired: true,
  clientMaySettleGiftsOrCash: false,
  serverVerificationRequiredForEconomicEvents: true,
})

export const HOLO_CLIP_DEVICE_BRIDGE = Object.freeze({
  physicalDeviceStatus: 'CONCEPT_UNVERIFIED',
  softwarePrototypeMayShipFirst: true,
  bluetoothAdapterReserved: true,
  usbAdapterReserved: true,
  localNetworkAdapterReserved: true,
  deviceProtocolMustBeDocumentedAndTested: true,
  noHardwareCapabilityClaimWithoutDeviceEvidence: true,
})
