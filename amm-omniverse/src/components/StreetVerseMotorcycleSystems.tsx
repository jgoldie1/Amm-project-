import {useEffect,useRef,useState} from 'react'

type DriveTelemetry={entered?:boolean;speed?:number;throttle?:number;brake?:number;steer?:number;handbrake?:number;slipAngle?:number;surface?:string;gripMultiplier?:number;x?:number;z?:number}
type MotorcycleState={active:boolean;lean:number;wheelie:number;stoppie:number;crashed:boolean;recovering:boolean}

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export default function StreetVerseMotorcycleSystems(){
 const [state,setState]=useState<MotorcycleState>({active:false,lean:0,wheelie:0,stoppie:0,crashed:false,recovering:false})
 const stateRef=useRef(state);const last=useRef<DriveTelemetry>({})
 useEffect(()=>{stateRef.current=state},[state])
 useEffect(()=>{
  const onToggle=(e:Event)=>{const d=(e as CustomEvent<{active?:boolean}>).detail||{};setState(s=>({...s,active:d.active??!s.active,crashed:false,recovering:false,lean:0,wheelie:0,stoppie:0}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-motorcycle-mode',{detail:{active:d.active??!stateRef.current.active}}))}
  const onDrive=(e:Event)=>{const d=(e as CustomEvent<DriveTelemetry>).detail||{};last.current=d;if(!stateRef.current.active||!d.entered)return
   const speed=Math.max(0,Number(d.speed||0)),steer=clamp(Number(d.steer||0),-1,1),throttle=clamp(Number(d.throttle||0),0,1),brake=clamp(Number(d.brake||0),0,1),surfaceGrip=clamp(Number(d.gripMultiplier||1),.45,1)
   const lean=clamp(-steer*(speed/34)*.82,-.82,.82)
   const wheelie=clamp((throttle-.72)*2.9*(1-clamp(speed/34,0,.8))*surfaceGrip,0,.72)
   const stoppie=clamp((brake-.72)*2.7*clamp(speed/22,0,1),0,.62)
   const unstable=(Math.abs(lean)>.68&&Number(d.slipAngle||0)>24&&speed>18)||((d.surface==='WET'||d.surface==='LOW-GRIP')&&Number(d.slipAngle||0)>34&&speed>15)
   const crashed=stateRef.current.crashed||unstable
   setState(s=>({...s,lean,wheelie,stoppie,crashed,recovering:s.recovering&&crashed}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-motorcycle-telemetry',{detail:{active:true,speed,lean,wheelie,stoppie,crashed,surface:d.surface||'DRY',gripMultiplier:surfaceGrip,x:d.x,z:d.z}}))
   if(unstable)window.dispatchEvent(new CustomEvent('tryamm:streetverse-motorcycle-crash',{detail:{speed,lean,slipAngle:d.slipAngle||0,surface:d.surface||'DRY',x:d.x,z:d.z}}))
  }
  const recover=()=>{if(!stateRef.current.active||!stateRef.current.crashed)return;setState(s=>({...s,recovering:true}));window.setTimeout(()=>{setState(s=>({...s,crashed:false,recovering:false,lean:0,wheelie:0,stoppie:0}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-motorcycle-recovered',{detail:{x:last.current.x,z:last.current.z}}))},900)}
  addEventListener('tryamm:streetverse-motorcycle-toggle',onToggle);addEventListener('tryamm:streetverse-drive-telemetry',onDrive);addEventListener('tryamm:streetverse-motorcycle-recover',recover)
  return()=>{removeEventListener('tryamm:streetverse-motorcycle-toggle',onToggle);removeEventListener('tryamm:streetverse-drive-telemetry',onDrive);removeEventListener('tryamm:streetverse-motorcycle-recover',recover)}
 },[])
 if(!state.active)return <button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-motorcycle-toggle',{detail:{active:true}}))} style={{position:'fixed',right:12,bottom:168,zIndex:17010,border:'1px solid #55e6ff88',borderRadius:12,padding:'8px 10px',background:'#06111ce8',color:'#fff',fontSize:10,fontWeight:900}}>MOTORCYCLE MODE</button>
 return <div style={{position:'fixed',right:12,bottom:168,zIndex:17010,minWidth:210,padding:10,borderRadius:13,background:'#06111cee',border:'1px solid #55e6ff88',color:'#fff',fontFamily:'system-ui',fontSize:10}}><div style={{fontWeight:950,color:'#66eaff'}}>MOTORCYCLE HANDLING</div><div style={{marginTop:5}}>LEAN {Math.round(state.lean*100)}% • WHEELIE {Math.round(state.wheelie*100)}%</div><div>STOPPIE {Math.round(state.stoppie*100)}% • {state.crashed?'CRASHED':'STABLE'}</div><div style={{display:'flex',gap:6,marginTop:7}}>{state.crashed&&<button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-motorcycle-recover'))} style={btn}>{state.recovering?'RECOVERING…':'RECOVER'}</button>}<button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-motorcycle-toggle',{detail:{active:false}}))} style={btn}>CAR MODE</button></div></div>
}
const btn:React.CSSProperties={border:'1px solid #4b687c',borderRadius:9,padding:'7px 8px',background:'#0c1a27',color:'#fff',fontSize:9,fontWeight:900}
