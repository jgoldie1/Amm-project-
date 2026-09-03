import {useEffect,useMemo,useState} from 'react'

type Agency='POLICE'|'SHERIFF'|'FBI'|'CIA'|'MIB'
type UnitState={active:boolean;agency:Agency;unitId:string;channel:string;bodyCam:boolean;recording:boolean;status:string;incidentId:string;lastCall:string;classification:string}
const idle:UnitState={active:false,agency:'POLICE',unitId:'PD-21',channel:'CITY TAC 1',bodyCam:true,recording:false,status:'AVAILABLE',incidentId:'',lastCall:'Radio clear',classification:'LOCAL'}
function stamp(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
function profile(agency:Agency){
 if(agency==='SHERIFF')return{unitId:'SO-12',channel:'COUNTY TAC 2',classification:'COUNTY',bodyCam:true}
 if(agency==='FBI')return{unitId:'FED-71',channel:'FEDERAL JOINT OPS',classification:'FEDERAL INVESTIGATION',bodyCam:true}
 if(agency==='CIA')return{unitId:'INT-09',channel:'INTELLIGENCE OPS',classification:'FICTIONAL INTELLIGENCE MISSION',bodyCam:false}
 if(agency==='MIB')return{unitId:'MIB-X7',channel:'SPECIAL RESPONSE BLACK',classification:'FICTIONAL SPECIAL RESPONSE',bodyCam:false}
 return{unitId:'PD-21',channel:'CITY TAC 1',classification:'LOCAL',bodyCam:true}
}
export default function StreetVerseLawEnforcementComms(){
 const [unit,setUnit]=useState<UnitState>(idle)
 const [log,setLog]=useState<string[]>(['Dispatch online • CITY TAC 1'])
 const push=(line:string)=>setLog(v=>[`${stamp()} • ${line}`,...v].slice(0,6))
 useEffect(()=>{
  const dispatch=(agency:Agency,x=0,z=0,reason='incident')=>{const id=`INC-${Date.now().toString(36).toUpperCase()}`;const p=profile(agency);const recording=p.bodyCam;setUnit({active:true,agency,unitId:p.unitId,channel:p.channel,bodyCam:p.bodyCam,recording,status:'EN ROUTE',incidentId:id,lastCall:`${reason.toUpperCase()} @ ${Math.round(x)},${Math.round(z)}`,classification:p.classification});push(`${p.unitId} dispatched • ${reason}${recording?' • body cam recording':''}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-law-radio',{detail:{agency,unitId:p.unitId,channel:p.channel,incidentId:id,status:'en-route',x,z,bodyCam:p.bodyCam,recording,classification:p.classification}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-federal-tier-state',{detail:{active:['FBI','CIA','MIB'].includes(agency),agency,incidentId:id,x,z,classification:p.classification}}))}
  const agencyFrom=(raw:string):Agency=>raw.includes('sheriff')?'SHERIFF':raw.includes('fbi')||raw.includes('federal')?'FBI':raw.includes('cia')||raw.includes('intelligence')?'CIA':raw.includes('mib')||raw.includes('special black')?'MIB':'POLICE'
  const onEmergency=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const raw=String(d.type||d.kind||d.service||'police').toLowerCase();if(raw.includes('ambul')||raw.includes('fire'))return;const agency=agencyFrom(raw);dispatch(agency,Number(d.x||0),Number(d.z||0),String(d.reason||`${agency.toLowerCase()} response`))}
  const onVehicle=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const raw=String(d.kind||'').toLowerCase();if(!raw)return;const agency=agencyFrom(raw);if(['police','sheriff','fbi','federal','cia','intelligence','mib'].some(k=>raw.includes(k)))dispatch(agency,Number(d.x||0),Number(d.z||0),`${agency.toLowerCase()} unit response`)}
  const onCollision=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(Number(d.speed||0)>=18)dispatch('POLICE',Number(d.x||0),Number(d.z||0),'major collision')}
  const onBackup=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const agency=agencyFrom(String(d.agency||'police').toLowerCase());push(`Backup requested • ${agency} • ${String(d.reason||'unit assist')}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-response',{detail:{kind:agency.toLowerCase(),x:Number(d.x||0),z:Number(d.z||0),reason:'backup'}}))}
  const onEscalate=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const level=String(d.level||d.agency||'fbi').toLowerCase();const agency=agencyFrom(level);dispatch(agency,Number(d.x||0),Number(d.z||0),String(d.reason||'escalated incident'))}
  const clear=()=>{setUnit(v=>({...v,active:false,recording:false,status:'AVAILABLE',lastCall:'Incident cleared'}));push('Incident cleared • recording/log closed');window.dispatchEvent(new CustomEvent('tryamm:streetverse-federal-tier-state',{detail:{active:false}}))}
  addEventListener('tryamm:streetverse-emergency-response',onEmergency);addEventListener('tryamm:streetverse-emergency-vehicle-dispatched',onVehicle);addEventListener('tryamm:streetverse-vehicle-collision',onCollision);addEventListener('tryamm:streetverse-law-backup-request',onBackup);addEventListener('tryamm:streetverse-federal-escalation',onEscalate);addEventListener('tryamm:streetverse-incident-cleared',clear)
  return()=>{removeEventListener('tryamm:streetverse-emergency-response',onEmergency);removeEventListener('tryamm:streetverse-emergency-vehicle-dispatched',onVehicle);removeEventListener('tryamm:streetverse-vehicle-collision',onCollision);removeEventListener('tryamm:streetverse-law-backup-request',onBackup);removeEventListener('tryamm:streetverse-federal-escalation',onEscalate);removeEventListener('tryamm:streetverse-incident-cleared',clear)}
 },[])
 const camLabel=useMemo(()=>!unit.bodyCam?'NO BODY CAM':unit.recording?'BODY CAM • REC':'BODY CAM • STANDBY',[unit.bodyCam,unit.recording])
 if(!unit.active)return null
 return <div style={{position:'fixed',right:12,bottom:176,zIndex:16980,width:286,pointerEvents:'none',border:'1px solid #6e9bc766',borderRadius:14,background:'rgba(4,9,16,.92)',color:'#fff',padding:10,fontFamily:'system-ui',boxShadow:'0 12px 34px #0008'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8,fontSize:9,fontWeight:950,letterSpacing:.8}}><span>{unit.agency} • {unit.unitId}</span><span style={{color:unit.recording?'#ff6b6b':'#9eb6c8'}}>{camLabel}</span></div>
  <div style={{fontSize:10,color:'#7ddcff',marginTop:5}}>RADIO • {unit.channel} • {unit.status}</div>
  <div style={{fontSize:8,color:'#ffd978',marginTop:3}}>{unit.classification}</div>
  <div style={{fontSize:11,fontWeight:900,marginTop:5}}>{unit.incidentId}</div>
  <div style={{fontSize:9,opacity:.76,marginTop:2}}>{unit.lastCall}</div>
  <div style={{marginTop:7,paddingTop:6,borderTop:'1px solid #ffffff18',display:'grid',gap:2,fontSize:8,opacity:.72}}>{log.slice(0,4).map((x,i)=><span key={i}>{x}</span>)}</div>
  <div style={{fontSize:8,opacity:.58,marginTop:6}}>IN-GAME SIMULATION ONLY • NO REAL AGENCY ACCESS, CREDENTIALS OR SURVEILLANCE</div>
 </div>
}
