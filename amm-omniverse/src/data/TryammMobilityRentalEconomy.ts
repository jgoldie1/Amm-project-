export type VehicleRentalMode='self-drive'|'passenger'|'chauffeur'|'event'
export type VehicleRentalRate={
  vehicleClass:string
  hourlyUsd:number
  dailyUsd:number
  depositUsd:number
  credential:string|null
  selfDrive:boolean
  passenger:boolean
  plasmaShield?:boolean
}

export const TRYAMM_MOBILITY_RENTAL_RATES:VehicleRentalRate[]=[
  {vehicleClass:'car',hourlyUsd:2.99,dailyUsd:9.99,depositUsd:5,credential:'street-driver',selfDrive:true,passenger:true},
  {vehicleClass:'classic-car',hourlyUsd:4.99,dailyUsd:14.99,depositUsd:10,credential:'street-driver',selfDrive:true,passenger:true},
  {vehicleClass:'lowrider',hourlyUsd:5.99,dailyUsd:17.99,depositUsd:10,credential:'street-driver',selfDrive:true,passenger:true},
  {vehicleClass:'motorcycle',hourlyUsd:3.99,dailyUsd:11.99,depositUsd:8,credential:'powersports-rider',selfDrive:true,passenger:false},
  {vehicleClass:'box-truck',hourlyUsd:6.99,dailyUsd:24.99,depositUsd:20,credential:'commercial-driver',selfDrive:true,passenger:true},
  {vehicleClass:'flying-bike',hourlyUsd:9.99,dailyUsd:29.99,depositUsd:25,credential:'future-air-mobility',selfDrive:true,passenger:false,plasmaShield:true},
  {vehicleClass:'flying-car',hourlyUsd:12.99,dailyUsd:39.99,depositUsd:35,credential:'future-air-mobility',selfDrive:true,passenger:true,plasmaShield:true},
  {vehicleClass:'evtol',hourlyUsd:17.99,dailyUsd:54.99,depositUsd:50,credential:'future-air-mobility',selfDrive:true,passenger:true,plasmaShield:true},
  {vehicleClass:'business-helicopter',hourlyUsd:24.99,dailyUsd:79.99,depositUsd:75,credential:'rotorcraft-pilot',selfDrive:true,passenger:true},
  {vehicleClass:'light-plane',hourlyUsd:34.99,dailyUsd:119.99,depositUsd:100,credential:'fixed-wing-pilot',selfDrive:true,passenger:true},
]

export const TRYAMM_MOBILITY_RENTAL_POLICY={
  product:'TRYAMM Mobility Rental',
  founderCanCompAnyRental:true,
  founderCompCreatesRevenue:false,
  ownershipAndControlAreSeparate:true,
  uncertifiedUsersCanUsePassengerMode:true,
  selfDriveRequiresCredential:true,
  flyingVehicleCorridorsStillApply:true,
  emergencyRoleFleetNotPublicRental:true,
  paidRentalRequiresVerifiedServerPayment:true,
  nativeDigitalRentalUsesApplicableStoreCommerce:true,
  pwaWebRentalUsesApprovedWebCheckout:true,
  rentalDamageIsGameStateOnly:true,
  realWorldVehicleRentalClaim:false,
} as const

export function rentalRate(vehicleClass:string){
  return TRYAMM_MOBILITY_RENTAL_RATES.find(x=>x.vehicleClass===vehicleClass)||null
}

export function quoteTryammRental(vehicleClass:string,hours:number){
  const rate=rentalRate(vehicleClass)
  if(!rate)return null
  const h=Math.max(1,Math.ceil(hours))
  const fullDays=Math.floor(h/24)
  const remainder=h%24
  const grossUsd=fullDays*rate.dailyUsd+(remainder?Math.min(rate.dailyUsd,remainder*rate.hourlyUsd):0)
  return{...rate,hours:h,grossUsd:Number(grossUsd.toFixed(2))}
}

export function rentalRevenueSplit(grossCents:number,vehicleOwner:'tryamm'|'business'|'creator'='tryamm'){
  const gross=Math.max(0,Math.round(grossCents))
  if(vehicleOwner==='tryamm'){
    const reserve=Math.floor(gross*.10)
    return{grossCents:gross,vehicleOwnerCents:0,tryammCents:gross-reserve,reserveCents:reserve}
  }
  const vehicleOwnerCents=Math.floor(gross*.70)
  const tryammCents=Math.floor(gross*.20)
  return{grossCents:gross,vehicleOwnerCents,tryammCents,reserveCents:gross-vehicleOwnerCents-tryammCents}
}