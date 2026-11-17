/**
 * Source-evidence registry for the existing TRYAMM economy and Earth digital-twin stack.
 * This file does NOT enable real transfers, rewards, imagery access or satellite feeds.
 */
export const ECONOMY_AND_EARTH_SYSTEMS = Object.freeze([
 {id:'holo-earned',label:'Holo earned credits',kind:'game-credit',source:'src/data/TryammHoloPlayCreditEconomy.ts',cashRedeemable:false,transferable:false,productionEnabled:false},
 {id:'play-purchased',label:'Purchased play credits',kind:'game-credit',source:'src/data/TryammHoloPlayCreditEconomy.ts',cashRedeemable:false,transferable:false,productionEnabled:false},
 {id:'aniyah-cross-border',label:'Aniyah Pay / Cross Borders',kind:'payment-intent',source:'src/services/aniyahPay.ts',cashRedeemable:null,transferable:null,productionEnabled:false},
 {id:'global-provider-router',label:'Global and African provider routing',kind:'payment-provider',source:'api/payments/route.js',cashRedeemable:null,transferable:null,productionEnabled:false},
 {id:'mycelium-events',label:'StreetVerse Mycelium local event fabric',kind:'simulation',source:'src/runtime/StreetVerseMyceliumNetwork.ts',cashRedeemable:null,transferable:null,productionEnabled:false},
 {id:'weather-visual',label:'StreetVerse real weather visual mapping',kind:'environment',source:'src/runtime/StreetVerseWeatherRuntime.ts',cashRedeemable:null,transferable:null,productionEnabled:false},
 {id:'weather-commercial-adapter',label:'Licensed Open-Meteo global weather adapter',kind:'external-provider',source:'api/_lib/global-weather.js',cashRedeemable:null,transferable:null,productionEnabled:false},
 {id:'satellite-tiles',label:'NASA GIBS satellite imagery',kind:'planned-provider',source:null,cashRedeemable:null,transferable:null,productionEnabled:false},
 {id:'omni-cash',label:'Omni Cash — naming/integration pending verified module',kind:'unverified-name',source:null,cashRedeemable:null,transferable:null,productionEnabled:false},
])
export const DIGITAL_TWIN_LAYERS = Object.freeze([
 {id:'earth-image',source:'NASA GIBS',scope:'satellite visualization; not live street-level 3D',enabled:false},
 {id:'weather',source:'commercial weather adapter when licensed and production enabled',scope:'time-stamped weather/current forecast',enabled:false},
 {id:'city-geometry',source:'owned/generated meshes and GIS-authorized data',scope:'gameplay city models, never satellite imagery alone',enabled:false},
 {id:'mycelium',source:'StreetVerse local event routing',scope:'simulation messages only until authenticated server authority exists',enabled:false},
])
export function assertEconomyBoundaries(systems=ECONOMY_AND_EARTH_SYSTEMS){
 const credits=systems.filter(s=>s.kind==='game-credit')
 if(credits.length!==2||credits.some(s=>s.cashRedeemable!==false||s.transferable!==false))return false
 if(systems.some(s=>s.kind==='planned-provider'&&s.productionEnabled))return false
 if(systems.some(s=>s.kind==='unverified-name'&&s.source))return false
 return true
}
