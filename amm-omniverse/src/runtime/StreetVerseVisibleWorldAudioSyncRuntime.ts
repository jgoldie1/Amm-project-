type Point={x:number;z:number}
type WorldSound='talk'|'bird'|'animal'|'vehicle'|'water'|'fish'|'music'|'door'

const NPC_NEAR_SPAWN:[number,number][]=[[-13,58],[-7,52],[7,55],[13,61],[-19,47],[19,49],[-4,67],[9,69]]
const BUSINESSES=[
 {id:'marketplace',x:48,z:-28},{id:'creator-studio',x:-44,z:-32},{id:'holo-ads',x:-45,z:38},{id:'network',x:38,z:36},
]

let installed=false,active=false,startedAt=0,timer=0
let player:Point={x:0,z:58}
let lastVehicle=0,lastResident=0,lastAnimal=0,lastBird=0,lastBoat=0,lastBusiness=0
let lastSurface=''

function emit(type:string,detail:Record<string,unknown>){window.dispatchEvent(new CustomEvent(type,{detail}))}
function elapsed(){return active?(performance.now()-startedAt)/1000:0}
function dist(a:Point,b:Point){return Math.hypot(a.x-b.x,a.z-b.z)}
function surfaceAt(p:Point){
 if(p.z>70)return 'water-edge'
 if([-55,-5,45].some(z=>Math.abs(p.z-z)<10)||[-65,-15,35,85].some(x=>Math.abs(p.x-x)<10))return 'pavement'
 return 'grass'
}
function carAt(i:number,t:number):Point{const lane=i%2?45:-55,dir=i%2?1:-1;return {x:dir*(-128+((t*(11+i*.45)+i*19)%256)),z:lane}}
function npcBase(i:number):Point{const near=NPC_NEAR_SPAWN[i];return {x:near?.[0]??(-108+(i*27)%216),z:near?.[1]??(-72+(i*19)%122)}}
function npcAt(i:number,t:number):Point{const b=npcBase(i);return {x:b.x+Math.sin(t*.38+i)*2.2,z:b.z+Math.cos(t*.31+i*.7)*1.4}}
function animalAt(i:number,t:number):Point{return {x:-90+i*33+(1-Math.cos(t*.5+i))*.7/.5,z:62-(i%2)*14}}
function birdAt(i:number,t:number):Point{const a=t*.25+i*.45,r=32+(i%4)*7;return {x:Math.cos(a)*r,z:Math.sin(a)*r}}
function boatAt(i:number,t:number):Point{return {x:-110+((t*(3+i*.35)+i*48)%220),z:84+(i%2)*10}}
function nearest<T extends Point>(items:T[]){return items.map((p,i)=>({p,i,d:dist(player,p)})).sort((a,b)=>a.d-b.d)[0]}
function worldSound(kind:WorldSound,p:Point,level:number,extra:Record<string,unknown>={}){emit('tryamm:world-sound',{kind,x:p.x,z:p.z,level,...extra})}

function syncSurface(){const s=surfaceAt(player);if(s!==lastSurface){lastSurface=s;emit('tryamm:world-surface',{surface:s,source:'StreetVerseOmniWorld'})}}
function syncVehicles(t:number,now:number){if(now-lastVehicle<720)return;lastVehicle=now;const cars=Array.from({length:12},(_,i)=>carAt(i,t));const n=nearest(cars);if(n&&n.d<72)emit('tryamm:vehicle-move',{id:`streetverse-traffic-${n.i}`,x:n.p.x,z:n.p.z,speed:11+n.i*.45,level:n.d<28?.12:.075,source:'visible-world-sync'})}
function syncResidents(t:number,now:number){if(now-lastResident<2400)return;lastResident=now;const residents=Array.from({length:18},(_,i)=>npcAt(i,t));const n=nearest(residents);if(n&&n.d<34){worldSound('talk',n.p,n.d<10?.09:.045,{id:`resident-${n.i+1}`});if(n.d<20)emit('tryamm:world-sound',{kind:'footstep',x:n.p.x,z:n.p.z,level:.035,source:'visible-resident'})}}
function syncAnimals(t:number,now:number){if(now-lastAnimal<3100)return;lastAnimal=now;const animals=Array.from({length:6},(_,i)=>animalAt(i,t));const n=nearest(animals);if(n&&n.d<46)worldSound('animal',n.p,n.d<16?.09:.05,{id:`streetverse-animal-${n.i+1}`})}
function syncBirds(t:number,now:number){if(now-lastBird<2100)return;lastBird=now;const birds=Array.from({length:14},(_,i)=>birdAt(i,t));const n=nearest(birds);if(n&&n.d<58)worldSound('bird',n.p,n.d<22?.07:.04,{id:`streetverse-bird-${n.i+1}`})}
function syncBoats(t:number,now:number){if(now-lastBoat<1900)return;lastBoat=now;const boats=Array.from({length:4},(_,i)=>boatAt(i,t));const n=nearest(boats);if(n&&n.d<62){worldSound('water',n.p,.045,{id:`streetverse-boat-${n.i+1}`});emit('tryamm:vehicle-move',{id:`streetverse-boat-${n.i+1}`,x:n.p.x,z:n.p.z,speed:3+n.i*.35,level:.055,source:'visible-boat-sync'})}}
function syncBusinesses(now:number){if(now-lastBusiness<4200)return;lastBusiness=now;const n=nearest(BUSINESSES);if(n&&n.d<25){worldSound('music',n.p,.05,{id:n.p.id});if(n.d<8&&Math.random()<.45)worldSound('door',n.p,.06,{id:n.p.id})}}
function tick(){if(!active)return;const t=elapsed(),now=performance.now();syncSurface();syncVehicles(t,now);syncResidents(t,now);syncAnimals(t,now);syncBirds(t,now);syncBoats(t,now);syncBusinesses(now)}
function start(){active=true;startedAt=performance.now();emit('tryamm:world-day-phase',{phase:'night',source:'StreetVerseOmniWorld'});emit('tryamm:world-weather',{weather:'clear',source:'StreetVerseOmniWorld'});if(!timer)timer=window.setInterval(tick,250);tick();emit('tryamm:visible-world-audio-sync-state',{active:true})}
function stop(){active=false;emit('tryamm:visible-world-audio-sync-state',{active:false})}

export function installStreetVerseVisibleWorldAudioSyncRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 window.addEventListener('tryamm:streetverse-enter',start)
 window.addEventListener('tryamm:streetverse-exit',stop)
 window.addEventListener('tryamm:streetverse-player-position',(e:Event)=>{const d=(e as CustomEvent<{x?:number;z?:number}>).detail||{};if(Number.isFinite(d.x)&&Number.isFinite(d.z))player={x:Number(d.x),z:Number(d.z)}})
 emit('tryamm:visible-world-audio-sync-ready',{source:'StreetVerseOmniWorld movement model',sync:['12 moving cars','18 moving residents','6 animals','14 birds','4 boats','4 business sound zones','player surface'],dayPhase:'night',weather:'clear',mobileBudgeted:true})
}
