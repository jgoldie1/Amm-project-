export type TryammOrganId =
  | 'brain' | 'nervous-system' | 'heart' | 'memory' | 'circulation'
  | 'creator-hands' | 'media-senses' | 'muscles' | 'reflexes' | 'immune-system'
  | 'infrastructure' | 'supply-chain' | 'logistics' | 'business-network'
  | 'education-career' | 'faith-culture' | 'legacy'

export type TryammOrgan = {
  id: TryammOrganId
  name: string
  systems: string[]
  brings: string
  alphaCritical: boolean
}

export const TRYAMM_SYSTEM_ORGANS: TryammOrgan[] = [
  {id:'brain',name:'HoloGPT + HoloOS',systems:['HoloGPT','HoloOS','Command Nexus'],brings:'Intent routing, orchestration and human-approved automation.',alphaCritical:true},
  {id:'nervous-system',name:'Holo FON + Holo Chirp',systems:['Holo FON','Holo Chirp','translation','captions'],brings:'Calls, messaging, push-to-talk, squad and business dispatch communication.',alphaCritical:true},
  {id:'heart',name:'StreetVerse',systems:['Chicago','Living City','missions','NPCs','traffic','vehicles','Quantum Tower'],brings:'The playable living-world hub where the ecosystem meets.',alphaCritical:true},
  {id:'memory',name:'Passport + Time Machine',systems:['Passport','relationships','progress','Time Machine','Living City history'],brings:'Identity, permissions, continuity, history and consequence snapshots.',alphaCritical:true},
  {id:'circulation',name:'Commerce + Ledgers',systems:['Marketplace','payments','rewards','commissions','payout ledger'],brings:'Server-authoritative value movement and verified earnings.',alphaCritical:true},
  {id:'creator-hands',name:'Creator + HoloForge',systems:['HoloForge','Reel Composer','Creator Studio','long-form production'],brings:'Authorized asset, reel, video and world creation.',alphaCritical:true},
  {id:'media-senses',name:'Media Network',systems:['Isaiah AI TV','All American Network','Holo Music','LIVE','PK','podcasts'],brings:'Discovery, performance and distribution.',alphaCritical:false},
  {id:'muscles',name:'Volcano + HoloCube',systems:['Volcano','HoloCube','controllers','accessibility','XR'],brings:'Control and multi-device embodied interaction.',alphaCritical:false},
  {id:'reflexes',name:'Quantum Runtime',systems:['Quantum Speed','Lag Buster'],brings:'Software workload scheduling and responsiveness protection.',alphaCritical:true},
  {id:'immune-system',name:'Guardian + Security',systems:['Guardian QA','moderation','Jacobie Vision','fraud controls','age lanes'],brings:'Release quality, safety, cybersecurity and trust controls.',alphaCritical:true},
  {id:'infrastructure',name:'Runtime Infrastructure',systems:['cloud','cache','streaming','storage','network fallback'],brings:'Resilient execution across constrained and capable devices.',alphaCritical:true},
  {id:'supply-chain',name:'Holo Supply Network',systems:['Holo Fridge','Virtual Warehouse','inventory','wholesale','fulfillment','returns'],brings:'Inventory and fulfillment operations for real businesses.',alphaCritical:false},
  {id:'logistics',name:'Mobility + Delivery',systems:['rideshare','delivery','courier','drone adapters'],brings:'Provider-backed movement of people and goods.',alphaCritical:false},
  {id:'business-network',name:'Business Experience Network',systems:['Business Passport','Digital Twin','Scout Network','Business Server Package'],brings:'Business onboarding, presence, services and monetization.',alphaCritical:false},
  {id:'education-career',name:'Middleverse',systems:['jobs','training','lessons','tests','cyber challenges'],brings:'Playable learning, assessment and job pathways.',alphaCritical:false},
  {id:'faith-culture',name:'FaithVerse',systems:['FaithVerse','Ethiopian Bible experience','culture'],brings:'Dedicated faith and cultural experiences with provenance controls.',alphaCritical:false},
  {id:'legacy',name:'Legacy Worlds',systems:['StarVerse','Isaiah AI','Aniyah Studio','cross-border concepts','Jacobie Vision'],brings:'Shared infrastructure for family, creator and business ventures.',alphaCritical:false},
]

export const STREETVERSE_ALPHA_SPINE = [
  'sign-in',
  'passport',
  'enter-chicago',
  'walk',
  'holo-chirp',
  'vehicle',
  'mission',
  'business-or-npc-interaction',
  'living-city-consequence',
  'server-verified-reward',
  'ledger',
  'reel-capture',
  'share',
  'commerce',
] as const

export const QUANTUM_TOWER_SERVICES = [
  'Command Nexus',
  'HoloGPT',
  'HoloOS',
  'Holo Chirp dispatch',
  'HoloForge',
  'Creator Studio',
  'Time Machine',
  'Holo Lab',
  'Business services',
  'StreetVerse mission control',
] as const

export function alphaCriticalOrgans(){
  return TRYAMM_SYSTEM_ORGANS.filter(organ=>organ.alphaCritical)
}

export function organForSystem(system:string){
  const needle=system.trim().toLowerCase()
  return TRYAMM_SYSTEM_ORGANS.find(organ=>organ.systems.some(item=>item.toLowerCase()===needle))
}
