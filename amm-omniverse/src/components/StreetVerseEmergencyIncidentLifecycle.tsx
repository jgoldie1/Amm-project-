import {useEffect,useRef,useState} from 'react'

type Kind='police'|'sheriff'|'fbi'|'cia'|'mib'|'ambulance'|'fire'
type Phase='idle'|'dispatch'|'approach'|'onscene'|'perimeter'|'handoff'|'resolve'|'clear'
type Incident={kind:Kind;phase:Phase;x:number;z:number;progress:number;label:string;severity:number}

const labels:Record<Kind,string>={police:'POLICE RESPONSE',sheriff:'SHERIFF RESPONSE',fbi:'FEDERAL INVESTIGATION',cia:'INTELLIGENCE RESPONSE',mib:'SPECIAL RESPONSE',ambulance:'EMS RESPONSE',fire:'FIRE RESPONSE'}
const isLaw=(kind:Kind)=>!['ambulance','fire'].includes(kind)
const federal=(kind:Kind)=>['fbi','cia','mib'].includes(kind)

export default function StreetVerseEmergencyIncidentLifecycle(){
 const [incident,setIncident]=useState<Incident|null>(null)
 const timerRef=useRef<number|undefined>(undefined)
 useEffect(()=>{
  const clearTimer=()=>{if(timerRef.current)window.clearInterval(timerRef.current);timerRef.current=undefined}
  const begin=(kind:Kind,x:number,z:number,severity=1)=>{
   clearTimer();let progress=0;let phase:Phase='dispatch';setIncident({kind,phase,x,z,progress,label:labels[kind],severity})
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-lifecycle',{detail:{kind,phase,x,z,progress,severity}}))
   if(isLaw(kind))window.dispatchEvent(new CustomEvent('tryamm:streetverse-scene-perimeter',{detail:{active:true,kind,x,z,radius:federal(kind)?34:kind==='sheriff'?28:22}}))
   timerRef.current=window.setInterval(()=>{
    progress=Math.min(100,progress+5)
    const next:Phase=progress<15?'dispatch':progress<48?'approach':progress<63?'onscene':isLaw(kind)&&progress<76?'perimeter':federal(kind)&&progress<86?'handoff':progress<94?'resolve':'clear'
    if(next!==phase){phase=next;window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-lifecycle',{detail:{kind,phase,x,z,progress,severity}}))
      if(phase==='onscene')window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-onscene',{detail:{kind,x,z,severity}}))
      if(phase==='perimeter'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-roadblock-request',{detail:{kind,x,z,radius:federal(kind)?34:kind==='sheriff'?28:22}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-law-radio',{detail:{agency:kind.toUpperCase(),status:'PERIMETER',x,z}}))}
      if(phase==='handoff')window.dispatchEvent(new CustomEvent('tryamm:streetverse-federal-handoff',{detail:{kind,x,z,classification:kind==='fbi'?'FEDERAL CASE':kind==='cia'?'INTELLIGENCE CASE':'SPECIAL CASE'}}))
      if(phase==='resolve'){
        const name=kind==='ambulance'?'tryamm:streetverse-ems-treatment':kind==='fire'?'tryamm:streetverse-fire-suppression':federal(kind)?'tryamm:streetverse-federal-action':'tryamm:streetverse-police-action'
        window.dispatchEvent(new CustomEvent(name,{detail:{kind,x,z,active:true,severity}}))
      }
      if(phase==='clear'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-resolved',{detail:{kind,x,z}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-incident-cleared',{detail:{kind,x,z}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-scene-perimeter',{detail:{active:false,kind,x,z}}))}
    }
    setIncident({kind,phase,x,z,progress,label:labels[kind],severity})
    if(progress>=100){clearTimer();window.setTimeout(()=>setIncident(null),1100)}
   },500)
  }
  const normalize=(raw:string):Kind=>raw.includes('ambul')?'ambulance':raw.includes('fire')?'fire':raw.includes('sheriff')?'sheriff':raw.includes('fbi')?'fbi':raw.includes('cia')?'cia':raw.includes('mib')?'mib':'police'
  const dispatch=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const raw=String(d.kind||d.type||d.service||d.agency||'police').toLowerCase();begin(normalize(raw),Number(d.x||0),Number(d.z||0),Math.max(1,Number(d.severity||1)))}
  const federalDispatch=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const raw=String(d.agency||d.kind||'fbi').toLowerCase();begin(normalize(raw),Number(d.x||0),Number(d.z||0),Math.max(2,Number(d.severity||2)))}
  const collision=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const speed=Number(d.speed||0);if(speed>15)begin('ambulance',Number(d.x||0),Number(d.z||0),speed>28?3:2)}
  const race=()=>begin('police',0,0,2)
  addEventListener('tryamm:streetverse-emergency-vehicle-dispatched',dispatch)
  addEventListener('tryamm:streetverse-federal-dispatch',federalDispatch)
  addEventListener('tryamm:streetverse-vehicle-collision',collision)
  addEventListener('tryamm:streetverse-ai-opponents-start',race)
  return()=>{clearTimer();removeEventListener('tryamm:streetverse-emergency-vehicle-dispatched',dispatch);removeEventListener('tryamm:streetverse-federal-dispatch',federalDispatch);removeEventListener('tryamm:streetverse-vehicle-collision',collision);removeEventListener('tryamm:streetverse-ai-opponents-start',race)}
 },[])
 if(!incident)return null
 const action=incident.phase==='dispatch'?'DISPATCHING':incident.phase==='approach'?'EN ROUTE':incident.phase==='onscene'?'ON SCENE':incident.phase==='perimeter'?'PERIMETER / ROADBLOCK':incident.phase==='handoff'?'FEDERAL HANDOFF':incident.phase==='resolve'?(incident.kind==='ambulance'?'TREAT / STABILIZE':incident.kind==='fire'?'SUPPRESS / SECURE':federal(incident.kind)?'INVESTIGATE / SECURE':'PURSUIT / SECURE'):'CLEARING'
 return <div style={{position:'fixed',right:12,bottom:178,zIndex:16980,width:250,padding:'9px 10px',borderRadius:13,background:'rgba(5,8,14,.9)',border:'1px solid rgba(255,86,86,.45)',color:'#fff',fontFamily:'system-ui',pointerEvents:'none'}}><div style={{fontSize:9,fontWeight:950,letterSpacing:.9,color:'#ff7676'}}>{incident.label}</div><div style={{fontSize:12,fontWeight:950,marginTop:3}}>{action}</div><div style={{fontSize:8,opacity:.7,marginTop:2}}>SEVERITY {incident.severity} • {federal(incident.kind)?'FEDERAL / SPECIAL TIER':incident.kind==='sheriff'?'COUNTY TIER':'LOCAL / EMERGENCY TIER'}</div><div style={{height:5,borderRadius:99,background:'#202631',overflow:'hidden',marginTop:7}}><div style={{height:'100%',width:`${incident.progress}%`,background:'linear-gradient(90deg,#ff334e,#f7f7f7)'}}/></div><div style={{fontSize:8,opacity:.7,marginTop:5}}>INCIDENT {Math.round(incident.progress)}% • RESPONSE → ARRIVAL → PERIMETER → ACTION → CLEAR</div></div>
}
