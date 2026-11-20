/** StreetVerse mini-city: local gameplay evidence, not a cloud-backed city or authoritative server. */
export type MiniCityState={version:1;visited:boolean;visitCount:number;lastVisitAt:string|null}
export const MINI_CITY_SAVE_KEY='tryamm.streetverse.mini-city.v1'
export const MINI_CITY_HUB={x:62,z:62,radius:8} as const
export const MINI_CITY_BUILDINGS=[
 {id:'maker-studio',x:56,z:59,halfX:2.4,halfZ:3.1},
 {id:'creator-gallery',x:69,z:59,halfX:2.4,halfZ:3.1},
 {id:'local-market',x:68,z:71,halfX:2.5,halfZ:2.5},
] as const
export const defaultMiniCityState=():MiniCityState=>({version:1,visited:false,visitCount:0,lastVisitAt:null})
export function miniCityCollision(x:number,z:number,radius=.33):boolean{
 if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(radius)||radius<0)return true
 return MINI_CITY_BUILDINGS.some(b=>Math.abs(x-b.x)<b.halfX+radius&&Math.abs(z-b.z)<b.halfZ+radius)
}
export function canCheckInMiniCity(x:number,z:number):boolean{
 return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-MINI_CITY_HUB.x,z-MINI_CITY_HUB.z)<=MINI_CITY_HUB.radius&&!miniCityCollision(x,z)
}
export function restoreMiniCityState(raw:string|null):MiniCityState{
 try{const data=JSON.parse(raw||'null');if(data?.version===1&&typeof data.visited==='boolean'&&Number.isSafeInteger(data.visitCount)&&data.visitCount>=0&&data.visitCount<=100000&&
 (data.lastVisitAt===null||(typeof data.lastVisitAt==='string'&&data.lastVisitAt.length<=64)))
 return {version:1,visited:data.visited,visitCount:data.visitCount,lastVisitAt:data.lastVisitAt}}catch{}
 return defaultMiniCityState()
}
export function recordMiniCityVisit(current:MiniCityState,x:number,z:number,at:string):{state:MiniCityState;ok:boolean;reason:string}{
 if(!canCheckInMiniCity(x,z))return {state:current,ok:false,reason:'Move to the mini-city courtyard at (62, 62), outside the buildings.'}
 if(current.visited)return {state:current,ok:true,reason:'Already checked in; prior progress preserved.'}
 if(!Number.isFinite(Date.parse(at)))return {state:current,ok:false,reason:'Invalid time'}
 return {state:{version:1,visited:true,visitCount:Math.min(100000,current.visitCount+1),lastVisitAt:at},ok:true,reason:'Mini-city courtyard visited and saved on this device.'}
}
