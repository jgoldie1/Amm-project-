export type GlobalMarket={
  id:string;country:string;region:string;cities:string[];currencies:string[];paymentAdapters:string[];
  businessLanes:string[];jobLanes:string[];mediaLanes:string[];diasporaLanes:string[];status:'wired'|'provider-gated'
}

export const GLOBAL_DIASPORA_MARKETS:GlobalMarket[]=[
  {id:'ng',country:'Nigeria',region:'West Africa',cities:['Lagos','Abuja','Port Harcourt'],currencies:['NGN','USD'],paymentAdapters:['Flutterwave','Paystack','OmniCash ledger'],businessLanes:['marketplace','global trade','creator commerce','Business OS','AI call center','Holo Ads','broadcasting'],jobLanes:['remote support','sales','creator production','marketplace operations','dealer/install support','media'],mediaLanes:['All American Network','creator channels','music','sports','news','LIVE'],diasporaLanes:['US↔Nigeria trade','diaspora commerce','creator collaboration','family remittance routing'],status:'provider-gated'},
  {id:'za',country:'South Africa',region:'Southern Africa',cities:['Johannesburg','Cape Town','Durban','Pretoria'],currencies:['ZAR','USD'],paymentAdapters:['approved regional provider','OmniCash ledger'],businessLanes:['marketplace','global trade','Business OS','AI call center','Holo Ads','broadcasting','tourism'],jobLanes:['remote support','sales','creator production','broadcast','tourism commerce','marketplace operations'],mediaLanes:['All American Network','creator channels','music','sports','news','LIVE'],diasporaLanes:['US↔South Africa trade','diaspora investment discovery','creator collaboration'],status:'provider-gated'},
  {id:'ht',country:'Haiti',region:'Caribbean',cities:['Port-au-Prince','Cap-Haïtien'],currencies:['HTG','USD'],paymentAdapters:['approved regional provider','OmniCash ledger'],businessLanes:['marketplace','global trade','Business OS','AI call center','Holo Ads','broadcasting','agriculture'],jobLanes:['remote support','sales','creator production','marketplace operations','agriculture commerce'],mediaLanes:['All American Network','creator channels','music','news','LIVE'],diasporaLanes:['US↔Haiti trade','diaspora commerce','family support routing','creator collaboration'],status:'provider-gated'},
  {id:'diaspora',country:'Global Diaspora',region:'Global',cities:['Chicago','New York','Toronto','London','Lagos','Johannesburg','Port-au-Prince','Accra','Kingston'],currencies:['USD','NGN','ZAR','HTG'],paymentAdapters:['OmniCash orchestration','country-approved provider adapters'],businessLanes:['cross-border marketplace','supplier discovery','services','creator economy','property discovery','travel commerce','Business OS','Holo Ads'],jobLanes:['remote jobs','contracting','creator work','support','sales','translation','media','marketplace operations'],mediaLanes:['All American Network','Isaiah AI TV','Servants of Christ Network','LIVE','podcasts','music','GameVerse broadcasts'],diasporaLanes:['buy local from abroad','sell globally','hire across borders','broadcast globally','investigate opportunities','send provider-compliant payments'],status:'provider-gated'}
]

let installed=false
export function installGlobalDiasporaBusinessRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:global-diaspora-business-state',{detail:{schema:'tryamm.global.diaspora.business.v1',markets:GLOBAL_DIASPORA_MARKETS,policy:{payments:'Real money movement requires an approved country/provider path, KYC/KYB/AML where applicable, server verification and ledger posting.',jobs:'Listings and applications must identify employer/contractor, location, compensation basis and eligibility; no guaranteed income claims.',ads:'Holo Ads may target market/context/interest with consent and policy controls; sensitive targeting and deceptive claims are prohibited.'}}}))
  queueMicrotask(publish)
  window.addEventListener('tryamm:global-diaspora-business-request',publish)
  window.addEventListener('tryamm:global-market-open',(event:Event)=>{
    const id=String((event as CustomEvent<any>).detail?.id||'diaspora')
    const market=GLOBAL_DIASPORA_MARKETS.find(m=>m.id===id)||GLOBAL_DIASPORA_MARKETS[3]
    window.dispatchEvent(new CustomEvent('tryamm:global-market-state',{detail:market}))
  })
  ;(window as any).__showGlobalDiasporaBusiness=(id='diaspora')=>window.dispatchEvent(new CustomEvent('tryamm:global-market-open',{detail:{id}}))
}
