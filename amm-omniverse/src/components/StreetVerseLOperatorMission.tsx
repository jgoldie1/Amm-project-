import {useEffect,useMemo,useState} from 'react'

type Stop={id:string;name:string;x:number;z:number;board:number;exit:number}
const STOPS:Stop[]=[
{id:'state-lake',name:'STATE / LAKE',x:-18,z:-34,board:7,exit:0},
{id:'wabash-adams',name:'WABASH / ADAMS',x:22,z:32,board:5,exit:3},
{id:'north-side',name:'NORTH SIDE',x:18,z:-69,board:4,exit:6},
]
type Phase='idle'|'approach'|'doors-open'|'boarding'|'depart'
export default function StreetVerseLOperatorMission(){
 const [active,setActive]=useState(false),[index,setIndex]=useState(0),[phase,setPhase]=useState<Phase>('idle'),[riders,setRiders]=useState(0),[score,setScore]=useState(100),[pos,setPos]=useState({x:0,z:0,speed:0})
 const stop=STOPS[index]
 useEffect(()=>{const onPos=(e:Event)=>{const d=(e as CustomEvent).detail||{};setPos({x:Number(d.x)||0,z:Number(d.z)||0,speed:Math.abs(Number(d.speed)||0)})};window.addEventListener('tryamm:streetverse-player-position',onPos);return()=>window.removeEventListener('tryamm:streetverse-player-position',onPos)},[])
 const distance=useMemo(()=>Math.hypot(pos.x-stop.x,pos.z-stop.z),[pos,stop])
 useEffect(()=>{if(!active)return;if(phase==='approach'&&distance<8){if(pos.speed>2.5){setScore(s=>Math.max(0,s-5));return}setPhase('doors-open')}} ,[active,phase,distance,pos.speed])
 const start=()=>{setActive(true);setIndex(0);setRiders(0);setScore(100);setPhase('approach');window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:'chicago-l-operator-01',label:'Chicago L Operator',financialReward:false}}))}
 const openDoors=()=>{if(distance>8||pos.speed>1)return;setPhase('boarding');window.dispatchEvent(new CustomEvent('tryamm:l-train-doors',{detail:{open:true,stopId:stop.id}}));setTimeout(()=>{setRiders(r=>Math.max(0,r-stop.exit)+stop.board);setPhase('depart')},2200)}
 const depart=()=>{window.dispatchEvent(new CustomEvent('tryamm:l-train-doors',{detail:{open:false,stopId:stop.id}}));if(index===STOPS.length-1){const xp=220+Math.round(score*.8);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:'chicago-l-operator-01',label:'Chicago L Operator',xp,financialReward:false,progressState:{route:'Loop/North',safeStopScore:score,passengers:riders}}}));setActive(false);setPhase('idle')}else{setIndex(i=>i+1);setPhase('approach')}}
 if(!active)return <button onClick={start} style={{position:'fixed',left:12,top:132,zIndex:12000,padding:'9px 12px',borderRadius:10,fontWeight:900}}>🚆 L OPERATOR MISSION</button>
 return <div style={{position:'fixed',left:12,top:132,zIndex:12000,width:270,padding:12,borderRadius:12,background:'rgba(4,13,22,.92)',border:'1px solid #56b8ff88',color:'#fff',fontFamily:'system-ui',fontSize:12}}><b>🚆 CHICAGO L OPERATOR</b><div style={{marginTop:5}}>NEXT STOP • {stop.name}</div><div>{distance.toFixed(0)}m • Riders {riders} • Safety {score}</div><div style={{opacity:.72,marginTop:4}}>{phase==='approach'?'Arrive and stop inside the station zone.':phase==='doors-open'?'Train stopped. Open the doors.':phase==='boarding'?`Passengers boarding/exiting • ${stop.board} on / ${stop.exit} off`:phase==='depart'?'Close doors and depart safely.':''}</div>{phase==='doors-open'&&<button onClick={openDoors} style={{marginTop:8}}>OPEN DOORS</button>}{phase==='depart'&&<button onClick={depart} style={{marginTop:8}}>CLOSE DOORS • DEPART</button>}</div>
}
