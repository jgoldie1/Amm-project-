export type NPCScheduleStop='HOME'|'COMMUTE'|'WORK'|'SHOP'|'RESTAURANT'|'EVENT'
export type StorePhase='OPEN'|'RECEIVE_INVENTORY'|'CUSTOMERS_ARRIVE'|'SALES_CHANGE_STOCK'|'REORDER'|'DELIVERY_ARRIVES'|'PROMOTION'|'HOLO_COUPON'
export type CreatorPhase='RECORD'|'EDIT'|'REEL'|'PUBLISH'|'PRODUCT_TAG'|'VIEWER_ENTERS_WORLD'|'PURCHASE'|'CREATOR_ATTRIBUTION'

export const LIVING_WORLD_SYSTEMS=[
 'PEDESTRIANS','TRAFFIC','WEATHER','DAY_NIGHT','ANIMALS','RESTAURANTS','CLUBS','BUSINESSES','JOBS','HOUSING','MUSIC','EVENTS','NPC_MEMORY','MISSIONS','PLAYER_BUSINESSES','CREATOR_EVENTS','LIVE_COMMERCE','REAL_STORES','REAL_PRODUCTS','FOOD_DELIVERY','GLOBAL_ORDER_TRACKING','REELS','PLAYER_ECONOMY'
] as const

export const NPC_DAY:NPCScheduleStop[]=['HOME','COMMUTE','WORK','SHOP','RESTAURANT','EVENT','HOME']
export const STORE_LOOP:StorePhase[]=['OPEN','RECEIVE_INVENTORY','CUSTOMERS_ARRIVE','SALES_CHANGE_STOCK','REORDER','DELIVERY_ARRIVES','PROMOTION','HOLO_COUPON','CUSTOMERS_ARRIVE']
export const CREATOR_LOOP:CreatorPhase[]=['RECORD','EDIT','REEL','PUBLISH','PRODUCT_TAG','VIEWER_ENTERS_WORLD','PURCHASE','CREATOR_ATTRIBUTION']

export type ProductCard={image?:string;brand:string;product:string;variant:string;seller:string;verified:boolean;price:number;memberPrice?:number;coupon?:string;deliveryEta?:string;stockConfidence:'high'|'medium'|'low';creatorVideo?:string;sku:string}
export type TrackingEvent={status:string;location?:string;time:string;carrier?:string;proof?:string}
export type WorldBusiness={id:string;name:string;kind:string;stock:Record<string,number>;open:boolean;traffic:number;reorderThreshold:number;promotion?:string}
export type LivingWorldState={minute:number;weather:string;dayPhase:string;pedestrians:number;traffic:number;animals:number;events:string[];businesses:WorldBusiness[];npcMemory:Record<string,string[]>;tracking:Record<string,TrackingEvent[]>}

export function createLivingWorldState():LivingWorldState{return {minute:0,weather:'clear',dayPhase:'morning',pedestrians:120,traffic:70,animals:28,events:['Neighborhood market opens'],businesses:[],npcMemory:{},tracking:{}}}
export function advanceWorld(state:LivingWorldState,minutes=5):LivingWorldState{
 const minute=(state.minute+minutes)%(24*60),hour=Math.floor(minute/60)
 const dayPhase=hour<6?'night':hour<12?'morning':hour<18?'afternoon':hour<22?'evening':'night'
 const traffic=dayPhase==='morning'||dayPhase==='evening'?110:dayPhase==='night'?35:75
 const pedestrians=dayPhase==='night'?55:dayPhase==='evening'?155:125
 return {...state,minute,dayPhase,traffic,pedestrians,businesses:state.businesses.map(b=>({...b,traffic:Math.max(0,b.traffic+Math.round((Math.random()-.45)*8))}))}
}
export function remember(state:LivingWorldState,npcId:string,event:string):LivingWorldState{return {...state,npcMemory:{...state.npcMemory,[npcId]:[...(state.npcMemory[npcId]||[]).slice(-9),event]}}}
export function recordTracking(state:LivingWorldState,orderId:string,event:TrackingEvent):LivingWorldState{return {...state,tracking:{...state.tracking,[orderId]:[...(state.tracking[orderId]||[]),event]}}}
export function applySale(state:LivingWorldState,businessId:string,sku:string,qty=1):LivingWorldState{return {...state,businesses:state.businesses.map(b=>b.id!==businessId?b:{...b,stock:{...b.stock,[sku]:Math.max(0,(b.stock[sku]||0)-qty)}})}}
export function needsReorder(business:WorldBusiness){return Object.entries(business.stock).filter(([,qty])=>qty<=business.reorderThreshold).map(([sku])=>sku)}

export const PRODUCT_TO_WORLD_LOOP='GAME PRODUCT → REAL SKU → VIRTUAL WAREHOUSE → REAL AVAILABILITY → HOLO COUPON → CART → GUARDIAN → PAYMENT → FULFILLMENT → DELIVERY'
export const CREATOR_COMMERCE_LOOP='RECORD → EDIT → REEL → PUBLISH → PRODUCT TAG → VIEWER ENTERS WORLD → PURCHASE → CREATOR ATTRIBUTION'
export const PROFIT_STACK=['RETAIL_MARGIN','WHOLESALE_MARGIN','MARKETPLACE_COMMISSION','MERCHANT_SUBSCRIPTION','BUSINESS_IN_A_BOX','DELIVERY','FULFILLMENT_ORCHESTRATION','CREATOR_AFFILIATE_COMMISSION','SPONSORED_HOLO_COUPONS','ADVERTISING','LIVE_COMMERCE','SOFTWARE_SERVICES','INVENTORY_REORDER_SERVICES'] as const
