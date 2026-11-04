import {useMemo,useState} from 'react'
import StreetVerseTransitMotionPreview from './StreetVerseTransitMotionPreview'
import {TRANSIT_MEDIA_DEFAULTS,makeTransitMedia} from '../runtime/StreetVerseTransitMotionAndMedia'
import {TRYAMM_NETWORK_CHANNELS,type TryammNetworkChannelId} from '../runtime/TryammBroadcastOSRuntime'
import {createTransitDisplay,transitDisplayText,updateTransitDisplay,type StreetVerseTransitMode,type TransitDisplayPage} from '../runtime/StreetVerseTransitDisplayRuntime'
import {createStreetVerseCabinDirector} from '../runtime/StreetVerseCabinCameraDirector'
import {boardWalkway,createAirportWalkway,emergencyStopWalkway,leaveWalkway,resetWalkway,setWalkwayRunning,tickAirportWalkway,type WalkwayState} from '../runtime/StreetVerseAirportWalkwayRuntime'
const MODES:readonly StreetVerseTransitMode[]=['car','bus','el-train','plane','airport-walkway']
const PAGES:readonly TransitDisplayPage[]=['route','next-stop','accessibility','cabin','safety']
const btn:React.CSSProperties={minHeight:44,padding:'8px 10px',borderRadius:10,border:'1px solid #486982',background:'#112a39',color:'#effcff',fontSize:12,touchAction:'manipulation'}
export default function StreetVerseTransportScreenLab({onClose}:{onClose:()=>void}){
 const [mode,setMode]=useState<StreetVerseTransitMode>('car')
 const [display,setDisplay]=useState(()=>createTransitDisplay('car'))
 const [seated,setSeated]=useState<string[]>([])
 const [camera,setCamera]=useState('exterior')
 const [channelId,setChannelId]=useState<TryammNetworkChannelId>('streetverse-local-tv')
 const [mediaMode,setMediaMode]=useState<'tv'|'radio'>('tv')
 const [walkway,setWalkway]=useState<WalkwayState>(()=>createAirportWalkway('airport-demo'))
 const director=useMemo(()=>createStreetVerseCabinDirector('streetverse-transit-lab'),[mode])
 const text=transitDisplayText(display)
 const media=makeTransitMedia(mediaMode==='radio'?'cabin-radio':TRANSIT_MEDIA_DEFAULTS[mode].slot,channelId)
 const select=(next:StreetVerseTransitMode)=>{setMode(next);setDisplay(createTransitDisplay(next));setSeated([]);setCamera('exterior');setWalkway(createAirportWalkway('airport-demo'));setChannelId(TRANSIT_MEDIA_DEFAULTS[next].channelId)}
 const action=(next:Parameters<typeof updateTransitDisplay>[1])=>setDisplay(s=>updateTransitDisplay(s,next))
 const board=()=>{
   if(mode!=='car'){action({type:'board'});return}
   const id='demo-rider-'+(seated.length+1)
   const passenger=director.board(id,seated.length===0?'BJ Stubbs':'Passenger '+seated.length,seated.length===0)
   if(passenger){setSeated(v=>[...v,passenger.seatId]);action({type:'board'})}
 }
 const screenContent=display.page==='accessibility'
  ?'Accessible route tools: captions, high contrast, large touch targets, assistance-request placeholder and visible door status.'
  :display.page==='cabin'
   ?mode==='car'?'Six occupant manifest; seating requires real GLB measurements and skeleton checks before release.'
     :'Vehicle interior cameras, destination signage and seating will be attached to licensed/approved 3D assets.'
   :display.page==='safety'
    ?'Simulated evacuation and assistance alerts. This does not replace real transit or airport safety instructions.'
    :display.page==='next-stop'?text.next:text.current
 return <section role="dialog" aria-modal="true" aria-label="StreetVerse transport screen simulator" style={{position:'fixed',inset:0,zIndex:50020,overflowY:'auto',background:'#07111beb',color:'#f4faff',padding:'max(18px,env(safe-area-inset-top)) 14px max(32px,env(safe-area-inset-bottom))',fontFamily:'system-ui'}}>
   <div style={{maxWidth:620,margin:'0 auto'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
      <div><div style={{fontSize:11,color:'#8adfff',fontWeight:900}}>STREETVERSE • TRANSPORT STUDIO</div><h2 style={{margin:'4px 0 10px'}}>PASSENGER DISPLAY TEST</h2></div>
      <button style={btn} onClick={onClose} aria-label="Return to StreetVerse">× CLOSE</button>
    </header>
    <p style={{fontSize:12,color:'#acc4d8'}}>Simulated interface only: not live flight, CTA, or airport data. These controls exercise shared game-state rules without moving the player in the 3D world.</p>
    <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:10}}>{MODES.map(m=><button key={m} style={{...btn,flexShrink:0,borderColor:mode===m?'#74e8d3':'#486982'}} onClick={()=>select(m)}>{m.toUpperCase().replaceAll('-',' ')}</button>)}</div>
    <div style={{border:'3px solid #5b9dca',borderRadius:18,padding:16,background:'linear-gradient(140deg,#101d34,#0e3540)',boxShadow:'inset 0 0 28px #07111c'}}>
      <div style={{fontSize:11,color:'#9ee9ff'}}>SIMULATION • {mode.toUpperCase().replaceAll('-',' ')}</div>
      <h3 style={{margin:'10px 0 4px',fontSize:20}}>{text.title}</h3>
      <div style={{fontSize:12,color:'#a4f2cd'}}>{text.motion} • {text.doors} • OCCUPANCY {text.occupancy}</div>
      <div style={{marginTop:12,padding:16,border:'1px solid #648c98',borderRadius:12,minHeight:76,fontWeight:800,fontSize:17}}>{screenContent}</div>
      <div style={{marginTop:10,fontSize:12}}>NEXT: {text.next}</div>
      <small style={{display:'block',marginTop:12,color:'#aabac8'}}>{text.simulation}</small>
    </div>
    <StreetVerseTransitMotionPreview mode={mode} speedMps={mode==='airport-walkway'?(walkway.enabled?walkway.speedMps:0):display.speedMps} occupancy={mode==='car'?seated.length:display.occupancy}/>
    <section style={{marginTop:12,padding:12,border:'1px solid #47758c',borderRadius:12,background:'#102633'}} aria-label="TRYAMM onboard television and radio">
     <b>📺 TRYAMM IN-VEHICLE TV / RADIO</b>
     <div style={{fontSize:12,margin:'7px 0'}}>Display: {media.slot} • {media.title}</div>
     <label style={{display:'block',fontSize:11,marginBottom:5}}>Network channel</label>
     <select value={channelId} onChange={e=>setChannelId(e.target.value as TryammNetworkChannelId)} style={{width:'100%',padding:10,borderRadius:8,background:'#1c3645',color:'#fff',border:'1px solid #52718d'}}>{TRYAMM_NETWORK_CHANNELS.filter(x=>x.familySafe).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
     <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>
      <button style={btn} onClick={()=>setMediaMode('tv')}>TV CHANNEL</button>
      <button style={btn} onClick={()=>{setMediaMode('radio');window.dispatchEvent(new Event('tryamm:verse-radio-open'))}}>OPEN VERSE RADIO</button>
      <button style={btn} onClick={()=>window.dispatchEvent(new Event('tryamm:broadcast-os-request'))}>REFRESH BROADCAST OS</button>
     </div>
     <p style={{fontSize:11,color:'#b5ccd7'}}>Source: existing TRYAMM Broadcast OS / Verse Radio. Channel selection alone does not start live video or licensed audio. Advertising slots require paid approval, rights clearance and clear ADVERTISEMENT labels; no ad is served automatically.</p>
    </section>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginTop:12}}>
      <button style={btn} onClick={()=>action({type:'move',speedMps:display.moving?0:8})}>{display.moving?'STOP':'START TRAVEL'}</button>
      <button style={btn} onClick={()=>action({type:'doors',open:!display.doorsOpen})}>{display.doorsOpen?'CLOSE DOORS':'OPEN DOORS'}</button>
      <button style={btn} onClick={()=>action({type:'next-stop'})}>NEXT STOP</button>
      <button style={btn} onClick={board}>BOARD {mode==='car'?'SEAT':'PASSENGER'}</button>
    </div>
    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:12}}>{PAGES.map(p=><button key={p} style={{...btn,borderColor:display.page===p?'#62f6ce':'#486982'}} onClick={()=>action({type:'page',page:p})}>{p.toUpperCase().replaceAll('-',' ')}</button>)}</div>
    {mode==='car'&&<div style={{marginTop:12,padding:12,border:'1px solid #486982',borderRadius:12}}>
      <strong>Six-seat cabin test • {seated.length}/6 seated</strong>
      <div style={{fontSize:12,margin:'6px 0'}}>Seats assigned: {seated.length?seated.join(', '):'none'}</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{(['driver','passenger','rear-seat','aisle','cinematic','exterior'] as const).map(c=><button key={c} style={btn} onClick={()=>{director.camera(c);setCamera(c)}}>{c}</button>)}</div>
      <div style={{fontSize:11,marginTop:8}}>Selected camera: {camera}. This is a camera-shot specification, not an active 3D camera.</div>
    </div>}
    {mode==='airport-walkway'&&<section style={{border:'1px solid #486982',borderRadius:12,padding:12,marginTop:12}}>
      <strong>Moving walkway • gameplay simulation</strong>
      <div style={{fontSize:12,margin:'8px 0'}}>Belt: {walkway.enabled?'RUNNING':'STOPPED'} • rider progress: {walkway.riders['demo-rider']?.distanceM.toFixed(1)??'not aboard'} / {walkway.lengthM} m • emergency: {walkway.emergencyStopped?'ON':'OFF'}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:6}}>
       <button style={btn} onClick={()=>setWalkway(s=>boardWalkway(s,'demo-rider'))}>STEP ON</button>
       <button style={btn} onClick={()=>setWalkway(s=>setWalkwayRunning(s,!s.enabled))}>{walkway.enabled?'STOP BELT':'RUN BELT'}</button>
       <button style={btn} onClick={()=>setWalkway(s=>tickAirportWalkway(s,.1))}>ADVANCE SIMULATION 0.1s</button>
       <button style={btn} onClick={()=>setWalkway(s=>leaveWalkway(s,'demo-rider'))}>STEP OFF</button>
       <button style={btn} onClick={()=>setWalkway(s=>emergencyStopWalkway(s))}>EMERGENCY STOP</button>
       <button style={btn} onClick={()=>setWalkway(s=>resetWalkway(s))}>RESET EMPTY BELT</button>
      </div>
      <p style={{fontSize:11}}>An accessible alternate walking route is preserved. The 3D airport walkway mesh, collisions and actual character transport still require integration.</p>
     </section>}
    <button style={{...btn,marginTop:16,width:'100%'}} onClick={onClose}>RETURN TO STREETVERSE</button>
   </div>
  </section>
}
