export type IndustrialDomain='ADDITIVE_MANUFACTURING'|'WAREHOUSE'|'IMPORT_EXPORT'|'MINING'|'CROP_GROWING'|'SUPPLIER_NETWORK'
export type IndustrialStatus='FOUNDATION_READY'|'PROVIDER_GATED'|'REGULATORY_GATED'|'EVIDENCE_GATED'
export type SupplierChannel='EMAIL'|'PHONE'|'WHATSAPP'|'PORTAL'|'EDI'|'API'
export type SupplierOutreachPurpose='RFQ'|'SAMPLE_REQUEST'|'CAPACITY_CHECK'|'COMPLIANCE_DOCS'|'ORDER_FOLLOWUP'|'QUALITY_ISSUE'

export interface IndustrialCapability{
  id:string
  domain:IndustrialDomain
  status:IndustrialStatus
  purpose:string
  authoritativeOwner:'TRYAMM_SERVER'|'EXTERNAL_PROVIDER'|'REGULATED_OPERATOR'
  evidence:string[]
}

export interface SupplierOutreachRequest{
  supplierId:string
  contactId:string
  channel:SupplierChannel
  purpose:SupplierOutreachPurpose
  humanApproved:boolean
  complianceChecked:boolean
  publicBusinessContactOrRelationship:boolean
  optedOut:boolean
  sanctionsOrRestrictedPartyHold:boolean
  rfqId?:string
  attachmentEvidenceIds?:string[]
}

export const TRYAMM_INDUSTRIAL_CAPABILITIES:IndustrialCapability[]=[
  {id:'tryamm-advanced-additive',domain:'ADDITIVE_MANUFACTURING',status:'FOUNDATION_READY',authoritativeOwner:'TRYAMM_SERVER',purpose:'Manage print/manufacturing jobs across qualified 3D printers, multi-axis robotic deposition, CNC/laser/cutting and metrology/QC adapters without claiming unvalidated fabrication capability.',evidence:['machine profile','material lot','qualified process','job file hash','inspection result']},
  {id:'warehouse-digital-twin',domain:'WAREHOUSE',status:'FOUNDATION_READY',authoritativeOwner:'TRYAMM_SERVER',purpose:'Track receiving, putaway, bins, pallets, cycle counts, reservation, picking, packing, yard/dock state, cold-chain readings and robot tasks from one inventory truth.',evidence:['facility','location/bin','lot/serial','inventory event','reconciliation timestamp']},
  {id:'global-import-export-control',domain:'IMPORT_EXPORT',status:'REGULATORY_GATED',authoritativeOwner:'REGULATED_OPERATOR',purpose:'Connect RFQs and POs to classification, origin, trade documents, freight, customs/broker workflows, sanctions screening and landed-cost evidence.',evidence:['party screening','HS/origin evidence','commercial documents','broker/carrier source','customs status']},
  {id:'mine-operations-digital-twin',domain:'MINING',status:'REGULATORY_GATED',authoritativeOwner:'REGULATED_OPERATOR',purpose:'Represent permitted sites, ore/material lots, equipment telemetry, maintenance, worker exclusion zones, environmental monitoring, haulage, stockpiles and reclamation evidence. AI remains advisory and does not control blasting or other hazardous extraction processes.',evidence:['permit/site authority','material assay/provenance','equipment source','environmental evidence','human safety approval']},
  {id:'crop-production-control',domain:'CROP_GROWING',status:'FOUNDATION_READY',authoritativeOwner:'TRYAMM_SERVER',purpose:'Connect field plans, seed/input lots, soil/moisture observations, irrigation, farm-robot missions, harvest batches, cold chain, warehouse receipts and marketplace traceability.',evidence:['field/zone','input lot','production activity','harvest lot','storage/temperature record']},
  {id:'supplier-network-crm',domain:'SUPPLIER_NETWORK',status:'PROVIDER_GATED',authoritativeOwner:'TRYAMM_SERVER',purpose:'Create a supplier directory, RFQ inbox, verified business contacts, quote comparison, translated outreach, sample requests, capacity checks, compliance-document requests and response tracking.',evidence:['supplier identity','verified business contact','outreach approval','RFQ/order link','communication audit record']},
]

