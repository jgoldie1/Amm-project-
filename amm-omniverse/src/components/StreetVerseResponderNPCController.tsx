import {useEffect,useRef} from 'react'

type Role='officer'|'deputy'|'paramedic'|'firefighter'|'agent'|'intel-agent'|'special-agent'
type TeamMember={id:string;unitId:string;agency:string;role:Role;x:number;z:number;targetX:number;targetZ:number;status:string;active:boolean}

function roleFor(agencyRaw:string):Role{const a=agencyRaw.toLowerCase();if(a.includes('sheriff'))return'deputy';if(a.includes('ambul'))return'paramedic';if(a.includes('fire'))return'firefighter';if(a.includes('cia')||a.includes('intel'))return'intel-agent';if(a.includes('mib'))return'special-agent';if(a.includes('fbi')||a.includes('federal'))return'agent';return'officer'}
function teamSize(role:Role){if(role==='firefighter')return 3;if(role==='paramedic')return 2;if(role==='special-agent')return 2;return 2}
function assignment(role:Role,index:number){if(role==='paramedic')return index===0?'triage':'medical-support';if(role==='firefighter')return index===0?'suppression':index===1?'hose-line':'scene-safety';if(role==='agent'||role==='intel-agent'||role==='special-agent')return index===0?'investigation':'security-perimeter';return index===0?'scene-contact':'perimeter'}

export default function StreetVerseResponderNPCController(){
 const members=useRef<TeamMember[]>([]),raf=useRef(0),last=useRef(performance.now())
 useEffect(()=>{
  const staged=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};const unitId=String(d.id||'UNIT');const agency=String(d.agency||'police');const role=roleFor(agency);const count=teamSize(role);members.current=members.current.filter(m=>m.unitId!==unitId);for(let i=0;i<count;i++){const ang=(i/count)*Math.PI*2+(unitId.length%4)*.35;const radius=4.5+i*1.8;const x=Number(d.x||0),z=Number(d.z||0);const member:TeamMember={id:`${unitId}-${role}-${i+1}`,unitId,agency,role,x,z,targetX:x+Math.cos(ang)*radius,targetZ:z+Math.sin(ang)*radius,status:'deploying',active:true};members.current.push(member);window.dispatchEvent(new CustomEvent('tryamm:streetverse-responder-npc-deployed',{detail:{...member,assignment:assignment(role,i)}}))}}
  const clear=()=>{for(const m of members.current)window.dispatchEvent(new CustomEvent('tryamm:streetverse-responder-npc-position',{detail:{...m,active:false,status:'clear'}}));members.current=[]}
  addEventListener('tryamm:streetverse-responder-staged',staged);addEventListener('tryamm:streetverse-incident-cleared',clear);addEventListener('tryamm:streetverse-emergency-resolved',clear)
  const tick=(now:number)=>{const dt=Math.min(.05,(now-last.current)/1000);last.current=now;for(const m of members.current){const dx=m.targetX-m.x,dz=m.targetZ-m.z,dist=Math.hypot(dx,dz);if(dist>.35){const step=Math.min(dist,3.6*dt);m.x+=dx/dist*step;m.z+=dz/dist*step;m.status='moving'}else m.status=assignment(m.role,Number(m.id.split('-').pop())-1);window.dispatchEvent(new CustomEvent('tryamm:streetverse-responder-npc-position',{detail:{...m,heading:Math.atan2(-dz,dx)}}))}raf.current=requestAnimationFrame(tick)}
  raf.current=requestAnimationFrame(tick)
  return()=>{cancelAnimationFrame(raf.current);removeEventListener('tryamm:streetverse-responder-staged',staged);removeEventListener('tryamm:streetverse-incident-cleared',clear);removeEventListener('tryamm:streetverse-emergency-resolved',clear)}
 },[])
 return null
}
