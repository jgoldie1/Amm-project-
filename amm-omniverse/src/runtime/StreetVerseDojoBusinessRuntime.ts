import {STREETVERSE_DOJO_BUSINESS_MODEL} from '../config/streetverseDojoEconomy'

const KEY='tryamm.streetverse.dojo-business.v1'
let installed=false

export type DojoState={
  created:boolean
  name:string
  affiliation:'green-dragon'|'black-dragon-reconstruction'|'independent'
  reputation:number
  students:number
  classes:number
  tournaments:number
  tournamentWins:number
  heritage:number
  communityTrust:number
  mentorBonds:Record<string,number>
  updatedAt?:string
}

const fresh=():DojoState=>({
  created:false,name:'StreetVerse Chicago Dojo',affiliation:'independent',
  reputation:0,students:0,classes:0,tournaments:0,tournamentWins:0,
  heritage:0,communityTrust:0,mentorBonds:{teacher:0,student:0,'rival-respect':0,historian:0,community:0,creator:0},
})

export function readDojoState():DojoState{
  try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return fresh()}
}
function write(state:DojoState){
  const next={...state,updatedAt:new Date().toISOString()}
  try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:dojo-business-state',{detail:next}))
  return next
}
function clampBond(n:number){return Math.max(0,Math.min(100,n))}
function levelFor(rep:number){
  return [...STREETVERSE_DOJO_BUSINESS_MODEL.progression.levels].reverse().find(x=>rep>=x.rep)||STREETVERSE_DOJO_BUSINESS_MODEL.progression.levels[0]
}
function reward(state:DojoState,kind:string){
  if(kind==='class')return write({...state,classes:state.classes+1,students:state.students+Math.max(1,Math.ceil((state.reputation+1)/300)),reputation:state.reputation+35,mentorBonds:{...state.mentorBonds,student:clampBond((state.mentorBonds.student||0)+4),teacher:clampBond((state.mentorBonds.teacher||0)+2)}})
  if(kind==='heritage-night')return write({...state,heritage:state.heritage+10,reputation:state.reputation+25,mentorBonds:{...state.mentorBonds,historian:clampBond((state.mentorBonds.historian||0)+6)}})
  if(kind==='creator-night')return write({...state,reputation:state.reputation+30,mentorBonds:{...state.mentorBonds,creator:clampBond((state.mentorBonds.creator||0)+5)}})
  if(kind==='community-workshop')return write({...state,communityTrust:state.communityTrust+8,reputation:state.reputation+30,mentorBonds:{...state.mentorBonds,community:clampBond((state.mentorBonds.community||0)+6)}})
  return state
}

export function installStreetVerseDojoBusinessRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true

  window.addEventListener('tryamm:dojo-create',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const state=readDojoState()
    const affiliation=['green-dragon','black-dragon-reconstruction','independent'].includes(String(d.affiliation))?d.affiliation:'independent'
    write({...state,created:true,name:String(d.name||state.name||'StreetVerse Chicago Dojo').slice(0,60),affiliation})
  })

  window.addEventListener('tryamm:dojo-operation',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const state=readDojoState()
    if(!state.created)return
    if(d.operation==='tournament'){
      const next=write({...state,tournaments:state.tournaments+1,reputation:state.reputation+15})
      window.dispatchEvent(new CustomEvent('tryamm:dojo-tournament-start',{detail:{dojo:next,mode:'present-day',nonlethal:true}}))
      return
    }
    const next=reward(state,String(d.operation||''))
    window.dispatchEvent(new CustomEvent('tryamm:dojo-operation-complete',{detail:{operation:d.operation,dojo:next,level:levelFor(next.reputation)}}))
  })

  window.addEventListener('tryamm:dojo-tournament-completed',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const state=readDojoState()
    const won=Boolean(d.won)
    const next=write({...state,tournamentWins:state.tournamentWins+(won?1:0),reputation:state.reputation+(won?80:30),mentorBonds:{...state.mentorBonds,'rival-respect':clampBond((state.mentorBonds['rival-respect']||0)+(won?7:3))}})
    window.dispatchEvent(new CustomEvent('tryamm:dojo-tournament-reward',{detail:{dojo:next,won,level:levelFor(next.reputation),cashPayout:false,prototypeCredits:won?150:60}}))
  })

  window.addEventListener('tryamm:history-present-day-unlock',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    if(d.campaignId!=='chicago-dojo-wars')return
    const state=readDojoState()
    write({...state,heritage:state.heritage+20,reputation:state.reputation+50,mentorBonds:{...state.mentorBonds,historian:clampBond((state.mentorBonds.historian||0)+12)}})
  })

  window.addEventListener('tryamm:martial-mastery-earned',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    if(Number(d.mastery||0)<100)return
    const state=readDojoState()
    write({...state,reputation:state.reputation+40,mentorBonds:{...state.mentorBonds,teacher:clampBond((state.mentorBonds.teacher||0)+5)}})
  })

  write(readDojoState())
  window.dispatchEvent(new CustomEvent('tryamm:dojo-business-ready',{detail:{persistent:true,tournament:true,mentorBonds:true,clientCashPayout:false}}))
}
