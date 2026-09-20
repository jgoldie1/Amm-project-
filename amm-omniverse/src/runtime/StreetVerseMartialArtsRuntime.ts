import {STREETVERSE_CHICAGO_MARTIAL_STYLES,type StreetVerseMartialStyleId} from '../config/streetverseChicagoMartialArtsStyles'

const KEY='tryamm.streetverse.martial-mastery.v1'
let installed=false

type Mastery={xp:number;mastery:number;wins:number}
type State={selected:StreetVerseMartialStyleId;styles:Partial<Record<StreetVerseMartialStyleId,Mastery>>;updatedAt?:string}

function fresh():State{return{selected:'neutral-dojo',styles:{}}}
function read():State{try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return fresh()}}
function write(state:State){
 try{localStorage.setItem(KEY,JSON.stringify({...state,updatedAt:new Date().toISOString()}))}catch{}
 window.dispatchEvent(new CustomEvent('tryamm:martial-mastery-state',{detail:state}))
}
function valid(id:string):id is StreetVerseMartialStyleId{return id in STREETVERSE_CHICAGO_MARTIAL_STYLES}
function levelFor(xp:number){if(xp>=8000)return'GRANDMASTER';if(xp>=4000)return'MASTER';if(xp>=1800)return'INSTRUCTOR';if(xp>=750)return'FIGHTER';if(xp>=250)return'STUDENT';return'NOVICE'}

export function installStreetVerseMartialArtsRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true

 window.addEventListener('tryamm:martial-style-selected',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  const id=String(d.styleId||d.id||'')
  if(!valid(id))return
  const state=read()
  write({...state,selected:id})
  window.dispatchEvent(new CustomEvent('tryamm:martial-profile-updated',{detail:{styleId:id,label:STREETVERSE_CHICAGO_MARTIAL_STYLES[id].label,mastery:state.styles[id]||{xp:0,mastery:0,wins:0}}}))
 })

 const award=(idRaw:string,scoreRaw:number,won:boolean)=>{
  const state=read()
  const id=valid(idRaw)?idRaw:state.selected
  const prev=state.styles[id]||{xp:0,mastery:0,wins:0}
  const gain=Math.max(25,Math.min(250,Number(scoreRaw||100)))
  const xp=prev.xp+gain
  const mastery=Math.min(100,Math.floor(xp/80))
  const next={xp,mastery,wins:prev.wins+(won?1:0)}
  write({...state,selected:id,styles:{...state.styles,[id]:next}})
  window.dispatchEvent(new CustomEvent('tryamm:martial-mastery-earned',{detail:{styleId:id,label:STREETVERSE_CHICAGO_MARTIAL_STYLES[id].label,...next,level:levelFor(xp),gain}}))
 }

 window.addEventListener('tryamm:dojo-training-completed',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  const id=String(localStorage.getItem('tryamm.streetverse.martial-style.v1')||read().selected)
  award(id,Number(d.score||100)*10,true)
 })

 window.addEventListener('tryamm:martial-training-complete',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  award(String(d.styleId||read().selected),Number(d.xp||100),Boolean(d.won))
 })

 window.addEventListener('tryamm:rp-onehand-action',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(d.action!=='INTERACT')return
  const state=read()
  const style=STREETVERSE_CHICAGO_MARTIAL_STYLES[state.selected]
  window.dispatchEvent(new CustomEvent('tryamm:martial-context-ready',{detail:{styleId:state.selected,label:style.label,oneHand:true,nonlethal:true}}))
 })

 write(read())
 window.dispatchEvent(new CustomEvent('tryamm:martial-runtime-ready',{detail:{styles:Object.keys(STREETVERSE_CHICAGO_MARTIAL_STYLES).length,persistentMastery:true,oneHand:true,nonlethal:true}}))
}
