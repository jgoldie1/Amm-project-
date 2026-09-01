type Point={x:number;z:number}
type SoundKind='footstep'|'talk'|'door'|'window'|'elevator'|'music'|'bird'|'insect'|'fish'|'water'|'traffic'|'animal'
type Zone={id:string;kind:SoundKind;x:number;z:number;radius:number;level:number}

let installed=false
let active=false
let ctx:AudioContext|null=null
let master:GainNode|null=null
let lastPlayer:Point={x:0,z:58}
let lastMoveAt=0
let lastFootstepAt=0
let timer=0
let ambientNodes:AudioNode[]=[]

const zones:Zone[]=[
 {id:'traffic-east',kind:'traffic',x:42,z:4,radius:62,level:.42},
 {id:'traffic-west',kind:'traffic',x:-42,z:8,radius:62,level:.38},
 {id:'waterfront',kind:'water',x:55,z:72,radius:48,level:.46},
 {id:'market-music',kind:'music',x:48,z:-28,radius:28,level:.24},
 {id:'studio-music',kind:'music',x:-44,z:-32,radius:30,level:.28},
 {id:'network-music',kind:'music',x:38,z:36,radius:26,level:.22},
 {id:'park-birds',kind:'bird',x:-4,z:28,radius:46,level:.34},
 {id:'park-insects',kind:'insect',x:-10,z:30,radius:50,level:.22},
 {id:'marina-fish',kind:'fish',x:55,z:72,radius:30,level:.22},
 {id:'residential-talk',kind:'talk',x:6,z:-18,radius:45,level:.20},
 {id:'animal-zone',kind:'animal',x:-20,z:42,radius:42,level:.25},
]

function audio(){if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.gain.value=.62;master.connect(ctx.destination)}return ctx}
function ensureUnlocked(){const c=audio();if(c.state==='suspended')void c.resume()}
function distance(a:Point,b:Point){return Math.hypot(a.x-b.x,a.z-b.z)}
function attenuation(zone:Zone){const d=distance(lastPlayer,zone);if(d>=zone.radius)return 0;const t=1-d/zone.radius;return Math.max(0,t*t*zone.level)}
function panFor(x:number){const dx=x-lastPlayer.x;return Math.max(-1,Math.min(1,dx/34))}
function emitTone(freq:number,duration:number,level:number,pan=0,type:OscillatorType='sine',delay=0){if(!active||level<=.001)return;const c=audio(),o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0001,level),t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);p.pan.value=pan;o.connect(g).connect(p).connect(master!);o.start(t);o.stop(t+duration+.04)}
function noiseBurst(duration:number,level:number,pan=0,low=250,high=1600){if(!active||level<=.001)return;const c=audio(),len=Math.max(1,Math.floor(c.sampleRate*duration)),buf=c.createBuffer(1,len,c.sampleRate),data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const s=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain(),p=c.createStereoPanner();s.buffer=buf;filter.type='bandpass';filter.frequency.value=(low+high)/2;filter.Q.value=Math.max(.3,(low+high)/(high-low));g.gain.value=level;p.pan.value=pan;s.connect(filter).connect(g).connect(p).connect(master!);s.start();s.stop(c.currentTime+duration+.03)}
function chirp(level:number,pan:number){const f=1450+Math.random()*1800;emitTone(f,.055+Math.random()*.04,level,pan,'sine');emitTone(f*1.18,.04,level*.65,pan,'sine',.07)}
function insect(level:number,pan:number){const f=3800+Math.random()*1600;for(let i=0;i<3;i++)emitTone(f+i*90,.035,level*.45,pan,'square',i*.055)}
function fish(level:number,pan:number){emitTone(180+Math.random()*70,.12,level*.35,pan,'sine');noiseBurst(.08,level*.35,pan,700,1900)}
function talk(level:number,pan:number){noiseBurst(.28,level,pan,180,900);emitTone(125+Math.random()*85,.22,level*.28,pan,'triangle')}
function door(level:number,pan:number){noiseBurst(.07,level,pan,80,700);emitTone(92,.13,level*.55,pan,'sine',.035)}
function windowSound(level:number,pan:number){noiseBurst(.13,level*.65,pan,500,2400);emitTone(440,.07,level*.25,pan,'triangle')}
function elevator(level:number,pan:number){emitTone(72,.7,level*.42,pan,'sine');emitTone(880,.08,level*.28,pan,'sine',.55)}
function animal(level:number,pan:number){const base=250+Math.random()*420;emitTone(base,.1,level*.6,pan,'triangle');emitTone(base*.82,.14,level*.45,pan,'triangle',.12)}
function music(level:number,pan:number){const root=[110,130.81,146.83,164.81][Math.floor(Math.random()*4)];[1,1.25,1.5,2].forEach((m,i)=>emitTone(root*m,.3,level*.22,pan,'triangle',i*.08))}
function water(level:number,pan:number){noiseBurst(.55,level*.4,pan,120,1200)}
function traffic(level:number,pan:number){noiseBurst(.45,level*.42,pan,70,480);emitTone(65+Math.random()*45,.38,level*.22,pan,'sawtooth')}
function playZone(zone:Zone){const level=attenuation(zone);if(level<.006)return;const pan=panFor(zone.x);switch(zone.kind){case'bird':chirp(level,pan);break;case'insect':insect(level,pan);break;case'fish':fish(level,pan);break;case'talk':talk(level,pan);break;case'music':music(level,pan);break;case'water':water(level,pan);break;case'traffic':traffic(level,pan);break;case'animal':animal(level,pan);break}}
function randomBuildingLife(){if(!active)return;const nearCenter=distance(lastPlayer,{x:0,z:4})<90;if(!nearCenter)return;const pan=Math.random()*2-1,level=.025+Math.random()*.035,r=Math.random();if(r<.34)door(level,pan);else if(r<.58)windowSound(level,pan);else if(r<.76)elevator(level,pan);else talk(level*.8,pan)}
function tick(){if(!active)return;zones.forEach(z=>{const chance=z.kind==='traffic'||z.kind==='water'?0.55:z.kind==='insect'?0.32:0.18;if(Math.random()<chance)playZone(z)});if(Math.random()<.34)randomBuildingLife()}
function movement(next:Point){const now=performance.now(),d=distance(lastPlayer,next);if(active&&d>.12){lastMoveAt=now;if(now-lastFootstepAt>310){const speed=Math.min(1,d/1.4),pan=Math.max(-.28,Math.min(.28,(next.x-lastPlayer.x)*.35));noiseBurst(.055,.025+.025*speed,pan,90,900);emitTone(115,.04,.012+.012*speed,pan,'sine');lastFootstepAt=now}}lastPlayer=next}
function explicitWorldSound(e:Event){const d=(e as CustomEvent<{kind?:SoundKind;x?:number;z?:number;level?:number}>).detail||{};if(!d.kind)return;const p={x:Number(d.x)||lastPlayer.x,z:Number(d.z)||lastPlayer.z},level=(Number(d.level)||.08)*Math.max(.1,1-distance(lastPlayer,p)/45),pan=panFor(p.x);if(d.kind==='door')door(level,pan);if(d.kind==='window')windowSound(level,pan);if(d.kind==='elevator')elevator(level,pan);if(d.kind==='talk')talk(level,pan);if(d.kind==='music')music(level,pan);if(d.kind==='bird')chirp(level,pan);if(d.kind==='insect')insect(level,pan);if(d.kind==='fish')fish(level,pan);if(d.kind==='animal')animal(level,pan)}
function start(){active=true;ensureUnlocked();if(!timer)timer=window.setInterval(tick,1150);window.dispatchEvent(new CustomEvent('tryamm:outdoor-soundscape-state',{detail:{active:true}}))}
function stop(){active=false;window.dispatchEvent(new CustomEvent('tryamm:outdoor-soundscape-state',{detail:{active:false}}))}

