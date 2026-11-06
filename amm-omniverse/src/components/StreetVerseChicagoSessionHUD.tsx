import {useEffect,useState} from 'react'
import {advanceChicagoSession,type ChicagoStage,type ChicagoEvent} from '../runtime/StreetVerseChicagoSessionRuntime'
import {buyStreetVerseFood,STREETVERSE_FOOD_MENU,type StreetVerseFoodPlayer} from '../runtime/StreetVerseFoodEconomyRuntime'
const initial:StreetVerseFoodPlayer={wallet:100,ageVerifiedAdult:false,needs:{health:80,stamina:50,hunger:40,hydration:40,impaired:false,severeInjury:false}}
const names:Record<ChicagoStage,string>={drive:'Drive BJ to the checkpoint',delivery:'Deliver UIC package',restaurant:'Buy food at the restaurant','after-dark':'Enter and exit After Dark','next-mission':'Start next Chicago mission',complete:'Pilot route complete'}
export default function StreetVerseChicagoSessionHUD(){
 const [open,setOpen]=useState(false),[stage,setStage]=useState<ChicagoStage>('drive'),[player,setPlayer]=useState(initial),[note,setNote]=useState('Confirm world milestones after actually performing them.')
 const advance=(event:ChicagoEvent)=>setStage(current=>{const result=advanceChicagoSession(current,event);if(result.advanced)window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-session-progress',{detail:{stage:result.stage,event}}));return result.stage})
 useEffect(()=>{const listener=(e:Event)=>{if((e as CustomEvent<{action?:string}>).detail?.action==='exit')advance('after-dark-exited')};window.addEventListener('tryamm:streetverse-after-dark-test',listener);return()=>window.removeEventListener('tryamm:streetverse-after-dark-test',listener)},[])
 const buy=(id:'burger'|'ribs'|'pop'|'water')=>{const result=buyStreetVerseFood(player,id);if(!result.ok){setNote(result.reason||'Rejected');return}setPlayer(result.player);setNote('Fictional purchase completed; food effects applied');window.dispatchEvent(new CustomEvent('tryamm:streetverse-food-purchased',{detail:{id,fictional:true}}));advance('food-purchased')}
 const confirm=(event:ChicagoEvent)=>{setNote('Player-confirmed checkpoint; 3D behavior not automatically certified');advance(event)}
 const button={minHeight:46,padding:'8px 10px',borderRadius:9,border:'1px solid #8ce6ff',background:'#143c52',color:'#fff',font:'700 12px system-ui'}
 return <div data-streetverse-chicago-session="true" style={{position:'fixed',left:8,top:'calc(env(safe-area-inset-top) + 174px)',zIndex:43020,width:open?240:'auto',maxWidth:'calc(100vw - 16px)',padding:open?10:0,borderRadius:12,background:open?'rgba(4,22,35,.96)':'transparent',color:'#fff',font:'700 12px system-ui'}}>
 <button style={button} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🚗 CHICAGO SESSION</button>
 {open&&<div style={{display:'grid',gap:8,marginTop:8}}><div aria-live="polite">{names[stage]}</div><small>{note}</small>
 {stage==='drive'&&<button style={button} onClick={()=>confirm('vehicle-driven')}>I DROVE TO THE CHECKPOINT</button>}
 {stage==='delivery'&&<button style={button} onClick={()=>confirm('package-delivered')}>I DELIVERED THE PACKAGE</button>}
 {stage==='restaurant'&&<><div>Food counter • fictional balance: {player.wallet}</div>{(['burger','ribs','pop','water'] as const).map(id=><button key={id} style={button} onClick={()=>buy(id)}>BUY {STREETVERSE_FOOD_MENU[id].label} • {STREETVERSE_FOOD_MENU[id].price}</button>)}</>}
 {stage==='after-dark'&&<div>Open 🌙 AFTER DARK, test music and sitting, then EXIT to advance.</div>}
 {stage==='next-mission'&&<button style={button} onClick={()=>confirm('next-mission-started')}>I STARTED THE NEXT MISSION</button>}
 {stage==='complete'&&<div>Pilot checkpoints acknowledged; not a certified 3D playthrough.</div>}
 <button style={button} onClick={()=>{setStage('drive');setPlayer(initial);setNote('Pilot restarted')}}>RESTART PILOT</button></div>}
 </div>
}
