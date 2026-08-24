export type SourcingDocumentType='NDA'|'NNN'|'NON_CIRCUMVENTION'|'MSA'|'SOW'|'RFQ'|'RFP'|'PO'|'LOI'|'IP_ASSIGNMENT'|'WORK_FOR_HIRE'|'DPA'|'VENDOR_CODE'|'QUALITY_AGREEMENT'|'SUPPLIER_ONBOARDING'
export type SupplierRisk='low'|'medium'|'high'|'blocked'

export type SupplierProfile={
  id:string
  name:string
  country:string
  categories:string[]
  capabilities:string[]
  certifications:string[]
  leadTimeDays:number|null
  moq:number|null
  paymentTerms:string|null
  risk:SupplierRisk
  verified:boolean
  provenanceScore:number
  qualityScore:number
  deliveryScore:number
  communicationScore:number
}

export type DealProtection={
  ndaRequired:boolean
  nnnRequired:boolean
  nonCircumventionRequired:boolean
  ipAssignmentRequired:boolean
  dpaRequired:boolean
  counselReviewRequired:boolean
  watermarking:boolean
  accessLogging:boolean
  expirationDays:number
}

export type SourcingEvent={id:string;type:string;supplierId?:string;dealId?:string;at:number;metadata:Record<string,unknown>}

const SUPPLIERS_KEY='tryamm_quantum_sourcing_suppliers_v1'
const EVENTS_KEY='tryamm_quantum_sourcing_events_v1'
const DEAL_POLICY_KEY='tryamm_quantum_sourcing_deal_policy_v1'
let installed=false

const DEFAULT_POLICY:DealProtection={
  ndaRequired:true,nnnRequired:true,nonCircumventionRequired:true,ipAssignmentRequired:false,dpaRequired:false,counselReviewRequired:true,watermarking:true,accessLogging:true,expirationDays:365,
}

export const SOURCING_DOCUMENT_LIBRARY:Array<{type:SourcingDocumentType;label:string;purpose:string;legalStatus:'template-only'|'operational'}>=[
  {type:'NDA',label:'Mutual / Supplier NDA',purpose:'Protect confidential information shared during sourcing, evaluation and collaboration.',legalStatus:'template-only'},
  {type:'NNN',label:'NNN Agreement',purpose:'Non-use, non-disclosure and non-circumvention protection for sourcing relationships and introduced opportunities.',legalStatus:'template-only'},
  {type:'NON_CIRCUMVENTION',label:'Non-Circumvention',purpose:'Protect introductions, sourcing relationships and deal channels from bypassing agreed parties.',legalStatus:'template-only'},
  {type:'MSA',label:'Master Services Agreement',purpose:'Framework for recurring supplier or contractor work.',legalStatus:'template-only'},
  {type:'SOW',label:'Statement of Work',purpose:'Define scope, deliverables, acceptance criteria, milestones and fees.',legalStatus:'template-only'},
  {type:'RFQ',label:'Request for Quote',purpose:'Collect comparable pricing, MOQ, lead time and commercial terms.',legalStatus:'operational'},
  {type:'RFP',label:'Request for Proposal',purpose:'Collect solution proposals for complex sourcing needs.',legalStatus:'operational'},
  {type:'PO',label:'Purchase Order',purpose:'Authorize a defined purchase with quantity, price and delivery terms.',legalStatus:'operational'},
  {type:'LOI',label:'Letter of Intent',purpose:'Capture preliminary commercial intent before final agreements.',legalStatus:'template-only'},
  {type:'IP_ASSIGNMENT',label:'IP Assignment',purpose:'Assign agreed intellectual-property rights created under a project.',legalStatus:'template-only'},
  {type:'WORK_FOR_HIRE',label:'Work-for-Hire Addendum',purpose:'Define ownership treatment for commissioned creative or technical work where legally applicable.',legalStatus:'template-only'},
  {type:'DPA',label:'Data Processing Agreement',purpose:'Define processor/controller obligations for personal-data handling.',legalStatus:'template-only'},
  {type:'VENDOR_CODE',label:'Vendor Code of Conduct',purpose:'Supplier expectations for ethics, labor, safety, compliance and business conduct.',legalStatus:'operational'},
  {type:'QUALITY_AGREEMENT',label:'Quality Agreement',purpose:'Define quality controls, inspection, change control and nonconformance handling.',legalStatus:'template-only'},
  {type:'SUPPLIER_ONBOARDING',label:'Supplier Onboarding',purpose:'Collect identity, banking, tax, compliance, capability and operational data.',legalStatus:'operational'},
]

