export type SupplierStatus='candidate'|'document-review'|'sample-approved'|'verified'|'suspended'
export type FulfillmentMode='dropship'|'supplier-direct'|'micro-batch'|'virtual-warehouse'|'3pl'|'local-delivery'
export type SupplierVettingCheck=
  |'identity'
  |'business-registration'
  |'banking'
  |'sample-quality'
  |'product-rights'
  |'compliance'
  |'insurance'
  |'return-policy'
  |'inventory-feed'
  |'shipping-sla'

export type SupplierProfile={
 id:string
 name:string
 country:string
 status:SupplierStatus
 checks:Partial<Record<SupplierVettingCheck,boolean>>
 moq:number
 leadTimeDays:number
 fulfillment:FulfillmentMode[]
 dropship:boolean
 dtc:boolean
}

export type SupplierVettingResult={
 eligible:boolean
 score:number
 missing:SupplierVettingCheck[]
 reasons:string[]
}

const REQUIRED:SupplierVettingCheck[]=[
 'identity','business-registration','banking','sample-quality','product-rights',
 'compliance','return-policy','inventory-feed','shipping-sla'
]

export function evaluateSupplierVetting(supplier:SupplierProfile):SupplierVettingResult{
 const missing=REQUIRED.filter(check=>supplier.checks[check]!==true)
 const score=Math.round(((REQUIRED.length-missing.length)/REQUIRED.length)*100)
 const reasons:string[]=[]
 if(supplier.status==='suspended')reasons.push('supplier_suspended')
 if(missing.length)reasons.push('required_vetting_incomplete')
 if(supplier.moq<0)reasons.push('invalid_moq')
 return{
  eligible:supplier.status==='verified'&&!missing.length&&supplier.moq>=0,
  score,
  missing,
  reasons
 }
}

export type TariffCostInput={
 productCostMinor:number
 freightMinor:number
 insuranceMinor?:number
 dutyMinor:number
 brokerageMinor?:number
 taxMinor?:number
 pickPackMinor?:number
 deliveryMinor?:number
 returnsReserveMinor?:number
 marginMinor?:number
 authoritativeClassification:boolean
 authoritativeOrigin:boolean
 programEligibilityVerified?:boolean
}

export type TariffCostResult={
 schema:'tryamm.quantum-tariff-buster.v1'
 landedCostMinor:number
 floorPriceMinor:number
 canPublishPrice:boolean
 blockers:string[]
 lawfulOnly:true
}

export function calculateLawfulLandedCost(input:TariffCostInput):TariffCostResult{
 const blockers:string[]=[]
 if(!input.authoritativeClassification)blockers.push('hs_classification_not_verified')
 if(!input.authoritativeOrigin)blockers.push('country_of_origin_not_verified')
 const values=[
  input.productCostMinor,input.freightMinor,input.insuranceMinor||0,input.dutyMinor,
  input.brokerageMinor||0,input.taxMinor||0,input.pickPackMinor||0,input.deliveryMinor||0,
  input.returnsReserveMinor||0
 ].map(v=>Math.max(0,Math.floor(Number(v)||0)))
 const landedCostMinor=values.reduce((a,b)=>a+b,0)
 const floorPriceMinor=landedCostMinor+Math.max(0,Math.floor(Number(input.marginMinor)||0))
 return{
  schema:'tryamm.quantum-tariff-buster.v1',
  landedCostMinor,
  floorPriceMinor,
  canPublishPrice:blockers.length===0,
  blockers,
  lawfulOnly:true
 }
}

export const QUANTUM_SOURCE_FLOW=[
 'VET SUPPLIER',
 'RFQ / QUOTE',
 'LOW MOQ / SAMPLE',
 'DTC DEMAND TEST / PREORDER',
 'MICRO-BATCH OR DROPSHIP',
 'PURCHASE ORDER',
 'QUANTUM TARIFF BUSTER',
 'VIRTUAL WAREHOUSE',
 '3PL / SUPPLIER-DIRECT FULFILLMENT',
 'PROOF TRACKING',
 'CUSTOMER DELIVERY',
 'SMART REORDER'
] as const


export type QuantumPaddingProfile={
 fragile:boolean
 liquid:boolean
 crushRisk:boolean
 highValue:boolean
 temperatureSensitive:boolean
 recommended:[
  'inner-cushion'|'corner-protection'|'void-fill'|'double-wall-box'|'tamper-seal'|
  'water-barrier'|'thermal-liner'|'signature-required'|'photo-proof'
 ][number][]
}

export function buildQuantumPaddingProfile(input:{
 fragile?:boolean
 liquid?:boolean
 crushRisk?:boolean
 highValue?:boolean
 temperatureSensitive?:boolean
}):QuantumPaddingProfile{
 const recommended:QuantumPaddingProfile['recommended']=[]
 if(input.fragile)recommended.push('inner-cushion','corner-protection','void-fill')
 if(input.crushRisk)recommended.push('double-wall-box')
 if(input.liquid)recommended.push('water-barrier','tamper-seal')
 if(input.temperatureSensitive)recommended.push('thermal-liner')
 if(input.highValue)recommended.push('tamper-seal','signature-required','photo-proof')
 return{
  fragile:Boolean(input.fragile),
  liquid:Boolean(input.liquid),
  crushRisk:Boolean(input.crushRisk),
  highValue:Boolean(input.highValue),
  temperatureSensitive:Boolean(input.temperatureSensitive),
  recommended:[...new Set(recommended)]
 }
}
