import {useEffect,useState} from 'react'
import {FILM_SCENES,chooseFilm,newFilmState,validFilmState,type FilmState} from '../runtime/StreetVerseBranchingMovieJusticeRuntime'
const KEY='tryamm:streetverse:movie-justice-choice:v1'
const btn={minHeight:58,padding:'12px 14px',borderRadius:13,border:'1px solid #a6d8df',color:'#fff',background:'#173b51',fontWeight:800,fontSize:16,touchAction:'manipulation' as const}
function restore():FilmState{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(validFilmState(s))return s}catch{}return newFilmState()}
export default function StreetVerseMovieJusticeHUD(){
 const [open,setOpen]=useState(false),[state,setState]=useState<FilmState>(restore),[message,setMessage]=useState('You direct the next episode with choices A, B, C or D.')
 const scene=FILM_SCENES[state.scene]
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}},[state])
 const select=(key:'A'|'B'|'C'|'D')=>{
  const choice=scene.choices.find(c=>c.key===key);if(!choice)return
  const next=chooseFilm(state,key);setState(next);setMessage(choice.summary)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-movie-choice',{detail:{episode:scene.id,choice:key,next:next.scene,camera:FILM_SCENES[next.scene].camera,fictional:true,serverVerified:false,rewardCredits:0}}))
 }
 const reset=()=>{setState(newFilmState());setMessage('Story restarted; no account or wallet balances were changed.')}
 const exportScript=()=>{const payload={schema:'tryamm.streetverse.branching-movie.v1',scene:state.scene,history:state.history,summary:{community:state.community,evidence:state.caseEvidence,rights:state.rightsAwareness,services:state.services},fictional:true,serverVerified:false,riggedCharacterPlaybackVerified:false,exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='StreetVerse_ABCD_Movie_Justice_Choices.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),750)}
 return <aside data-streetverse-movie-choice="true" style={{position:'fixed',right:8,top:'max(110px,env(safe-area-inset-top))',zIndex:42012,maxWidth:'calc(100vw - 16px)',color:'#fff',fontFamily:'system-ui'}}>
  <button style={btn} aria-expanded={open} onClick={()=>setOpen(x=>!x)}>🎬 ABCD MOVIE / JUSTICE RP</button>
  {open&&<div role="region" aria-label="StreetVerse interactive justice film" style={{maxWidth:390,maxHeight:'70dvh',overflowY:'auto',background:'#061725f5',padding:13,borderRadius:14,border:'1px solid #76b7d1',marginTop:7,display:'grid',gap:9}}>
   <strong style={{fontSize:20}}>{scene.title}</strong>
   <div style={{fontSize:12,color:'#bad7e2'}}>LOCATION: {scene.location} · CAMERA: {scene.camera}</div>
   <p style={{fontSize:16,lineHeight:1.55,margin:0}}>{scene.voice}</p>
   <div style={{fontSize:13}}>Cast: {scene.roles.join(', ')}</div>
   {scene.choices.map(c=><button key={c.key} style={{...btn,textAlign:'left',background:'#1e455d'}} onClick={()=>select(c.key)}><strong>{c.key}.</strong> {c.label}</button>)}
   <p role="status" aria-live="polite" style={{margin:0,fontSize:13,lineHeight:1.5}}>{message}</p>
   <p style={{fontSize:12,margin:0}}>Branch progress: {state.history.length} choices · neighborhood care {state.community} · evidence {state.caseEvidence} · rights {state.rightsAwareness} · support {state.services}</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}><button style={btn} onClick={exportScript}>EXPORT MOVIE REPORT</button><button style={btn} onClick={reset}>RESTART EPISODE</button></div>
   <small>Scripted interactive roleplay: scenes, camera cues and decisions change locally. Actual animated cutscenes, cast GLB animation, server co-op and production justice interiors are not yet verified. Fictional lawyers are not providing legal advice; all court outcomes are determined by narrative scripts, not player-assigned punishment.</small>
  </div>}
 </aside>
}
