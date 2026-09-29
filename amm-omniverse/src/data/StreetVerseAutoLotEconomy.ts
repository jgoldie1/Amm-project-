export type StreetVerseLotTier='starter'|'daily'|'premium'|'classic'|'commercial'|'powersports'|'future-air'|'aviation'

export type StreetVerseLotPrice={
  vehicleClass:string
  tier:StreetVerseLotTier
  streetverseStickerUsd:number
  holoCredits:number
  realMoneyDigitalPriceUsd?:number
  notes:string
}

export const STREETVERSE_AUTO_LOT_PRICES:StreetVerseLotPrice[]=[
  {vehicleClass:'compact-car',tier:'starter',streetverseStickerUsd:18500,holoCredits:18500,realMoneyDigitalPriceUsd:4.99,notes:'entry car'},
  {vehicleClass:'sedan',tier:'daily',streetverseStickerUsd:26900,holoCredits:26900,realMoneyDigitalPriceUsd:6.99,notes:'daily driver'},
  {vehicleClass:'suv',tier:'daily',streetverseStickerUsd:38900,holoCredits:38900,realMoneyDigitalPriceUsd:8.99,notes:'family/SUV tier'},
  {vehicleClass:'sport-sedan',tier:'premium',streetverseStickerUsd:54900,holoCredits:54900,realMoneyDigitalPriceUsd:12.99,notes:'TRYAMM 2027 sport sedan'},
  {vehicleClass:'supercar',tier:'premium',streetverseStickerUsd:149900,holoCredits:149900,realMoneyDigitalPriceUsd:24.99,notes:'rare performance vehicle'},
  {vehicleClass:'classic-car',tier:'classic',streetverseStickerUsd:45900,holoCredits:45900,realMoneyDigitalPriceUsd:9.99,notes:'restored old-school baseline; collector cars can price higher'},
  {vehicleClass:'lowrider',tier:'classic',streetverseStickerUsd:57900,holoCredits:57900,realMoneyDigitalPriceUsd:12.99,notes:'custom paint/interior/wheel/hydraulic game package'},
  {vehicleClass:'motorcycle',tier:'powersports',streetverseStickerUsd:12900,holoCredits:12900,realMoneyDigitalPriceUsd:5.99,notes:'street/powersports motorcycle'},
  {vehicleClass:'box-truck',tier:'commercial',streetverseStickerUsd:64900,holoCredits:64900,realMoneyDigitalPriceUsd:14.99,notes:'business logistics vehicle'},
  {vehicleClass:'custom-box-truck',tier:'commercial',streetverseStickerUsd:79900,holoCredits:79900,realMoneyDigitalPriceUsd:17.99,notes:'custom rims/spokes/spinner visual package'},
  {vehicleClass:'flying-bike',tier:'future-air',streetverseStickerUsd:149900,holoCredits:149900,realMoneyDigitalPriceUsd:29.99,notes:'fictional future-air vehicle; certification required to control'},
  {vehicleClass:'flying-car',tier:'future-air',streetverseStickerUsd:249900,holoCredits:249900,realMoneyDigitalPriceUsd:39.99,notes:'fictional future-air vehicle with Plasma Force Field option'},
  {vehicleClass:'evtol',tier:'future-air',streetverseStickerUsd:499000,holoCredits:499000,realMoneyDigitalPriceUsd:49.99,notes:'fleet/air-taxi tier'},
  {vehicleClass:'business-helicopter',tier:'aviation',streetverseStickerUsd:1250000,holoCredits:1250000,notes:'game-world business aviation asset; not a real aircraft sales quote'},
  {vehicleClass:'light-plane',tier:'aviation',streetverseStickerUsd:650000,holoCredits:650000,notes:'game-world aviation asset; not a real aircraft sales quote'},
]

export const STREETVERSE_AUTO_LOT_POLICY={
  product:'TRYAMM Auto Lot',
  streetverseStickerIsGameEconomyPrice:true,
  realMoneyDigitalPriceIsOptionalDigitalEntitlement:true,
  nativeMobileDigitalPurchasesRequireApplicableStoreBilling:true,
  serverAuthoritativeCheckout:true,
  founderCanGiftWithoutCharge:true,
  founderGiftDoesNotCreateFakeRevenue:true,
  ownershipGrantSeparateFromControlCertification:true,
  noRealVehicleSalesClaim:true,
  physicalVehicleSalesWouldRequireSeparateDealerLegalCompliance:true,
} as const

export function lotPriceFor(vehicleClass:string){
  return STREETVERSE_AUTO_LOT_PRICES.find(x=>x.vehicleClass===vehicleClass)||null
}
