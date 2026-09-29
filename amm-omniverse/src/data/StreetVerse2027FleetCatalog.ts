export type StreetVerse2027VehicleDomain='road'|'motorcycle'|'transit'|'commercial'|'emergency'|'air'|'experimental-air'
export type StreetVerse2027Powertrain='gas'|'diesel'|'hybrid'|'plug-in-hybrid'|'electric'|'hydrogen'|'aviation'|'experimental-electric'

export type StreetVerse2027FleetEntry={
  id:string
  label:string
  domain:StreetVerse2027VehicleDomain
  segment:string
  powertrain:StreetVerse2027Powertrain
  seats:number
  rarity:'common'|'uncommon'|'rare'|'ultra-rare'
  cityRole:string
  accessClass:string
  originalDesign:true
}

const roadSegments=[
  ['micro-hatch','Micro Hatch','compact','hybrid',4],
  ['city-hatch','City Hatch','compact','electric',5],
  ['compact-sedan','Compact Sedan','sedan','hybrid',5],
  ['midsize-sedan','Midsize Sedan','sedan','hybrid',5],
  ['fullsize-sedan','Full-Size Sedan','sedan','electric',5],
  ['sport-sedan','Sport Sedan','performance-sedan','electric',5],
  ['executive-sedan','Executive Sedan','luxury-sedan','plug-in-hybrid',5],
  ['compact-wagon','Compact Wagon','wagon','hybrid',5],
  ['sport-wagon','Sport Wagon','performance-wagon','electric',5],
  ['subcompact-crossover','Subcompact Crossover','crossover','hybrid',5],
  ['compact-crossover','Compact Crossover','crossover','electric',5],
  ['midsize-crossover','Midsize Crossover','crossover','plug-in-hybrid',5],
  ['coupe-crossover','Coupe Crossover','crossover','electric',5],
  ['compact-suv','Compact SUV','suv','hybrid',5],
  ['midsize-suv','Midsize SUV','suv','electric',7],
  ['three-row-suv','Three-Row SUV','suv','hybrid',7],
  ['fullsize-suv','Full-Size SUV','suv','gas',8],
  ['luxury-suv','Luxury SUV','luxury-suv','electric',7],
  ['offroad-suv','Off-Road SUV','offroad-suv','hybrid',5],
  ['compact-pickup','Compact Pickup','pickup','hybrid',5],
  ['midsize-pickup','Midsize Pickup','pickup','gas',5],
  ['fullsize-pickup','Full-Size Pickup','pickup','hybrid',5],
  ['electric-pickup','Electric Pickup','pickup','electric',5],
  ['heavy-duty-pickup','Heavy-Duty Pickup','pickup','diesel',5],
  ['cargo-van','Cargo Van','van','electric',2],
  ['passenger-van','Passenger Van','van','hybrid',8],
  ['minivan','Family Minivan','minivan','plug-in-hybrid',7],
  ['roadster','Electric Roadster','sports-car','electric',2],
  ['sport-coupe','Sport Coupe','sports-car','hybrid',4],
  ['super-coupe','Super Coupe','supercar','hybrid',2],
  ['electric-supercar','Electric Supercar','supercar','electric',2],
  ['grand-tourer','Grand Tourer','luxury-performance','electric',4],
  ['luxury-limo','Luxury Limousine','limousine','electric',6],
  ['rideshare-sedan','Rideshare Sedan','fleet-sedan','hybrid',5],
  ['rideshare-suv','Rideshare SUV','fleet-suv','electric',7],
  ['taxi-hybrid','City Taxi Hybrid','taxi','hybrid',5],
] as const

