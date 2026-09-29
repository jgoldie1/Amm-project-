export type StreetVerseMobilityTier=
  |'passenger'
  |'street-driver'
  |'powersports'
  |'commercial'
  |'emergency-role'
  |'rotorcraft'
  |'fixed-wing'
  |'future-air'

export type StreetVerseMobilityCredential={
  id:string
  label:string
  tier:StreetVerseMobilityTier
  unlockLevel:number
  requiredMissions:string[]
  allowedVehicleClasses:string[]
  ownership:'personal'|'business'|'role-fleet'|'club-or-business'|'restricted-future'
  notes:string[]
}

export const STREETVERSE_MOBILITY_CREDENTIALS:StreetVerseMobilityCredential[]=[
  {
    id:'street-driver',
    label:'StreetVerse Driver',
    tier:'street-driver',
    unlockLevel:1,
    requiredMissions:['movement-tutorial','vehicle-entry-tutorial'],
    allowedVehicleClasses:['car','sedan','coupe','wagon','crossover','suv','pickup','van','rideshare','taxi','classic-car','lowrider'],
    ownership:'personal',
    notes:['base civilian driving tier','starter car unlock','ordinary road rules apply'],
  },
  {
    id:'powersports-rider',
    label:'Powersports Rider',
    tier:'powersports',
    unlockLevel:2,
    requiredMissions:['street-driver','powersports-balance-course'],
    allowedVehicleClasses:['motorcycle','sport-bike','cruiser-bike','adventure-bike','scooter','dirt-bike','supermoto','atv','utv','three-wheel-roadster'],
    ownership:'personal',
    notes:['closed-course training first','stunt actions restricted to designated game zones'],
  },
  {
    id:'commercial-driver',
    label:'StreetVerse Commercial Driver',
    tier:'commercial',
    unlockLevel:4,
    requiredMissions:['street-driver','delivery-route-training','commercial-parking-training'],
    allowedVehicleClasses:['box-truck','delivery-van','cargo-van','tow-truck','sanitation-truck','shuttle','city-bus'],
    ownership:'business',
    notes:['business/job fleet','larger turning/braking envelope','cargo/passenger missions'],
  },
  {
    id:'emergency-operator',
    label:'Emergency Fleet Operator',
    tier:'emergency-role',
    unlockLevel:5,
    requiredMissions:['street-driver','de-escalation-training','emergency-response-training'],
    allowedVehicleClasses:['police-cruiser','ambulance','fire-engine','rescue-truck'],
    ownership:'role-fleet',
    notes:['available only while assigned to an approved fictional role/mission','not a private ownership unlock by default'],
  },
  {
    id:'rotorcraft-pilot',
    label:'StreetVerse Rotorcraft Pilot',
    tier:'rotorcraft',
    unlockLevel:7,
    requiredMissions:['street-driver','air-academy-ground-school','rotorcraft-simulator','landing-zone-checkride'],
    allowedVehicleClasses:['news-helicopter','rescue-helicopter','business-helicopter'],
    ownership:'club-or-business',
    notes:['uses marked heliports/landing zones','air-corridor clearance required','game certification only'],
  },
  {
    id:'fixed-wing-pilot',
    label:'StreetVerse Fixed-Wing Pilot',
    tier:'fixed-wing',
    unlockLevel:8,
    requiredMissions:['street-driver','air-academy-ground-school','fixed-wing-simulator','airport-pattern-checkride'],
    allowedVehicleClasses:['light-plane','commuter-plane','cargo-plane'],
    ownership:'club-or-business',
    notes:['airport/runway spawn only','regional routes','game certification only'],
  },
  {
    id:'future-air-mobility',
    label:'Future Mobility Pilot',
    tier:'future-air',
    unlockLevel:10,
    requiredMissions:['rotorcraft-pilot','fixed-wing-pilot','future-air-safety-course','air-corridor-checkride'],
    allowedVehicleClasses:['evtol','flying-car','evtol-shuttle'],
    ownership:'restricted-future',
    notes:['ultra-rare class','approved future-air corridors only','rental/test fleet before personal ownership','game certification only'],
  },
]

