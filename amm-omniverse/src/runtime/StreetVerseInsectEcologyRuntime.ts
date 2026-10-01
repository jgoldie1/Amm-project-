import * as THREE from 'three'

export type StreetVerseInsectSpecies='bee'|'butterfly'|'ladybug'|'dragonfly'|'firefly'|'beetle'|'cockroach'
export const STREETVERSE_INSECT_SPECIES=[
 {id:'bee',label:'Bee',role:'pollinator',habitat:'garden'},
 {id:'butterfly',label:'Butterfly',role:'pollinator',habitat:'garden'},
 {id:'ladybug',label:'Ladybug',role:'garden predator',habitat:'planting beds'},
 {id:'dragonfly',label:'Dragonfly',role:'wetland predator',habitat:'pool/water'},
 {id:'firefly',label:'Firefly',role:'night biodiversity',habitat:'courtyard'},
 {id:'beetle',label:'Beetle',role:'decomposer',habitat:'soil/landscape'},
 {id:'cockroach',label:'Cockroach',role:'urban scavenger / sanitation signal',habitat:'night alley / trash / utility areas'},
] as const

type Bug={mesh:THREE.Mesh;species:StreetVerseInsectSpecies;home:THREE.Vector3;phase:number;nightOnly?:boolean}
export type StreetVerseInsectEcologyRuntime={tick:(nowMs:number)=>void;dispose:()=>void;counts:Record<StreetVerseInsectSpecies,number>;scan:()=>void}

export function createStreetVerseInsectEcology(scene:THREE.Scene):StreetVerseInsectEcologyRuntime{
 const root=new THREE.Group();root.name='streetverse-insect-ecology';scene.add(root)
 const defs:[
  StreetVerseInsectSpecies,number,number,number,number,boolean?
 ][]=[
  ['bee',-35,1.1,35.5,6],['butterfly',-27,1.5,53,5],['ladybug',-45,.65,53,4],
  ['dragonfly',5,1.4,63,5],['firefly',-20,1.7,58,8,true],['beetle',-31,.35,35.5,5],
  ['cockroach',-12,.16,52,5,true],['cockroach',12,.16,52,5,true],
 ]
 const colors:Record<StreetVerseInsectSpecies,number>={bee:0xf2c94c,butterfly:0xc77dff,ladybug:0xe63946,dragonfly:0x45c9d8,firefly:0xd8ff62,beetle:0x5a3b22,cockroach:0x4a2b1a}
 const bugs:Bug[]=[];const counts={bee:0,butterfly:0,ladybug:0,dragonfly:0,firefly:0,beetle:0,cockroach:0}
 defs.forEach(([species,x,y,z,count,nightOnly])=>{for(let i=0;i<count;i++){const g=species==='butterfly'?new THREE.TetrahedronGeometry(.10,0):new THREE.SphereGeometry(species==='cockroach'?.09:species==='dragonfly'?.07:.055,6,4);const m=species==='firefly'?new THREE.MeshBasicMaterial({color:colors[species]}):new THREE.MeshLambertMaterial({color:colors[species]});const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);if(species==='cockroach')mesh.scale.set(1.45,.38,.72);mesh.userData={species,insectEcology:true};root.add(mesh);bugs.push({mesh,species,home:new THREE.Vector3(x,y,z),phase:i*.83+bugs.length*.27,nightOnly});counts[species]++}})
 let scanIndex=0
 const report=(species:(typeof STREETVERSE_INSECT_SPECIES)[number],source:string)=>{window.dispatchEvent(new CustomEvent('tryamm:insect-ecology-discovered',{detail:{...species,world:'circle-park',source}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'INSECT DISCOVERED • '+species.label+' • '+species.role}}));if(species.id==='cockroach')window.dispatchEvent(new CustomEvent('tryamm:streetverse-sanitation-mission-open',{detail:{id:'circle-park-roach-sanitation',location:'trash-recycling-zone',steps:['inspect','clean','secure-trash','maintenance-check'],source:'cockroach-scan'}}))}
 const scan=()=>report(STREETVERSE_INSECT_SPECIES[scanIndex++%STREETVERSE_INSECT_SPECIES.length],'insect-scan')
 const onScan=()=>scan();const onRoachCheck=()=>{const roach=STREETVERSE_INSECT_SPECIES.find(x=>x.id==='cockroach')!;report(roach,'roach-sanitation-check')};window.addEventListener('tryamm:insect-scan-request',onScan);window.addEventListener('tryamm:roach-check-request',onRoachCheck)
 const tick=(nowMs:number)=>{const t=nowMs*.001,hour=new Date().getHours(),night=hour>=19||hour<6;bugs.forEach((b,i)=>{b.mesh.visible=!b.nightOnly||night;const speed=b.species==='cockroach'?3.4:b.species==='dragonfly'?1.7:b.species==='butterfly'?.72:1.0;b.mesh.position.x=b.home.x+Math.sin(t*speed+b.phase)*(1.1+(i%3)*.35);b.mesh.position.z=b.home.z+Math.cos(t*(speed*.83)+b.phase)*(.9+(i%2)*.45);b.mesh.position.y=b.species==='cockroach'?b.home.y:b.home.y+Math.sin(t*1.9+b.phase)*.35;if(b.species==='butterfly')b.mesh.rotation.z=Math.sin(t*8+b.phase)*.55;if(b.species==='dragonfly')b.mesh.rotation.y=t*2+b.phase;if(b.species==='cockroach')b.mesh.rotation.y=Math.atan2(Math.cos(t*speed+b.phase),-Math.sin(t*(speed*.83)+b.phase))})}
 return{tick,scan,counts,dispose:()=>{window.removeEventListener('tryamm:insect-scan-request',onScan);window.removeEventListener('tryamm:roach-check-request',onRoachCheck);root.removeFromParent();root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}})}}
}