export const STREETVERSE_2027_FLEET:StreetVerse2027FleetEntry[]=[
  ...roadSegments.map(([id,label,segment,powertrain,seats],i)=>({
    id:`sv27-${id}`,
    label:`TRYAMM 2027 ${label}`,
    domain:'road' as const,
    segment,
    powertrain:powertrain as StreetVerse2027Powertrain,
    seats:Number(seats),
    rarity:i>=28?'uncommon' as const:'common' as const,
    cityRole:'civilian/private/rideshare',
    accessClass:segment.includes('sedan')?'sedan':segment.includes('coupe')?'coupe':segment.includes('wagon')?'wagon':segment.includes('crossover')?'crossover':segment.includes('suv')?'suv':segment.includes('pickup')?'pickup':segment.includes('van')?'van':segment==='taxi'?'taxi':'car',
    originalDesign:true as const,
  })),
  {id:'sv27-sport-bike',label:'TRYAMM 2027 Sport Motorcycle',domain:'motorcycle',segment:'sport-bike',powertrain:'electric',seats:2,rarity:'uncommon',cityRole:'personal mobility',accessClass:'sport-bike',originalDesign:true},
  {id:'sv27-cruiser-bike',label:'TRYAMM 2027 Cruiser Motorcycle',domain:'motorcycle',segment:'cruiser',powertrain:'hybrid',seats:2,rarity:'uncommon',cityRole:'personal mobility',accessClass:'cruiser-bike',originalDesign:true},
  {id:'sv27-adventure-bike',label:'TRYAMM 2027 Adventure Motorcycle',domain:'motorcycle',segment:'adventure',powertrain:'electric',seats:2,rarity:'uncommon',cityRole:'personal/off-road mobility',originalDesign:true},
  {id:'sv27-scooter',label:'TRYAMM 2027 Urban Scooter',domain:'motorcycle',segment:'scooter',powertrain:'electric',seats:2,rarity:'common',cityRole:'last-mile mobility',accessClass:'scooter',originalDesign:true},
  {id:'sv27-delivery-bike',label:'TRYAMM 2027 Delivery Motorcycle',domain:'motorcycle',segment:'delivery-bike',powertrain:'electric',seats:1,rarity:'uncommon',cityRole:'delivery',accessClass:'motorcycle',originalDesign:true},
  {id:'sv27-city-bus',label:'TRYAMM 2027 Electric City Bus',domain:'transit',segment:'city-bus',powertrain:'electric',seats:42,rarity:'common',cityRole:'public transit',accessClass:'city-bus',originalDesign:true},
  {id:'sv27-articulated-bus',label:'TRYAMM 2027 Articulated Bus',domain:'transit',segment:'articulated-bus',powertrain:'electric',seats:70,rarity:'uncommon',cityRole:'public transit',accessClass:'city-bus',originalDesign:true},
  {id:'sv27-shuttle',label:'TRYAMM 2027 Neighborhood Shuttle',domain:'transit',segment:'shuttle',powertrain:'electric',seats:14,rarity:'uncommon',cityRole:'community transit',accessClass:'shuttle',originalDesign:true},
  {id:'sv27-delivery-van',label:'TRYAMM 2027 Delivery Van',domain:'commercial',segment:'delivery-van',powertrain:'electric',seats:2,rarity:'common',cityRole:'parcel/food delivery',accessClass:'delivery-van',originalDesign:true},
  {id:'sv27-box-truck',label:'TRYAMM 2027 Box Truck',domain:'commercial',segment:'box-truck',powertrain:'electric',seats:2,rarity:'uncommon',cityRole:'business logistics',accessClass:'box-truck',originalDesign:true},
  {id:'sv27-tow-truck',label:'TRYAMM 2027 Tow Truck',domain:'commercial',segment:'tow-truck',powertrain:'hybrid',seats:2,rarity:'uncommon',cityRole:'roadside/repair',accessClass:'tow-truck',originalDesign:true},
  {id:'sv27-garbage-truck',label:'TRYAMM 2027 Sanitation Truck',domain:'commercial',segment:'sanitation',powertrain:'electric',seats:3,rarity:'uncommon',cityRole:'waste collection',accessClass:'sanitation-truck',originalDesign:true},
  {id:'sv27-police-cruiser',label:'TRYAMM 2027 Police Cruiser',domain:'emergency',segment:'police',powertrain:'hybrid',seats:5,rarity:'uncommon',cityRole:'public safety',accessClass:'police-cruiser',originalDesign:true},
  {id:'sv27-ambulance',label:'TRYAMM 2027 Ambulance',domain:'emergency',segment:'ambulance',powertrain:'electric',seats:5,rarity:'rare',cityRole:'emergency medical',accessClass:'ambulance',originalDesign:true},
  {id:'sv27-fire-engine',label:'TRYAMM 2027 Fire Engine',domain:'emergency',segment:'fire-engine',powertrain:'hybrid',seats:6,rarity:'rare',cityRole:'fire/rescue',accessClass:'fire-engine',originalDesign:true},
  {id:'sv27-news-helicopter',label:'TRYAMM 2027 News Helicopter',domain:'air',segment:'helicopter',powertrain:'aviation',seats:4,rarity:'rare',cityRole:'news/traffic',accessClass:'news-helicopter',originalDesign:true},
  {id:'sv27-rescue-helicopter',label:'TRYAMM 2027 Rescue Helicopter',domain:'air',segment:'helicopter',powertrain:'aviation',seats:8,rarity:'rare',cityRole:'rescue/emergency',accessClass:'rescue-helicopter',originalDesign:true},
  {id:'sv27-business-helicopter',label:'TRYAMM 2027 Business Helicopter',domain:'air',segment:'helicopter',powertrain:'aviation',seats:6,rarity:'rare',cityRole:'business transport',accessClass:'business-helicopter',originalDesign:true},
  {id:'sv27-light-plane',label:'TRYAMM 2027 Light Utility Plane',domain:'air',segment:'fixed-wing',powertrain:'aviation',seats:6,rarity:'rare',cityRole:'regional utility',accessClass:'light-plane',originalDesign:true},
  {id:'sv27-commuter-plane',label:'TRYAMM 2027 Regional Commuter Plane',domain:'air',segment:'regional-fixed-wing',powertrain:'aviation',seats:30,rarity:'rare',cityRole:'regional passenger',accessClass:'commuter-plane',originalDesign:true},
  {id:'sv27-cargo-plane',label:'TRYAMM 2027 Regional Cargo Plane',domain:'air',segment:'cargo-fixed-wing',powertrain:'aviation',seats:2,rarity:'rare',cityRole:'regional cargo',accessClass:'cargo-plane',originalDesign:true},
  {id:'sv27-evtol-taxi',label:'TRYAMM 2027 eVTOL Air Taxi',domain:'experimental-air',segment:'evtol',powertrain:'experimental-electric',seats:4,rarity:'ultra-rare',cityRole:'future air mobility',accessClass:'evtol',originalDesign:true},
  {id:'sv27-flying-bike',label:'TRYAMM 2027 Flying Bike',domain:'experimental-air',segment:'flying-bike',powertrain:'experimental-electric',seats:1,rarity:'ultra-rare',cityRole:'future personal mobility',accessClass:'flying-bike',originalDesign:true},
  {id:'sv27-flying-coupe',label:'TRYAMM 2027 Flying Coupe',domain:'experimental-air',segment:'flying-car',powertrain:'experimental-electric',seats:2,rarity:'ultra-rare',cityRole:'future personal mobility',accessClass:'flying-car',originalDesign:true},
  {id:'sv27-flying-shuttle',label:'TRYAMM 2027 Flying Shuttle',domain:'experimental-air',segment:'evtol-shuttle',powertrain:'experimental-electric',seats:8,rarity:'ultra-rare',cityRole:'future shuttle',accessClass:'evtol-shuttle',originalDesign:true},
]

