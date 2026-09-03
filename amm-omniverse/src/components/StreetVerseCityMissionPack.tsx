import {useEffect,useMemo,useState} from 'react'

type Mission={id:string;label:string;kind:string;xp:number;start:{x:number;z:number};target:{x:number;z:number};objective:string}
const MISSIONS:Mission[]=[
{id:'outreach-01',label:'Homeless Outreach',kind:'CARE',xp:180,start:{x:-22,z:18},target:{x:-10,z:30},objective:'Meet the outreach team, check on the resident, and escort them to the service point.'},
{id:'liquor-compliance-01',label:'Alcohol Compliance Check',kind:'COMPLIANCE',xp:170,start:{x:10,z:18},target:{x:24,z:22},objective:'Visit the licensed storefront, verify age-check signage and complete the compliance checklist.'},
{id:'tobacco-compliance-01',label:'Tobacco Compliance Check',kind:'COMPLIANCE',xp:170,start:{x:26,z:18},target:{x:39,z:22},objective:'Inspect the storefront for age-restricted sales compliance and complete the inspection.'},
{id:'drug-interdiction-01',label:'Narcotics Interdiction',kind:'LAW',xp:260,start:{x:-58,z:-6},target:{x:-72,z:4},objective:'Respond to the investigation point, secure the scene and hand evidence to the assigned unit.'},
{id:'recovery-support-01',label:'Recovery Support Run',kind:'CARE',xp:210,start:{x:-40,z:76},target:{x:-20,z:94},objective:'Pick up the outreach package and deliver it to the recovery support location.'},
{id:'police-patrol-01',label:'CPD Patrol Response',kind:'LAW',xp:220,start:{x:0,z:0},target:{x:18,z:-14},objective:'Respond to the call, assess the incident and clear the scene safely.'},
{id:'sheriff-transport-01',label:'Sheriff Transport Detail',kind:'LAW',xp:230,start:{x:-48,z:18},target:{x:-72,z:10},objective:'Meet the sheriff unit and complete the controlled transport route.'},
{id:'store-delivery-01',label:'Marketplace Delivery',kind:'DELIVERY',xp:190,start:{x:0,z:18},target:{x:-12,z:111},objective:'Pick up the order in the Loop and deliver it to the 79th Street Market.'},
{id:'riverwalk-creator-01',label:'Riverwalk Creator Shoot',kind:'CREATOR',xp:160,start:{x:18,z:10},target:{x:38,z:18},objective:'Reach the creator zone and complete the recording checkpoint.'},
{id:'business-run-01',label:'West Side Business Run',kind:'BUSINESS',xp:200,start:{x:-64,z:-7},target:{x:-92,z:5},objective:'Collect the business package and deliver it to the West Side hub.'}
]
export default function StreetVerseCityMissionPack(){
 const [pos,setPos]=useState({x:0,z:0}),[active,setActive]=useState<Mission|null>(null),[started,setStarted]=useState(false)
 useEffect(()=>{const h=(e:Event)=>{const d=(e as CustomEvent).detail||{};setPos({x:Number(d.x)||0,z:Number(d.z)||0})};window.addEventListener('tryamm:streetverse-player-position',h);return()=>window.removeEventListener('tryamm:streetverse-player-position',h)},[])
 const nearest=useMemo(()=>MISSIONS.map(m=>({...m,d:Math.hypot(pos.x-m.start.x,pos.z-m.start.z)})).sort((a,b)=>a.d-b.d)[0],[pos])
 const distTarget=active?Math.hypot(pos.x-active.target.x,pos.z-active.target.z):Infinity
 useEffect(()=>{if(active&&started&&distTarget<8){window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:active.id,label:active.label,xp:active.xp,financialReward:false,progressState:{kind:active.kind}}}));setActive(null);setStarted(false)}},[active,started,distTarget])
 const start=(m:Mission)=>{setActive(m);setStarted(true);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:m.id,label:m.label,financialReward:false,kind:m.kind}}))}
 if(active)return <div style={{position:'fixed',left:12,bottom:80,zIndex:13000,width:290,padding:12,borderRadius:12,background:'rgba(4,13,22,.94)',border:'1px solid #7cc9ff88',color:'#fff',fontFamily:'system-ui',fontSize:12}}><b>{active.kind} • {active.label}</b><div style={{marginTop:5}}>{active.objective}</div><div style={{marginTop:6}}>Destination {distTarget.toFixed(0)}m • {active.xp} XP</div><button onClick={()=>{setActive(null);setStarted(false)}} style={{marginTop:8}}>CANCEL</button></div>
 return <div style={{position:'fixed',left:12,bottom:80,zIndex:13000,width:290,padding:12,borderRadius:12,background:'rgba(4,13,22,.9)',border:'1px solid #ffffff24',color:'#fff',fontFamily:'system-ui',fontSize:12}}><b>CITY MISSIONS</b><div style={{marginTop:5}}>{nearest.label} • {nearest.kind}</div><div>{nearest.d.toFixed(0)}m away • {nearest.xp} XP</div><div style={{opacity:.7,marginTop:4}}>{nearest.objective}</div><button disabled={nearest.d>28} onClick={()=>start(nearest)} style={{marginTop:8}}>START MISSION</button></div>
}