export function installStreetVerseOutdoorSoundscapeRuntime(){if(installed||typeof window==='undefined')return;installed=true;document.addEventListener('pointerdown',ensureUnlocked,{once:true});window.addEventListener('tryamm:streetverse-enter',start);window.addEventListener('tryamm:streetverse-exit',stop);window.addEventListener('tryamm:streetverse-player-position',(e:Event)=>{const d=(e as CustomEvent<{x?:number;z?:number}>).detail||{};if(Number.isFinite(d.x)&&Number.isFinite(d.z))movement({x:Number(d.x),z:Number(d.z)})});window.addEventListener('tryamm:world-sound',explicitWorldSound);window.addEventListener('tryamm:door-open',(e:Event)=>explicitWorldSound(new CustomEvent('x',{detail:{...(e as CustomEvent<any>).detail,kind:'door'}})));window.addEventListener('tryamm:door-close',(e:Event)=>explicitWorldSound(new CustomEvent('x',{detail:{...(e as CustomEvent<any>).detail,kind:'door'}})));window.addEventListener('tryamm:window-open',(e:Event)=>explicitWorldSound(new CustomEvent('x',{detail:{...(e as CustomEvent<any>).detail,kind:'window'}})));window.addEventListener('tryamm:window-close',(e:Event)=>explicitWorldSound(new CustomEvent('x',{detail:{...(e as CustomEvent<any>).detail,kind:'window'}})));window.addEventListener('tryamm:elevator-move',(e:Event)=>explicitWorldSound(new CustomEvent('x',{detail:{...(e as CustomEvent<any>).detail,kind:'elevator'}})));window.dispatchEvent(new CustomEvent('tryamm:outdoor-soundscape-ready',{detail:{spatial:true,proceduralFallback:true,playerReactive:true,sounds:['walking-footsteps','people-talking','doors-open-close','windows-open-close','elevators-up-down','building-music','birds','insects','fish-water-life','waterfront','traffic','animals'],explicitEventBridge:['tryamm:world-sound','tryamm:door-open','tryamm:door-close','tryamm:window-open','tryamm:window-close','tryamm:elevator-move'],mobileBudgeted:true}}))}
