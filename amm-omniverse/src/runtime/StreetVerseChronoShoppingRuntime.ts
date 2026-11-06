/** Fictional ChronoVerse shopping/roleplay state. No physical time travel or real commerce. */
export type Era='present'|'chicago-1920'|'chicago-1985'|'future-2126'
export type ChronoVisit={era:Era;where:string;purpose:string;seed:string;branch:string;worldHash:string}
export type ShopRoleplay={insideStoreId:string|null;outfit:'default'|'creator-jacket'|'vintage-suit'|'future-coat';dialogue:string;chrono:ChronoVisit;history:string[]}
export const initialShopRoleplay=():ShopRoleplay=>({insideStoreId:null,outfit:'default',dialogue:'Welcome to StreetVerse.',chrono:{era:'present',where:'Chicago',purpose:'shopping',seed:'root',branch:'main',worldHash:'streetverse-v1'},history:[]})
export function enterShop(state:ShopRoleplay,storeId:string,near:boolean,onFoot:boolean):ShopRoleplay{
 if(!near||!onFoot||!['creator','restaurant','beauty'].includes(storeId))return state
 return {...state,insideStoreId:storeId,dialogue:'Welcome inside. Browse the shelves, talk to the vendor, or try on an outfit.'}
}
export function leaveShop(state:ShopRoleplay):ShopRoleplay{return {...state,insideStoreId:null,dialogue:'Thanks for visiting StreetVerse.'}}
export function talkToMerchant(state:ShopRoleplay,storeId:string):ShopRoleplay{
 if(state.insideStoreId!==storeId)return state
 const lines:Record<string,string>={creator:'Creator NPC: Try our new jackets. Every purchase here uses fictional game credits.',restaurant:'Chef NPC: Fresh virtual meals today. Our kitchen restocks from Holo Delivery.',beauty:'Beauty NPC: Welcome! Browse our fictional beauty kits and styles.'}
 return {...state,dialogue:lines[storeId]||'Hello!'}
}
export function tryOutfit(state:ShopRoleplay,outfit:ShopRoleplay['outfit']):ShopRoleplay{
 if(!state.insideStoreId||!['default','creator-jacket','vintage-suit','future-coat'].includes(outfit))return state
 return {...state,outfit,dialogue:'BJ outfit preview: '+outfit+'. Cosmetic preview only.'}
}
export function travelChrono(state:ShopRoleplay,era:Era,purpose:string):ShopRoleplay{
 if(!['present','chicago-1920','chicago-1985','future-2126'].includes(era)||!purpose.trim()||purpose.length>80)return state
 const seed=state.chrono.seed+'-'+String(state.history.length+1)
 const branch=era+'-'+String(state.history.length+1)
 const worldHash='sim-'+era+'-'+String(state.history.length+1)
 return {...state,insideStoreId:null,chrono:{era,where:'Chicago',purpose,seed,branch,worldHash},history:[...state.history.slice(-39),state.chrono.era+' → '+era],dialogue:'ChronoVerse simulation loaded: '+era+'. Your decisions branch the fictional timeline.'}
}
