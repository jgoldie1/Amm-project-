export type GameCommerceOrigin='streetverse'|'kingdom'|'campusverse'|'crossverse'
export type GameCommerceIntent={id:string;origin:GameCommerceOrigin;playerId?:string;creatorId?:string;passportId?:string;merchantId?:string;storeId?:string;itemId?:string;missionId?:string;contentId?:string;channel:'product-sale'|'service-booking'|'event-ticket'|'virtual-rental'|'business-campaign'}
declare global{interface Window{__TRYAMM_GAME_APP_INCOME_BRIDGE__?:{version:string}}}

export function installGameAppIncomeBridge(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_GAME_APP_INCOME_BRIDGE__)return()=>{}
 const onGameIntent=(event:Event)=>{
  const d=(event as CustomEvent<GameCommerceIntent>).detail
  if(!d?.id||!d?.origin)return
  window.dispatchEvent(new CustomEvent('tryamm:commerce-intent-request',{detail:{schema:'tryamm.revenue.intent.v1',id:d.id,surface:'world-object',channel:d.channel,attribution:{creatorId:d.creatorId,merchantId:d.merchantId,sourceContentId:d.contentId,sourceVerse:d.origin,passportId:d.passportId,storeId:d.storeId},itemId:d.itemId,missionId:d.missionId,requiresServerVerification:true,clientMayCreatePayableBalance:false,authority:'server',settlement:'transaction-orchestrator',attributionLocked:true}}))
 }
 const onSceneSale=(event:Event)=>{
  const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
  window.dispatchEvent(new CustomEvent('tryamm:game-commerce-intent',{detail:{id:'scene-sale-'+Date.now(),origin:String(d.sourceVerse||'streetverse'),playerId:d.playerId,creatorId:d.creatorId,passportId:d.passportId,merchantId:d.merchantId,storeId:d.storeId,itemId:d.itemId,contentId:d.contentId,channel:'product-sale'}}))
 }
 window.addEventListener('tryamm:game-commerce-intent',onGameIntent as EventListener)
 window.addEventListener('tryamm:scene-to-sale-candidate',onSceneSale as EventListener)
 window.__TRYAMM_GAME_APP_INCOME_BRIDGE__={version:'1.0.0'}
 window.dispatchEvent(new CustomEvent('tryamm:game-app-income-bridge-ready',{detail:{version:'1.0.0',gameToCommerce:true,sceneToSale:true,creatorAttribution:true,merchantAttribution:true,serverAuthoritativeSettlement:true}}))
 return()=>{window.removeEventListener('tryamm:game-commerce-intent',onGameIntent as EventListener);window.removeEventListener('tryamm:scene-to-sale-candidate',onSceneSale as EventListener);delete window.__TRYAMM_GAME_APP_INCOME_BRIDGE__}
}