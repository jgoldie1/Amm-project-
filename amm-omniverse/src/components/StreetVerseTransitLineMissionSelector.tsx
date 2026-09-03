import {useEffect,useState} from 'react'
type Line={id:string;name:string;mode:string;stops:string[];xp:number}
const LINES:Line[]=[
{id:'red',name:'RED LINE',mode:'SUBWAY + ELEVATED',stops:['95TH','ROOSEVELT','JACKSON','LAKE','FULLERTON','HOWARD'],xp:360},
{id:'blue',name:'BLUE LINE',mode:'SUBWAY + EXPRESSWAY',stops:["O'HARE",'LOGAN SQUARE','CLARK/LAKE','MONROE','UIC-HALSTED','FOREST PARK'],xp:380},
{id:'brown',name:'BROWN LINE',mode:'ELEVATED',stops:['KIMBALL','WESTERN','BELMONT','CHICAGO','WASHINGTON/WELLS'],xp:300},
{id:'green',name:'GREEN LINE',mode:'ELEVATED + SURFACE',stops:['HARLEM','ASHLAND','CLARK/LAKE','ROOSEVELT','GARFIELD','63RD'],xp:330},
{id:'orange',name:'ORANGE LINE',mode:'ELEVATED',stops:['MIDWAY','PULASKI','HALSTED','ROOSEVELT','WASHINGTON/WELLS'],xp:320},
{id:'pink',name:'PINK LINE',mode:'ELEVATED',stops:['54TH/CERMAK','KEDZIE','POLK','CLINTON','WASHINGTON/WELLS'],xp:300},
{id:'purple',name:'PURPLE LINE',mode:'ELEVATED',stops:['LINDEN','DAVIS','HOWARD','BELMONT','CHICAGO','LOOP'],xp:340},
{id:'yellow',name:'YELLOW LINE',mode:'SURFACE',stops:['DEMPSTER-SKOKIE','OAKTON-SKOKIE','HOWARD'],xp:240},
]
export default function StreetVerseTransitLineMissionSelector(){const [line,setLine]=useState<Line|null>(null),[stop,setStop]=useState(0),[riders,setRiders]=useState(0),[doors,setDoors]=useState(false)
 useEffect(()=>{if(!line)return;window.dispatchEvent(new CustomEvent('tryamm:transit-line-active',{detail:{lineId:line.id,lineName:line.name,stop:line.stops[stop],stopIndex:stop}}))},[line,stop])
 const start=(l:Line)=>{setLine(l);setStop(0);setRiders(0);setDoors(false);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:`transit-${l.id}-operator`,label:`${l.name} Operator`,financialReward:false}}))}
 const serviceStop=()=>{if(!line)return;if(!doors){setDoors(true);window.dispatchEvent(new CustomEvent('tryamm:l-train-doors',{detail:{open:true,lineId:line.id,station:line.stops[stop]}}));setRiders(v=>Math.max(0,v-(stop%3))+4+(stop%4));return}setDoors(false);window.dispatchEvent(new CustomEvent('tryamm:l-train-doors',{detail:{open:false,lineId:line.id,station:line.stops[stop]}}));if(stop===line.stops.length-1){window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:`transit-${line.id}-operator`,label:`${line.name} Operator`,xp:line.xp,financialReward:false,progressState:{line:line.id,passengers:riders,stations:line.stops.length}}}));setLine(null)}else setStop(v=>v+1)}
 if(!line)return <div style={{position:'fixed',right:12,top:132,zIndex:12004,width:230,padding:10,borderRadius:12,background:'rgba(4,10,18,.92)',color:'#fff',fontFamily:'system-ui',fontSize:11}}><b>🚇 TRANSIT ROUTES</b><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginTop:7}}>{LINES.map(l=><button key={l.id} onClick={()=>start(l)}>{l.name.replace(' LINE','')}</button>)}</div></div>
 return <div style={{position:'fixed',right:12,top:132,zIndex:12004,width:250,padding:11,borderRadius:12,background:'rgba(4,10,18,.94)',color:'#fff',fontFamily:'system-ui',fontSize:12}}><b>🚇 {line.name} OPERATOR</b><div>{line.mode}</div><div style={{marginTop:6}}>STOP {stop+1}/{line.stops.length} • {line.stops[stop]}</div><div>Passengers • {riders}</div><div style={{opacity:.72,marginTop:4}}>{doors?'Boarding/alighting. Close doors when clear.':'Arrive at the station, stop safely, then open doors.'}</div><button onClick={serviceStop} style={{marginTop:7}}>{doors?'CLOSE DOORS • DEPART':'STOP • OPEN DOORS'}</button></div>}
