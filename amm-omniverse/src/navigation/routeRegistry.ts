import type { Screen } from '../game/state/useGameStore'

export type TryammRoute = {
  id: string
  path: string
  label: string
  kind: 'screen' | 'overlay'
  screen?: Screen
  opener?: string
  readiness: 'live' | 'beta'
}

export const TRYAMM_ROUTES: TryammRoute[] = [
  { id:'home', path:'/', label:'Home', kind:'screen', screen:'intro', readiness:'live' },
  { id:'login', path:'/login', label:'Sign In', kind:'screen', screen:'login', readiness:'live' },
  { id:'city', path:'/city', label:'AMM City', kind:'screen', screen:'city', readiness:'live' },
  { id:'sports', path:'/sports', label:'Sports Realm', kind:'screen', screen:'sports', readiness:'live' },
  { id:'marketplace', path:'/marketplace', label:'Marketplace', kind:'screen', screen:'marketplace', readiness:'live' },
  { id:'music', path:'/music', label:'Music Realm', kind:'screen', screen:'music', readiness:'live' },
  { id:'holo-music', path:'/holo-music', label:'Holo Music Streaming', kind:'overlay', opener:'__showHoloMusic', readiness:'beta' },
  { id:'faith', path:'/faith', label:'Faith Realm', kind:'screen', screen:'faith', readiness:'live' },
  { id:'blockchain', path:'/blockchain', label:'Blockchain Realm', kind:'screen', screen:'blockchain', readiness:'beta' },
  { id:'streetverse', path:'/streetverse', label:'StreetVerse', kind:'overlay', opener:'__showPlayableBeta', readiness:'beta' },
  { id:'reel-creator', path:'/reel-creator', label:'Reel Creator', kind:'overlay', opener:'__showMediaStudio', readiness:'beta' },
  { id:'holo-video', path:'/holo-video', label:'Holo Video', kind:'overlay', opener:'__showMediaStudio', readiness:'beta' },
  { id:'all-american-network', path:'/all-american-network', label:'All American Network', kind:'overlay', opener:'__showAllAmericanNetwork', readiness:'beta' },
  { id:'servants-of-christ-network', path:'/servants-of-christ-network', label:'Servants of Christ Network', kind:'overlay', opener:'__showServantsOfChristNetwork', readiness:'beta' },
  { id:'jacobie-vision', path:'/jacobie-vision', label:'Jacobie Vision', kind:'overlay', opener:'__showJacobieVision', readiness:'beta' },
  { id:'holoverse', path:'/holoverse', label:'Holoverse', kind:'overlay', opener:'__showHoloverse', readiness:'beta' },
  { id:'command-nexus', path:'/command-nexus', label:'Command Nexus', kind:'overlay', opener:'__showCommandNexusV2', readiness:'beta' },
  { id:'holo-menu', path:'/holo-menu', label:'Holo Menu', kind:'overlay', opener:'__showCommandNexusV2', readiness:'beta' },
  { id:'holo-lab', path:'/holo-lab', label:'Holo Lab', kind:'overlay', opener:'__showHoloLab', readiness:'beta' },
  { id:'xr', path:'/xr', label:'AR VR Mixed Reality', kind:'overlay', opener:'__showXR', readiness:'beta' },
  { id:'holo-core', path:'/holo-core', label:'Holo Core', kind:'overlay', opener:'__showHoloCore', readiness:'beta' },
  { id:'holo-services', path:'/holo-services', label:'Holo Services', kind:'overlay', opener:'__showHoloServices', readiness:'beta' },
  { id:'holo-ride', path:'/holo-ride', label:'Holo Ride', kind:'overlay', opener:'__showHoloRide', readiness:'beta' },
  { id:'holo-delivery', path:'/holo-delivery', label:'Holo Delivery', kind:'overlay', opener:'__showHoloDelivery', readiness:'beta' },
  { id:'holo-drone', path:'/holo-drone', label:'Holo Drone', kind:'overlay', opener:'__showHoloDrone', readiness:'beta' },
  { id:'omniverse', path:'/omniverse', label:'Omniverse Command Center', kind:'overlay', opener:'__showOmniverse', readiness:'beta' },
  { id:'immersive-worlds', path:'/immersive-worlds', label:'Immersive Worlds', kind:'overlay', opener:'__showImmersiveWorlds', readiness:'beta' },
  { id:'advanced-worlds', path:'/advanced-worlds', label:'Advanced Worlds', kind:'overlay', opener:'__showAdvancedWorlds', readiness:'beta' },
  { id:'kingdoms-press', path:'/kingdoms-press', label:'Kingdoms Press', kind:'overlay', opener:'__showKingdomsPress', readiness:'beta' },
  { id:'ai-cafe', path:'/ai-cafe', label:'AI Cafe', kind:'overlay', opener:'__showAICafe', readiness:'beta' },
  { id:'family-legacy', path:'/family-legacy', label:'Family Legacy', kind:'overlay', opener:'__showFamilyLegacy', readiness:'beta' },
  { id:'quantum-engine', path:'/quantum-engine', label:'Quantum Engine', kind:'overlay', opener:'__showQuantumEngine', readiness:'beta' },
  { id:'security', path:'/security', label:'Security Center', kind:'overlay', opener:'__showSecurityCenter', readiness:'live' },
  { id:'sign-language', path:'/sign-language', label:'Sign Language', kind:'overlay', opener:'__showSignLanguage', readiness:'beta' },
  { id:'omni-access', path:'/omni-access', label:'Omni Access', kind:'overlay', opener:'__showOmniAccess', readiness:'beta' },
  { id:'live', path:'/live', label:'TRYAMM Live', kind:'overlay', opener:'__showTryAMMLive', readiness:'beta' },
  { id:'stream-fx', path:'/stream-fx', label:'Stream Studio FX', kind:'overlay', opener:'__showStreamStudioFX', readiness:'beta' },
  { id:'lag-buster', path:'/lag-buster', label:'Quantum Lag Buster', kind:'overlay', opener:'__showQuantumLagBuster', readiness:'beta' },
  { id:'quantum-beat', path:'/quantum-beat', label:'Quantum Beat', kind:'overlay', opener:'__showQuantumBeat', readiness:'beta' },
  { id:'isaiah-tv', path:'/isaiah-tv', label:'Isaiah AI TV', kind:'overlay', opener:'__showIsaiahTV', readiness:'beta' },
  { id:'pro-audio', path:'/pro-audio', label:'Pro Audio', kind:'overlay', opener:'__showProAudio', readiness:'beta' },
  { id:'pricing', path:'/pricing', label:'Pricing', kind:'overlay', opener:'__showPricing', readiness:'live' },
  { id:'hologpt', path:'/hologpt', label:'HoloGPT', kind:'overlay', opener:'__showHoloGPT', readiness:'beta' },
]

export const ROUTE_BY_PATH = new Map(TRYAMM_ROUTES.map(route => [route.path, route]))
export const PATH_BY_SCREEN = new Map(TRYAMM_ROUTES.filter(r=>r.kind==='screen'&&r.screen).map(r => [r.screen as Screen, r.path]))

export function normalizeRoutePath(value=''){
  const raw=value.replace(/^#/, '').trim() || '/'
  const withSlash=raw.startsWith('/')?raw:`/${raw}`
  return withSlash.length>1?withSlash.replace(/\/$/,''):withSlash
}
