import { useEffect, useMemo, useState } from 'react'
import { MISSION_RUNTIME_CONTRACT, STREETVERSE_PRODUCED_MISSIONS } from '../game/story/StreetVerseMissionProductionEngine'
import { saveMissionState } from '../services/streetVerseLifeApi'

const CHARACTER_ID_KEY='tryamm.streetverse.character.v1.id'
const LOCAL_RUN_KEY='tryamm.streetverse.mission-runs.local.v1'
function characterId(){return localStorage.getItem(CHARACTER_ID_KEY)||'streetverse-traveler'}
function saveLocal(run:any){let old:any[]=[];try{old=JSON.parse(localStorage.getItem(LOCAL_RUN_KEY)||'[]')}catch{};localStorage.setItem(LOCAL_RUN_KEY,JSON.stringify([...old.filter(x=>x.missionId!==run.missionId),run].slice(-50)))}

export default function StreetVerseMissionDirectorHub(){
 const [open,setOpen]=useState(false),[missionId,setMissionId]=useState(STREETVERSE_PRODUCED_MISSIONS[0].id),[beatIndex,setBeatIndex]=useState(0),[status,setStatus]=useState('READY'),[message,setMessage]=useState('')
 useEffect(()=>{const show=()=>setOpen(true);window.addEventListener('tryamm:streetverse-mission-open',show);return()=>window.removeEventListener('tryamm:streetverse-mission-open',show)},[])
 const mission=useMemo(()=>STREETVERSE_PRODUCED_MISSIONS.find(x=>x.id===missionId)!,[missionId]);const beat=mission.beats[Math.min(beatIndex,mission.beats.length-1)]
 const persist=async(nextBeat:number,nextStatus:'active'|'complete'|'paused'='active',choice?:string)=>{const target=mission.beats[Math.min(nextBeat,mission.beats.length-1)];const payload={characterId:characterId(),missionId:mission.id,beatId:target.id,status:nextStatus,choice:choice?{choice}:{},runtimeState:{beatIndex:nextBeat,chapter:mission.chapter,location:mission.location,updatedAt:new Date().toISOString()}};try{await saveMissionState(payload);setStatus(nextStatus==='complete'?'COMPLETE':'SAVED');setMessage('Mission state saved to World Memory persistence.')}catch(error){if(error instanceof Error&&/Authentication required/i.test(error.message)){saveLocal(payload);setStatus('LOCAL CHECKPOINT');setMessage('Mission checkpoint saved on this device. Sign in to persist it across devices.')}else{setStatus('FAILED');setMessage(error instanceof Error?error.message:'Mission save failed')}}}
 const advance=async()=>{const next=beatIndex+1;if(next>=mission.beats.length){await persist(beatIndex,'complete');return}setBeatIndex(next);await persist(next,'active')}
 const selectMission=(id:string)=>{setMissionId(id);setBeatIndex(0);setStatus('READY');setMessage('')}
 if(!open)return null
 return <div role="dialog" aria-modal="true" aria-label="StreetVerse Mission Director" style={{position:'fixed',inset:0,zIndex:12140,overflowY:'auto',background:'radial-gradient(circle at top,#30210d,#05070c 58%,#020204)',color:'#fff',padding:16}}><div style={{maxWidth:1180,margin:'0 auto'}}><header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:'#ffcf66',letterSpacing:3,fontWeight:900}}>STREETVERSE • SCRIPTED STORYBOARD RUNTIME</div><h1>Missions Are Scenes, Choices and Consequences</h1></div><button aria-label="Close" onClick={()=>setOpen(false)} style={close}>×</button></header>
 <section style={panel}><h2>Mission library</h2><div style={grid}>{STREETVERSE_PRODUCED_MISSIONS.map(m=><button key={m.id} onClick={()=>selectMission(m.id)} style={missionButton(m.id===mission.id)}><b>{m.title}</b><span>{m.chapter}</span><small>{m.location}</small></button>)}</div></section>
 <section style={panel}><div style={{color:'#ffcf66',fontSize:11,fontWeight:900}}>{mission.chapter} • {mission.rightsMode}</div><h2>{mission.title}</h2><p style={muted}>{mission.objective}</p><div style={chips}>{mission.unlocks.map(x=><span key={x} style={chip}>UNLOCK • {x}</span>)}</div></section>
 <section style={panel}><div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><div><div style={{color:'#4fe3ff',fontSize:10,fontWeight:900}}>BEAT {beatIndex+1} / {mission.beats.length}</div><h2>{beat.title}</h2></div><strong>STATUS: {status}</strong></div><p><b>SHOT:</b> {beat.shot}</p><p><b>GAMEPLAY:</b> {beat.gameplay}</p><blockquote style={{margin:'14px 0',padding:'12px 16px',borderLeft:'3px solid #ffcf66',background:'#0d1017'}}>{beat.npcLine}</blockquote>{beat.playerChoice&&<div><b>PLAYER CHOICE</b><div style={chips}>{beat.playerChoice.map(x=><button key={x} onClick={()=>persist(beatIndex,'active',x)} style={choice}>{x}</button>)}</div></div>}<p style={muted}><b>WORLD MEMORY:</b> {beat.worldMemoryWrite||'Beat progression only'}</p><div style={chips}>{beat.assetTags.map(x=><span key={x} style={chip}>{x}</span>)}</div><h3>Accessibility</h3><div style={chips}>{beat.accessibility.map(x=><span key={x} style={chip}>{x}</span>)}</div><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:18}}><button style={action} onClick={()=>persist(beatIndex,'paused')}>SAVE CHECKPOINT</button><button style={action} onClick={advance}>{beatIndex===mission.beats.length-1?'COMPLETE MISSION':'NEXT STORY BEAT →'}</button></div>{message&&<p style={muted}>{message}</p>}</section>
 <section style={panel}><h2>Success + fail-safe contract</h2><div style={grid}><article><h3>Success writes</h3><ul>{mission.success.map(x=><li key={x}>{x}</li>)}</ul></article><article><h3>Fail-safe rules</h3><ul>{mission.failSafe.map(x=><li key={x}>{x}</li>)}</ul></article></div></section>
 <section style={panel}><h2>Runtime contract</h2><ol>{MISSION_RUNTIME_CONTRACT.map(x=><li key={x}>{x}</li>)}</ol></section>
 </div></div>
}
const panel={border:'1px solid #46391f',borderRadius:18,padding:16,margin:'14px 0',background:'#0b0d13'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10} as const
const chips={display:'flex',gap:7,flexWrap:'wrap'} as const
const chip={border:'1px solid #4a4654',borderRadius:999,padding:'6px 9px',fontSize:10,background:'#11141c'} as const
const muted={color:'#aab8c8',lineHeight:1.6} as const
const action={minHeight:46,borderRadius:10,border:'1px solid #ffcf66',background:'#2a1e08',color:'#fff',padding:'0 14px',fontWeight:900,cursor:'pointer'} as const
const choice={...action,minHeight:38,fontSize:11} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #5c5260',background:'#11131b',color:'#fff',fontSize:22} as const
const missionButton=(active:boolean)=>({display:'grid',gap:5,textAlign:'left' as const,minHeight:100,borderRadius:14,padding:12,border:active?'2px solid #ffcf66':'1px solid #343845',background:active?'#2b210e':'#0e1118',color:'#fff',cursor:'pointer'})