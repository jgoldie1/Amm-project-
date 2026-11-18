'use strict'
// Local, non-sensitive RPG milestone bridge for the existing Mycelium concept.
// No real blockchain, paid rewards, clinical records, or cross-device sync claimed.
const ALLOWED=new Set(['arrived_shore','boarded_boat','fishing_completed','studied_gospel','reflected','returned_streetverse'])
const MAX_RECEIPTS=80
function normalizeMilestone(input={}){
 const kind=String(input.kind||'')
 if(!ALLOWED.has(kind))return null
 const eventId=String(input.eventId||'').trim()
 if(!/^[A-Za-z0-9:_-]{6,110}$/.test(eventId))return null
 const missionId=String(input.missionId||'faith-galilee-v1')
 if(missionId!=='faith-galilee-v1')return null
 return {eventId,missionId,kind,source:'faithverse-galilee',isSimulation:true,hasFinancialValue:false,containsHealthData:false}
}
function applyMilestone(history=[],incoming={}){
 const event=normalizeMilestone(incoming)
 const existing=Array.isArray(history)?history.filter(x=>normalizeMilestone(x)).slice(-MAX_RECEIPTS):[]
 if(!event)return{accepted:false,reason:'invalid-milestone',events:existing}
 if(existing.some(x=>x.eventId===event.eventId))return{accepted:true,duplicate:true,events:existing}
 return{accepted:true,duplicate:false,events:[...existing,event].slice(-MAX_RECEIPTS)}
}
function progress(history=[]){
 const events=(Array.isArray(history)?history:[]).filter(x=>normalizeMilestone(x))
 const flags=new Set(events.map(x=>x.kind))
 const chain=['arrived_shore','boarded_boat','fishing_completed','studied_gospel','reflected']
 return {steps:chain.map(kind=>({kind,done:flags.has(kind)})),completed:chain.every(kind=>flags.has(kind)),xpEligible:false,realMoneyReward:false,cloudPersisted:false}
}
module.exports={ALLOWED,normalizeMilestone,applyMilestone,progress}
