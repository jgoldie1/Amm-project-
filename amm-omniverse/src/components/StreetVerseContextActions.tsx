import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react'
import {ACTION_EVENT,CONTROL_EVENT,CONTEXTS,BUTTON_LABELS,resolveAction,makeControlIntent,normalizeStick,type ControlContext,type ControlButton} from '../foundation/streetverseControllerProtocol.js'
const btn:CSSProperties={minHeight:60,borderRadius:13,border:'2px solid #6dd3ff',background:'#183e59',color:'#fff',fontSize:16,fontWeight:800,padding:12,cursor:'pointer',touchAction:'manipulation'}
const face:ControlButton[]=['Y','X','B','A']
const shoulders:ControlButton[]=['LB','LT','RB','RT']
const misc:ControlButton[]=['L3','R3','SELECT','START']
const dpad:ControlButton[]=['UP','LEFT','RIGHT','DOWN']
const gamepadIndex:Record<number,ControlButton>={0:'A',1:'B',2:'X',3:'Y',4:'LB',5:'RB',6:'LT',7:'RT',8:'SELECT',9:'START',10:'L3',11:'R3',12:'UP',13:'DOWN',14:'LEFT',15:'RIGHT'}
const contextLabels:Record<ControlContext,string>={street:'Chicago Streets',home:'Home / Kitchen',workplace:'Jobs / Restaurant',range:'Fictional Target Range',sports:'Sports Career',grocery:'Grocery / Store',trucking:'Trucking / Logistics',housing:'Family Housing',health:'Accessible Healthcare',parkour:'Parkour / Obstacles',rescue:'911 / Fire / Rescue',missions:'Detective / Missions'}
export default function StreetVerseContextActions(){
 const [context,setContext]=useState<ControlContext>('street')
 const [index,setIndex]=useState(0)
 const [open,setOpen]=useState(false)
 const [notice,setNotice]=useState('A = interact • B = back • X = secondary • Y = action wheel. Gamepad and large touch controls supported.')
 const [actions,setActions]=useState(0)
 const [connected,setConnected]=useState(false)
 const [move,setMove]=useState({x:0,y:0})
 const [camera,setCamera]=useState({x:0,y:0})
 const menu=CONTEXTS[context]
 const state=useRef({context,index,open})
 state.current={context,index,open}
 const emitIntent=useCallback((button:ControlButton,source='touch',action:string|null=null)=>{
  window.dispatchEvent(new CustomEvent(CONTROL_EVENT,{detail:makeControlIntent({button,context:state.current.context,source,action})}))
 },[])
 const perform=useCallback((action:string,source='touch')=>{
  const ctx=state.current.context
  if(action==='target'&&ctx!=='range'){setNotice('Fictional target interaction is restricted to the training range.');return}
  window.dispatchEvent(new CustomEvent(ACTION_EVENT,{detail:{schema:'tryamm.action.local.v1',action,context:ctx,description:'Requested '+action+' in '+ctx,source,authoritative:false}}))
  setNotice('ACTION: '+action.replace(/-/g,' ').toUpperCase()+' — request registered. World animation/objects are not yet connected.')
  setActions(x=>x+1);setOpen(false)
 },[])
 const onButton=useCallback((key:ControlButton,source='touch')=>{
  emitIntent(key,source)
  const current=state.current
  const count=CONTEXTS[current.context].length
  if(key==='A'){if(current.open)perform(resolveAction(current.context,current.index),source);else{setOpen(true);setNotice('Action wheel open. Choose an action and press A.')}} 
  else if(key==='B'){setOpen(false);setNotice('Back / cancel.')}
  else if(key==='Y'){setOpen(x=>!x);setNotice('Action wheel toggled.')}
  else if(key==='X'){perform(resolveAction(current.context,1),source)}
  else if(key==='LB'||key==='LEFT'||key==='UP'){setIndex(i=>(i+count-1)%count);setNotice('Previous action.')}
  else if(key==='RB'||key==='RIGHT'||key==='DOWN'){setIndex(i=>(i+1)%count);setNotice('Next action.')}
  else if(key==='LT')setNotice('Left trigger: aim or brake request (3D adapter pending).')
  else if(key==='RT')setNotice('Right trigger: use or accelerate request (3D adapter pending).')
  else if(key==='L3')setNotice('Sprint request (3D adapter pending).')
  else if(key==='R3')setNotice('Camera toggle request (3D adapter pending).')
  else if(key==='START')setNotice('Pause/menu request (3D adapter pending).')
  else if(key==='SELECT')setNotice('Map/inventory request (3D adapter pending).')
 },[emitIntent,perform])
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{
   const node=e.target as HTMLElement|null
   if(node?.closest('input,textarea,select,[contenteditable],button,a'))return
   const keys:Record<string,ControlButton>={a:'A',b:'B',x:'X',y:'Y',q:'LB',e:'RB',shift:'L3',m:'SELECT',p:'START',arrowup:'UP',arrowdown:'DOWN',arrowleft:'LEFT',arrowright:'RIGHT'}
   const button=keys[e.key.toLowerCase()]
   if(button){e.preventDefault();onButton(button,'keyboard')}
  }
  window.addEventListener('keydown',key)
  return ()=>window.removeEventListener('keydown',key)
 },[onButton])
 const prevPressed=useRef(new Set<number>())
 useEffect(()=>{
  let frame=0,lastAxes=''
  const poll=()=>{
   const pads=typeof navigator.getGamepads==='function'?navigator.getGamepads():[]
   const pad=Array.from(pads).find(Boolean)
   setConnected(old=>old===Boolean(pad)?old:Boolean(pad))
   if(pad){
    const buttons=new Set<number>()
    pad.buttons.forEach((b,i)=>{if(b.pressed&&gamepadIndex[i]!==undefined){buttons.add(i);if(!prevPressed.current.has(i))onButton(gamepadIndex[i],'gamepad')}})
    prevPressed.current=buttons
    const left=normalizeStick(pad.axes[0]||0,pad.axes[1]||0),right=normalizeStick(pad.axes[2]||0,pad.axes[3]||0)
    const snapshot=JSON.stringify({left,right})
    if(snapshot!==lastAxes){
     lastAxes=snapshot;setMove(left);setCamera(right)
     window.dispatchEvent(new CustomEvent(CONTROL_EVENT,{detail:{schema:'tryamm.controller.axes.v1',source:'gamepad',left,right,authoritative:false}}))
    }
   }else prevPressed.current.clear()
   frame=requestAnimationFrame(poll)
  }
  frame=requestAnimationFrame(poll)
  return ()=>cancelAnimationFrame(frame)
 },[onButton])
 return <section aria-label="StreetVerse original context action controls" style={{padding:14,border:'1px solid #578ca8',background:'#0b2237',borderRadius:16}}>
  <h2 style={{marginTop:0}}>StreetVerse Full Controller</h2>
  <p style={{fontSize:15,lineHeight:1.6}}>Original contextual layout with familiar gamepad buttons. These commands emit browser events; actual BJ/Jacobie walking, combat, vehicle physics and animations still require a 3D adapter.</p>
  <p role="status" aria-live="polite" style={{color:'#ffe6a6',minHeight:44}}>{notice}</p>
  <label style={{fontWeight:800,display:'block'}}>Career / location
   <select aria-label="Career or activity" value={context} onChange={e=>{setContext(e.target.value as ControlContext);setIndex(0);setOpen(false)}} style={{display:'block',width:'100%',minHeight:60,padding:12,borderRadius:12,fontSize:17,background:'#163750',color:'white'}}>
   {Object.entries(contextLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}
   </select>
  </label>
  <p style={{fontSize:14}}>Gamepad: {connected?'CONNECTED':'not detected'} • Left stick movement: {move.x}, {move.y} • Right stick camera: {camera.x}, {camera.y}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
   {shoulders.map(k=><button type="button" key={k} style={btn} onClick={()=>onButton(k)}>{k} — {BUTTON_LABELS[k]}</button>)}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8,marginTop:12}}>
   {face.map(k=><button type="button" key={k} style={{...btn,background:k==='A'?'#165e4a':k==='B'?'#67333a':'#24466a'}} onClick={()=>onButton(k)}>{k} — {BUTTON_LABELS[k]}</button>)}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8,marginTop:12}}>
   {misc.map(k=><button type="button" key={k} style={btn} onClick={()=>onButton(k)}>{k} — {BUTTON_LABELS[k]}</button>)}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8,marginTop:12}}>
   {dpad.map(k=><button type="button" key={k} style={btn} onClick={()=>onButton(k)}>{k} — {BUTTON_LABELS[k]}</button>)}
  </div>
  {open&&<div aria-label="Action wheel options" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8,marginTop:16}}>
    {menu.map((action,i)=><button key={action} type="button" aria-pressed={i===index} style={{...btn,borderColor:i===index?'#ffe09b':'#6dd3ff'}} onClick={()=>{setIndex(i);perform(action)}}>{action.replace(/-/g,' ').toUpperCase()}</button>)}
   </div>}
  <p style={{fontSize:13,color:'#bad6e4'}}>Local action intents: {actions}. No real weapons, real emergency dispatch, actual money, or verified multiplayer effects. On-screen controls remain in normal page flow so they do not cover a 3D joystick.</p>
 </section>
}
