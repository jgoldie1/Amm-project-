import * as THREE from 'three'

const mat=(color:number,emissive=0)=>new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.12,emissive:emissive||color,emissiveIntensity:emissive?0.45:0})
function textTexture(label:string,bg:string,fg:string){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256
 const c=canvas.getContext('2d')!;c.fillStyle=bg;c.fillRect(0,0,768,256);c.fillStyle=fg;c.font='900 58px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(label,384,128)
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t
}
function sign(scene:THREE.Scene,label:string,x:number,y:number,z:number,ry=0,bg='#07131d',fg='#65e9ff'){
 const tex=textTexture(label,bg,fg);const m=new THREE.Mesh(new THREE.PlaneGeometry(8,2.65),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m
}
function bench(scene:THREE.Scene,x:number,z:number,ry=0){const g=new THREE.Group();const wood=mat(0x7a5236),metal=mat(0x2d333a);for(const y of [.65,1.05]){const slat=new THREE.Mesh(new THREE.BoxGeometry(3.4,.18,.35),wood);slat.position.y=y;g.add(slat)}for(const sx of [-1.35,1.35]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.18,.75,.5),metal);leg.position.set(sx,.35,0);g.add(leg)}g.position.set(x,0,z);g.rotation.y=ry;scene.add(g)}
function hydrant(scene:THREE.Scene,x:number,z:number){const g=new THREE.Group();const red=mat(0xc9303b);const body=new THREE.Mesh(new THREE.CylinderGeometry(.28,.32,.8,10),red);body.position.y=.4;const cap=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8,0,Math.PI*2,0,Math.PI/2),red);cap.position.y=.82;g.add(body,cap);g.position.set(x,0,z);scene.add(g)}
function shelter(scene:THREE.Scene,x:number,z:number,ry=0){const g=new THREE.Group();const dark=mat(0x30363d),glass=new THREE.MeshStandardMaterial({color:0x8fdfff,transparent:true,opacity:.28,roughness:.2,metalness:.15});const roof=new THREE.Mesh(new THREE.BoxGeometry(5.5,.2,2),dark);roof.position.y=3.1;g.add(roof);for(const sx of [-2.5,2.5]){const post=new THREE.Mesh(new THREE.BoxGeometry(.12,3,.12),dark);post.position.set(sx,1.5,0);g.add(post)}const pane=new THREE.Mesh(new THREE.BoxGeometry(5,.08,2.4),glass);pane.position.set(0,1.6,-.9);pane.rotation.x=Math.PI/2;g.add(pane);g.position.set(x,0,z);g.rotation.y=ry;scene.add(g)}
function mural(scene:THREE.Scene,x:number,y:number,z:number,ry:number,colors:[number,number,number]){const c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d')!;const hex=(n:number)=>`#${n.toString(16).padStart(6,'0')}`;g.fillStyle=hex(colors[0]);g.fillRect(0,0,512,512);g.fillStyle=hex(colors[1]);g.beginPath();g.arc(150,210,120,0,Math.PI*2);g.fill();g.fillStyle=hex(colors[2]);g.beginPath();g.moveTo(250,30);g.lineTo(490,250);g.lineTo(270,490);g.closePath();g.fill();g.fillStyle='#fff';g.font='900 56px system-ui';g.fillText('STREETVERSE',42,454);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(7,7),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=ry;scene.add(mesh)}
function raceGate(scene:THREE.Scene,x:number,z:number,ry=0){const g=new THREE.Group();const glow=new THREE.MeshStandardMaterial({color:0xffd34f,emissive:0xff9f1c,emissiveIntensity:.9,roughness:.35});for(const sx of [-3.5,3.5]){const p=new THREE.Mesh(new THREE.BoxGeometry(.35,5,.35),glow);p.position.set(sx,2.5,0);g.add(p)}const top=new THREE.Mesh(new THREE.BoxGeometry(7.35,.45,.45),glow);top.position.y=5;g.add(top);g.position.set(x,0,z);g.rotation.y=ry;scene.add(g)}

export function addStreetVerseOriginalCityArt(scene:THREE.Scene){
 sign(scene,'ALL AMERICAN MARKETPLACE',42,6.5,-18,0,'#07131d','#63edff')
 sign(scene,'ANIYAH 64 TRACK STUDIO',-42,6.5,-24,0,'#25102f','#ff91ff')
 sign(scene,'ALL AMERICAN NETWORK',38,7.2,44,Math.PI,'#2c2105','#ffd96b')
 sign(scene,'CHICAGO AFTER DARK',-38,7.2,44,Math.PI,'#2a071b','#ff63b7')
 sign(scene,'TRYAMM • ENTER THE WORLD',0,11,-70,0,'#06121c','#8df5ff')
 mural(scene,-69,7,-60,Math.PI/2,[0x16283b,0xff5d8f,0xffd15b]);mural(scene,69,8,60,-Math.PI/2,[0x0e2530,0x43d9c3,0x816dff])
 for(const [x,z,r] of [[-18,-58,0],[18,-58,0],[-18,58,Math.PI],[18,58,Math.PI]] as [number,number,number][])shelter(scene,x,z,r)
 for(const [x,z,r] of [[-22,-20,0],[22,-20,0],[-22,20,Math.PI],[22,20,Math.PI]] as [number,number,number][])bench(scene,x,z,r)
 for(const [x,z] of [[-10,-10],[10,-10],[-10,10],[10,10],[-58,10],[58,-10]] as [number,number][])hydrant(scene,x,z)
 raceGate(scene,0,48,0);raceGate(scene,48,-48,Math.PI/2);raceGate(scene,0,0,0);raceGate(scene,48,48,Math.PI/2)
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-original-city-art-ready',{detail:{businessSigns:5,murals:2,busShelters:4,benches:4,hydrants:6,raceGates:4,originalArt:true}}))
 return {businessSigns:5,murals:2,busShelters:4,benches:4,hydrants:6,raceGates:4,originalArt:true}
}
