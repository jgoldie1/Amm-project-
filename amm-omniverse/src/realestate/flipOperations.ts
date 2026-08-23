export type RegulatedService = 'brokerage'|'appraisal'|'lending'|'contracting'|'inspection'|'legal'

export type FlipScenario = 'best'|'base'|'worst'

export type FlipFinancials = {
  purchasePrice:number
  rehabBudget:number
  financingCost:number
  carryingCost:number
  closingBuyingCost:number
  closingSellingCost:number
  taxesAndOther:number
  afterRepairValue:number
}

export type FlipAnalysis = FlipFinancials & {
  projectedProfit:number
  totalProjectCost:number
  roi:number
  breakEvenSalePrice:number
}

export function analyzeFlip(f:FlipFinancials):FlipAnalysis{
  const totalProjectCost=f.purchasePrice+f.rehabBudget+f.financingCost+f.carryingCost+f.closingBuyingCost+f.closingSellingCost+f.taxesAndOther
  const projectedProfit=f.afterRepairValue-totalProjectCost
  const roi=totalProjectCost>0?projectedProfit/totalProjectCost:0
  return {...f,totalProjectCost,projectedProfit,roi,breakEvenSalePrice:totalProjectCost}
}

export function scenarioAnalysis(base:FlipFinancials){
  const adjust=(scenario:FlipScenario):FlipFinancials=>{
    if(scenario==='best') return {...base,rehabBudget:base.rehabBudget*.9,carryingCost:base.carryingCost*.85,afterRepairValue:base.afterRepairValue*1.05}
    if(scenario==='worst') return {...base,rehabBudget:base.rehabBudget*1.2,carryingCost:base.carryingCost*1.35,afterRepairValue:base.afterRepairValue*.92}
    return base
  }
  return {best:analyzeFlip(adjust('best')),base:analyzeFlip(adjust('base')),worst:analyzeFlip(adjust('worst'))}
}

export const FLIP_WORKSTREAMS=[
  {key:'comps',title:'Comp Research',outputs:['comparable sales','price-per-square-foot notes','market-time notes','source references']},
  {key:'deal',title:'Deal Analysis',outputs:['purchase assumptions','ARV range','best/base/worst scenarios','maximum acquisition model']},
  {key:'construction',title:'Construction Budgeting',outputs:['scope of work','line-item budget','contingency','change-order log']},
  {key:'docs',title:'Project Documentation',outputs:['decision log','receipts/invoices index','permits/approvals index','before/during/after records']},
  {key:'media',title:'Property Photo + Video',outputs:['before photos','progress media','finished media','listing-safe exports']},
  {key:'scan3d',title:'3D Scan + Digital Twin',outputs:['room scan','measurements reference','3D tour assets','privacy review']},
  {key:'holo',title:'Holo Listing',outputs:['interactive tour','3D staging plan','feature hotspots','marketplace link']},
  {key:'marketing',title:'Marketing',outputs:['campaign brief','reels/clips','Holo ad placements','lead attribution']},
  {key:'security',title:'Property Record Cybersecurity',outputs:['access review','document classification','secret/PII redaction','audit trail']},
  {key:'admin',title:'Administrative Project Support',outputs:['schedule','vendor contact log','milestone tracker','closeout checklist']},
] as const

export const REGULATED_GATES:Record<RegulatedService,{requiresQualifiedProfessional:true;rule:string}>={
  brokerage:{requiresQualifiedProfessional:true,rule:'Representation, agency, listing/buyer brokerage and other licensed brokerage activity must be performed by an appropriately licensed real-estate professional.'},
  appraisal:{requiresQualifiedProfessional:true,rule:'A formal appraisal or valuation represented as an appraisal must be performed by an appropriately licensed or credentialed appraiser where required.'},
  lending:{requiresQualifiedProfessional:true,rule:'Mortgage origination, lending decisions and regulated financing activity stay with authorized lenders and licensed professionals where required.'},
  contracting:{requiresQualifiedProfessional:true,rule:'Work requiring contractor licensing, permits or trade credentials must be performed by appropriately qualified contractors/trades.'},
  inspection:{requiresQualifiedProfessional:true,rule:'Professional inspections represented as licensed inspections must be performed by properly qualified inspectors where required.'},
  legal:{requiresQualifiedProfessional:true,rule:'Legal advice, legal documents requiring counsel and attorney-only services stay with licensed legal professionals.'},
}

export const FLIP_OPERATING_RULES={
  arvIsEstimateNotGuarantee:true,
  studentLabsCannotAuthorizePurchase:true,
  aiCannotActAsBrokerAppraiserLenderContractorInspectorOrLawyer:true,
  externalPropertyDataMustShowSourceAndFreshness:true,
  sensitivePropertyDocumentsRequireAccessControl:true,
  marketingCannotMisrepresentConditionOrReturns:true,
} as const
