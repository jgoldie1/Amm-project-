import {useEffect,useRef} from 'react'

type Agency='police'|'sheriff'|'ambulance'|'fire'|'fbi'|'cia'|'mib'
type Unit={id:string;agency:Agency;x:number;z:number;targetX:number;targetZ:number;speed:number;stageOffset:number;active:boolean}

const cfg:Record<Agency,{prefix:string;speed:number;offset:number}>={
 police:{prefix:'PD',speed:18,offset:10},
 sheriff:{prefix:'SO',speed:17,offset:12},
 ambulance:{prefix:'EMS',speed:16,offset:8},
 fire:{prefix:'FD',speed:14,offset:14},
 fbi:{prefix:'FBI',speed:18,offset:16},
 cia:{prefix:'INTEL',speed:17,offset:18},
 mib:{prefix:'MIB',speed:20,offset:20},
}
function normAgency(raw:string):Agency{const s=raw.toLowerCase();if(s.includes('sheriff'))return'sheriff';if(s.includes('ambul'))return'ambulance';if(s.includes('fire'))return'fire';if(s.includes('fbi')||s.includes('federal'))return'fbi';if(s.includes('cia')||s.includes('intel'))return'cia';if(s.includes('mib'))return'mib';return'police'}
function edgeSpawn(x:number,z:number,slot:number){const sx=x>=0?-84:84;const sz=Math.max(-78,Math.min(78,z+(slot%3-1)*7));return{x:sx,z:sz}}
export default function StreetVerseResponderStaging(){
 const units=useRef<Unit[]>([]),raf=useRef(0),last=useRef(performance.now()),seq=useRef(0)
 useEffect(()=>{
  const deploy=(detail:any)=>{const agency=normAgency(String(detail?.agency||detail?.kind||detail?.type||detail?.service||'police'));const x=Number(detail?.x||0),z=Number(detail?.z||0);const c=cfg[agency];const slot=seq.current++;const spawn=edgeSpawn(x,z,slot);const ang=(slot%4)*Math.PI/2;const targetX=x+Math.cos(ang)*c.offset,targetZ=z+Math.sin(ang)*c.offset;const id=`${c.prefix}-${String(slot%90+10).padStart(2,'0')}`;units.current=units.current.filter(u=>u.agency!==agency).slice(-3);units.current.push({id,agency,x:spawn.x,z:spawn.z,targetX,targetZ,speed:c.speed,stageOffset:c.offset,active:true});window.dispatchEvent(new CustomEvent('tryamm:streetverse-responder-stage-deployed',{detail:{id,agency,x:spawn.x,z:spawn.z,targetX,targetZ,incidentX:x,incidentZ:z}}))}
  const onEmergency=(e:Event)=>deploy((e as CustomEvent<any>).detail||{})
  const onFederal=(e:Event)=>deploy((e as CustomEvent<any>).detail||{})
  const onRoadblock=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.active===false)return;deploy({agency:d.agency||'police',x:d.x,z:d.z})}
  const clear=()=>{for(const u of units.current)window.dispatchEvent(new CustomEvent('tryamm:streetverse-responder-world-position',{detail:{...u,active:false,status:'clear'}}));units.current=[]}
  addEventListener('tryamm:streetverse-emergency-response',onEmergency);addEventListener('tryamm:streetverse-federal-escalation',onFederal);addEventListener('tryamm:streetverse-roadblock-state',onRoadblock);addEventListener('tryamm:streetverse-incident-cleared',clear);addEventListener('tryamm:streetverse-emergency-resolved',clear)
  const tick=(now:number)=>{const dt=Math.min(.05,(now-last.current)/1000);last.current=now;for(const u of units.current){const dx=u.targetX-u.x,dz=u.targetZ-u.z,dist=Math.hypot(dx,dz);const arrived=dist<1.4;if(!arrived){const step=Math.min(dist,u.speed*dt);u.x+=dx/dist*step;u.z+=dz/dist*step}window.dispatchEvent(new CustomEvent('tryamm:streetverse-responder-world-position',{detail:{id:u.id,agency:u.agency,x:u.x,z:u.z,targetX:u.targetX,targetZ:u.targetZ,heading:Math.atan2(-dz,dx),speed:arrived?0:u.speed,status:arrived?'staged':'approach',active:true}}));if(arrived)window.dispatchEvent(new CustomEvent('tryamm:streetverse-responder-staged',{detail:{id:u.id,agency:u.agency,x:u.x,z:u.z}}))}raf.current=requestAnimationFrame(tick)}
  raf.current=requestAnimationFrame(tick)
  return()=>{cancelAnimationFrame(raf.current);removeEventListener('tryamm:streetverse-emergency-response',onEmergency);removeEventListener('tryamm:streetverse-federal-escalation',onFederal);removeEventListener('tryamm:streetverse-roadblock-state',onRoadblock);removeEventListener('tryamm:streetverse-incident-cleared',clear);removeEventListener('tryamm:streetverse-emergency-resolved',clear)}
 },[])
 return null
}
