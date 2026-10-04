export type CommerceChannelId='tryamm'|'streetverse'|'shopify'|'ebay'|'live-shopping-twin'

export type CommerceChannel={
 id:CommerceChannelId
 label:string
 mode:'native'|'external'
 capabilities:('catalog'|'checkout'|'orders'|'inventory'|'auction'|'live-shopping'|'ar-vr'|'dropship')[]
 live:boolean
 reason:string
}

export const COMMERCE_CHANNELS:CommerceChannel[]=[
 {id:'tryamm',label:'All American Marketplace / TRYAMM',mode:'native',capabilities:['catalog','checkout','orders','inventory','live-shopping','ar-vr','dropship'],live:true,reason:'Native TRYAMM channel'},
 {id:'streetverse',label:'StreetVerse Storefronts',mode:'native',capabilities:['catalog','checkout','orders','inventory','live-shopping','ar-vr'],live:true,reason:'Native TRYAMM world channel'},
 {id:'shopify',label:'Shopify',mode:'external',capabilities:['catalog','checkout','orders','inventory','dropship'],live:false,reason:'Requires authenticated Shopify store credentials and server-side connection'},
 {id:'ebay',label:'eBay',mode:'external',capabilities:['catalog','orders','inventory','auction'],live:false,reason:'Requires eBay OAuth and seller account permissions'},
 {id:'live-shopping-twin',label:'TRYAMM Live Shopping Twin',mode:'native',capabilities:['catalog','checkout','orders','live-shopping','ar-vr'],live:true,reason:'TRYAMM-owned QVC/HSN-style live-shopping experience; not an official QVC/HSN integration'},
]

export type CanonicalProduct={
 id:string
 sku:string
 title:string
 description?:string
 priceMinor:number
 currency:string
 inventory?:number
 images?:string[]
 supplier?:{name?:string;sourceId?:string;dropship?:boolean}
 arAssetUrl?:string
 vrAssetUrl?:string
 streetVerseStoreId?:string
}

export type ChannelListing={
 channel:CommerceChannelId
 productId:string
 externalListingId?:string
 state:'draft'|'ready'|'published'|'blocked'
 url?:string
 lastSyncedAt?:string
 reason?:string
}

export function buildChannelListing(product:CanonicalProduct,channel:CommerceChannelId):ChannelListing{
 const def=COMMERCE_CHANNELS.find(x=>x.id===channel)
 if(!def)return{channel,productId:product.id,state:'blocked',reason:'Unknown channel'}
 if(product.priceMinor<=0)return{channel,productId:product.id,state:'blocked',reason:'Authoritative positive price required'}
 if(!product.sku)return{channel,productId:product.id,state:'blocked',reason:'SKU required'}
 if(def.mode==='external'&&!def.live)return{channel,productId:product.id,state:'draft',reason:def.reason}
 return{channel,productId:product.id,state:'ready'}
}
