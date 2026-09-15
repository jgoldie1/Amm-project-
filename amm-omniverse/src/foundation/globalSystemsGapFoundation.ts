export type GapStatus='FOUNDATION_READY'|'PROVIDER_GATED'|'EVIDENCE_GATED'|'REGULATORY_GATED'
export type GlobalTradeLane='identity-traceability'|'customs-data'|'trade-compliance'|'classification-origin'|'documents'|'logistics'|'inventory'|'risk-insurance'|'tax-currency'|'returns'
export type HolographicClass='TRUE_LIGHT_FIELD'|'SPATIAL_LIGHT_FIELD'|'HOLOLUMINESCENT'|'TELEPRESENCE_DISPLAY'|'OPENXR_HEADSET'

export type GlobalTradeGap={
  id:string
  lane:GlobalTradeLane
  status:GapStatus
  purpose:string
  requiredEvidence:string[]
  authority:'SERVER_AUTHORITATIVE'|'REFERENCE_STANDARD'|'PRESENTATION_ONLY'
}

export type HolographicProviderProfile={
  id:string
  displayClass:HolographicClass
  status:GapStatus
  bestFor:string[]
  integrationMode:'PROVIDER_ADAPTER'|'LOCAL_OPENXR'
  hardwareClaim:'PHYSICAL_PROVIDER_HARDWARE_REQUIRED'|'EXISTING_SOFTWARE_ONLY'
  notes:string
}

export const GLOBAL_TRADE_CONTROL_GAPS:GlobalTradeGap[]=[
  {id:'gs1-digital-link',lane:'identity-traceability',status:'FOUNDATION_READY',authority:'REFERENCE_STANDARD',purpose:'Give products, assets and locations durable web-linked identifiers for traceability, recalls, provenance and Digital Product Passport experiences.',requiredEvidence:['GTIN/GLN or approved internal identifier mapping','resolver/domain ownership','product provenance record']},
  {id:'wco-data-model-4.3',lane:'customs-data',status:'FOUNDATION_READY',authority:'REFERENCE_STANDARD',purpose:'Normalize cross-border customs and Single Window data around the current WCO Data Model rather than country-specific ad-hoc payloads.',requiredEvidence:['country implementation mapping','message/version mapping','data-owner approval']},
  {id:'us-ace-adapter',lane:'customs-data',status:'PROVIDER_GATED',authority:'SERVER_AUTHORITATIVE',purpose:'Represent U.S. import/export filing and admissibility workflows through an approved customs broker/ACE integration instead of client-side customs mutation.',requiredEvidence:['approved broker/filer relationship','ACE channel capability','production credentials','audit logging']},
  {id:'consolidated-screening-list',lane:'trade-compliance',status:'REGULATORY_GATED',authority:'SERVER_AUTHORITATIVE',purpose:'Screen suppliers, buyers, consignees and other transaction parties against authoritative U.S. restricted-party sources before regulated transactions proceed.',requiredEvidence:['screening timestamp','query/match evidence','human resolution of possible matches','official-source verification when required']},
  {id:'ofac-sanctions-screening',lane:'trade-compliance',status:'REGULATORY_GATED',authority:'SERVER_AUTHORITATIVE',purpose:'Screen relevant parties and transactions against current OFAC sanctions data and retain auditable review evidence.',requiredEvidence:['sanctions dataset/version','screening timestamp','match disposition','legal/compliance escalation when required']},
  {id:'hs-eccn-origin-engine',lane:'classification-origin',status:'REGULATORY_GATED',authority:'SERVER_AUTHORITATIVE',purpose:'Track HS classification, export-control classification, country of origin and preference evidence without treating AI suggestions as final legal classification.',requiredEvidence:['classification source','human/broker approval where required','origin evidence','effective date']},
  {id:'trade-document-vault',lane:'documents',status:'FOUNDATION_READY',authority:'SERVER_AUTHORITATIVE',purpose:'Version and retain commercial invoices, packing lists, bills of lading/air waybills, certificates, permits, customs evidence and exception documents.',requiredEvidence:['document hash','issuer','issue date','linked order/shipment','retention policy']},
  {id:'shipment-event-ledger',lane:'logistics',status:'FOUNDATION_READY',authority:'SERVER_AUTHORITATIVE',purpose:'Unify booking, pickup, port, departure, arrival, customs, warehouse and last-mile events into one auditable shipment timeline.',requiredEvidence:['carrier/provider source','event timestamp','location','shipment/container/package identifier']},
  {id:'inventory-reservation-reconciliation',lane:'inventory',status:'FOUNDATION_READY',authority:'SERVER_AUTHORITATIVE',purpose:'Prevent LIVE, marketplace and StreetVerse views from overselling stock by separating reservation, on-hand, available-to-promise and reconciliation truth.',requiredEvidence:['warehouse source','reservation id','reconciliation timestamp','exception handling']},
  {id:'cargo-insurance-claims',lane:'risk-insurance',status:'PROVIDER_GATED',authority:'SERVER_AUTHORITATIVE',purpose:'Attach insured value, coverage evidence, damage/loss claims and recovery state to real shipments.',requiredEvidence:['policy/provider','coverage period','declared value','claim evidence']},
  {id:'landed-cost-tax-currency',lane:'tax-currency',status:'REGULATORY_GATED',authority:'SERVER_AUTHORITATIVE',purpose:'Separate estimates from authoritative duty, tax, VAT/GST, FX, freight and fee settlement values.',requiredEvidence:['rate source','effective timestamp','jurisdiction','settlement source']},
  {id:'reverse-logistics-recovery',lane:'returns',status:'FOUNDATION_READY',authority:'SERVER_AUTHORITATIVE',purpose:'Track return authorization, inspection, refurbishment, resale, recycling, supplier chargeback and refund evidence.',requiredEvidence:['return id','item condition','warehouse disposition','refund/credit authority']},
]