function loadSuppliers():SupplierProfile[]{try{const v=JSON.parse(localStorage.getItem(SUPPLIERS_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function loadEvents():SourcingEvent[]{try{const v=JSON.parse(localStorage.getItem(EVENTS_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function loadPolicy():DealProtection{try{return {...DEFAULT_POLICY,...JSON.parse(localStorage.getItem(DEAL_POLICY_KEY)||'{}')}}catch{return DEFAULT_POLICY}}
function persist(suppliers:SupplierProfile[],events:SourcingEvent[],policy:DealProtection){try{localStorage.setItem(SUPPLIERS_KEY,JSON.stringify(suppliers));localStorage.setItem(EVENTS_KEY,JSON.stringify(events.slice(-500)));localStorage.setItem(DEAL_POLICY_KEY,JSON.stringify(policy))}catch{}}
function supplierScore(s:SupplierProfile){return Math.round((s.provenanceScore*.25+s.qualityScore*.3+s.deliveryScore*.25+s.communicationScore*.2)*100)/100}

export function installQuantumSourcingRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  let suppliers=loadSuppliers();let events=loadEvents();let policy=loadPolicy()
  const publish=()=>{
    persist(suppliers,events,policy)
    window.dispatchEvent(new CustomEvent('tryamm:quantum-sourcing-state',{detail:{schema:'tryamm.quantum-sourcing.v1',suppliers:suppliers.map(s=>({...s,score:supplierScore(s)})),events,policy,documents:SOURCING_DOCUMENT_LIBRARY,features:['supplier-discovery','rfq-rfp','vendor-scorecards','provenance','quality','lead-time','moq','deal-room','nda','nnn','non-circumvention','ip-protection','access-logs','watermarking','audit-trail','counsel-review-gates'],legalNotice:'Contract templates and policy flags require qualified legal review for the applicable jurisdiction before execution.'}}))
  }
  queueMicrotask(publish)
  window.addEventListener('tryamm:quantum-sourcing-request',publish)
  window.addEventListener('tryamm:quantum-sourcing-supplier-upsert',(event:Event)=>{
    const supplier=(event as CustomEvent<SupplierProfile>).detail
    if(!supplier?.id)return
    suppliers=[...suppliers.filter(s=>s.id!==supplier.id),supplier]
    events=[...events,{id:`evt-${Date.now()}`,type:'supplier-upsert',supplierId:supplier.id,at:Date.now(),metadata:{verified:supplier.verified,risk:supplier.risk}}]
    publish()
  })
  window.addEventListener('tryamm:quantum-sourcing-policy-update',(event:Event)=>{policy={...policy,...((event as CustomEvent<Partial<DealProtection>>).detail||{})};events=[...events,{id:`evt-${Date.now()}`,type:'policy-update',at:Date.now(),metadata:{...policy}}];publish()})
  window.addEventListener('tryamm:quantum-sourcing-event',(event:Event)=>{const d=(event as CustomEvent<Partial<SourcingEvent>>).detail||{};events=[...events,{id:d.id||`evt-${Date.now()}`,type:String(d.type||'activity'),supplierId:d.supplierId,dealId:d.dealId,at:d.at||Date.now(),metadata:d.metadata||{}}];publish()})
}
