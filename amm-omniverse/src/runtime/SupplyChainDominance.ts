export type SupplyMode='normal'|'watch'|'disrupted'|'emergency'|'recovery'
export type SupplierTier='local'|'regional'|'national'|'global'

export interface SupplierOption {
  supplierId:string
  sku:string
  tier:SupplierTier
  unitCost:number
  freightCost:number
  dutyCost:number
  leadTimeDays:number
  availableUnits:number
  reliability:number // 0..1
  complianceVerified:boolean
  coldChainCapable?:boolean
  localFirst?:boolean
}

export interface SupplyRequirement {
  sku:string
  quantity:number
  maxLeadTimeDays:number
  coldChainRequired?:boolean
  preferredTier?:SupplierTier
  minimumReliability?:number
}

export interface SupplyRouteDecision {
  supplierId:string
  sku:string
  quantity:number
  landedUnitCost:number
  leadTimeDays:number
  reliability:number
  reason:string[]
}

export interface InventoryPolicy {
  sku:string
  onHand:number
  dailyDemand:number
  leadTimeDays:number
  safetyStock:number
  reorderPoint:number
  targetStock:number
  essential:boolean
}

export interface SupplyChainState {
  mode:SupplyMode
  lastUpdatedAt:string
  criticalShortages:string[]
  alternateSupplierCount:number
  localSupplierShare:number
  fulfillmentRisk:'low'|'medium'|'high'|'critical'
}

export const SUPPLY_CHAIN_FLOW=[
  'DEMAND SIGNAL',
  'REAL INVENTORY',
  'SAFETY STOCK / REORDER POINT',
  'LOCAL-FIRST VERIFIED SUPPLIERS',
  'REGIONAL / NATIONAL / GLOBAL ALTERNATES',
  'LANDED COST + LEAD TIME + RELIABILITY',
  'COMPLIANCE / COLD-CHAIN CHECK',
  'BEST RESILIENT ROUTE',
  'PURCHASE ORDER',
  'FULFILLMENT + TRACKING',
  'RECEIVING / LOT / TEMPERATURE PROOF',
  'INVENTORY UPDATE',
  'MERCHANT / CUSTOMER DELIVERY',
  'REORDER LEARNING LOOP',
] as const

export function computeReorderPoint(dailyDemand:number,leadTimeDays:number,safetyStock:number){
  return Math.max(0,dailyDemand*leadTimeDays+safetyStock)
}

export function landedUnitCost(option:SupplierOption){
  return option.unitCost+option.freightCost+option.dutyCost
}

export function chooseSupplyRoute(requirement:SupplyRequirement,options:SupplierOption[]):SupplyRouteDecision|null{
  const minReliability=requirement.minimumReliability??0.8
  const eligible=options.filter(o=>
    o.sku===requirement.sku&&
    o.complianceVerified&&
    o.availableUnits>=requirement.quantity&&
    o.leadTimeDays<=requirement.maxLeadTimeDays&&
    o.reliability>=minReliability&&
    (!requirement.coldChainRequired||o.coldChainCapable)
  )
  if(!eligible.length)return null

  const ranked=[...eligible].sort((a,b)=>{
    const localA=a.localFirst?1:0,localB=b.localFirst?1:0
    if(localA!==localB)return localB-localA
    const scoreA=landedUnitCost(a)+(a.leadTimeDays*0.25)+((1-a.reliability)*20)
    const scoreB=landedUnitCost(b)+(b.leadTimeDays*0.25)+((1-b.reliability)*20)
    return scoreA-scoreB
  })
  const best=ranked[0]
  return {
    supplierId:best.supplierId,
    sku:best.sku,
    quantity:requirement.quantity,
    landedUnitCost:landedUnitCost(best),
    leadTimeDays:best.leadTimeDays,
    reliability:best.reliability,
    reason:[
      best.localFirst?'local-first preference':'best eligible alternate',
      'compliance verified',
      requirement.coldChainRequired?'cold-chain capable':'standard fulfillment',
      'ranked by landed cost + lead time + reliability',
    ],
  }
}

export function emergencySafetyMultiplier(mode:SupplyMode,essential:boolean){
  if(!essential)return mode==='emergency'?1.15:1
  if(mode==='watch')return 1.2
  if(mode==='disrupted')return 1.5
  if(mode==='emergency')return 2
  if(mode==='recovery')return 1.25
  return 1
}

export const SUPPLY_CHAIN_RULES={
  noExclusiveSupplierLockIn:true,
  localFirstWhenCompetitive:true,
  multiSupplierByDefault:true,
  antiPriceGougingAlerts:true,
  essentialGoodsSafetyStock:true,
  coldChainTraceability:true,
  supplierComplianceRequired:true,
  noClientSidePurchaseOrderAuthority:true,
  serverVerifiedInventory:true,
  humanApprovalForCriticalEmergencyOverrides:true,
} as const

export const SUPPLY_CHAIN_POSITIONING='TRYAMM supply-chain advantage means faster, cheaper, more resilient orchestration through diversified verified suppliers—not unlawful market exclusion or coercive control.' as const
