export type CustomerCommerceSurface='store'|'streetverse'|'reel'|'live'|'ar'|'vr'|'auction-watch'
declare global{interface Window{__TRYAMM_CUSTOMER_COMMERCE__?:{version:string;openProduct:(detail:Record<string,unknown>)=>void}}}
export function installCustomerCommerceRuntime(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_CUSTOMER_COMMERCE__)return()=>{}
 const openProduct=(detail:Record<string,unknown>)=>{
  window.dispatchEvent(new CustomEvent('tryamm:customer-product-open',{detail:{...detail,source:detail.source||'tryamm',fraudProtected:true,serverPriceAuthority:true}}))
 }
 window.__TRYAMM_CUSTOMER_COMMERCE__={version:'1.0.0',openProduct}
 window.dispatchEvent(new CustomEvent('tryamm:customer-commerce-ready',{detail:{
  version:'1.0.0',
  gamerToShop:true,
  arTryOn:true,
  vrShowroom:true,
  liveShopping:true,
  dropshipCatalog:true,
  shopifyBridge:true,
  ebayBridge:true,
  unifiedCartTarget:true
 }}))
 return()=>{delete window.__TRYAMM_CUSTOMER_COMMERCE__}
}
