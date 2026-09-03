import {useEffect,useMemo,useState} from 'react'

type Agency='POLICE'|'SHERIFF'
type UnitState={active:boolean;agency:Agency;unitId:string;channel:string;bodyCam:boolean;recording:boolean;status:string;incidentId:string;lastCall:string}
const idle:UnitState={active:false,agency:'POLICE',unitId:'PD-21',channel:'CITY TAC 1',bodyCam:true,recording:false,status:'AVAILABLE',incidentId:'',lastCall:'Radio clear'}
function stamp(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
export default function StreetVerseLawEnforcementComms(){
 const [unit,setUnit]=useState<UnitState>(idle)
 const [log,setLog]=useState<string[]>(['Dispatch online • CITY TAC 1'])
 const push=(line:string)=>setLog(v=>[`${stamp()} • ${line}`,...v].slice(0,5))
 useEffect(()=>{
  const dispatch=(agency:Agency,x=0,z=0,reason='incident')=>{const id=`INC-${Date.now().toString(36).toUpperCase()}`;const unitId=agency==='SHERIFF'?'SO-12':'PD-21';const channel=agency==='SHERIFF'?'COUNTY TAC 2':'CITY TAC 1';setUnit({active:true,agency,unitId,channel,bodyCam:true,recording:true,status:'EN ROUTE',incidentId:id,lastCall:`${reason.toUpperCase()} @ ${Math.round(x)},${Math.round(z)}`});push(`${unitId} dispatched • ${reason} • body cam recording`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-law-radio',{detail:{agency,unitId,channel,incidentId:id,status:'en-route',x,z,bodyCam:true,recording:true}}))}
  const onEmergency=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const raw=String(d.type||d.kind||d.service||'police').toLowerCase();if(raw.includes('ambul')||raw.includes('fire'))return;dispatch(raw.includes('sheriff')?'SHERIFF':'POLICE',Number(d.x||0),Number(d.z||0),raw.includes('sheriff')?'sheriff assist':'police response')}
  const onVehicle=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const raw=String(d.kind||'').toLowerCase();if(raw==='police'||raw==='sheriff')dispatch(raw==='sheriff'?'SHERIFF':'POLICE',Number(d.x||0),Number(d.z||0),`${raw} unit response`)}
  const onCollision=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(Number(d.speed||0)>=18)dispatch('POLICE',Number(d.x||0),Number(d.z||0),'major collision')}
  const onBackup=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};push(`Backup requested • ${String(d.reason||'officer assist')}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-response',{detail:{kind:d.agency==='SHERIFF'?'sheriff':'police',x:Number(d.x||0),z:Number(d.z||0),reason:'backup'}}))}
  const clear=()=>{setUnit(v=>({...v,active:false,recording:false,status:'AVAILABLE',lastCall:'Incident cleared'}));push('Incident cleared • body cam stopped')}
  addEventListener('tryamm:streetverse-emergency-response',onEmergency);addEventListener('tryamm:streetverse-emergency-vehicle-dispatched',onVehicle);addEventListener('tryamm:streetverse-vehicle-collision',onCollision);addEventListener('tryamm:streetverse-law-backup-request',onBackup);addEventListener('tryamm:streetverse-incident-cleared',clear)
  return()=>{removeEventListener('tryamm:streetverse-emergency-response',onEmergency);removeEventListener('tryamm:streetverse-emergency-vehicle-dispatched',onVehicle);removeEventListener('tryamm:streetverse-vehicle-collision',onCollision);removeEventListener('tryamm:streetverse-law-backup-request',onBackup);removeEventListener('tryamm:streetverse-incident-cleared',clear)}
 },[])
 const camLabel=useMemo(()=>unit.recording?'BODY CAM • REC':'BODY CAM • STANDBY',[unit.recording])
 if(!unit.active)return null
 return <div style={{position:'fixed',right:12,bottom:176,zIndex:16980,width:268,pointerEvents:'none',border:'1px solid #6e9bc766',borderRadius:14,background:'rgba(4,9,16,.9)',color:'#fff',padding:10,fontFamily:'system-ui',boxShadow:'0 12px 34px #0008'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8,fontSize:9,fontWeight:950,letterSpacing:.8}}><span>{unit.agency} • {unit.unitId}</span><span style={{color:unit.recording?'#ff6b6b':'#9eb6c8'}}>{camLabel}</span></div>
  <div style={{fontSize:10,color:'#7ddcff',marginTop:5}}>RADIO • {unit.channel} • {unit.status}</div>
  <div style={{fontSize:11,fontWeight:900,marginTop:5}}>{unit.incidentId}</div>
  <div style={{fontSize:9,opacity:.76,marginTop:2}}>{unit.lastCall}</div>
  <div style={{marginTop:7,paddingTop:6,borderTop:'1px solid #ffffff18',display:'grid',gap:2,fontSize:8,opacity:.72}}>{log.slice(0,3).map((x,i)=><span key={i}>{x}</span>)}</div>
  <div style={{fontSize:8,opacity:.58,marginTop:6}}>IN-GAME SIMULATION • DISPATCH / WALKIE-TALKIE / BODY-CAM EVENT LOG</div>
 </div>
}
