import { useMemo, useState } from 'react'
import { FLIGHT_STAGES, INITIAL_FLIGHT_STATE, SPACEFLIGHT_PORTABLE_STATE, SPACEFLIGHT_RELEASE_GATES, advanceFlight, clampFlightState, type FlightState } from '../game/space/SpaceflightJourney'
import { saveMissionState } from '../services/streetVerseLifeApi'

const STORAGE_KEY='tryamm.spaceflight.state.v1'
const CHARACTER_ID_KEY='tryamm.streetverse.character.v1.id'
function loadState():FlightState{try{return clampFlightState({...INITIAL_FLIGHT_STATE,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')})}catch{return {...INITIAL_FLIGHT_STATE,updatedAt:new Date().toISOString()}}}
function characterId(){return localStorage.getItem(CHARACTER_ID_KEY)||'streetverse-traveler'}

export default function SpaceflightJourneyHub(){
 const [open,setOpen]=useState(false),[state,setState]=useState<FlightState>(loadState),[status,setStatus]=useState('READY')
 const stage=useMemo(()=>FLIGHT_STAGES[state.stageIndex],[state.stageIndex])
 const commit=(next:FlightState)=>{const safe=clampFlightState(next);setState(safe);localStorage.setItem(STORAGE_KEY,JSON.stringify(safe));return safe}
 const persist=async(next:FlightState,label:string)=>{const saved=commit(next);try{await saveMissionState({characterId:characterId(),missionId:'spaceverse-first-flight',beatId:FLIGHT_STAGES[saved.stageIndex].id,status:saved.stageIndex===FLIGHT_STAGES.length-1?'complete':'active',runtimeState:saved});setStatus(`${label} • WORLD MEMORY SAVED`)}catch(error){setStatus(error instanceof Error&&/Authentication required/i.test(error.message)?`${label} • LOCAL CHECKPOINT`:`${label} • SAVE FAILED`)}}
 const control=(key:'thrust'|'pitch'|'yaw'|'roll',delta:number)=>commit({...state,[key]:state[key]+delta})
 const next=()=>persist(advanceFlight(state),'STAGE ADVANCED')
 const reset=()=>{const next={...INITIAL_FLIGHT_STATE,updatedAt:new Date().toISOString()};commit(next);setStatus('RESET')}
 return <>
  <button type="button" aria-label="Open SpaceVerse flight journey" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:172,zIndex:9002,border:'1px solid #8be9ff88',borderRadius:999,background:'linear-gradient(135deg,#07152b,#26123d)',color:'#fff',padding:'10px 14px',fontFamily:'monospace',fontSize:10,fontWeight:900}}>🚀 SPACEFLIGHT</button>
  {open&&<div role="dialog" aria-modal="true" aria-label="SpaceVerse Flight Journey" style={{position:'fixed',inset:0,zIndex:10160,overflowY:'auto',background:'radial-gradient(circle at top,#162b52,#050714 55%,#020206)',color:'#fff',padding:16}}><div style={{maxWidth:1180,margin:'0 auto'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:'#8be9ff',letterSpacing:3,fontWeight:900}}>ONE AVATAR • ONE WORLD MEMORY • MANY WORLDS</div><h1>StreetVerse → Spaceport → Mars → Holoverse</h1><p style={muted}>The ship does not create a second character. It carries the same player state through every world.</p></div><button aria-label="Close SpaceVerse flight journey" onClick={()=>setOpen(false)} style={close}>×</button></header>
   <section style={panel}><div style={chips}>{FLIGHT_STAGES.map((s,i)=><span key={s.id} style={i===state.stageIndex?activeChip:chip}>{i+1}. {s.title}</span>)}</div></section>
   <section style={panel}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:10,color:'#8be9ff'}}>CURRENT STAGE</div><h2>{stage.title}</h2></div><strong>{status}</strong></div><p>{stage.objective}</p><p style={muted}><b>WORLD MEMORY:</b> {stage.worldMemory}</p>
    <div style={grid}><Meter label="FUEL" value={state.fuel}/><Meter label="HULL" value={state.hull}/><Meter label="THRUST" value={state.thrust}/><Meter label="PITCH" value={state.pitch+45} max={90}/><Meter label="YAW" value={state.yaw+90} max={180}/><Meter label="ROLL" value={state.roll+90} max={180}/></div>
   </section>
   <section style={panel}><h2>Cockpit</h2><div style={grid}><Control label="THRUST" onMinus={()=>control('thrust',-10)} onPlus={()=>control('thrust',10)}/><Control label="PITCH" onMinus={()=>control('pitch',-5)} onPlus={()=>control('pitch',5)}/><Control label="YAW" onMinus={()=>control('yaw',-10)} onPlus={()=>control('yaw',10)}/><Control label="ROLL" onMinus={()=>control('roll',-10)} onPlus={()=>control('roll',10)}/></div><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:14}}><button style={action} onClick={()=>persist({...state,crewReady:!state.crewReady},state.crewReady?'CREW NOT READY':'CREW READY')}>{state.crewReady?'CREW READY ✓':'SET CREW READY'}</button><button style={action} onClick={next}>ADVANCE JOURNEY →</button><button style={secondary} onClick={reset}>RESET FLIGHT</button></div></section>
   <section style={panel}><h2>Portable player state</h2><div style={chips}>{SPACEFLIGHT_PORTABLE_STATE.map(x=><span key={x} style={chip}>{x}</span>)}</div><h2>Release gates</h2><ul>{SPACEFLIGHT_RELEASE_GATES.map(x=><li key={x}>{x}</li>)}</ul></section>
  </div></div>}
 </>
}
function Meter({label,value,max=100}:{label:string;value:number;max?:number}){const pct=Math.max(0,Math.min(100,value/max*100));return <div style={card}><div style={{fontSize:10,color:'#8be9ff'}}>{label}</div><strong>{Math.round(value)}</strong><div style={{height:7,background:'#111b2d',borderRadius:999,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#4fe3ff,#e8b944)'}}/></div></div>}
function Control({label,onMinus,onPlus}:{label:string;onMinus:()=>void;onPlus:()=>void}){return <div style={card}><strong>{label}</strong><div style={{display:'flex',gap:8,marginTop:8}}><button style={secondary} onClick={onMinus}>−</button><button style={secondary} onClick={onPlus}>+</button></div></div>}
const panel={border:'1px solid #294264',borderRadius:18,padding:16,margin:'14px 0',background:'#07101d'} as const
const card={border:'1px solid #253853',borderRadius:12,padding:12,background:'#0b1524'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10} as const
const chips={display:'flex',gap:7,flexWrap:'wrap'} as const
const chip={border:'1px solid #36516a',borderRadius:999,padding:'6px 9px',fontSize:10,background:'#0b1824'} as const
const activeChip={...chip,border:'1px solid #8be9ff',background:'#123450'} as const
const muted={color:'#aab8c8',lineHeight:1.6} as const
const action={minHeight:46,borderRadius:10,border:'1px solid #8be9ff',background:'#0d2741',color:'#fff',padding:'0 14px',fontWeight:900,cursor:'pointer'} as const
const secondary={minHeight:40,borderRadius:10,border:'1px solid #52647d',background:'#111927',color:'#fff',padding:'0 14px',fontWeight:900,cursor:'pointer'} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #52647d',background:'#101827',color:'#fff',fontSize:22} as const
