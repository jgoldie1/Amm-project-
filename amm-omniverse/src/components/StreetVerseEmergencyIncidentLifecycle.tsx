import {useEffect,useRef,useState} from 'react'

type Kind='police'|'ambulance'|'fire'
type Phase='idle'|'dispatch'|'approach'|'onscene'|'resolve'|'clear'
type Incident={kind:Kind;phase:Phase;x:number;z:number;progress:number;label:string}

const labels:Record<Kind,string>={police:'POLICE RESPONSE',ambulance:'EMS RESPONSE',fire:'FIRE RESPONSE'}

export default function StreetVerseEmergencyIncidentLifecycle(){
 const [incident,setIncident]=useState<Incident|null>(null)
 const timerRef=useRef<number|undefined>(undefined)
 useEffect(()=>{
  const clearTimer=()=>{if(timerRef.current)window.clearInterval(timerRef.current);timerRef.current=undefined}
  const begin=(kind:Kind,x:number,z:number)=>{
   clearTimer();let progress=0;let phase:Phase='dispatch';setIncident({kind,phase,x,z,progress,label:labels[kind]})
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-lifecycle',{detail:{kind,phase,x,z,progress}}))
   timerRef.current=window.setInterval(()=>{
    progress=Math.min(100,progress+5)
    const next:Phase=progress<15?'dispatch':progress<55?'approach':progress<72?'onscene':progress<94?'resolve':'clear'
    if(next!==phase){phase=next;window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-lifecycle',{detail:{kind,phase,x,z,progress}}));
      if(phase==='onscene')window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-onscene',{detail:{kind,x,z}}))
      if(phase==='resolve')window.dispatchEvent(new CustomEvent(kind==='police'?'tryamm:streetverse-police-action':kind==='ambulance'?'tryamm:streetverse-ems-treatment':'tryamm:streetverse-fire-suppression',{detail:{kind,x,z,active:true}}))
      if(phase==='clear')window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-resolved',{detail:{kind,x,z}}))
    }
    setIncident({kind,phase,x,z,progress,label:labels[kind]})
    if(progress>=100){clearTimer();window.setTimeout(()=>setIncident(null),1100)}
   },500)
  }
  const dispatch=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const raw=String(d.kind||d.type||d.service||'police').toLowerCase();const kind:Kind=raw.includes('ambul')?'ambulance':raw.includes('fire')?'fire':'police';begin(kind,Number(d.x||0),Number(d.z||0))}
  const collision=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(Number(d.speed||0)>15)begin('ambulance',Number(d.x||0),Number(d.z||0))}
  const race=()=>begin('police',0,0)
  addEventListener('tryamm:streetverse-emergency-vehicle-dispatched',dispatch)
  addEventListener('tryamm:streetverse-vehicle-collision',collision)
  addEventListener('tryamm:streetverse-ai-opponents-start',race)
  return()=>{clearTimer();removeEventListener('tryamm:streetverse-emergency-vehicle-dispatched',dispatch);removeEventListener('tryamm:streetverse-vehicle-collision',collision);removeEventListener('tryamm:streetverse-ai-opponents-start',race)}
 },[])
 if(!incident)return null
 const action=incident.phase==='dispatch'?'DISPATCHING':incident.phase==='approach'?'EN ROUTE':incident.phase==='onscene'?'ON SCENE':incident.phase==='resolve'?(incident.kind==='police'?'PURSUIT / SECURE':incident.kind==='ambulance'?'TREAT / STABILIZE':'SUPPRESS / SECURE'):'CLEARING'
 return <div style={{position:'fixed',right:12,bottom:178,zIndex:16980,width:238,padding:'9px 10px',borderRadius:13,background:'rgba(5,8,14,.9)',border:'1px solid rgba(255,86,86,.45)',color:'#fff',fontFamily:'system-ui',pointerEvents:'none'}}><div style={{fontSize:9,fontWeight:950,letterSpacing:.9,color:'#ff7676'}}>{incident.label}</div><div style={{fontSize:12,fontWeight:950,marginTop:3}}>{action}</div><div style={{height:5,borderRadius:99,background:'#202631',overflow:'hidden',marginTop:7}}><div style={{height:'100%',width:`${incident.progress}%`,background:'linear-gradient(90deg,#ff334e,#f7f7f7)'}}/></div><div style={{fontSize:8,opacity:.7,marginTop:5}}>INCIDENT {Math.round(incident.progress)}% • RESPONSE → ARRIVAL → ACTION → CLEAR</div></div>
}
