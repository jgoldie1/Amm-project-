export type LiveShoppingTwinEvent={
 id:string
 showId:string
 hostId:string
 productId:string
 source:'tryamm'|'streetverse'|'shopify'|'ebay'
 mode:'demo'|'live'
}

declare global{interface Window{__TRYAMM_LIVE_SHOPPING_TWIN__?:{version:string;feature:(event:LiveShoppingTwinEvent)=>void}}}

export function installLiveShoppingTwin(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_LIVE_SHOPPING_TWIN__)return()=>{}
 const feature=(event:LiveShoppingTwinEvent)=>{
  window.dispatchEvent(new CustomEvent('tryamm:live-shopping-product-featured',{detail:{
   ...event,
   experience:'tryamm-live-shopping-twin',
   officialQvcHsnIntegration:false,
   commerceAuthority:'server',
   checkoutRequiresVerifiedPrice:true,
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:commerce-intent-request',{detail:{
   schema:'tryamm.revenue.intent.v1',
   id:'live-shop-'+event.id,
   surface:'live',
   channel:'product-sale',
   itemId:event.productId,
   attribution:{creatorId:event.hostId,sourceContentId:event.showId,sourceVerse:'streetverse'},
   requiresServerVerification:true,
   clientMayCreatePayableBalance:false,
   authority:'server',
   settlement:'transaction-orchestrator',
  }}))
 }
 window.__TRYAMM_LIVE_SHOPPING_TWIN__={version:'1.0.0',feature}
 window.dispatchEvent(new CustomEvent('tryamm:live-shopping-twin-ready',{detail:{version:'1.0.0',qvcHsnStyle:true,officialQvcHsnIntegration:false,streetVerse:true,reels:true,live:true,arVr:true}}))
 return()=>{delete window.__TRYAMM_LIVE_SHOPPING_TWIN__}
}
