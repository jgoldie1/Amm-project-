import {OMNIVERSE_ADULT_AFTER_DARK,AFTER_DARK_NIGHT_CYCLE,afterDarkAccess} from './OmniverseAdultAfterDark'
import {REUSABLE_ADVENTURE_LIBRARY} from './ReusableAdventureMissionLibrary'

export interface AfterDarkRuntimeContext{
 cityId:string;districtId:string;localHour:number;adultLane:boolean;ageAssured:boolean;
 jurisdictionAllowed:boolean;deviceTier:'low-mobile'|'mobile'|'desktop'|'cinematic'
}
export function resolveAfterDarkRuntime(ctx:AfterDarkRuntimeContext){
 const access=afterDarkAccess({adultLane:ctx.adultLane,ageAssured:ctx.ageAssured,featureJurisdictionAllowed:ctx.jurisdictionAllowed})
 if(!access.allowed)return{access,active:false,phase:null,missions:[],renderTier:'day-safe'}
 const h=((ctx.localHour%24)+24)%24
 const phase=h>=18&&h<20?AFTER_DARK_NIGHT_CYCLE[0]:
  h>=20&&h<22?AFTER_DARK_NIGHT_CYCLE[1]:
  h>=22||h<1?AFTER_DARK_NIGHT_CYCLE[2]:
  h<3?AFTER_DARK_NIGHT_CYCLE[3]:
  h<5?AFTER_DARK_NIGHT_CYCLE[4]:
  h<6?AFTER_DARK_NIGHT_CYCLE[5]:AFTER_DARK_NIGHT_CYCLE[6]
 const missions=REUSABLE_ADVENTURE_LIBRARY.filter(m=>m.family==='after-dark'||m.family==='detective'||m.family==='paranormal-investigation')
 return{access,active:true,phase,missions,renderTier:ctx.deviceTier==='low-mobile'?'mobile-night':'enhanced-night',
  experiences:OMNIVERSE_ADULT_AFTER_DARK.experiences}
}

export const AFTER_DARK_WORLD_TRANSFORM={
 environment:['night lighting','venue signs','weather reflections','reduced mobile shadows','district ambience'],
 population:['night workers','venue staff','performers','diners','adult visitors','transport workers'],
 mobility:['late transit','rideshare/taxi','delivery','night traffic profiles'],
 media:['Holo LIVE','TRYAMM TV','StreetVerse Radio','creator events','Reels capture'],
 economy:['tickets','eligible gifts','business offers','merchandise','sponsorships','Holo Ads'],
 continuity:['missions can begin in daytime and resolve after dark','replay/save preserves phase and mission state'],
}

export const AFTER_DARK_CERTIFICATION=[
 'adult-access-gate','minor-separation','jurisdiction-gate','moderation','rights','mission-safety',
 'server-authoritative-commerce','privacy','accessibility','mobile-performance','save-resume','rollback',
] as const