export const TRYAMM_ADVANCED_MANUFACTURING={
  brandResearchLabel:'TRYAMM 12D Forge',
  technicalFoundation:['3D additive manufacturing','multi-axis robotic deposition','CNC/laser/cutting adapters','machine vision/metrology','material traceability','job simulation/digital twin'],
  claimBoundary:'12D printing is a TRYAMM brand/research label, not a claim that a recognized 12-dimensional manufacturing standard or validated physical process currently exists.',
  productionRule:'Only qualified machines, materials, process parameters and inspection evidence may mark a physical manufacturing job production-ready.',
} as const

export const TRYAMM_SUPPLIER_WORKFLOW=[
  'supplier.discovered',
  'supplier.identity_verified',
  'supplier.compliance_checked',
  'rfq.created',
  'outreach.approved',
  'outreach.sent_by_provider',
  'supplier.responded',
  'quote.normalized',
  'sample.requested',
  'quote.accepted',
  'po.created',
  'golden_order.linked',
] as const

export const TRYAMM_INDUSTRIAL_FLOW=[
  'SUPPLIER',
  'RFQ',
  'QUOTE',
  'PO',
  'IMPORT_EXPORT',
  'WAREHOUSE',
  'MANUFACTURE_OR_GROW_OR_EXTRACT',
  'QUALITY_AND_PROVENANCE',
  'INVENTORY',
  'LIVE_AND_MARKETPLACE',
  'DELIVERY',
  'SETTLEMENT',
] as const

export const TRYAMM_INDUSTRIAL_AUTHORITY={
  clientMay:['discover','visualize','simulate','compare quotes','draft outreach','request manufacturing job','request warehouse move','plan crop task','view mine digital twin'],
  serverOnly:['send approved supplier outreach through configured provider','create authoritative PO','reserve/reconcile inventory','record authoritative warehouse state','record settlement','commit production lot provenance'],
  regulatedOperatorOnly:['customs filing/admissibility','regulated mining/extraction authorization','hazardous machine operation','permit approval'],
  neverAutoAuthorize:['supplier payment','customs clearance','mining permit','blasting','hazardous extraction','regulated autonomous machinery movement'],
} as const

export function validateSupplierOutreach(request:SupplierOutreachRequest){
  const reasons:string[]=[]
  if(!request.supplierId.trim())reasons.push('missing-supplier-id')
  if(!request.contactId.trim())reasons.push('missing-contact-id')
  if(!request.humanApproved)reasons.push('human-approval-required')
  if(!request.complianceChecked)reasons.push('compliance-check-required')
  if(!request.publicBusinessContactOrRelationship)reasons.push('business-contact-basis-required')
  if(request.optedOut)reasons.push('supplier-opted-out')
  if(request.sanctionsOrRestrictedPartyHold)reasons.push('restricted-party-hold')
  if(request.purpose==='RFQ'&&!request.rfqId?.trim())reasons.push('rfq-id-required')
  return{allowed:reasons.length===0,reasons}
}

export function buildSupplierOutreachDispatch(request:SupplierOutreachRequest){
  const validation=validateSupplierOutreach(request)
  return validation.allowed
    ?{dispatchAllowed:true as const,providerActionRequired:true,supplierId:request.supplierId,contactId:request.contactId,channel:request.channel,purpose:request.purpose,rfqId:request.rfqId,auditRequired:true}
    :{dispatchAllowed:false as const,reasons:validation.reasons}
}

export function mayIndustrialAIFileCustoms(){return false as const}
export function mayIndustrialAIApproveMiningPermit(){return false as const}
export function mayIndustrialAIBypassWarehouseInventoryTruth(){return false as const}
export function mayIndustrialAIAutoSendSupplierOutreachWithoutApproval(){return false as const}
