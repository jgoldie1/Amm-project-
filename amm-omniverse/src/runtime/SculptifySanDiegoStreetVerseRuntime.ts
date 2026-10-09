import {
  SCULPTIFY_PARTNER_REFERRAL_POLICY,
  SCULPTIFY_REPUTATION_EVENTS,
  SCULPTIFY_STREETVERSE_SAN_DIEGO,
  sculptifyDominanceTier,
} from '../data/sculptifySanDiegoStreetVerse'
import {activateStreetVerseBusinessNetwork} from './StreetVerseGrowthNetworkRuntime'

export type SculptifyRpSignal =
  | 'sculptify-booking-intent'
  | 'sculptify-academy-intent'
  | 'sculptify-store-interaction'
  | 'sculptify-business-collaboration'
  | 'sculptify-training-complete'
  | 'sculptify-staffing-intent'
  | 'sculptify-template-intent'
  | 'sculptify-referral-shared'
  | 'sculptify-referral-verified'
  | 'sculptify-referred-user-active'
  | 'sculptify-positive-outcome'

type SignalDetail={
  event:SculptifyRpSignal
  source?:string
  serverVerified?:boolean
  verified?:boolean
  businessId?:string
  userId?:string
  referralCode?:string
  metadata?:Record<string,unknown>
}

type SculptifyRpState={
  provisionalReputation:number
  tier:string
  lastEvent?:SculptifyRpSignal
  updatedAt:string
}

const KEY='tryamm.sculptify.san-diego.rp.v1'
let installed=false

const emit=(name:string,detail:unknown)=>{
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))
}

function readState():SculptifyRpState{
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null')||{}
    const reputation=Math.max(0,Number(raw.provisionalReputation)||0)
    return {
      provisionalReputation:reputation,
      tier:sculptifyDominanceTier(reputation).tier,
      lastEvent:raw.lastEvent,
      updatedAt:String(raw.updatedAt||new Date().toISOString()),
    }
  }catch{
    return {provisionalReputation:0,tier:'startup',updatedAt:new Date().toISOString()}
  }
}

function writeState(state:SculptifyRpState){
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
  emit('tryamm:sculptify-dominance-state',{
    ...state,
    authoritative:false,
    financial:false,
    note:'Client state is RP/progression preview only. Server verification is required for leaderboards, partner revenue and valuable rewards.',
  })
}

function signalRequiresServerVerification(event:SculptifyRpSignal){
  return event==='sculptify-referral-verified'||event==='sculptify-referred-user-active'
}

function reputationFor(detail:SignalDetail){
  if(detail.event==='sculptify-training-complete'&&detail.verified)return SCULPTIFY_REPUTATION_EVENTS.approvedAcademyCompletion
  if(detail.event==='sculptify-business-collaboration'&&detail.verified)return SCULPTIFY_REPUTATION_EVENTS.verifiedLocalBusinessCollaboration
  if(detail.event==='sculptify-referral-verified'&&detail.serverVerified)return SCULPTIFY_REPUTATION_EVENTS.verifiedStreetVerseActivation
  if(detail.event==='sculptify-store-interaction'&&detail.serverVerified)return SCULPTIFY_REPUTATION_EVENTS.verifiedStoreOrder
  if(detail.event==='sculptify-positive-outcome'&&detail.serverVerified)return SCULPTIFY_REPUTATION_EVENTS.verifiedServiceCompletion
  return 0
}

export function emitSculptifyRpSignal(input:SignalDetail){
  const detail:SignalDetail={
    ...input,
    businessId:input.businessId||SCULPTIFY_STREETVERSE_SAN_DIEGO.businessId,
    referralCode:input.referralCode||SCULPTIFY_PARTNER_REFERRAL_POLICY.referralCode,
    source:input.source||'sculptify-san-diego-rp',
  }
  if(signalRequiresServerVerification(detail.event)&&detail.serverVerified!==true){
    const denied={accepted:false,reason:'server-verification-required',event:detail.event,businessId:detail.businessId}
    emit('tryamm:sculptify-rp-signal-rejected',denied)
    return denied
  }

  const current=readState()
  const delta=reputationFor(detail)
  const nextReputation=current.provisionalReputation+delta
  const next:SculptifyRpState={
    provisionalReputation:nextReputation,
    tier:sculptifyDominanceTier(nextReputation).tier,
    lastEvent:detail.event,
    updatedAt:new Date().toISOString(),
  }
  writeState(next)
  emit('tryamm:sculptify-rp-signal',detail)
  if(delta>0)emit('tryamm:sculptify-reputation-earned',{businessId:detail.businessId,event:detail.event,delta,provisionalReputation:nextReputation,tier:next.tier,authoritative:false})
  return {accepted:true,detail,state:next,reputationDelta:delta}
}

