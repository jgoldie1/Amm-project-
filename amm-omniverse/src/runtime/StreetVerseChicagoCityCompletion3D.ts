import * as THREE from 'three'
const mat=(color:number,metal=.15)=>new THREE.MeshStandardMaterial({color,roughness:.68,metalness:metal})
const box=(p:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
const person=(p:THREE.Object3D,x:number,z:number,i:number)=>{const g=new THREE.Group();const skin=mat([0x5b3525,0x7a4d34,0xa86f4b,0xc88c68,0xe0ae89][i%5],.02);box(g,0,1.05,0,.52,1.2,.34,mat([0x235b8f,0x9f3e5b,0x3b7e50,0xb66d2e,0x6548a1][i%5],.03));const h=new THREE.Mesh(new THREE.SphereGeometry(.22,8,8),skin);h.position.y=1.92;g.add(h);g.position.set(x,0,z);p.add(g);return g}
export function addStreetVerseChicagoCityCompletion3D(scene:THREE.Scene){
 const root=new THREE.Group();root.name='streetverse-chicago-city-completion';scene.add(root)
 const road=mat(0x23272b,.05),concrete=mat(0x777d82,.06),glass=mat(0x7ca4b5,.28),brick=mat(0x725142,.03),steel=mat(0x394047,.65)
 for(const z of [-120,-90,-60,-30,0,30,60,90,120])box(root,0,.08,z,250,.16,9,road)
 for(const x of [-110,-80,-50,-20,10,40,70,100])box(root,x,.08,0,9,.16,260,road)
 for(let x=-105;x<=100;x+=28)for(let z=-112;z<=112;z+=30){if(Math.abs(x)<35&&Math.abs(z)<45)continue;const h=10+((Math.abs(x*7+z*3)%24));box(root,x,h/2,z,18,h,18,(x+z)%2?brick:glass);for(let y=4;y<h;y+=4)for(const side of [-1,1])box(root,x+side*9.05,y,z,0.08,1.2,10,mat(0xcbd7df,.02))}
 for(let i=0;i<56;i++){const x=-118+(i%14)*18,z=-105+Math.floor(i/14)*70;person(root,x,z,i)}
 for(let i=0;i<26;i++){const along=i%13,side=i<13?-1:1;box(root,-102+along*17,.55,side*14,3.7,1.1,1.8,mat([0x243f6b,0x7b2d35,0x4f6332,0x6b5b31,0x40444a][i%5],.45))}
 for(let i=0;i<34;i++){const x=-115+(i%17)*14,z=i<17?-18:18;box(root,x,2.2,z,.18,4.4,.18,steel);const lamp=new THREE.PointLight(0xffe4b0,.36,11,2);lamp.position.set(x,4.6,z);root.add(lamp)}
 for(const [x,z] of [[-16,-84],[18,-100],[40,-54],[-46,58],[66,78],[-72,18],[52,-70],[-30,-118]] as [number,number][]){box(root,x,.6,z,7,1.2,5,concrete);box(root,x,2.2,z,1.1,3.2,1.1,steel);const glow=new THREE.PointLight(0x76c8ff,.55,10,2);glow.position.set(x,3.4,z);root.add(glow)}
 for(let i=0;i<20;i++){const x=-90+(i%10)*20,z=-46+Math.floor(i/10)*92;box(root,x,.45,z,2.4,.9,1.1,mat(0x30363c,.6));box(root,x,.7,z-1.2,.12,1.4,.12,steel)}
 const lake=box(root,126,-.4,0,28,.8,270,mat(0x194b68,.08));lake.receiveShadow=true
 box(root,108,.15,0,8,.3,270,concrete)
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-city-completion-ready',{detail:{streetGrid:true,blocks:true,pedestrians:56,trafficProps:26,streetLights:34,transitEntrances:8,lakefront:true}}))
 return {group:root,pedestrians:56,streetLights:34,transitEntrances:8,dispose:()=>{scene.remove(root);root.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose?.();const mm=m.material as THREE.Material|THREE.Material[]|undefined;if(Array.isArray(mm))mm.forEach(x=>x.dispose());else mm?.dispose?.()})}}
}
