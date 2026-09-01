type SpatialSourceId='traffic-east'|'traffic-west'|'waterfront'|'marketplace'|'creator-studio'|'network'|'holo-ads'|'park'|'portal'
type SpatialSource={id:SpatialSourceId;x:number;z:number;freq:number;wave:OscillatorType;baseGain:number;label:string}
type PlayerPos={x:number;z:number}

type NodeBundle={osc:OscillatorNode;gain:GainNode;panner:PannerNode}
const AUDIO_KEY='tryamm_living_audio_v1'
const SOURCES:SpatialSource[]=[
 {id:'traffic-east',x:72,z:10,freq:72,wave:'sawtooth',baseGain:.022,label:'east traffic'},
 {id:'traffic-west',x:-70,z:-5,freq:68,wave:'sawtooth',baseGain:.019,label:'west traffic'},
 {id:'waterfront',x:55,z:72,freq:116,wave:'sine',baseGain:.018,label:'waterfront'},
 {id:'marketplace',x:48,z:-28,freq:196,wave:'triangle',baseGain:.012,label:'marketplace crowd'},
 {id:'creator-studio',x:-44,z:-32,freq:220,wave:'triangle',baseGain:.011,label:'creator studio'},
 {id:'network',x:38,z:36,freq:164,wave:'sine',baseGain:.011,label:'network district'},
 {id:'holo-ads',x:-45,z:38,freq:246,wave:'sine',baseGain:.009,label:'holo ads district'},
 {id:'park',x:-8,z:10,freq:330,wave:'sine',baseGain:.006,label:'park wildlife'},
 {id:'portal',x:0,z:-70,freq:92,wave:'sine',baseGain:.016,label:'Construct portal'},
]
let installed=false,ctx:AudioContext|null=null,master:GainNode|null=null,active=false,unlocked=false
let player:PlayerPos={x:0,z:58};const nodes=new Map<SpatialSourceId,NodeBundle>()
function settings(){try{return {enabled:true,sfx:true,music:true,master:.72,...JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}')}}catch{return {enabled:true,sfx:true,music:true,master:.72}}}
function context(){if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination)}return ctx}
function setParam(param:AudioParam,value:number){const c=context();param.cancelScheduledValues(c.currentTime);param.setTargetAtTime(value,c.currentTime,.08)}
function listenerAt(p:PlayerPos){const c=context(),l=c.listener;if(l.positionX){setParam(l.positionX,p.x);setParam(l.positionY,1.65);setParam(l.positionZ,p.z)}else (l as any).setPosition?.(p.x,1.65,p.z);if(l.forwardX){setParam(l.forwardX,0);setParam(l.forwardY,0);setParam(l.forwardZ,-1);setParam(l.upX,0);setParam(l.upY,1);setParam(l.upZ,0)}else (l as any).setOrientation?.(0,0,-1,0,1,0)}
function sourceAt(p:PannerNode,s:SpatialSource){if(p.positionX){setParam(p.positionX,s.x);setParam(p.positionY,1.2);setParam(p.positionZ,s.z)}else (p as any).setPosition?.(s.x,1.2,s.z)}
function ensureSources(){if(nodes.size)return;const c=context();for(const s of SOURCES){const osc=c.createOscillator(),gain=c.createGain(),panner=c.createPanner();osc.type=s.wave;osc.frequency.value=s.freq;panner.panningModel='HRTF';panner.distanceModel='inverse';panner.refDistance=5;panner.maxDistance=120;panner.rolloffFactor=1.15;panner.coneInnerAngle=360;panner.coneOuterAngle=360;gain.gain.value=s.baseGain;sourceAt(panner,s);osc.connect(gain).connect(panner).connect(master!);osc.start();nodes.set(s.id,{osc,gain,panner})}}
function apply(){const s=settings();if(!master)return;const on=active&&unlocked&&s.enabled!==false&&(s.sfx!==false||s.music!==false);setParam(master.gain,on?Math.max(0,Math.min(1,Number(s.master)||.72)):0);for(const def of SOURCES){const n=nodes.get(def.id);if(!n)continue;const d=Math.hypot(player.x-def.x,player.z-def.z),near=Math.max(.2,1-Math.min(d,100)/100);setParam(n.gain.gain,def.baseGain*(.55+near*.75))}}
async function unlock(){const c=context();ensureSources();try{if(c.state==='suspended')await c.resume()}catch{}unlocked=true;listenerAt(player);apply();window.dispatchEvent(new CustomEvent('tryamm:streetverse-spatial-audio-unlocked',{detail:{sources:SOURCES.map(s=>s.id)}}))}
function stop(){active=false;apply()}
function zoneFor(p:PlayerPos){let nearest=SOURCES[0],distance=Infinity;for(const s of SOURCES){const d=Math.hypot(p.x-s.x,p.z-s.z);if(d<distance){distance=d;nearest=s}}return {id:nearest.id,label:nearest.label,distance:Math.round(distance)}}
export function installStreetVerseSpatialAudioBridge(){if(installed||typeof window==='undefined')return;installed=true;document.addEventListener('pointerdown',unlock,{once:true});window.addEventListener('tryamm:streetverse-enter',()=>{active=true;if(unlocked){ensureSources();apply()}});window.addEventListener('tryamm:streetverse-exit',stop);window.addEventListener('tryamm:streetverse-player-position',(e:Event)=>{const d=(e as CustomEvent<Partial<PlayerPos>>).detail||{};if(!Number.isFinite(d.x)||!Number.isFinite(d.z))return;player={x:Number(d.x),z:Number(d.z)};if(unlocked){listenerAt(player);apply()}window.dispatchEvent(new CustomEvent('tryamm:streetverse-audio-zone',{detail:{player,...zoneFor(player)}}))});window.addEventListener('tryamm:audio-state',()=>apply());window.addEventListener('tryamm:audio-settings',()=>setTimeout(apply,0));window.dispatchEvent(new CustomEvent('tryamm:streetverse-spatial-audio-ready',{detail:{spatial:true,panning:'HRTF',distanceModel:'inverse',proceduralFallback:true,worldSources:SOURCES.map(({id,x,z,label})=>({id,x,z,label})),requiresUserGesture:true}}))}
