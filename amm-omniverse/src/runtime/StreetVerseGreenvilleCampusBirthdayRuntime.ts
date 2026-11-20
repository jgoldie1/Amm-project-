import * as THREE from 'three'

export const GREENVILLE_CAMPUS_ZONES=[
 {id:'GV01',label:'Campus Welcome',x:0,z:54,kind:'arrival'},
 {id:'GV02',label:'Residence Hall',x:-28,z:34,kind:'housing'},
 {id:'GV03',label:'Academic Hall',x:26,z:34,kind:'school'},
 {id:'GV04',label:'Athletics Field',x:28,z:-8,kind:'sports'},
 {id:'GV05',label:'Birthday Pavilion',x:-28,z:-8,kind:'party'},
 {id:'GV06',label:'Birthday HoloReel Stage',x:0,z:-34,kind:'reel'},
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
 building('Residence Hall',-28,34,24,16,15)
 building('Academic Hall',26,34,26,17,16)
 building('Student Union',0,12,28,16,11)
 box([34,.08,20],[28,.05,-8],field,'greenville-athletics-field')
 const trackOuter=new THREE.Mesh(geo(new THREE.RingGeometry(12,16,48)),track);trackOuter.rotation.x=-Math.PI/2;trackOuter.position.set(28,.07,-8);root.add(trackOuter)
 for(let i=0;i<4;i++)box([15,.5,1.2],[46,0.35+i*.5,-13+i*1.2],stone,'greenville-bleachers-'+i)
 const pavilion=new THREE.Group();pavilion.position.set(-28,0,-8);pavilion.name='greenville-birthday-pavilion';root.add(pavilion)
 const roof=new THREE.Mesh(geo(new THREE.CylinderGeometry(9,9,1,8)),party);roof.position.y=6.6;pavilion.add(roof)
 for(const [x,z] of [[-6,-6],[6,-6],[-6,6],[6,6]]){const post=new THREE.Mesh(geo(new THREE.CylinderGeometry(.22,.22,6,8)),white);post.position.set(x,3,z);pavilion.add(post)}
 const cakeBase=new THREE.Mesh(geo(new THREE.CylinderGeometry(2.2,2.2,.8,24)),white);cakeBase.position.set(0,.45,0);pavilion.add(cakeBase)
 const cakeTop=new THREE.Mesh(geo(new THREE.CylinderGeometry(1.45,1.45,.8,24)),gold);cakeTop.position.set(0,1.25,0);pavilion.add(cakeTop)
 for(let i=0;i<12;i++){const balloon=new THREE.Mesh(geo(new THREE.SphereGeometry(.48,8,6)),i%2?party:gold);const a=i/12*Math.PI*2;balloon.position.set(Math.cos(a)*7,3.8+(i%3)*.45,Math.sin(a)*7);pavilion.add(balloon)}
 box([18,.8,7],[0,.4,-34],blue,'greenville-birthday-reel-stage')
 box([12,4,.5],[0,2.4,-37.5],gold,'greenville-birthday-stage-backdrop')
 GREENVILLE_CAMPUS_ZONES.forEach(zone=>{const beacon=new THREE.Mesh(geo(new THREE.CylinderGeometry(.55,.55,6,10)),new THREE.MeshBasicMaterial({color:zone.kind==='party'?0xff70c8:zone.kind==='sports'?0x64e680:0x6fdcff,transparent:true,opacity:.55}));mats.push(beacon.material as THREE.Material);beacon.position.set(zone.x,3,zone.z);beacon.name='greenville-zone-'+zone.id;root.add(beacon)})
 window.dispatchEvent(new CustomEvent('tryamm:greenville-campus-assets-ready',{detail:{zones:GREENVILLE_CAMPUS_ZONES.map(z=>z.id),housing:true,school:true,sports:true,birthdayParty:true,holoReelStage:true}}))
 return{root,dispose:()=>{root.removeFromParent();root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose())}});textures.forEach(t=>t.dispose());geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose())}}
}
