import * as THREE from 'three'

export const GREENVILLE_CAMPUS_ZONES=[
 {id:'GV01',label:'Campus Welcome',x:0,z:58,kind:'arrival'},
 {id:'GV02',label:'Jacobie Mansion + Master Suite',x:-30,z:38,kind:'mansion'},
 {id:'GV03',label:'Fraternity House',x:-48,z:12,kind:'fraternity'},
 {id:'GV04',label:'Sorority Residence',x:48,z:12,kind:'sorority'},
 {id:'GV05',label:'Academic Hall + Student Union',x:18,z:34,kind:'school'},
 {id:'GV06',label:'Athletics Field',x:30,z:-18,kind:'sports'},
 {id:'GV07',label:'Birthday Party at Mansion Estate',x:-30,z:38,kind:'party'},
 {id:'GV08',label:'Birthday HoloReel Stage',x:0,z:-38,kind:'reel'},
] as const

export function installGreenvilleCampusBirthdayWorld(scene:THREE.Scene){
 const root=new THREE.Group();root.name='greenville-campus-birthday-world';scene.add(root)
 const mats:THREE.Material[]=[];const geos:THREE.BufferGeometry[]=[];const textures:THREE.Texture[]=[]
 const mat=(color:number,roughness=.85)=>{const m=new THREE.MeshStandardMaterial({color,roughness});mats.push(m);return m}
 const geo=<T extends THREE.BufferGeometry>(g:T)=>{geos.push(g);return g}
 const box=(size:[number,number,number],pos:[number,number,number],m:THREE.Material,name:string)=>{const x=new THREE.Mesh(geo(new THREE.BoxGeometry(...size)),m);x.position.set(...pos);x.name=name;root.add(x);return x}
 const lawn=mat(0x315d38),walk=mat(0xd7d0bf),brick=mat(0x8a4939),stone=mat(0xc7bda8),glass=mat(0x56849b,.28),blue=mat(0x173e68),gold=mat(0xf1c85b),field=mat(0x2e7d46),track=mat(0x8f473f),party=mat(0x6b3fa0),white=mat(0xf4f0e8)
 box([150,.12,150],[0,-.06,8],lawn,'greenville-campus-lawn')
 box([8,.08,108],[0,.04,10],walk,'greenville-main-walk')
 box([72,.08,8],[0,.05,34],walk,'greenville-cross-walk')
 const building=(label:string,x:number,z:number,w:number,d:number,h:number)=>{
   const g=new THREE.Group();g.position.set(x,0,z);g.name='greenville-'+label.toLowerCase().replace(/\s+/g,'-');root.add(g)
   const body=new THREE.Mesh(geo(new THREE.BoxGeometry(w,h,d)),brick);body.position.y=h/2;g.add(body)
   const trim=new THREE.Mesh(geo(new THREE.BoxGeometry(w+.3,.5,d+.3)),stone);trim.position.y=h+.25;g.add(trim)
   const entry=new THREE.Mesh(geo(new THREE.BoxGeometry(Math.min(5,w*.4),3,.35)),glass);entry.position.set(0,1.5,-d/2-.2);g.add(entry)
   for(let yy=3.5;yy<h-1;yy+=3.2)for(let xx=-w/2+2;xx<w/2-1;xx+=3.2){const win=new THREE.Mesh(geo(new THREE.BoxGeometry(1.35,1,.12)),glass);win.position.set(xx,yy,-d/2-.08);g.add(win)}
   return g
 }
 building('Residence Hall',-6,34,20,15,14)
 building('Academic Hall',18,34,24,17,16)
 building('Student Union',18,12,24,15,11)
 const mansion=building('Jacobie Mansion',-30,38,30,22,18)
 mansion.userData={...mansion.userData,privateMasterSuite:'Suite 01',birthdayEstate:true}
 const suiteWing=new THREE.Mesh(geo(new THREE.BoxGeometry(11,8,10)),stone);suiteWing.position.set(-37,4,40);suiteWing.name='jacobie-master-suite-01';root.add(suiteWing)
 const suiteGlass=new THREE.Mesh(geo(new THREE.BoxGeometry(6,3,.3)),glass);suiteGlass.position.set(-37,4,34.9);suiteGlass.name='jacobie-suite-01-window';root.add(suiteGlass)
 building('Fraternity House',-48,12,20,16,13)
 building('Sorority Residence',48,12,20,16,13)
 box([34,.08,20],[28,.05,-8],field,'greenville-athletics-field')
 const trackOuter=new THREE.Mesh(geo(new THREE.RingGeometry(12,16,48)),track);trackOuter.rotation.x=-Math.PI/2;trackOuter.position.set(28,.07,-8);root.add(trackOuter)
 for(let i=0;i<4;i++)box([15,.5,1.2],[46,0.35+i*.5,-13+i*1.2],stone,'greenville-bleachers-'+i)
 const pavilion=new THREE.Group();pavilion.position.set(-30,0,38);pavilion.name='greenville-mansion-birthday-courtyard';root.add(pavilion)
 const roof=new THREE.Mesh(geo(new THREE.CylinderGeometry(9,9,1,8)),party);roof.position.y=6.6;pavilion.add(roof)
 for(const [x,z] of [[-6,-6],[6,-6],[-6,6],[6,6]]){const post=new THREE.Mesh(geo(new THREE.CylinderGeometry(.22,.22,6,8)),white);post.position.set(x,3,z);pavilion.add(post)}
 const cakeBase=new THREE.Mesh(geo(new THREE.CylinderGeometry(2.2,2.2,.8,24)),white);cakeBase.position.set(0,.45,0);pavilion.add(cakeBase)
 const cakeTop=new THREE.Mesh(geo(new THREE.CylinderGeometry(1.45,1.45,.8,24)),gold);cakeTop.position.set(0,1.25,0);pavilion.add(cakeTop)
 for(let i=0;i<12;i++){const balloon=new THREE.Mesh(geo(new THREE.SphereGeometry(.48,8,6)),i%2?party:gold);const a=i/12*Math.PI*2;balloon.position.set(Math.cos(a)*7,3.8+(i%3)*.45,Math.sin(a)*7);pavilion.add(balloon)}
 box([18,.8,7],[0,.4,-38],blue,'greenville-birthday-reel-stage')
 box([12,4,.5],[0,2.4,-41.5],gold,'greenville-birthday-stage-backdrop')
 GREENVILLE_CAMPUS_ZONES.forEach(zone=>{const beacon=new THREE.Mesh(geo(new THREE.CylinderGeometry(.55,.55,6,10)),new THREE.MeshBasicMaterial({color:zone.kind==='party'?0xff70c8:zone.kind==='sports'?0x64e680:0x6fdcff,transparent:true,opacity:.55}));mats.push(beacon.material as THREE.Material);beacon.position.set(zone.x,3,zone.z);beacon.name='greenville-zone-'+zone.id;root.add(beacon)})
 window.dispatchEvent(new CustomEvent('tryamm:greenville-campus-assets-ready',{detail:{zones:GREENVILLE_CAMPUS_ZONES.map(z=>z.id),housing:true,mansion:true,masterSuite:'Suite 01',fraternityHouse:true,sororityResidence:true,school:true,sports:true,birthdayPartyAtMansion:true,holoReelStage:true}}))
 return{root,dispose:()=>{root.removeFromParent();root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose())}});textures.forEach(t=>t.dispose());geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose())}}
}
