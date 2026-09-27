export type RevenueSplitTemplate=
 |'business-recurring-scout'
 |'business-production-scout'
 |'creator-gift'
 |'creator-ticket-ppv'
 |'creator-subscription'
 |'creator-ad'
 |'owned-network-ad'
 |'marketplace-scout'
 |'licensing'

export type SplitDestination='platform'|'creator-rights'|'merchant'|'scout-sales'|'growth-reserve'

export interface SplitLine{destination:SplitDestination;basisPoints:number;notes?:string}
export interface SplitPolicy{template:RevenueSplitTemplate;lines:SplitLine[];term?:string}

export const TRYAMM_DEFAULT_SPLITS:SplitPolicy[]=[
 {template:'business-recurring-scout',term:'Scout share applies for first 12 paid months of an attributed business unless contract says otherwise.',lines:[
  {destination:'platform',basisPoints:8500},
  {destination:'scout-sales',basisPoints:1000},
  {destination:'growth-reserve',basisPoints:500},
 ]},
 {template:'business-production-scout',lines:[
  {destination:'platform',basisPoints:8500,notes:'Covers production labor, infrastructure and company margin.'},
  {destination:'scout-sales',basisPoints:1000},
  {destination:'growth-reserve',basisPoints:500},
 ]},
 {template:'creator-gift',lines:[
  {destination:'creator-rights',basisPoints:8000},
  {destination:'platform',basisPoints:1500},
  {destination:'growth-reserve',basisPoints:500},
 ]},
 {template:'creator-ticket-ppv',lines:[
  {destination:'creator-rights',basisPoints:7000},
  {destination:'platform',basisPoints:2500},
  {destination:'growth-reserve',basisPoints:500},
 ]},
 {template:'creator-subscription',lines:[
  {destination:'creator-rights',basisPoints:7000},
  {destination:'platform',basisPoints:2500},
  {destination:'growth-reserve',basisPoints:500},
 ]},
 {template:'creator-ad',lines:[
  {destination:'creator-rights',basisPoints:5500},
  {destination:'platform',basisPoints:3500},
  {destination:'scout-sales',basisPoints:500,notes:'Only when an eligible attributed seller/Scout exists; otherwise this returns to platform.'},
  {destination:'growth-reserve',basisPoints:500},
 ]},
 {template:'owned-network-ad',lines:[
  {destination:'platform',basisPoints:8500},
  {destination:'scout-sales',basisPoints:1000,notes:'Only for an eligible attributed ad sale; otherwise this returns to platform.'},
  {destination:'growth-reserve',basisPoints:500},
 ]},
 {template:'marketplace-scout',lines:[
  {destination:'merchant',basisPoints:9000},
  {destination:'platform',basisPoints:700},
  {destination:'scout-sales',basisPoints:300,notes:'Only for an eligible attributed merchant/customer event; otherwise this returns to platform.'},
 ]},
 {template:'licensing',lines:[
  {destination:'creator-rights',basisPoints:7000},
  {destination:'platform',basisPoints:2500},
  {destination:'growth-reserve',basisPoints:500},
 ]},
]

export const SPLIT_BASIS={
 basis:'net-distributable-revenue',
 definition:'Gross verified receipt less sales/use taxes collected for authorities, refunds/chargebacks and processor pass-through fees when contractually applicable.',
 founderPay:'Founder personal compensation is paid from the company/platform share under company accounting and tax rules; it is not an extra percentage charged on top.',
} as const

export const validateSplitPolicy=(policy:SplitPolicy)=>
 policy.lines.length>0 &&
 policy.lines.every(x=>Number.isInteger(x.basisPoints)&&x.basisPoints>=0) &&
 policy.lines.reduce((n,x)=>n+x.basisPoints,0)===10000

export const SPLIT_RULES={
 contractMayOverrideDefault:true,
 rightsHolderContractsOverrideGenericCreatorShare:true,
 scoutShareRequiresVerifiedAttribution:true,
 noScoutMeansEligibleScoutShareReturnsToPlatform:true,
 refundsAndChargebacksReverseProRata:true,
 allSplitsServerAuthoritative:true,
 noClientEditablePercentages:true,
 percentagesShownBeforeEligibleCreatorOrBusinessTransaction:true,
} as const