export function activateSculptifySanDiegoBusiness(ownerUserId:string){
  const owner=String(ownerUserId||'').trim()
  if(!owner)return{activated:false,reason:'verified-owner-user-id-required'}
  const plan=activateStreetVerseBusinessNetwork({
    businessId:SCULPTIFY_STREETVERSE_SAN_DIEGO.businessId,
    ownerUserId:owner,
    category:'wellness',
    name:SCULPTIFY_STREETVERSE_SAN_DIEGO.brandName,
    city:SCULPTIFY_STREETVERSE_SAN_DIEGO.city,
    regulatedVerification:'pending',
  })
  emit('tryamm:sculptify-san-diego-business-ready',{
    business:SCULPTIFY_STREETVERSE_SAN_DIEGO,
    plan,
    partnerPolicy:SCULPTIFY_PARTNER_REFERRAL_POLICY,
    ownerUserId:owner,
  })
  return{activated:true,plan}
}

export function installSculptifySanDiegoStreetVerseRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const w=window as Window&{
    __emitSculptifyRpSignal?:typeof emitSculptifyRpSignal
    __activateSculptifySanDiegoBusiness?:typeof activateSculptifySanDiegoBusiness
    __getSculptifyRpState?:typeof readState
  }
  w.__emitSculptifyRpSignal=emitSculptifyRpSignal
  w.__activateSculptifySanDiegoBusiness=activateSculptifySanDiegoBusiness
  w.__getSculptifyRpState=readState

  const forward=(eventName:SculptifyRpSignal)=>(event:Event)=>{
    const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
    emitSculptifyRpSignal({event:eventName,...detail} as SignalDetail)
  }

  const bindings:[string,SculptifyRpSignal][]=[
    ['tryamm:sculptify:booking-intent','sculptify-booking-intent'],
    ['tryamm:sculptify:academy-intent','sculptify-academy-intent'],
    ['tryamm:sculptify:store-interaction','sculptify-store-interaction'],
    ['tryamm:sculptify:business-collaboration','sculptify-business-collaboration'],
    ['tryamm:sculptify:training-complete','sculptify-training-complete'],
    ['tryamm:sculptify:staffing-intent','sculptify-staffing-intent'],
    ['tryamm:sculptify:template-intent','sculptify-template-intent'],
    ['tryamm:sculptify:referral-shared','sculptify-referral-shared'],
    ['tryamm:sculptify:referral-verified','sculptify-referral-verified'],
    ['tryamm:sculptify:referred-user-active','sculptify-referred-user-active'],
    ['tryamm:sculptify:positive-outcome','sculptify-positive-outcome'],
  ]
  bindings.forEach(([name,signal])=>window.addEventListener(name,forward(signal)))

  window.addEventListener('tryamm:sculptify-owner-verified',(event:Event)=>{
    const detail=(event as CustomEvent<{ownerUserId?:string}>).detail||{}
    if(detail.ownerUserId)activateSculptifySanDiegoBusiness(detail.ownerUserId)
  })

  queueMicrotask(()=>{
    writeState(readState())
    emit('tryamm:sculptify-san-diego-rp-ready',{
      business:SCULPTIFY_STREETVERSE_SAN_DIEGO,
      partnerPolicy:SCULPTIFY_PARTNER_REFERRAL_POLICY,
      rules:{
        noRawSignupPay:true,
        noPyramidRewards:true,
        serverVerifiedRevenueRequiredForCommission:true,
        positiveBusinessImpactDrivesDominance:true,
      },
    })
  })
}
