import {useEffect,useMemo,useState} from 'react'
import {MARTIAL_STYLE_SYSTEM,type MartialStyle} from '../config/streetverseMartialArtsStyles'

type Progress={xp:number;mastery:number;unlocked:boolean}
type MartialState={selected?:string;styles:Record<string,Progress>}
const KEY='tryamm.streetverse.martial-styles.v1'

function read():MartialState{
 try{return JSON.parse(localStorage.getItem(KEY)||'{"styles":{}}')}catch{return{styles:{}}}
}

export default function StreetVerseMartialArtsStyleWheel(){
 const [open,setOpen]=useState(false)
 const [state,setState]=useState<MartialState>(()=>read())
 useEffect(()=>{
  const refresh=()=>setState(read())
  window.addEventListener('tryamm:martial-style-state',refresh)
  window.addEventListener('storage',refresh)
  return()=>{window.removeEventListener('tryamm:martial-style-state',refresh);window.removeEventListener('storage',refresh)}
 },[])
 const styles=useMemo(()=>MARTIAL_STYLE_SYSTEM.all.filter(s=>s.lane==='green-dragon'||s.lane==='black-dragon'),[])
 const selected=styles.find(s=>s.id===state.selected)||styles.find(s=>s.id==='gd-dragon')

 const choose=(s:MartialStyle)=>{
  window.dispatchEvent(new CustomEvent('tryamm:martial-style-select',{detail:{id:s.id}}))
  setTimeout(()=>setState(read()),0)
 }
 const train=()=>{
  if(!selected)return
  window.dispatchEvent(new CustomEvent('tryamm:martial-training-complete',{detail:{styleId:selected.id,xp:100,mode:'timing-simulation'}}))
  setTimeout(()=>setState(read()),0)
 }
 return <div style={{position:'fixed',left:12,bottom:128,zIndex:17025}}>
  <button aria-label="Open martial arts style wheel" onClick={()=>setOpen(v=>!v)} style={{width:46,height:46,borderRadius:'50%',border:'1px solid #6ee7a855',background:'#07160eed',color:'#fff',fontSize:21}}>🥋</button>
  {open&&<div role="dialog" aria-label="Martial arts style wheel" style={{marginTop:8,width:'min(92vw,430px)',maxHeight:'64vh',overflow:'auto',padding:12,border:'1px solid #2c6b45',borderRadius:16,background:'#050b08f5',color:'#fff',boxShadow:'0 20px 60px #000b'}}>
   <div style={{fontWeight:1000}}>GREEN DRAGON • ANIMAL STYLE WHEEL</div>
   <div style={{fontSize:10,opacity:.65,marginTop:3}}>Game reconstruction • one-hand compatible • nonlethal by default</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginTop:10}}>
    {styles.map(s=>{const p=state.styles?.[s.id];const unlocked=p?.unlocked??s.tier==='core';return <button key={s.id} disabled={!unlocked} onClick={()=>choose(s)} style={{minHeight:70,padding:9,borderRadius:12,border:s.id===selected?.id?'1px solid #8fffc0':'1px solid #244d34',background:s.id===selected?.id?'#10321f':'#0a1710',color:unlocked?'#fff':'#66786c',textAlign:'left'}}>
      <b>{s.name}</b><div style={{fontSize:9,opacity:.7,marginTop:3}}>{s.special}</div><div style={{fontSize:9,opacity:.6}}>Mastery {p?.mastery||0}%</div>
    </button>})}
   </div>
   {selected&&<div style={{marginTop:10,padding:10,border:'1px solid #315842',borderRadius:12}}>
    <b>{selected.name}</b><div style={{fontSize:10,opacity:.7,marginTop:4}}>{selected.focus.join(' • ')}</div>
    <div style={{fontSize:10,opacity:.7,marginTop:4}}>One-hand: {selected.oneHandPattern}</div>
    <button onClick={train} style={{marginTop:8,minHeight:44,width:'100%',borderRadius:10,fontWeight:950}}>TRAIN TIMING • +100 XP</button>
   </div>}
  </div>}
 </div>
}
