import type {AssetKind} from './TryammAssetForge'
import type {AssetPassport} from './AssetPassportCertification'

export interface CertifiedAssetRecord{
 id:string;kind:AssetKind;version:number;artifactUri:string;passport:AssetPassport;
 tags:string[];stylePacks:string[];compatibleCities:string[];reusable:boolean;
}

export interface WorldAssetSlot{
 id:string;cityId:string;kind:AssetKind;stylePack:string;count:number;
 placement:'district'|'road'|'park'|'interior'|'population'|'traffic'|'ambient';
}

export class TryammAssetRegistry{
 private assets=new Map<string,CertifiedAssetRecord>()
 register(record:CertifiedAssetRecord){
  if(record.passport.status!=='certified')throw new Error('Only certified assets may enter the production registry')
  this.assets.set(`${record.id}@${record.version}`,record);return record
 }
 find(slot:WorldAssetSlot){
  return [...this.assets.values()].filter(a=>a.kind===slot.kind&&
   (a.compatibleCities.includes(slot.cityId)||a.reusable)&&
   (a.stylePacks.length===0||a.stylePacks.includes(slot.stylePack)))
 }
 planPlacement(slot:WorldAssetSlot){
  const candidates=this.find(slot)
  return Array.from({length:Math.min(slot.count,candidates.length)},(_,i)=>({
   slotId:slot.id,asset:candidates[i],instanceIndex:i,
  }))
 }
 list(){return [...this.assets.values()]}
}

export const GLOBAL_ASSET_PLACEMENT_RULES={
 certifiedOnly:true,
 deterministicPlacement:true,
 avoidDuplicateHeroAssets:true,
 respectCityStylePacks:true,
 reuseGenericAssetsAcrossCities:true,
 localLandmarksRequireCitySpecificRights:true,
 peopleMustBeSyntheticOrConsented:true,
 noRealResidentReplication:true,
 mobileBudgetBeforeDensity:true,
 gracefulFallbackWhenAssetMissing:true,
} as const

export function createStandardCitySlots(cityId:string):WorldAssetSlot[]{
 return[
  {id:`${cityId}:population`,cityId,kind:'character',stylePack:`${cityId}-people`,count:24,placement:'population'},
  {id:`${cityId}:buildings`,cityId,kind:'building',stylePack:`${cityId}-architecture`,count:16,placement:'district'},
  {id:`${cityId}:traffic`,cityId,kind:'vehicle',stylePack:`${cityId}-mobility`,count:10,placement:'traffic'},
  {id:`${cityId}:props`,cityId,kind:'prop',stylePack:`${cityId}-street-props`,count:20,placement:'road'},
  {id:`${cityId}:environment`,cityId,kind:'environment',stylePack:`${cityId}-environment`,count:12,placement:'ambient'},
 ]
}
