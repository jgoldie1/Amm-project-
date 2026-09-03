import {useEffect,useState} from 'react'

type Dialogue={missionId?:string;speaker?:string;objective?:string;step?:number}
type Pos={x?:number;z?:number}
const targetFor=(missionId:string|undefined,step=0)=>{
 const map:Record<string,{x:number;z:number;label:string}[]>={
  'celebrity-boss-01':[
   {x:34,z:-8,label:'HEADLINER CONVOY'},{x:-34,z:34,label:'VENUE / SOUNDCHECK'},{x:-42,z:-30,label:'PRODUCTION CRATE'},{x:38,z:38,label:'PERFORMANCE STAGE'}],
  'rapper-studio-01':[
   {x:-42,z:-30,label:'ANIYAH 64 TRACK STUDIO'},{x:10,z:-18,label:'BEAT PACK PICKUP'},{x:-42,z:-30,label:'FINAL TAKE / BOOTH'}],
  'rapper-city-02':[
   {x:28,z:-12,label:'RIVERWALK MEETUP'},{x:20,z:28,label:'DOWNTOWN REEL SHOT'},{x:-72,z:10,label:'WEST SIDE BUSINESS STOP'},{x:38,z:38,label:'CREATOR STAGE'}]
 }
 return map[missionId||'']?.[step]
}
export default function StreetVerseStarMissionEncounterLayer(){
 const [dialogue,setDialogue]=useState<Dialogue|null>(null),[pos,setPos]=useState({x:0,z:0})
 useEffect(()=>{const onD=(e:Event)=>setDialogue((e as CustomEvent<Dialogue>).detail||null),onP=(e:Event)=>{const d=(e as CustomEvent<Pos>).detail||{};setPos({x:Number(d.x||0),z:Number(d.z||0)})},onDone=()=>setDialogue(null);addEventListener('tryamm:streetverse-dialogue',onD);addEventListener('tryamm:streetverse-player-position',onP);addEventListener('tryamm:streetverse-mission-complete',onDone);return()=>{removeEventListener('tryamm:streetverse-dialogue',onD);removeEventListener('tryamm:streetverse-player-position',onP);removeEventListener('tryamm:streetverse-mission-complete',onDone)}},[])
 const t=targetFor(dialogue?.missionId,dialogue?.step||0);if(!dialogue||!t)return null
 const d=Math.hypot(pos.x-t.x,pos.z-t.z),bearing=Math.atan2(t.x-pos.x,t.z-pos.z)*180/Math.PI
 return <div style={{position:'fixed',left:'50%',bottom:90,transform:'translateX(-50%)',zIndex:16997,fontFamily:'system-ui',pointerEvents:'none',color:'#fff',textAlign:'center'}}>
  <div style={{display:'inline-block',minWidth:230,maxWidth:'82vw',padding:'10px 14px',borderRadius:14,background:'rgba(6,12,24,.92)',border:'1px solid #ffd36b88',boxShadow:'0 10px 34px #0009'}}>
   <div style={{fontSize:10,fontWeight:900,letterSpacing:'.08em',color:'#ffd36b'}}>★ STAR MISSION ENCOUNTER</div>
   <div style={{fontSize:13,fontWeight:900,marginTop:4}}>{t.label}</div>
   <div style={{fontSize:11,opacity:.78,marginTop:3}}>{Math.round(d)}m • {Math.round(bearing)}°</div>
   <div style={{height:5,marginTop:7,borderRadius:99,background:'#ffffff22',overflow:'hidden'}}><div style={{height:'100%',width:`${Math.max(8,Math.min(100,100-d))}%`,background:'#ffd36b'}}/></div>
   <div style={{fontSize:10,opacity:.68,marginTop:5}}>{d<=10?'YOU ARE IN THE ENCOUNTER ZONE':'FOLLOW THE STAR MISSION MARKER'}</div>
  </div>
 </div>
}
