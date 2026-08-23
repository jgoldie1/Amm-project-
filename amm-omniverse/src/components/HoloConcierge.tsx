import { useEffect, useState } from 'react'

type Intent={label:string;action:()=>void}
function call(name:string,...args:any[]){const fn=(window as any)[name];if(typeof fn==='function')fn(...args)}

export default function HoloConcierge(){
 const [open,setOpen]=useState(false)
 useEffect(()=>{(window as any).__showHoloConcierge=()=>setOpen(true);return()=>{delete (window as any).__showHoloConcierge}},[])
 const intents:Intent[]=[
  {label:'I want healthy groceries',action:()=>call('__showYahavahGrocery')},
  {label:'Open my Holo Fridge',action:()=>call('__showHoloFridge')},
  {label:'Find the best supplier / fulfillment rail',action:()=>call('__showVirtualWarehouse')},
  {label:'I need wigs / beauty / nail supplies',action:()=>call('__showAllAmericanBeauty')},
  {label:'Help me start a beauty store or nail shop',action:()=>call('__showSupplyPlug')},
  {label:'Show the living StreetVerse economy',action:()=>call('__showLivingWorldEconomy')},
  {label:'I want to play StreetVerse',action:()=>call('__showPlayableBeta')},
  {label:'I want to make a Reel / movie clip',action:()=>call('__showMediaStudio')},
  {label:'I need a ride',action:()=>call('__showHoloRide')},
  {label:'I need delivery',action:()=>call('__showHoloDelivery')},
  {label:'Open HoloGPT',action:()=>call('__showHoloGPT')},
  {label:'Open Holo Menu',action:()=>call('__showCommandNexusV2')},
  {label:'Open Holoverse',action:()=>call('__showHoloverse')},
 ]
 return <>{<button aria-label="Open Holo Concierge" onClick={()=>setOpen(true)} style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:18,zIndex:10032,border:'1px solid #E8B94499',borderRadius:999,padding:'12px 16px',background:'linear-gradient(135deg,#241b07,#0a1622)',color:'#ffe49b',fontWeight:950,fontSize:10,cursor:'pointer'}}>✦ HOLO CONCIERGE</button>}{open&&<div role="dialog" aria-label="Holo Concierge" onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,zIndex:13100,background:'rgba(0,0,8,.88)',display:'grid',placeItems:'center',padding:15,color:'#fff'}}><section onClick={e=>e.stopPropagation()} style={{width:'min(94vw,700px)',maxHeight:'84vh',overflow:'auto',border:'1px solid #E8B94477',borderRadius:22,background:'linear-gradient(160deg,#0a1622,#0b0813)',padding:18}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{color:'#4FE3FF',fontSize:10,fontWeight:950,letterSpacing:3}}>PERSON → INTENT → SAFE ACTION</div><h2 style={{margin:'6px 0'}}>What do you need?</h2></div><button onClick={()=>setOpen(false)} style={{border:'1px solid #456',borderRadius:10,background:'#0d1520',color:'#fff',padding:'8px 12px'}}>Close</button></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:9,marginTop:14}}>{intents.map(i=><button key={i.label} onClick={()=>{setOpen(false);i.action()}} style={{minHeight:64,textAlign:'left',padding:12,border:'1px solid #29445a',borderRadius:14,background:'#09131d',color:'#fff',fontWeight:850,cursor:'pointer'}}>{i.label} →</button>)}</div><p style={{fontSize:10,color:'#8091a4',lineHeight:1.5,marginTop:14}}>Holo Concierge routes intent. Payments, physical delivery, rides, drones and other consequential actions remain behind identity, Guardian authorization and verified-provider gates.</p></section></div>}</>
}
