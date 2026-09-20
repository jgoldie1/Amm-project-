import {MARTIAL_STYLE_SYSTEM} from '../config/streetverseMartialArtsStyles'

const KEY='tryamm.streetverse.martial-styles.v1'
let installed=false

type StyleProgress={xp:number;mastery:number;unlocked:boolean}
type State={selected?:string;styles:Record<string,StyleProgress>;updatedAt?:string}

function fresh():State{
  const styles:Record<string,StyleProgress>={}
  for(const s of MARTIAL_STYLE_SYSTEM.all)styles[s.id]={xp:s.tier==='core'?50:0,mastery:0,unlocked:s.tier==='core'}
  return {selected:'gd-dragon',styles}
}
function read():State{try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return fresh()}}
function write(state:State){
  try{localStorage.setItem(KEY,JSON.stringify({...state,updatedAt:new Date().toISOString()}))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:martial-style-state',{detail:state}))
}
function style(id:string){return MARTIAL_STYLE_SYSTEM.all.find(s=>s.id===id)}

export function installStreetVerseMartialArtsRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true

  window.addEventListener('tryamm:martial-style-select',(e:Event)=>{
    const id=String((e as CustomEvent<any>).detail?.id||'')
    const s=style(id); if(!s)return
    const state=read(); if(!state.styles[id]?.unlocked)return
    write({...state,selected:id})
    window.dispatchEvent(new CustomEvent('tryamm:martial-style-selected',{detail:{style:s}}))
  })

  window.addEventListener('tryamm:martial-training-complete',(e:Event)=>{
    const d=(e as CustomEvent<any>).detail||{}
    const id=String(d.styleId||read().selected||'gd-dragon')
    const s=style(id); if(!s)return
    const state=read(); const prev=state.styles[id]||{xp:0,mastery:0,unlocked:true}
    const gain=Math.max(25,Math.min(250,Number(d.xp||100)))
    const xp=prev.xp+gain
    const mastery=Math.min(100,Math.floor(xp/80))
    const styles={...state.styles,[id]:{xp,mastery,unlocked:true}}
    // Dragon mastery can unlock extended animal forms progressively.
    if(id==='gd-dragon'){
      const ext=MARTIAL_STYLE_SYSTEM.all.filter(x=>x.lane==='green-dragon'&&x.tier==='extended')
      const count=Math.min(ext.length,Math.floor(mastery/15))
      for(const x of ext.slice(0,count))styles[x.id]={...(styles[x.id]||{xp:0,mastery:0}),unlocked:true}
    }
    write({...state,selected:id,styles})
    window.dispatchEvent(new CustomEvent('tryamm:martial-mastery-earned',{detail:{style:s,xp,mastery}}))
  })

  window.addEventListener('tryamm:rp-onehand-action',(e:Event)=>{
    const d=(e as CustomEvent<any>).detail||{}
    if(d.action!=='INTERACT')return
    const state=read();const s=style(state.selected||'gd-dragon')
    if(s)window.dispatchEvent(new CustomEvent('tryamm:martial-context-action',{detail:{style:s,pattern:s.oneHandPattern,nonlethal:true}}))
  })

  window.dispatchEvent(new CustomEvent('tryamm:martial-styles-ready',{detail:{
    total:MARTIAL_STYLE_SYSTEM.all.length,
    greenDragon:MARTIAL_STYLE_SYSTEM.all.filter(x=>x.lane==='green-dragon').length,
    blackDragon:MARTIAL_STYLE_SYSTEM.all.filter(x=>x.lane==='black-dragon').length,
    oneHand:true,
  }}))
}
