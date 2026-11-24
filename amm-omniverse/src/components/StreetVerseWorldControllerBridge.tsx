import {useEffect,useState} from 'react'
import {normalizeStick} from '../foundation/streetverseControllerProtocol.js'
const BUTTONS={interact:0,back:1,jump:2,wheel:3,camera:11,menu:9,map:8} as const
/** World bridge: translates standard Gamepad API inputs to existing StreetVerse 3D world events.
 * This does not create renderer, character rigs or vehicle physics.
 */
export default function StreetVerseWorldControllerBridge(){
 const [connected,setConnected]=useState(false)
 const [help,setHelp]=useState(false)
 useEffect(()=>{
  let frame=0,last=0,vehicle=false,lastMove='',lastVehicle=''
  const prev=new Set<number>()
  const controlled=(event:Event)=>{vehicle=Boolean((event as CustomEvent<{entered?:boolean}>).detail?.entered)}
  window.addEventListener('tryamm:streetverse-vehicle-controlled',controlled)
  const dispatch=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
  const tick=(now:number)=>{
   frame=requestAnimationFrame(tick)
   if(now-last<80)return
   last=now
   const pads=typeof navigator.getGamepads==='function'?navigator.getGamepads():[]
   const pad=Array.from(pads).find(Boolean)
   setConnected(v=>v===Boolean(pad)?v:Boolean(pad))
   if(!pad){prev.clear();if(lastMove!==''){dispatch('tryamm:streetverse-world-input',{move:{x:0,y:0},source:'tryamm-gamepad'});lastMove=''}return}
   const pressed=new Set<number>()
   pad.buttons.forEach((b,i)=>{if(b.pressed)pressed.add(i)})
   const tapped=(i:number)=>pressed.has(i)&&!prev.has(i)
   if(tapped(BUTTONS.interact))dispatch('tryamm:streetverse-world-input',{move:{x:0,y:0},interact:true,source:'tryamm-gamepad'})
   if(tapped(BUTTONS.back))dispatch('tryamm:streetverse-vehicle-interact',{entered:false,source:'tryamm-gamepad'})
   if(tapped(BUTTONS.jump))dispatch('tryamm:streetverse-parkour-action',{action:'jump',source:'tryamm-gamepad'})
   if(tapped(BUTTONS.camera))dispatch('tryamm:streetverse-toggle-player-camera',{source:'tryamm-gamepad'})
   if(tapped(BUTTONS.wheel))dispatch('tryamm:mini-panel-open',{tab:'missions',source:'tryamm-gamepad'})
   if(tapped(BUTTONS.map))dispatch('tryamm:mini-panel-open',{tab:'map',source:'tryamm-gamepad'})
   if(tapped(BUTTONS.menu))setHelp(v=>!v)
   prev.clear();pressed.forEach(i=>prev.add(i))
   const left=normalizeStick(pad.axes[0]||0,pad.axes[1]||0)
   const move=JSON.stringify(left)
   if(!vehicle){
    if(move!==lastMove||move!=='{"x":0,"y":0}')dispatch('tryamm:streetverse-world-input',{move:left,source:'tryamm-gamepad'})
    lastMove=move
   }else{
    const throttle=pad.buttons[7]?.value||0,brake=pad.buttons[6]?.value||0
    const data={throttle,brake,steer:left.x}
    const serialized=JSON.stringify(data)
    if(serialized!==lastVehicle||throttle>.05||brake>.05)dispatch('tryamm:streetverse-vehicle-input',{...data,source:'tryamm-gamepad'})
    lastVehicle=serialized
   }
  }
  frame=requestAnimationFrame(tick)
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('tryamm:streetverse-vehicle-controlled',controlled)}
 },[])
 return <aside style={{position:'fixed',top:'calc(env(safe-area-inset-top) + 12px)',left:'50%',transform:'translateX(-50%)',zIndex:20010,pointerEvents:'none'}}>
  <button type="button" onClick={()=>setHelp(v=>!v)} aria-expanded={help} style={{pointerEvents:'auto',minHeight:44,padding:'7px 12px',border:'1px solid #87efff',background:'#092536e8',color:'white',borderRadius:12,font:'800 12px system-ui'}}>🎮 {connected?'CONTROLLER CONNECTED':'CONTROLLER HELP'}</button>
  {help&&<div role="region" aria-label="StreetVerse controller guide" style={{pointerEvents:'auto',maxWidth:'min(290px,90vw)',padding:12,marginTop:5,background:'#061926f5',border:'1px solid #87efff',borderRadius:12,color:'white',font:'700 12px/1.65 system-ui'}}>
   Left stick: walk or steer. A: interact. B: exit vehicle. X: jump. Y: mission menu. LT: brake. RT: accelerate. R3: camera. Start: toggle this guide. Select: map panel.
   <button type="button" onClick={()=>setHelp(false)} style={{display:'block',minHeight:44,marginTop:8,padding:'7px 12px',color:'#fff',background:'#174e61',borderRadius:9}}>CLOSE GUIDE</button>
  </div>}
 </aside>
}