export const STREETVERSE_VEHICLE_ACCESS_POLICY={
  allPlayersCanRideAsPassengers:true,
  ordinaryCarsEarlyUnlock:true,
  motorcyclesNeedPowersportsTraining:true,
  commercialVehiclesNeedCommercialProgression:true,
  emergencyVehiclesNeedActiveRole:true,
  helicoptersNeedRotorcraftCertification:true,
  planesNeedFixedWingCertification:true,
  flyingCarsNeedFutureMobilityCertification:true,
  flyingCarsRareByDesign:true,
  noPayToSkipSafetyProgression:true,
  developerFounderTestAccessIsNonProductionOnly:true,
  realWorldLicenseRepresentation:false,
  gameCertificationOnlyForRegulatedClasses:true,
} as const

export const STREETVERSE_VEHICLE_OWNERSHIP_MODEL={
  personal:['cars','motorcycles','classic cars','lowriders','approved future flying car after full progression'],
  business:['box trucks','delivery vans','tow trucks','shuttles','some helicopters','some planes','eVTOL shuttle fleets'],
  roleFleet:['police cruisers','ambulances','fire engines','rescue helicopters'],
  rentalClub:['helicopters','light planes','commuter aircraft','rare future-air vehicles'],
  publicTransit:['city buses','articulated buses'],
} as const

export function mobilityCredential(id:string){
  return STREETVERSE_MOBILITY_CREDENTIALS.find(x=>x.id===id)
}

export function credentialForVehicleClass(vehicleClass:string){
  return STREETVERSE_MOBILITY_CREDENTIALS.find(x=>x.allowedVehicleClasses.includes(vehicleClass))
}

export const STREETVERSE_SPECIAL_VEHICLE_ASSIGNMENTS={
  'news-helicopter':{
    credential:'rotorcraft-pilot',
    allowedRoles:['news','media','creator-media','tryamm-tv'],
    ownership:'media-business-or-network-fleet',
    passengerAccess:true,
  },
  'rescue-helicopter':{
    credential:'rotorcraft-pilot',
    allowedRoles:['ems','fire','rescue','emergency-response'],
    ownership:'emergency-role-fleet',
    passengerAccess:true,
  },
  'business-helicopter':{
    credential:'rotorcraft-pilot',
    allowedRoles:['business-owner','charter','corporate-transport','aviation-club'],
    ownership:'business-charter-or-club',
    passengerAccess:true,
  },
  'light-plane':{
    credential:'fixed-wing-pilot',
    allowedRoles:['aviation-club','private-aviation','training'],
    ownership:'club-or-approved-personal',
    passengerAccess:true,
  },
  'commuter-plane':{
    credential:'fixed-wing-pilot',
    allowedRoles:['airline','regional-air','aviation-business'],
    ownership:'airline-or-regional-business',
    passengerAccess:true,
  },
  'cargo-plane':{
    credential:'fixed-wing-pilot',
    allowedRoles:['logistics','cargo-air','aviation-business'],
    ownership:'logistics-or-cargo-business',
    passengerAccess:false,
  },
  evtol:{
    credential:'future-air-mobility',
    allowedRoles:['future-air','air-taxi','mobility-test','aviation-business'],
    ownership:'future-air-fleet-first',
    passengerAccess:true,
  },
  'flying-car':{
    credential:'future-air-mobility',
    allowedRoles:['future-air','mobility-test','advanced-personal-mobility'],
    ownership:'rental-test-first-then-approved-personal',
    passengerAccess:true,
  },
  'evtol-shuttle':{
    credential:'future-air-mobility',
    allowedRoles:['future-air','air-taxi','transit-operator'],
    ownership:'transit-or-air-taxi-fleet',
    passengerAccess:true,
  },
} as const

export const STREETVERSE_ASSIGNMENT_TRUTH={
  ordinaryPassengersDoNotNeedPilotCredential:true,
  operatingAircraftRequiresGameCredential:true,
  roleFleetVehiclesNeedActiveAssignment:true,
  realWorldAviationAuthorizationNotRepresented:true,
  gameOnlySimulation:true,
} as const