export const HOLOGRAPHIC_SERVICE_PROFILES:HolographicProviderProfile[]=[
  {id:'light-field-lab-solidlight',displayClass:'TRUE_LIGHT_FIELD',status:'PROVIDER_GATED',integrationMode:'PROVIDER_ADAPTER',hardwareClaim:'PHYSICAL_PROVIDER_HARDWARE_REQUIRED',bestFor:['flagship HoloArena','location-based entertainment','large shared 3D experiences','future high-end telepresence research'],notes:'Treat as the highest-end true light-field/real-image holographic path. Requires vendor hardware, commercial agreement, content pipeline validation and on-site proof before TRYAMM may claim a physical SolidLight deployment.'},
  {id:'looking-glass-light-field-hld',displayClass:'HOLOLUMINESCENT',status:'PROVIDER_GATED',integrationMode:'PROVIDER_ADAPTER',hardwareClaim:'PHYSICAL_PROVIDER_HARDWARE_REQUIRED',bestFor:['retail signage','creator/product displays','education','portable spatial showcases','86-inch human-scale installations'],notes:'Useful as a more deployable glasses-free spatial display tier. Keep light-field/HLD claims precise and device-specific.'},
  {id:'proto-spatial-telepresence',displayClass:'TELEPRESENCE_DISPLAY',status:'PROVIDER_GATED',integrationMode:'PROVIDER_ADAPTER',hardwareClaim:'PHYSICAL_PROVIDER_HARDWARE_REQUIRED',bestFor:['entertainment','brand activations','AI hosts','remote appearances','creator events'],notes:'Use as a supported enterprise telepresence/spatial-display adapter, not as proof of free-space physics-lab holography.'},
  {id:'holoconnects-holobox',displayClass:'TELEPRESENCE_DISPLAY',status:'PROVIDER_GATED',integrationMode:'PROVIDER_ADAPTER',hardwareClaim:'PHYSICAL_PROVIDER_HARDWARE_REQUIRED',bestFor:['life-size two-way telepresence','telehealth','hospitality','events','AI concierge','retail'],notes:'Transparent-LCD telepresence class. Strong fit for life-size remote presence and AI concierge deployments; describe the underlying display honestly.'},
  {id:'tryamm-openxr-holoverse',displayClass:'OPENXR_HEADSET',status:'FOUNDATION_READY',integrationMode:'LOCAL_OPENXR',hardwareClaim:'EXISTING_SOFTWARE_ONLY',bestFor:['StreetVerse XR','Holoverse','training','immersive commerce','accessibility experiments'],notes:'Software/XR path only. It does not prove a glasses-free holographic display or physical force-field system exists.'},
]

export const GLOBAL_SYSTEMS_AUTHORITY_BOUNDARY={
  clientMay:['render','simulate','preview','navigate','request','display compliance status'],
  serverOnly:['party screening decision','customs filing state','inventory truth','shipment truth','tax/duty settlement','refund authority','seller payable balance'],
  neverClaimWithoutEvidence:['physical holographic hardware deployed','true light-field installation live','customs cleared','sanctions cleared','payment settled'],
} as const

export function getGlobalTradeGap(id:string){return GLOBAL_TRADE_CONTROL_GAPS.find(item=>item.id===id)}
export function getHolographicServiceProfile(id:string){return HOLOGRAPHIC_SERVICE_PROFILES.find(item=>item.id===id)}
export function listBlockedGlobalTradeGaps(){return GLOBAL_TRADE_CONTROL_GAPS.filter(item=>item.status==='PROVIDER_GATED'||item.status==='REGULATORY_GATED'||item.status==='EVIDENCE_GATED')}
export function mayRepresentHolographicHardwareAsLive(profile:HolographicProviderProfile,evidence:{providerAgreement?:boolean;hardwareInstalled?:boolean;acceptanceTestPassed?:boolean}){
  if(profile.hardwareClaim==='EXISTING_SOFTWARE_ONLY')return false
  return evidence.providerAgreement===true&&evidence.hardwareInstalled===true&&evidence.acceptanceTestPassed===true
}
