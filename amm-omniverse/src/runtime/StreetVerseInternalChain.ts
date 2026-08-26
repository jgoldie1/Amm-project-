export type StreetVerseRevenueKind=
  |'mission_reward'
  |'vehicle_rental'
  |'boat_rental'
  |'marketplace_sale'
  |'creator_sale'
  |'holo_ad'
  |'sponsorship'
  |'property_rent'
  |'event_ticket'
  |'media_royalty'

export type StreetVerseChainReceipt={
  id:string
  kind:StreetVerseRevenueKind
  amountCents:number
  currency:'USD'|'HOLO'
  source:string
  world:'streetverse'
  createdAt:string
  previousHash:string
  hash:string
  status:'local-proof'|'server-pending'|'server-verified'
  metadata?:Record<string,string|number|boolean>
}

const KEY='tryamm.streetverse.internal-chain.v1'

function read():StreetVerseChainReceipt[]{
  if(typeof window==='undefined')return []
  try{return JSON.parse(localStorage.getItem(KEY)||'[]') as StreetVerseChainReceipt[]}catch{return []}
}

function persist(rows:StreetVerseChainReceipt[]){
  if(typeof window==='undefined')return
  localStorage.setItem(KEY,JSON.stringify(rows.slice(-500)))
}

function digest(input:string){
  // Deterministic browser-side receipt hash. This is a local proof/queue hash,
  // not a substitute for an authoritative server or public-chain transaction.
  let h=2166136261
  for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}
  return `sv-${(h>>>0).toString(16).padStart(8,'0')}`
}

export function getStreetVerseChain(){return read()}

export function getStreetVerseRevenueSummary(){
  const rows=read()
  return rows.reduce((acc,row)=>{
    if(row.currency==='USD')acc.usdCents+=Math.max(0,row.amountCents)
    else acc.holoCredits+=Math.max(0,row.amountCents)
    acc.events+=1
    return acc
  },{usdCents:0,holoCredits:0,events:0})
}

export function appendStreetVerseRevenue(input:{
  kind:StreetVerseRevenueKind
  amountCents?:number
  currency?:'USD'|'HOLO'
  source:string
  metadata?:Record<string,string|number|boolean>
}){
  const rows=read()
  const previousHash=rows.at(-1)?.hash||'GENESIS-STREETVERSE'
  const createdAt=new Date().toISOString()
  const base={
    kind:input.kind,
    amountCents:Math.max(0,Math.round(input.amountCents||0)),
    currency:input.currency||'HOLO' as const,
    source:input.source,
    world:'streetverse' as const,
    createdAt,
    previousHash,
    metadata:input.metadata||{}
  }
  const hash=digest(JSON.stringify(base))
  const receipt:StreetVerseChainReceipt={
    id:`svr_${Date.now().toString(36)}_${hash.slice(-5)}`,
    ...base,
    hash,
    status:'local-proof'
  }
  persist([...rows,receipt])
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-chain',{detail:receipt}))
  return receipt
}

export async function submitStreetVerseServerEvent(receipt:StreetVerseChainReceipt){
  try{
    const response=await fetch('/api/internal-chain/streetverse',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(receipt)})
    if(!response.ok)return {...receipt,status:'server-pending' as const}
    return {...receipt,status:'server-verified' as const}
  }catch{return {...receipt,status:'server-pending' as const}}
}
