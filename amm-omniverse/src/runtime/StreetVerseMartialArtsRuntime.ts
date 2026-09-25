import {STREETVERSE_CHICAGO_MARTIAL_STYLES,type StreetVerseMartialStyleId} from '../config/streetverseChicagoMartialArtsStyles'

const KEY='tryamm.streetverse.martial-mastery.v1'
const HISTORY_KEY='tryamm.streetverse.history-legacy.v1'
let installed=false

type Mastery={xp:number;mastery:number;wins:number}
export type MartialMasteryState={selected:StreetVerseMartialStyleId;styles:Partial<Record<StreetVerseMartialStyleId,Mastery>>;updatedAt?:string}
export type MartialUnlockState={
 coreMastered:number
 dojoHistoryComplete:boolean
 dragonUnlocked:boolean
 extendedUnlocked:boolean
}

const CORE_GREEN:StreetVerseMartialStyleId[]=[
 'green-panther','green-leopard','green-boar','green-snake',
 'green-mantis','green-crane','green-eagle','green-tiger'
]
const EXTENDED_GREEN:StreetVerseMartialStyleId[]=[
 'green-monkey','green-bear','green-wolf','green-hawk','green-ape','green-fox','green-horse'
]

function fresh():MartialMasteryState{return{selected:'neutral-dojo',styles:{}}}
export function readMartialMastery():MartialMasteryState{
 try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return fresh()}
}
function write(state:MartialMasteryState){
 try{localStorage.setItem(KEY,JSON.stringify({...state,updatedAt:new Date().toISOString()}))}catch{}
 window.dispatchEvent(new CustomEvent('tryamm:martial-mastery-state',{detail:state}))
 window.dispatchEvent(new CustomEvent('tryamm:martial-unlock-state',{detail:getMartialUnlockState(state)}))
}
function valid(id:string):id is StreetVerseMartialStyleId{return id in STREETVERSE_CHICAGO_MARTIAL_STYLES}
function levelFor(xp:number){if(xp>=8000)return'GRANDMASTER';if(xp>=4000)return'MASTER';if(xp>=1800)return'INSTRUCTOR';if(xp>=750)return'FIGHTER';if(xp>=250)return'STUDENT';return'NOVICE'}
function dojoHistoryComplete(){
 try{
  const state=JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}')
  return Array.isArray(state.completed)&&state.completed.includes('chicago-dojo-wars')
 }catch{return false}
}

export function getMartialUnlockState(state=readMartialMastery()):MartialUnlockState{
 const coreMastered=CORE_GREEN.filter(id=>(state.styles[id]?.mastery||0)>=100).length
 const history=dojoHistoryComplete()
 const dragonUnlocked=coreMastered>=4&&history
 return {coreMastered,dojoHistoryComplete:history,dragonUnlocked,extendedUnlocked:dragonUnlocked}
}

export function isMartialStyleUnlocked(id:StreetVerseMartialStyleId,state=readMartialMastery()){
 if(id==='neutral-dojo'||id==='green-dragon-reconstruction'||id==='black-dragon-reconstruction')return true
 if(CORE_GREEN.includes(id))return true
 const unlock=getMartialUnlockState(state)
 if(id==='green-dragon')return unlock.dragonUnlocked
 if(EXTENDED_GREEN.includes(id))return unlock.extendedUnlocked
 return true
}

export function installStreetVerseMartialArtsRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true

 window.addEventListener('tryamm:martial-style-selected',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  const id=String(d.styleId||d.id||'')
  if(!valid(id))return
  const state=readMartialMastery()
  if(!isMartialStyleUnlocked(id,state)){
   const unlock=getMartialUnlockState(state)
   window.dispatchEvent(new CustomEvent('tryamm:martial-style-locked',{detail:{styleId:id,...unlock,requirement:'Complete the 1970 Dojo Wars Time Machine campaign and master any four core Green Dragon animal styles.'}}))
   return
  }
  write({...state,selected:id})
  window.dispatchEvent(new CustomEvent('tryamm:martial-profile-updated',{detail:{styleId:id,label:STREETVERSE_CHICAGO_MARTIAL_STYLES[id].label,mastery:state.styles[id]||{xp:0,mastery:0,wins:0}}}))
 })

 const award=(idRaw:string,scoreRaw:number,won:boolean)=>{
  const state=readMartialMastery()
  const id=valid(idRaw)?idRaw:state.selected
  if(!isMartialStyleUnlocked(id,state)&&id!=='green-dragon')return
  const prev=state.styles[id]||{xp:0,mastery:0,wins:0}
  const gain=Math.max(25,Math.min(250,Number(scoreRaw||100)))
  const xp=prev.xp+gain
  // 500 XP represents full mastery of one animal style; rank continues beyond mastery.
  const mastery=Math.min(100,Math.floor(xp/5))
  const next={xp,mastery,wins:prev.wins+(won?1:0)}
  const nextState={...state,selected:id,styles:{...state.styles,[id]:next}}
  write(nextState)
  const unlock=getMartialUnlockState(nextState)
  window.dispatchEvent(new CustomEvent('tryamm:martial-mastery-earned',{detail:{styleId:id,label:STREETVERSE_CHICAGO_MARTIAL_STYLES[id].label,...next,level:levelFor(xp),gain,...unlock}}))
  if(unlock.dragonUnlocked)window.dispatchEvent(new CustomEvent('tryamm:martial-dragon-unlocked',{detail:{coreMastered:unlock.coreMastered,dojoHistoryComplete:true}}))
 }

 window.addEventListener('tryamm:dojo-training-completed',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  const id=String(localStorage.getItem('tryamm.streetverse.martial-style.v1')||readMartialMastery().selected)
  award(id,Number(d.score||100)*10,true)
 })

 window.addEventListener('tryamm:martial-training-complete',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  award(String(d.styleId||readMartialMastery().selected),Number(d.xp||100),Boolean(d.won))
 })

 window.addEventListener('tryamm:history-present-day-unlock',()=>write(readMartialMastery()))

 window.addEventListener('tryamm:rp-onehand-action',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(d.action!=='INTERACT')return
  const state=readMartialMastery()
  const style=STREETVERSE_CHICAGO_MARTIAL_STYLES[state.selected]
  window.dispatchEvent(new CustomEvent('tryamm:martial-context-ready',{detail:{styleId:state.selected,label:style.label,oneHand:true,nonlethal:true}}))
 })

 write(readMartialMastery())
 window.dispatchEvent(new CustomEvent('tryamm:martial-runtime-ready',{detail:{styles:Object.keys(STREETVERSE_CHICAGO_MARTIAL_STYLES).length,persistentMastery:true,oneHand:true,nonlethal:true,coreGreen:CORE_GREEN.length,dragonRequirement:'4 core masteries + Chicago Dojo Wars Time Machine campaign'}}))
}