export const STREETVERSE_2027_SPAWN_MIX={
  road:90,
  motorcycle:5,
  transit:2,
  commercial:1.8,
  emergency:.6,
  air:.45,
  'experimental-air':.15,
} as const

export const STREETVERSE_2027_FLEET_POLICY={
  modelYear:2027,
  originalTryammDesigns:true,
  realBrandTradeDressCopied:false,
  groundedChicagoTraffic:true,
  flyingCarsRemainRare:true,
  aircraftStayOutOfStreetTraffic:true,
  helicoptersUseAirCorridors:true,
  motorcyclesUseRoadRules:true,
  emergencyVehiclesMissionDriven:true,
} as const

export function fleetByDomain(domain:StreetVerse2027VehicleDomain){
  return STREETVERSE_2027_FLEET.filter(v=>v.domain===domain)
}

export function deterministicFleetPick(seed:number,domain:StreetVerse2027VehicleDomain){
  const pool=fleetByDomain(domain)
  return pool[Math.abs(Math.floor(seed))%Math.max(1,pool.length)]
}

export function deterministicSpawnDomain(seed:number):StreetVerse2027VehicleDomain{
  const n=((Math.abs(Math.floor(seed*9973))%10000)/100)
  let cursor=0
  for(const [domain,weight] of Object.entries(STREETVERSE_2027_SPAWN_MIX) as [StreetVerse2027VehicleDomain,number][]){
    cursor+=weight
    if(n<cursor)return domain
  }
  return'road'
}