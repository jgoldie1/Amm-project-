import { useEffect,useMemo,useState } from 'react'

type Pos={x:number;z:number;vehicle?:boolean}
const GIVER={x:0,z:18,name:'Rico • Circuit Crew'}
export default function StreetVerseRaceMissionGiver(){
  const [pos,setPos]=useState<Pos|null>(null)
  const [accepted,setAccepted]=useState(false)
  const [driving,setDriving]=useState(false)
  const distance=useMemo(()=>pos?Math.hypot(pos.x-GIVER.x,pos.z-GIVER.z):Infinity,[pos])
  const near=distance<9
  useEffect(()=>{
    const onPos=(e:Event)=>{const d=(e as CustomEvent<Pos>).detail;if(Number.isFinite(d?.x)&&Number.isFinite(d?.z))setPos(d)}
    const onVehicle=(e:Event)=>setDriving(Boolean((e as CustomEvent).detail?.entered))
    addEventListener('tryamm:streetverse-player-position',onPos);addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
    return()=>{removeEventListener('tryamm:streetverse-player-position',onPos);removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)}
  },[])
  const accept=()=>{setAccepted(true);dispatchEvent(new CustomEvent('tryamm:streetverse-npc-mission-accepted',{detail:{npc:GIVER.name,id:'chicago-circuit-01'}}));dispatchEvent(new CustomEvent('tryamm:streetverse-resident-talk',{detail:{speaker:GIVER.name,text:'Take any drivable car and run Chicago Circuit 01. Four checkpoints. Clean line. Bring me your best time.'}}))}
  const start=()=>dispatchEvent(new CustomEvent('tryamm:streetverse-drive-mission-start-request',{detail:{id:'chicago-circuit-01',source:'npc',npc:GIVER.name}}))
  if(!near&&!accepted)return null
  return <div style={{position:'fixed',left:12,bottom:96,zIndex:16998,width:'min(86vw,310px)',padding:10,borderRadius:14,background:'#07111dea',border:'1px solid #67e5ff77',color:'#fff',fontFamily:'system-ui',boxShadow:'0 10px 28px #0008'}}>
    <div style={{fontSize:9,fontWeight:950,letterSpacing:1,color:'#67e5ff'}}>NPC MISSION GIVER</div>
    <div style={{fontSize:13,fontWeight:950,marginTop:4}}>{GIVER.name}</div>
    <div style={{fontSize:10,lineHeight:1.45,color:'#bfd0df',marginTop:4}}>{accepted?'Chicago Circuit 01 accepted. Enter a car, then start the race.':'I run the Circuit Crew. Want a timed drive across District 01?'}</div>
    <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
      {!accepted&&<button onClick={accept} style={btn}>TALK • ACCEPT</button>}
      {accepted&&<button disabled={!driving} onClick={start} style={{...btn,opacity:driving?1:.45}}>{driving?'START CIRCUIT':'ENTER A CAR'}</button>}
    </div>
  </div>
}
const btn:React.CSSProperties={minHeight:36,padding:'0 11px',borderRadius:999,border:'1px solid #67e5ff88',background:'#102235',color:'#fff',fontSize:9,fontWeight:950,cursor:'pointer'}