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
  {id:'STREETVERSE',label:'StreetVerse',route:'/streetverse'},
  {id:'PROPERTYVERSE',label:'PropertyVerse',route:'/propertyverse'},
  {id:'STARVERSE',label:'StarVerse',route:'/starverse'},
  {id:'SPORTVERSE',label:'SportVerse',route:'/sportverse'},
  {id:'MIDDLEVERSE',label:'Middleverse',route:'/middleverse'},
  {id:'KINGDOM',label:'Kingdom',route:'/kingdom'},
  {id:'MY_WORLD',label:'My World',route:'/my-world'},
  {id:'WE_ARE_THE_WORLD',label:'We Are the World',route:'/we-are-the-world'},
  {id:'HOLOVERSE',label:'Holoverse',route:'/holoverse'},
  {id:'OMNIVERSE',label:'Omniverse',route:'/'},
] as const)

export const HOLOGRAPHIC_CAROUSEL_PANELS = Object.freeze([
  'CHARACTERS',
  'MISSIONS',
  'LIVE',
  'PK',
  'REELS',
  'STREETVERSE_WORLD',
  'VERSE_DIRECTORY',
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
