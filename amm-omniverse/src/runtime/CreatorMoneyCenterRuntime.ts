export type CreatorMoneyState='PENDING'|'VERIFIED'|'PAYABLE'|'PAID'|'REVERSED'
export type CreatorMoneySource=
  |'reel'
  |'live-gift'
  |'mission'
  |'product-sale'
  |'service-booking'
  |'event-ticket'
  |'subscription'
  |'creator-affiliate'
  |'scout-referral'
  |'asset-license'
  |'remix-license'
  |'virtual-rental'
  |'business-campaign'
  |'digital-twin-sponsorship'
  |'other'

export type CreatorMoneyEntry={
  id:string
  source:CreatorMoneySource
  label:string
  amountMinor:number
  currency:'USD'
  state:CreatorMoneyState
  creatorId?:string
  merchantId?:string
  scoutId?:string
  sourceContentId?:string
  sourceEventId?:string
  createdAt:string
  updatedAt:string
  serverAuthoritative:boolean
}

export type CreatorMoneySnapshot={
  currency:'USD'
  totals:{
    pendingMinor:number
    verifiedMinor:number
    payableMinor:number
    paidMinor:number
    reversedMinor:number
  }
  entries:CreatorMoneyEntry[]
}

declare global{
  interface Window{
    __TRYAMM_CREATOR_MONEY_CENTER__?:{
      version:string
      snapshot:()=>CreatorMoneySnapshot
      ingestAuthoritative:(entry:CreatorMoneyEntry)=>CreatorMoneySnapshot
    }
  }
}

const entries=new Map<string,CreatorMoneyEntry>()

const normalizeState=(value:unknown):CreatorMoneyState=>{
  const v=String(value||'').toUpperCase()
  if(v==='VERIFIED')return'VERIFIED'
  if(v==='PAYABLE')return'PAYABLE'
  if(v==='PAID')return'PAID'
  if(v==='REVERSED'||v==='REFUNDED')return'REVERSED'
  return'PENDING'
}

const sourceFromClass=(value:unknown):CreatorMoneySource=>{
  const v=String(value||'').toUpperCase()
  if(v.includes('CREATOR_COMMISSION'))return'product-sale'
  if(v.includes('SCOUT_COMMISSION'))return'scout-referral'
  if(v.includes('MISSION'))return'mission'
  if(v.includes('GIFT'))return'live-gift'
  return'other'
}

const snapshot=():CreatorMoneySnapshot=>{
  const xs=[...entries.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))
  const totals={pendingMinor:0,verifiedMinor:0,payableMinor:0,paidMinor:0,reversedMinor:0}
  for(const row of xs){
    const amount=Math.max(0,Math.abs(Number(row.amountMinor||0)))
    if(row.state==='PENDING')totals.pendingMinor+=amount
    else if(row.state==='VERIFIED')totals.verifiedMinor+=amount
    else if(row.state==='PAYABLE')totals.payableMinor+=amount
    else if(row.state==='PAID')totals.paidMinor+=amount
    else if(row.state==='REVERSED')totals.reversedMinor+=amount
  }
  return{currency:'USD',totals,entries:xs}
}

const publish=()=>{
  const next=snapshot()
  window.dispatchEvent(new CustomEvent('tryamm:creator-money-snapshot',{detail:next}))
  return next
}

const ingestAuthoritative=(entry:CreatorMoneyEntry)=>{
  if(!entry?.id||!entry.serverAuthoritative)return snapshot()
  const now=new Date().toISOString()
  entries.set(entry.id,{
    ...entry,
    amountMinor:Math.max(0,Math.floor(Number(entry.amountMinor||0))),
    state:normalizeState(entry.state),
    currency:'USD',
    updatedAt:entry.updatedAt||now,
    createdAt:entry.createdAt||now,
    serverAuthoritative:true,
  })
  return publish()
}

export function installCreatorMoneyCenterRuntime(){
  if(typeof window==='undefined')return()=>{}
  if(window.__TRYAMM_CREATOR_MONEY_CENTER__)return()=>{}

  const onLedger=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const authority=String(d.authority||d.persistence||'').toLowerCase()
    const serverAuthoritative=
      d.serverAuthoritative===true||
      authority.includes('server')||
      authority.includes('ledger')
    if(!serverAuthoritative)return

    const id=String(d.id||d.ledgerEventId||d.sourceEventId||'')
    if(!id)return
    ingestAuthoritative({
      id,
      source:sourceFromClass(d.class||d.source),
      label:String(d.label||d.class||d.source||'Verified earning'),
      amountMinor:Number(d.amountMinor||0),
      currency:'USD',
      state:normalizeState(d.state),
      creatorId:String(d.creatorId||'')||undefined,
      merchantId:String(d.merchantId||'')||undefined,
      scoutId:String(d.scoutId||'')||undefined,
      sourceContentId:String(d.sourceContentId||d.contentId||'')||undefined,
      sourceEventId:String(d.sourceEventId||'')||undefined,
      createdAt:String(d.createdAt||new Date().toISOString()),
      updatedAt:String(d.updatedAt||new Date().toISOString()),
      serverAuthoritative:true,
    })
  }

  const onReward=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    if(d.serverDetermined!==true)return
    const claim=(d.claim||{}) as Record<string,unknown>
    const cashMinor=Number(claim.cashMinor||claim.amountMinor||0)
    if(!cashMinor)return
    const id=String(claim.id||d.missionRunId||'')
    if(!id)return
    ingestAuthoritative({
      id:'mission:'+id,
      source:'mission',
      label:'Verified mission reward',
      amountMinor:cashMinor,
      currency:'USD',
      state:normalizeState(claim.state||d.status),
      sourceEventId:id,
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      serverAuthoritative:true,
    })
  }

  const onGift=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const authority=String(d.authority||'').toLowerCase()
    if(!['server','service','ledger'].includes(authority)||!d.transactionId)return
    const amountMinor=Number(d.amountMinor||0)
    if(!amountMinor)return
    ingestAuthoritative({
      id:'gift:'+String(d.transactionId),
      source:'live-gift',
      label:String(d.giftName||d.gift||'Verified LIVE gift'),
      amountMinor,
      currency:'USD',
      state:normalizeState(d.state||'VERIFIED'),
      sourceEventId:String(d.transactionId),
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      serverAuthoritative:true,
    })
  }

  window.addEventListener('tryamm:commerce-ledger-authoritative',onLedger as EventListener)
  window.addEventListener('tryamm:creator-ledger-authoritative',onLedger as EventListener)
  window.addEventListener('tryamm:streetverse-authoritative-reward',onReward as EventListener)
  window.addEventListener('tryamm:live-gift-verified',onGift as EventListener)

  window.__TRYAMM_CREATOR_MONEY_CENTER__={version:'1.0.0',snapshot,ingestAuthoritative}
  queueMicrotask(()=>publish())
  window.dispatchEvent(new CustomEvent('tryamm:creator-money-center-ready',{detail:{
    version:'1.0.0',
    cashOnlyFromServerAuthority:true,
    separatesDemoCredits:true,
    states:['PENDING','VERIFIED','PAYABLE','PAID','REVERSED'],
  }}))

  return()=>{
    window.removeEventListener('tryamm:commerce-ledger-authoritative',onLedger as EventListener)
    window.removeEventListener('tryamm:creator-ledger-authoritative',onLedger as EventListener)
    window.removeEventListener('tryamm:streetverse-authoritative-reward',onReward as EventListener)
    window.removeEventListener('tryamm:live-gift-verified',onGift as EventListener)
    delete window.__TRYAMM_CREATOR_MONEY_CENTER__
  }
}
