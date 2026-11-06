import {useEffect,useState} from 'react'
import {advanceHoloMission,initialHoloMission,type HoloMission,type MissionAction} from '../runtime/StreetVerseHoloDeliveryMissionRuntime'
const warehouse={x:-28,z:18},store={x:-12,z:12}
export default function StreetVerseHoloDeliveryMissionHUD(){
 const [open,setOpen]=useState(false),[mission,setMission]=useState<HoloMission>(initialHoloMission)
 const [position,setPosition]=useState<{x:number;z:number;vehicleId?:string}|null>(null)
 const [note,setNote]=useState('Accept the fictional warehouse-to-store delivery mission.')
 const [paid,setPaid]=useState(false)
 useEffect(()=>{
  const onPosition=(event:Event)=>{const d=(event as CustomEvent<{x?:number;z?:number;vehicleId?:string}>).detail;if(Number.isFinite(d?.x)&&Number.isFinite(d?.z))setPosition({x:d!.x!,z:d!.z!,vehicleId:d?.vehicleId})}
  window.addEventListener('tryamm:streetverse-player-location',onPosition)
  return()=>window.removeEventListener('tryamm:streetverse-player-location',onPosition)
 },[])
 const near=(target:{x:number;z:number})=>Boolean(position&&Math.hypot(position.x-target.x,position.z-target.z)<12)
 const act=(action:MissionAction)=>{
  const result=advanceHoloMission(mission,action)
  setNote(result.message)
  if(!result.ok)return
  setMission(result.mission)
  if(result.reward>0&&!paid){
   setPaid(true)
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-holo-delivery-mission-complete',{detail:{missionId:mission.id,storeId:mission.storeId,sku:mission.sku,quantity:mission.quantity,rewardCredits:result.reward,demo:true,fictional:true}}))
  }
 }
 const btn={minHeight:46,padding:'8px 12px',border:'1px solid #70d8ee',borderRadius:8,background:'#164d62',color:'white'}
 return <aside data-streetverse-holo-delivery-mission="demo" style={{position:'fixed',left:8,bottom:90,zIndex:43989,maxWidth:'min(330px,calc(100vw - 16px))',maxHeight:'55dvh',overflow:'auto',padding:8,borderRadius:12,background:'rgba(4,25,37,.96)',color:'white',font:'12px system-ui'}}>
  <button style={btn} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🚚 HOLO DELIVERY MISSION • {mission.stage.toUpperCase()}</button>
  {open&&<div style={{display:'grid',gap:8,marginTop:8}}>
   <div>Warehouse ({warehouse.x},{warehouse.z}) → Creator Store ({store.x},{store.z})</div>
   <div>Package: {mission.quantity} × {mission.sku} • Reward: {mission.rewardCredits} fictional credits</div>
   {mission.stage==='dispatch'&&<button style={btn} onClick={()=>act({type:'accept'})}>ACCEPT HOLO FON DISPATCH</button>}
   {mission.stage==='pickup'&&<button style={btn} onClick={()=>act({type:'pickup',nearWarehouse:near(warehouse),packageAvailable:true})}>PICK UP PACKAGE AT WAREHOUSE</button>}
   {mission.stage==='drive'&&<button style={btn} onClick={()=>act({type:'enter-van',vehicleId:position?.vehicleId})}>VERIFY HOLO VAN ENTRY</button>}
   {mission.stage==='handoff'&&<><button style={btn} onClick={()=>act({type:'arrive',nearStore:near(store)})}>CHECK STOREFRONT ARRIVAL</button><button style={btn} onClick={()=>act({type:'handoff',nearStore:near(store),npcId:'npc-creator-vendor'})}>HAND PACKAGE TO NPC VENDOR</button></>}
   <div aria-live="polite">{note}</div>
   <small>Location and vehicle must be supplied by the 3D game controller. This mission cannot certify real-world delivery.</small>
  </div>}
 </aside>
}
