export type StreetVerseMobilityMode='rideshare'|'peer-car-share'|'tryamm-rental'|'delivery'|'recovery'

export const STREETVERSE_MOBILITY_ECONOMY={
  product:'TRYAMM StreetVerse Mobility Network',
  modes:{
    rideshare:{label:'Holo Ride Share',description:'Players/NPCs request simulated StreetVerse rides; eligible drivers accept jobs.',splitBps:{driver:8000,tryamm:1500,reserve:500},jobRewards:{shortRide:180,mediumRide:320,longRide:520}},
    'peer-car-share':{label:'All American Car Share',description:'Players list eligible digital vehicles for other players to rent, similar to peer-to-peer car sharing.',splitBps:{vehicleOwner:7000,tryamm:2000,reserve:1000}},
    'tryamm-rental':{label:'TRYAMM Auto Lot Rental',description:'TRYAMM-owned digital vehicles rent directly from the fleet.',splitBps:{tryamm:9000,reserve:1000}},
    delivery:{label:'Holo Delivery',description:'Food, parcel and business delivery missions use the same mobility layer.',splitBps:{courier:8000,tryamm:1500,reserve:500}},
    recovery:{label:'Vehicle Recovery',description:'Nonviolent digital-game vehicle recovery for stolen, overdue or abandoned StreetVerse vehicles.',splitBps:{recoveryAgent:7000,vehicleOwner:1500,tryamm:1000,reserve:500}},
  },
  principles:[
    'real-world transport remains provider, insurance, identity and legal-gate dependent',
    'StreetVerse simulation is labeled simulation',
    'digital vehicle earnings are server-authoritative before payout',
    'owners choose whether eligible vehicles can be shared',
    'recovery missions prohibit violence and vigilantism',
  ] as const,
} as const

export const STREETVERSE_MOBILITY_JOB_TYPES=['RIDER_PICKUP','RIDER_DROPOFF','AIR_TAXI_PICKUP','CAR_SHARE_HANDOFF','RENTAL_RETURN','FOOD_DELIVERY','PARCEL_DELIVERY','BUSINESS_DELIVERY','VEHICLE_RECOVERY','TOW_TO_IMPOUND'] as const