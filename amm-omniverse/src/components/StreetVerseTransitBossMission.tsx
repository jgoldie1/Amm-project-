import {useEffect,useState} from 'react'

type Stage={title:string,detail:string,target:{x:number;z:number};xp:number;event?:string}
const STAGES:Stage[]=[
 {title:'SERVICE DISRUPTION',detail:'Report to the Loop control point and assess the multi-line outage.',target:{x:0,z:-38},xp:50},
 {title:'EMERGENCY STOP',detail:'Reach the disabled Red Line subway train and secure the platform.',target:{x:8,z:-18},xp:70,event:'tryamm:transit-emergency-stop'},
 {title:'PASSENGER EVACUATION',detail:'Evacuate riders from the underground station to the safe zone.',target:{x:18,z:-8},xp:100,event:'tryamm:transit-evacuation'},
 {title:'RESPONDER COORDINATION',detail:'Meet police, fire and EMS at the incident command point.',target:{x:28,z:-2},xp:80,event:'tryamm:streetverse-emergency-dispatch'},
 {title:'BLUE LINE REROUTE',detail:'Reach the Blue Line junction and authorize the emergency route.',target:{x:-24,z:8},xp:90,event:'tryamm:transit-reroute'},
 {title:'SWITCH CHALLENGE',detail:'Restore the downtown rail switch without entering the closed track zone.',target:{x:-10,z:26},xp:110,event:'tryamm:transit-switch-restored'},
 {title:'RESCUE TRAIN',detail:'Board the rescue train and reach the stranded passenger transfer point.',target:{x:14,z:38},xp:140,event:'tryamm:transit-rescue-train'},
 {title:'RESTORE NETWORK',detail:'Return to central control and bring all eight lines back online.',target:{x:0,z:0},xp:160,event:'tryamm:transit-network-restored'},
 {title:'FINAL ARRIVAL',detail:'Complete the final safe station arrival to finish the crisis.',target:{x:22,z:32},xp:200,event:'tryamm:transit-final-arrival'},
]
export default function StreetVerseTransitBossMission(){
 const [active,setActive]=useState(false),[stage,setStage]=useState(0),[pos,setPos]=useState({x:999,z:999}),[score,setScore]=useState(100)
 useEffect(()=>{const f=(e:Event)=>{const d=(e as CustomEvent).detail||{};setPos({x:Number(d.x)||0,z:Number(d.z)||0})};window.addEventListener('tryamm:streetverse-player-position',f);return()=>window.removeEventListener('tryamm:streetverse-player-position',f)},[])
 const s=STAGES[stage],dist=Math.hypot(pos.x-s.target.x,pos.z-s.target.z)
 const start=()=>{setActive(true);setStage(0);setScore(100);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:'transit-crisis-boss-01',label:'Chicago Transit Crisis',boss:true,financialReward:false}}))}
 const advance=()=>{if(dist>12)return;if(s.event)window.dispatchEvent(new CustomEvent(s.event,{detail:{missionId:'transit-crisis-boss-01',stage,title:s.title}}));if(stage===STAGES.length-1){const xp=STAGES.reduce((n,a)=>n+a.xp,0)+Math.round(score*2);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:'transit-crisis-boss-01',label:'Chicago Transit Crisis',boss:true,xp,financialReward:false,unlock:'ELITE TRANSIT OPERATOR',progressState:{safeResponseScore:score,networkLinesRestored:8}}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-unlock',{detail:{id:'elite-transit-operator',label:'Elite Transit Operator',reward:'Special transit skin + advanced route missions'}}));setActive(false);return}setStage(v=>v+1)}
 if(!active)return <button onClick={start} style={{position:'fixed',left:12,top:214,zIndex:12005,padding:'9px 12px',borderRadius:10,fontWeight:950}}>🚨 TRANSIT BOSS MISSION</button>
 return <div style={{position:'fixed',left:12,top:214,zIndex:12005,width:300,padding:12,borderRadius:12,background:'rgba(18,5,9,.94)',border:'1px solid #ff3b4f99',color:'#fff',fontFamily:'system-ui',fontSize:12}}><b>🚨 CHICAGO TRANSIT CRISIS • BOSS</b><div style={{marginTop:6}}>STAGE {stage+1}/{STAGES.length} • {s.title}</div><div style={{opacity:.78,marginTop:4}}>{s.detail}</div><div style={{marginTop:5}}>{dist.toFixed(0)}m to objective • Safety {score}</div><button onClick={advance} disabled={dist>12} style={{marginTop:8}}>{dist<=12?'COMPLETE STAGE':'REACH OBJECTIVE'}</button></div>
}
