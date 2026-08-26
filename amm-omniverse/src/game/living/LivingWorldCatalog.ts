export type MobilityClass = 'street'|'luxury'|'performance'|'utility'|'accessible'|'marine'
export type AnimalClass = 'pet'|'urban'|'farm'|'wildlife'|'bird'|'marine'

export type MobilityAsset = {
  id: string
  name: string
  class: MobilityClass
  topSpeed: number
  seats: number
  ownedDesign: boolean
  commercialReady: boolean
  gameplayRoles: string[]
}

export type AnimalAsset = {
  id: string
  name: string
  class: AnimalClass
  behavior: string[]
  commercialReady: boolean
}

// Original/generic names are intentional. Production art must remain owned,
// licensed, public-domain, or provenance-tracked before commercial release.
export const MOBILITY_CATALOG: MobilityAsset[] = [
  { id:'amm-lowrider', name:'AMM Lowrider Classic', class:'street', topSpeed:120, seats:4, ownedDesign:true, commercialReady:true, gameplayRoles:['cruise','missions','car-shows','reels'] },
  { id:'quantum-gt', name:'Quantum GT', class:'performance', topSpeed:205, seats:2, ownedDesign:true, commercialReady:true, gameplayRoles:['racing','delivery','sponsored-events','reels'] },
  { id:'saturn-lux', name:'Saturn Executive', class:'luxury', topSpeed:175, seats:5, ownedDesign:true, commercialReady:true, gameplayRoles:['vip-rides','business','nightlife','product-placement'] },
  { id:'judah-suv', name:'Judah Grand SUV', class:'luxury', topSpeed:155, seats:7, ownedDesign:true, commercialReady:true, gameplayRoles:['family','escort','tourism','commerce'] },
  { id:'omnivan-access', name:'Omni Access Van', class:'accessible', topSpeed:110, seats:6, ownedDesign:true, commercialReady:true, gameplayRoles:['accessible-travel','jobs','medical-transport','missions'] },
  { id:'holo-service', name:'Holo Service Truck', class:'utility', topSpeed:105, seats:3, ownedDesign:true, commercialReady:true, gameplayRoles:['repairs','telecom','delivery','grid-missions'] },
  { id:'lake-runner', name:'Lake Runner Sport Boat', class:'marine', topSpeed:75, seats:6, ownedDesign:true, commercialReady:true, gameplayRoles:['water-racing','tourism','rescue','reels'] },
  { id:'saturn-yacht', name:'Saturn Horizon Yacht', class:'marine', topSpeed:42, seats:14, ownedDesign:true, commercialReady:true, gameplayRoles:['vip-events','streaming','sponsorships','creator-parties'] },
  { id:'omni-ferry', name:'Omni City Ferry', class:'marine', topSpeed:28, seats:80, ownedDesign:true, commercialReady:true, gameplayRoles:['public-transit','tourism','jobs','city-events'] },
]

export const ANIMAL_CATALOG: AnimalAsset[] = [
  { id:'dog', name:'Dog', class:'pet', behavior:['follow','sit','wander','react-to-player'], commercialReady:true },
  { id:'cat', name:'Cat', class:'pet', behavior:['wander','rest','avoid-traffic','react-to-player'], commercialReady:true },
  { id:'pigeon', name:'Pigeon', class:'bird', behavior:['flock','land','scatter','perch'], commercialReady:true },
  { id:'hawk', name:'Hawk', class:'bird', behavior:['circle','perch','depart'], commercialReady:true },
  { id:'deer', name:'Deer', class:'wildlife', behavior:['graze','flee','herd'], commercialReady:true },
  { id:'horse', name:'Horse', class:'farm', behavior:['idle','walk','run','race'], commercialReady:true },
  { id:'fish-school', name:'Lake Fish', class:'marine', behavior:['school','scatter','depth-change'], commercialReady:true },
  { id:'duck', name:'Duck', class:'bird', behavior:['swim','flock','land','takeoff'], commercialReady:true },
]

export const LIVING_WORLD_GAMEPLAY_LOOPS = [
  'walk-drive-boat-travel',
  'traffic-and-pedestrian-ambient-life',
  'animal-ambient-ai',
  'missions-and-sponsored-challenges',
  'racing-and-water-events',
  'creator-clip-capture',
  'marketplace-product-placement',
  'jobs-and-service-dispatch',
  'nightlife-and-live-events',
  'xp-reputation-and-server-verified-rewards',
] as const
