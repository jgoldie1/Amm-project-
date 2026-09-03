import {useEffect,useMemo,useState} from 'react'

type Point={id:string;label:string;district:string;x:number;z:number;kind:'JOB'|'CREATOR'|'DELIVERY'|'SOCIAL';mission:string}
const points:Point[]=[
{id:'loop-courier',label:'Loop Courier Hub',district:'THE LOOP',x:0,z:18,kind:'DELIVERY',mission:'Loop Express Delivery'},
{id:'riverwalk-creator',label:'Riverwalk Creator Spot',district:'CHICAGO RIVER',x:18,z:10,kind:'CREATOR',mission:'Riverwalk Reel Challenge'},
{id:'millennium-event',label:'Millennium Park Event',district:'LAKEFRONT',x:48,z:100,kind:'SOCIAL',mission:'Millennium Creator Jam'},
{id:'south-market',label:'79th Street Market',district:'SOUTH SIDE',x:-12,z:111,kind:'JOB',mission:'South Side Market Run'},
{id:'west-maker',label:'Madison Maker Hub',district:'WEST SIDE',x:-64,z:-7,kind:'JOB',mission:'West Side Business Delivery'},
{id:'north-night',label:'North Side Venue',district:'NORTH SIDE',x:18,z:-69,kind:'CREATOR',mission:'North Side Creator Night'},
]
export default function StreetVerseChicagoActivityDirector(){
 const [pos,setPos]=useState({x:0,z:0});const [active,setActive]=useState('')
 useEffect(()=>{const onPos=(e:Event)=>{const d=(e as CustomEvent).detail||{};if(Number.isFinite(d.x)&&Number.isFinite(d.z))setPos({x:d.x,z:d.z})};window.addEventListener('tryamm:streetverse-player-position',onPos);return()=>window.removeEventListener('tryamm:streetverse-player-position',onPos)},[])
 const nearest=useMemo(()=>points.map(p=>({...p,d:Math.hypot(pos.x-p.x,pos.z-p.z)})).sort((a,b)=>a.d-b.d)[0],[pos])
 const start=()=>{if(!nearest)return;setActive(nearest.id);const detail={eventId:nearest.id,label:nearest.mission,mode:nearest.kind,district:nearest.district,position:{x:nearest.x,z:nearest.z},financialReward:false};window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-event-join',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}));window.dispatchEvent(new CustomEvent('tryamm:chicago-activity-start',{detail}))}
 if(!nearest)return null
 return <div style={{position:'absolute',right:12,bottom:150,zIndex:44,width:230,padding:10,borderRadius:12,background:'rgba(4,10,18,.86)',border:'1px solid rgba(70,180,255,.55)',color:'#fff',fontFamily:'system-ui',fontSize:12,boxShadow:'0 8px 30px rgba(0,0,0,.3)'}}><div style={{fontWeight:900,letterSpacing:.7}}>CHICAGO ACTIVITY</div><div style={{marginTop:5,fontWeight:800}}>{nearest.label}</div><div style={{opacity:.72}}>{nearest.district} • {nearest.kind} • {Math.round(nearest.d)}m</div><button onClick={start} disabled={nearest.d>38} style={{marginTop:8,width:'100%',padding:'8px 10px',borderRadius:8,border:0,fontWeight:900,cursor:nearest.d<=38?'pointer':'default'}}>{nearest.d<=38?(active===nearest.id?'ACTIVE':'START '+nearest.mission.toUpperCase()):'MOVE CLOSER'}</button></div>
}
