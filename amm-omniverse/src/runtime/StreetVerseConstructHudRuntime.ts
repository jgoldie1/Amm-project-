import { closeConstructMap,focusConstructTarget,getConstructState,openConstructMap,scanConstructVicinity } from './StreetVerseWorldAwareConstructRuntime'

let installed=false
let hud:HTMLDivElement|null=null
let list:HTMLDivElement|null=null
let status:HTMLDivElement|null=null
let mapButton:HTMLButtonElement|null=null
let scanButton:HTMLButtonElement|null=null

function button(label:string,action:()=>void){const b=document.createElement('button');b.textContent=label;Object.assign(b.style,{border:'1px solid rgba(106,238,255,.55)',borderRadius:'999px',padding:'7px 10px',background:'rgba(4,28,45,.92)',color:'#e7fbff',fontSize:'10px',fontWeight:'800',cursor:'pointer'});b.onclick=action;return b}
function ensure(){
 if(hud||typeof document==='undefined')return
 hud=document.createElement('div');hud.id='tryamm-streetverse-construct-hud';Object.assign(hud.style,{position:'fixed',left:'14px',bottom:'18px',zIndex:'2147482998',width:'min(340px,86vw)',maxHeight:'46vh',overflow:'auto',border:'1px solid rgba(79,227,255,.48)',borderRadius:'18px',padding:'12px',background:'linear-gradient(145deg,rgba(3,17,31,.91),rgba(9,10,36,.87))',boxShadow:'0 0 38px rgba(55,221,255,.16),inset 0 0 28px rgba(70,80,255,.08)',backdropFilter:'blur(14px) saturate(145%)',color:'#e6fbff',fontFamily:'Inter,system-ui,sans-serif',display:'none'})
 const title=document.createElement('div');title.textContent='CONSTRUCT • WORLD AWARE';Object.assign(title.style,{fontSize:'10px',fontWeight:'950',letterSpacing:'1.4px',color:'#6feeff'});hud.appendChild(title)
 const agents=document.createElement('div');agents.textContent='BENNY • VECTOR • CHRONICLE';Object.assign(agents.style,{fontSize:'8px',opacity:'.62',marginTop:'3px'});hud.appendChild(agents)
 status=document.createElement('div');Object.assign(status.style,{fontSize:'10px',lineHeight:'1.4',margin:'8px 0'});hud.appendChild(status)
 const controls=document.createElement('div');Object.assign(controls.style,{display:'flex',gap:'7px',flexWrap:'wrap'});mapButton=button('◈ MAP',()=>{const s=getConstructState();s.mapOpen?closeConstructMap():openConstructMap()});scanButton=button('◎ SCAN',()=>scanConstructVicinity());controls.append(mapButton,scanButton);hud.appendChild(controls)
 list=document.createElement('div');Object.assign(list.style,{display:'grid',gap:'6px',marginTop:'9px'});hud.appendChild(list)
 document.body.appendChild(hud)
}
function render(){ensure();if(!hud||!list||!status)return;const s=getConstructState();hud.style.display=s.active?'block':'none';status.textContent=s.lastGuidance||'Construct ready.';if(mapButton)mapButton.textContent=s.mapOpen?'◈ CLOSE MAP':'◈ MAP';list.replaceChildren();if(!s.mapOpen)return;for(const t of s.targets.slice().sort((a,b)=>(a.distance||999)-(b.distance||999)).slice(0,10)){const row=document.createElement('button');row.textContent=`${t.kind==='mission'?'◆':'▣'} ${t.label} • ${Math.round(t.distance||0)}m`;Object.assign(row.style,{textAlign:'left',border:'1px solid rgba(255,255,255,.13)',borderRadius:'11px',padding:'7px 9px',background:s.focus?.id===t.id?'rgba(75,210,255,.18)':'rgba(255,255,255,.035)',color:'#f1fdff',fontSize:'10px',cursor:'pointer'});row.onclick=()=>focusConstructTarget(t.id);list.appendChild(row)}}
function route(detail:any){ensure();if(!status)return;const to=detail?.to;status.textContent=to?`Vector: route locked to ${to.label}. Follow the floating arrow and distance ring.`:'Vector route ready.';hud?.animate?.([{transform:'translateY(0)'},{transform:'translateY(-4px)'},{transform:'translateY(0)'}],{duration:300})}
function scan(detail:any){ensure();if(!status)return;const hits=Array.isArray(detail?.hits)?detail.hits:[];status.textContent=`Chronicle: scan complete • ${hits.length} nearby target${hits.length===1?'':'s'} found.`}
export function installStreetVerseConstructHudRuntime(){if(installed||typeof window==='undefined')return;installed=true;ensure();window.addEventListener('tryamm:construct:state',render);window.addEventListener('tryamm:construct:route',(e:Event)=>route((e as CustomEvent).detail));window.addEventListener('tryamm:construct:scan-result',(e:Event)=>scan((e as CustomEvent).detail));window.addEventListener('tryamm:streetverse-exit',()=>{if(hud)hud.style.display='none'});render();window.dispatchEvent(new CustomEvent('tryamm:construct:hud-ready',{detail:{interactive:true,controls:['map','scan','target-focus'],visuals:['route-pointer','distance','target-list','agent-status']}}))}
