export type ConstructAgentRole='host'|'navigator'|'context-ai'
export type ConstructTargetKind='mission'|'business'|'vehicle'|'resident'|'ai-spirit'|'creator'|'portal'|'unknown'
export type ConstructTarget={id:string;label:string;kind:ConstructTargetKind;x:number;z:number;distance?:number;metadata?:Record<string,unknown>}

export type ConstructState={
 active:boolean
 simulatedFreeSpaceHologram:true
 physicalProjection:false
 worldAware:true
 agents:{id:string;name:string;role:ConstructAgentRole;purpose:string}[]
 player:{x:number;z:number}
 targets:ConstructTarget[]
 focus?:ConstructTarget
 mapOpen:boolean
 scanActive:boolean
 lastGuidance?:string
}

const STATE:ConstructState={
 active:false,
 simulatedFreeSpaceHologram:true,
 physicalProjection:false,
 worldAware:true,
 agents:[
  {id:'benny',name:'Benny',role:'host',purpose:'Female holographic OmniHost, mission guide, creator assistant and accessibility companion.'},
  {id:'vector',name:'Vector',role:'navigator',purpose:'Original light-trace navigator that draws routes, pointers and movement paths through StreetVerse.'},
  {id:'chronicle',name:'Chronicle',role:'context-ai',purpose:'Original contextual AI that explains the present situation, recalls mission state and predicts useful next actions without impersonating TV characters.'},
 ],
 player:{x:0,z:58},targets:[],mapOpen:false,scanActive:false,
}

const emit=(name:string,detail:unknown)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))}
const copy=()=>({...STATE,player:{...STATE.player},targets:STATE.targets.map(t=>({...t})),agents:STATE.agents.map(a=>({...a}))})
function dist(a:{x:number;z:number},b:{x:number;z:number}){return Math.hypot(a.x-b.x,a.z-b.z)}
function nearest(){return [...STATE.targets].map(t=>({...t,distance:dist(STATE.player,t)})).sort((a,b)=>(a.distance||0)-(b.distance||0))[0]}
function guidance(target?:ConstructTarget){
 if(!target)return 'Benny: Construct online. Vector is mapping the district and Chronicle is watching mission context.'
 const d=Math.round(target.distance??dist(STATE.player,target))
 return `Benny: ${target.label} selected. Vector route locked at ${d} meters. Chronicle has contextual guidance ready.`
}
function publish(){emit('tryamm:construct:state',copy())}

export function enterStreetVerseConstruct(){STATE.active=true;STATE.lastGuidance=guidance();publish();emit('tryamm:benny:overlay-request',{context:'construct-world-aware'});emit('tryamm:construct:agents-online',{agents:STATE.agents,simulatedFreeSpaceHologram:true,physicalProjection:false});return copy()}
export function exitStreetVerseConstruct(){STATE.active=false;STATE.scanActive=false;STATE.mapOpen=false;publish();return copy()}
export function updateConstructPlayerPosition(x:number,z:number){STATE.player={x,z};const n=nearest();if(n)STATE.focus=n;publish();return copy()}
export function setConstructTargets(targets:ConstructTarget[]){STATE.targets=targets.map(t=>({...t,distance:dist(STATE.player,t)}));const n=nearest();if(n)STATE.focus=n;STATE.lastGuidance=guidance(n);publish();return copy()}
export function focusConstructTarget(id:string){const target=STATE.targets.find(t=>t.id===id);if(!target)return copy();STATE.focus={...target,distance:dist(STATE.player,target)};STATE.lastGuidance=guidance(STATE.focus);emit('tryamm:construct:route',{from:STATE.player,to:STATE.focus,agent:'Vector',render:['world-line','floating-arrow','distance-ring','destination-beacon']});emit('tryamm:construct:context',{target:STATE.focus,agent:'Chronicle',actions:['explain','mission-context','next-action','accessibility-description']});emit('tryamm:benny:overlay-request',{context:`mission:${target.kind}:${target.label}`});publish();return copy()}
export function openConstructMap(){STATE.mapOpen=true;emit('tryamm:construct:map-open',{targets:STATE.targets,player:STATE.player,layers:['missions','businesses','vehicles','residents','ai-spirits','creator-portals'],presentation:'floating-holographic-map'});publish();return copy()}
export function closeConstructMap(){STATE.mapOpen=false;publish();return copy()}
export function scanConstructVicinity(radius=18){STATE.scanActive=true;const hits=STATE.targets.filter(t=>dist(STATE.player,t)<=radius).map(t=>({...t,distance:dist(STATE.player,t)}));emit('tryamm:construct:scan-result',{radius,hits,agents:['Benny','Vector','Chronicle'],visualization:['depth-grid','target-boxes','labels','route-candidates']});setTimeout(()=>{STATE.scanActive=false;publish()},900);publish();return hits}
export function getConstructState(){return copy()}

let installed=false
export function installStreetVerseWorldAwareConstructRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 window.addEventListener('tryamm:streetverse-enter',()=>enterStreetVerseConstruct())
 window.addEventListener('tryamm:streetverse-exit',()=>exitStreetVerseConstruct())
 window.addEventListener('tryamm:streetverse-player-position',(event:Event)=>{const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{};if(Number.isFinite(d.x)&&Number.isFinite(d.z))updateConstructPlayerPosition(Number(d.x),Number(d.z))})
 window.addEventListener('tryamm:construct:targets',(event:Event)=>{const d=(event as CustomEvent<ConstructTarget[]>).detail;if(Array.isArray(d))setConstructTargets(d)})
 window.addEventListener('tryamm:construct:focus',(event:Event)=>{const d=(event as CustomEvent<{id?:string}>).detail||{};if(d.id)focusConstructTarget(d.id)})
 window.addEventListener('tryamm:construct:scan',()=>scanConstructVicinity())
 window.addEventListener('tryamm:construct:map-toggle',()=>STATE.mapOpen?closeConstructMap():openConstructMap())
 emit('tryamm:construct:world-aware-ready',{simulatedFreeSpaceHologram:true,physicalProjection:false,agents:STATE.agents,capabilities:['world-anchor','mission-pointer','business-pointer','floating-map','vicinity-scan','route-line','context-ai','accessibility-description','creator-link']})
}
