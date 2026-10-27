/** StreetVerse global delivery policy (staging): no network, DB, payment or world mutations. */
export type CityKey='chicago'|'lagos'|'abuja'
export type CityPack={id:CityKey;region:'us-central'|'af-west';assetRefs:string[];bytes:number;locale:string;fallback:string}
export type DeviceBudget={memoryGB:number;slowConnection:boolean;reducedMotion:boolean}
export type LoadResult={status:'ready'|'fallback'|'rejected';city:CityKey;assetRefs:string[];quality:'low'|'medium'|'high';reason:string}
const MAX_PACK_BYTES=75*1024*1024
const ALLOWED_ASSET=/^\/tryamm-assets\/[a-zA-Z0-9/_-]+\.(glb|json|webp|ktx2)$/
export function qualityForDevice(d:DeviceBudget):'low'|'medium'|'high'{
 if(!Number.isFinite(d.memoryGB)||d.memoryGB<3||d.slowConnection||d.reducedMotion)return'low'
 return d.memoryGB<6?'medium':'high'
}
export function planCityLoad(pack:CityPack,device:DeviceBudget,prior?:CityPack):LoadResult{
 const quality=qualityForDevice(device)
 const valid=pack.assetRefs.length>0&&pack.assetRefs.length<=200&&pack.assetRefs.every(x=>ALLOWED_ASSET.test(x))&&
 Number.isSafeInteger(pack.bytes)&&pack.bytes>0&&pack.bytes<=MAX_PACK_BYTES
 if(valid)return{status:'ready',city:pack.id,assetRefs:[...pack.assetRefs],quality,reason:'staged_assets'}
 const safePrior=prior?.assetRefs.filter(x=>ALLOWED_ASSET.test(x))||[]
 return safePrior.length&&safePrior.length<=200?{status:'fallback',city:prior!.id,assetRefs:safePrior,quality:'low',reason:'using_last_verified_city'}:
 {status:'rejected',city:pack.id,assetRefs:[],quality:'low',reason:'asset_pack_not_verified'}
}
export type TravelDecision={allowed:boolean;reason:string}
export function canTravelGlobally(input:{passportVerified:boolean;destinationAvailable:boolean;ageGatePassed:boolean;progressSaved:boolean}):TravelDecision{
 if(!input.passportVerified)return{allowed:false,reason:'passport_unverified'}
 if(!input.ageGatePassed)return{allowed:false,reason:'age_gate'}
 if(!input.progressSaved)return{allowed:false,reason:'progress_not_saved'}
 if(!input.destinationAvailable)return{allowed:false,reason:'destination_unavailable'}
 return{allowed:true,reason:'ready_to_transfer'}
}
/** Policy metadata only; region selection does not start or claim a real server. */
export const CITY_REGIONS:Readonly<Record<CityKey,{region:string;locale:string}>>=Object.freeze({
 chicago:{region:'us-central',locale:'en-US'},lagos:{region:'af-west',locale:'en-NG'},abuja:{region:'af-west',locale:'en-NG'},
})
