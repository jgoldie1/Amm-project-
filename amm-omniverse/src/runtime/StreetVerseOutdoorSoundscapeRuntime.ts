type Point={x:number;z:number}
type SoundKind='footstep'|'talk'|'door'|'window'|'elevator'|'music'|'bird'|'insect'|'fish'|'water'|'traffic'|'animal'|'vehicle'|'rain'|'wind'
type Surface='pavement'|'grass'|'wood'|'metal'|'water-edge'
type Zone={id:string;kind:SoundKind;x:number;z:number;radius:number;level:number}

let installed=false,active=false
let ctx:AudioContext|null=null,master:GainNode|null=null
let lastPlayer:Point={x:0,z:58},lastFootstepAt=0,timer=0
let surface:Surface='pavement',weather:'clear'|'rain'|'wind'='clear',dayPhase:'day'|'night'='day'

const zones:Zone[]=[
 {id:'traffic-east',kind:'traffic',x:42,z:4,radius:62,level:.42},{id:'traffic-west',kind:'traffic',x:-42,z:8,radius:62,level:.38},
 {id:'waterfront',kind:'water',x:55,z:72,radius:48,level:.46},{id:'market-music',kind:'music',x:48,z:-28,radius:28,level:.24},
 {id:'studio-music',kind:'music',x:-44,z:-32,radius:30,level:.28},{id:'network-music',kind:'music',x:38,z:36,radius:26,level:.22},
 {id:'park-birds',kind:'bird',x:-4,z:28,radius:46,level:.34},{id:'park-insects',kind:'insect',x:-10,z:30,radius:50,level:.22},
 {id:'marina-fish',kind:'fish',x:55,z:72,radius:30,level:.22},{id:'residential-talk',kind:'talk',x:6,z:-18,radius:45,level:.20},
 {id:'animal-zone',kind:'animal',x:-20,z:42,radius:42,level:.25},
]
function audio(){if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.gain.value=.62;master.connect(ctx.destination)}return ctx}
function ensureUnlocked(){const c=audio();if(c.state==='suspended')void c.resume()}
function distance(a:Point,b:Point){return Math.hypot(a.x-b.x,a.z-b.z)}
function attenuation(zone:Zone){const d=distance(lastPlayer,zone);if(d>=zone.radius)return 0;const t=1-d/zone.radius;return Math.max(0,t*t*zone.level)}
function panFor(x:number){return Math.max(-1,Math.min(1,(x-lastPlayer.x)/34))}
function emitTone(freq:number,duration:number,level:number,pan=0,type:OscillatorType='sine',delay=0){if(!active||level<=.001)return;const c=audio(),o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0001,level),t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);p.pan.value=pan;o.connect(g).connect(p).connect(master!);o.start(t);o.stop(t+duration+.04)}
function noiseBurst(duration:number,level:number,pan=0,low=250,high=1600){if(!active||level<=.001)return;const c=audio(),len=Math.max(1,Math.floor(c.sampleRate*duration)),buf=c.createBuffer(1,len,c.sampleRate),data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const s=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain(),p=c.createStereoPanner();s.buffer=buf;filter.type='bandpass';filter.frequency.value=(low+high)/2;filter.Q.value=Math.max(.3,(low+high)/(high-low));g.gain.value=level;p.pan.value=pan;s.connect(filter).connect(g).connect(p).connect(master!);s.start();s.stop(c.currentTime+duration+.03)}
const chirp=(l:number,p:number)=>{const f=1450+Math.random()*1800;emitTone(f,.06,l,p);emitTone(f*1.18,.04,l*.65,p,'sine',.07)}
const insect=(l:number,p:number)=>{const f=3800+Math.random()*1600;for(let i=0;i<3;i++)emitTone(f+i*90,.035,l*.45,p,'square',i*.055)}
const fish=(l:number,p:number)=>{emitTone(180+Math.random()*70,.12,l*.35,p);noiseBurst(.08,l*.35,p,700,1900)}
const talk=(l:number,p:number)=>{noiseBurst(.28,l,p,180,900);emitTone(125+Math.random()*85,.22,l*.28,p,'triangle')}
const door=(l:number,p:number)=>{noiseBurst(.07,l,p,80,700);emitTone(92,.13,l*.55,p,'sine',.035)}
const windowSound=(l:number,p:number)=>{noiseBurst(.13,l*.65,p,500,2400);emitTone(440,.07,l*.25,p,'triangle')}
const elevator=(l:number,p:number)=>{emitTone(72,.7,l*.42,p);emitTone(880,.08,l*.28,p,'sine',.55)}
const animal=(l:number,p:number)=>{const b=250+Math.random()*420;emitTone(b,.1,l*.6,p,'triangle');emitTone(b*.82,.14,l*.45,p,'triangle',.12)}
const music=(l:number,p:number)=>{const r=[110,130.81,146.83,164.81][Math.floor(Math.random()*4)];[1,1.25,1.5,2].forEach((m,i)=>emitTone(r*m,.3,l*.22,p,'triangle',i*.08))}
const water=(l:number,p:number)=>noiseBurst(.55,l*.4,p,120,1200)
const traffic=(l:number,p:number)=>{noiseBurst(.45,l*.42,p,70,480);emitTone(65+Math.random()*45,.38,l*.22,p,'sawtooth')}
function footstep(level:number,pan:number){const map:{[K in Surface]:[number,number,number]}={pavement:[90,900,115],grass:[120,520,88],wood:[140,1200,155],metal:[350,2200,240],'water-edge':[180,1400,105]};const [lo,hi,tone]=map[surface];noiseBurst(.06,level,pan,lo,hi);emitTone(tone,.04,level*.48,pan,'sine')}
function vehicle(level:number,pan:number,speed=1){noiseBurst(.32,level*.4,pan,60,520);emitTone(58+speed*55,.3,level*.35,pan,'sawtooth')}
function weatherBed(){if(weather==='rain')noiseBurst(.9,.025,0,700,5000);if(weather==='wind')noiseBurst(.8,.02,0,90,650)}
function playZone(z:Zone){const l=attenuation(z);if(l<.006)return;const p=panFor(z.x);if(z.kind==='bird'&&dayPhase==='night')return;if(z.kind==='insect'&&dayPhase==='day')return;({bird:()=>chirp(l,p),insect:()=>insect(l,p),fish:()=>fish(l,p),talk:()=>talk(l,p),music:()=>music(l,p),water:()=>water(l,p),traffic:()=>traffic(l,p),animal:()=>animal(l,p)} as Partial<Record<SoundKind,()=>void>>)[z.kind]?.()}
function randomBuildingLife(){if(!active||distance(lastPlayer,{x:0,z:4})>=90)return;const p=Math.random()*2-1,l=.025+Math.random()*.035,r=Math.random();if(r<.3)door(l,p);else if(r<.5)windowSound(l,p);else if(r<.68)elevator(l,p);else if(r<.84)talk(l*.8,p);else music(l*.7,p)}
function tick(){if(!active)return;zones.forEach(z=>{const c=(z.kind==='traffic'||z.kind==='water') ? .55 : (z.kind==='insect' ? .32 : .18);if(Math.random()<c)playZone(z)});if(Math.random()<.34)randomBuildingLife();weatherBed()}
function movement(next:Point){const now=performance.now(),d=distance(lastPlayer,next);if(active&&d>.12&&now-lastFootstepAt>310){const speed=Math.min(1,d/1.4),pan=Math.max(-.28,Math.min(.28,(next.x-lastPlayer.x)*.35));footstep(.025+.025*speed,pan);lastFootstepAt=now}lastPlayer=next}
function explicitWorldSound(e:Event){const d=(e as CustomEvent<{kind?:SoundKind;x?:number;z?:number;level?:number;speed?:number}>).detail||{};if(!d.kind)return;const p={x:Number(d.x)||lastPlayer.x,z:Number(d.z)||lastPlayer.z},l=(Number(d.level)||.08)*Math.max(.1,1-distance(lastPlayer,p)/45),pan=panFor(p.x);({door:()=>door(l,pan),window:()=>windowSound(l,pan),elevator:()=>elevator(l,pan),talk:()=>talk(l,pan),music:()=>music(l,pan),bird:()=>chirp(l,pan),insect:()=>insect(l,pan),fish:()=>fish(l,pan),animal:()=>animal(l,pan),vehicle:()=>vehicle(l,pan,Number(d.speed)||1),water:()=>water(l,pan),traffic:()=>traffic(l,pan)} as Partial<Record<SoundKind,()=>void>>)[d.kind]?.()}
function start(){active=true;ensureUnlocked();if(!timer)timer=window.setInterval(tick,1150);window.dispatchEvent(new CustomEvent('tryamm:outdoor-soundscape-state',{detail:{active:true,surface,weather,dayPhase}}))}
function stop(){active=false;window.dispatchEvent(new CustomEvent('tryamm:outdoor-soundscape-state',{detail:{active:false}}))}
export function installStreetVerseOutdoorSoundscapeRuntime(){if(installed||typeof window==='undefined')return;installed=true;document.addEventListener('pointerdown',ensureUnlocked,{once:true});window.addEventListener('tryamm:streetverse-enter',start);window.addEventListener('tryamm:streetverse-exit',stop);window.addEventListener('tryamm:streetverse-player-position',(e:Event)=>{const d=(e as CustomEvent<{x?:number;z?:number}>).detail||{};if(Number.isFinite(d.x)&&Number.isFinite(d.z))movement({x:Number(d.x),z:Number(d.z)})});window.addEventListener('tryamm:world-surface',(e:Event)=>{const s=(e as CustomEvent<{surface?:Surface}>).detail?.surface;if(s)surface=s});window.addEventListener('tryamm:world-weather',(e:Event)=>{const w=(e as CustomEvent<{weather?:'clear'|'rain'|'wind'}>).detail?.weather;if(w)weather=w});window.addEventListener('tryamm:world-day-phase',(e:Event)=>{const p=(e as CustomEvent<{phase?:'day'|'night'}>).detail?.phase;if(p)dayPhase=p});window.addEventListener('tryamm:world-sound',explicitWorldSound);for(const [event,kind] of [['tryamm:door-open','door'],['tryamm:door-close','door'],['tryamm:window-open','window'],['tryamm:window-close','window'],['tryamm:elevator-move','elevator'],['tryamm:vehicle-move','vehicle']] as const)window.addEventListener(event,(e:Event)=>explicitWorldSound(new CustomEvent('x',{detail:{...(e as CustomEvent<any>).detail,kind}})));window.dispatchEvent(new CustomEvent('tryamm:outdoor-soundscape-ready',{detail:{spatial:true,proceduralFallback:true,playerReactive:true,surfaceFootsteps:true,weatherReactive:true,dayNightReactive:true,movingVehicles:true,sounds:['walking-footsteps','people-talking','doors-open-close','windows-open-close','elevators-up-down','building-music','birds','insects','fish-water-life','waterfront','traffic','animals','moving-vehicles','rain','wind'],mobileBudgeted:true}}))}
