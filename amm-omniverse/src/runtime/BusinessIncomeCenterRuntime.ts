export type BusinessIncomeState='PENDING'|'VERIFIED'|'PAYABLE'|'PAID'|'REVERSED'
export type BusinessIncomeSource='storefront-sale'|'service-booking'|'event-ticket'|'virtual-rental'|'business-campaign'|'digital-twin-sponsorship'|'streetverse-sale'|'reel-attributed-sale'|'live-attributed-sale'|'campusverse-sale'|'crossverse-sale'

export type BusinessIncomeEntry={
 id:string; merchantId:string; passportId?:string; storeId?:string; source:BusinessIncomeSource; label:string;
 amountMinor:number; currency:'USD'; state:BusinessIncomeState; orderId?:string; creatorId?:string; scoutId?:string;
 sourceVerse?:string; sourceContentId?:string; createdAt:string; updatedAt:string; serverAuthoritative:true
}

export type BusinessIncomeSnapshot={
 currency:'USD';
 totals:{pendingMinor:number;verifiedMinor:number;payableMinor:number;paidMinor:number;reversedMinor:number};
 entries:BusinessIncomeEntry[]
}

declare global{interface Window{__TRYAMM_BUSINESS_INCOME_CENTER__?:{version:string;snapshot:()=>BusinessIncomeSnapshot;ingest:(entry:BusinessIncomeEntry)=>BusinessIncomeSnapshot}}}

const rows=new Map<string,BusinessIncomeEntry>()

const normalizeState=(value:unknown):BusinessIncomeState=>{
 const v=String(value||'').toUpperCase()
 if(v==='VERIFIED')return'VERIFIED'
 if(v==='PAYABLE')return'PAYABLE'
 if(v==='PAID')return'PAID'
 if(v==='REVERSED'||v==='REFUNDED')return'REVERSED'
 return'PENDING'
}

const snapshot=():BusinessIncomeSnapshot=>{
 const entries=[...rows.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))
 const totals={pendingMinor:0,verifiedMinor:0,payableMinor:0,paidMinor:0,reversedMinor:0}
 for(const row of entries){
  const amount=Math.max(0,Math.abs(row.amountMinor))
  if(row.state==='PENDING')totals.pendingMinor+=amount
  else if(row.state==='VERIFIED')totals.verifiedMinor+=amount
  else if(row.state==='PAYABLE')totals.payableMinor+=amount
  else if(row.state==='PAID')totals.paidMinor+=amount
  else totals.reversedMinor+=amount
 }
 return{currency:'USD',totals,entries}
}

const publish=()=>{const next=snapshot();window.dispatchEvent(new CustomEvent('tryamm:business-income-snapshot',{detail:next}));return next}

const ingest=(entry:BusinessIncomeEntry)=>{
 if(!entry?.id||!entry?.merchantId||entry.serverAuthoritative!==true)return snapshot()
 const now=new Date().toISOString()
 rows.set(entry.id,{...entry,amountMinor:Math.max(0,Math.floor(Number(entry.amountMinor||0))),state:normalizeState(entry.state),currency:'USD',createdAt:entry.createdAt||now,updatedAt:entry.updatedAt||now,serverAuthoritative:true})
 return publish()
}

export function installBusinessIncomeCenterRuntime(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_BUSINESS_INCOME_CENTER__)return()=>{}
 const onLedger=(event:Event)=>{
  const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
  if(String(d.class||'')!=='MERCHANT_PROCEEDS')return
  const authority=String(d.authority||d.persistence||'').toLowerCase()
  const authoritative=d.serverAuthoritative===true||authority.includes('server')||authority.includes('ledger')
  if(!authoritative)return
  const id=String(d.id||d.ledgerEventId||d.sourceEventId||'')
  const merchantId=String(d.merchantId||'')
  if(!id||!merchantId)return
  ingest({id,merchantId,passportId:String(d.passportId||'')||undefined,storeId:String(d.storeId||'')||undefined,source:(String(d.source||'storefront-sale') as BusinessIncomeSource),label:String(d.label||'Merchant proceeds'),amountMinor:Number(d.amountMinor||0),currency:'USD',state:normalizeState(d.state),orderId:String(d.orderId||'')||undefined,creatorId:String(d.creatorId||'')||undefined,scoutId:String(d.scoutId||'')||undefined,sourceVerse:String(d.sourceVerse||'')||undefined,sourceContentId:String(d.sourceContentId||'')||undefined,createdAt:String(d.createdAt||new Date().toISOString()),updatedAt:String(d.updatedAt||new Date().toISOString()),serverAuthoritative:true})
 }
 window.addEventListener('tryamm:commerce-ledger-authoritative',onLedger as EventListener)
 window.addEventListener('tryamm:merchant-ledger-authoritative',onLedger as EventListener)
 window.__TRYAMM_BUSINESS_INCOME_CENTER__={version:'1.0.0',snapshot,ingest}
 queueMicrotask(()=>publish())
 window.dispatchEvent(new CustomEvent('tryamm:business-income-center-ready',{detail:{version:'1.0.0',merchantProceedsOnly:true,serverAuthoritative:true,creatorAttribution:true,scoutAttribution:true,crossVerseAttribution:true}}))
 return()=>{window.removeEventListener('tryamm:commerce-ledger-authoritative',onLedger as EventListener);window.removeEventListener('tryamm:merchant-ledger-authoritative',onLedger as EventListener);delete window.__TRYAMM_BUSINESS_INCOME_CENTER__}
}