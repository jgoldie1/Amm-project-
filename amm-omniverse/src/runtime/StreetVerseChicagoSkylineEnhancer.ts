import * as THREE from 'three'

export type ChicagoSkylineEnhancer={group:THREE.Group;dispose:()=>void}
const mat=(color:number,roughness=.58,metalness=.16,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness,metalness,transparent,opacity})
const box=(p:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
const label=(p:THREE.Object3D,text:string,x:number,y:number,z:number)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');if(g){g.fillStyle='#101820';g.fillRect(0,0,512,96);g.strokeStyle='#e6eef5';g.lineWidth=4;g.strokeRect(3,3,506,90);g.fillStyle='#fff';g.font='900 34px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,48)}const t=new THREE.CanvasTexture(c);const m=new THREE.Mesh(new THREE.PlaneGeometry(9,1.7),new THREE.MeshBasicMaterial({map:t,transparent:true}));m.position.set(x,y,z);p.add(m)}

export function addStreetVerseChicagoSkylineEnhancer(scene:THREE.Scene):ChicagoSkylineEnhancer{
 const root=new THREE.Group();root.name='streetverse-chicago-skyline-enhancer';scene.add(root)
 const glass=mat(0x41677d,.2,.68,true,.9),darkGlass=mat(0x1f3443,.18,.72,true,.92),stone=mat(0x81786c,.82,.08),steel=mat(0x313b44,.38,.75),warm=mat(0xd9b66f,.45,.12,true,.9)
 const defs:[number,number,number,number,number,number][]=[
 [-88,-70,24,128,21,0],[-64,-82,26,154,22,1],[-34,-76,22,112,20,2],[-8,-86,30,176,24,1],[24,-82,24,142,21,0],[54,-76,28,166,23,1],[84,-66,22,120,20,2],
 [-92,-34,22,108,20,2],[-70,-24,25,136,22,0],[-42,-20,26,150,22,1],[-12,-24,24,122,20,2],[18,-24,30,184,24,1],[50,-22,26,144,22,0],[82,-28,22,116,20,2],
 [-88,44,22,104,19,2],[-62,52,26,134,22,0],[-34,46,24,118,21,1],[-8,54,28,158,23,0],[22,48,24,132,21,2],[50,52,30,172,24,1],[82,44,22,110,20,0]
 ]
 defs.forEach(([x,z,w,h,d,style],i)=>{
   const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const body=box(g,0,h/2,0,w,h,d,style===2?stone:style===1?darkGlass:glass)
   for(let y=7;y<h-5;y+=7){const band=box(g,0,y,-d/2-.07,w*.88,.18,.12,warm);band.castShadow=false}
   for(const side of [-1,1])for(let y=10;y<h-8;y+=14){const slit=box(g,side*(w/2+.07),y,0,.12,1.2,d*.72,warm);slit.castShadow=false}
   if(i%4===0){box(g,0,h+4,0,w*.42,8,d*.48,steel);box(g,0,h+10,0,.65,12,.65,steel)}
   if(i===10||i===17){const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.3,.5,24,8),steel);antenna.position.y=h+12;g.add(antenna)}
   body.userData={streetverseChicagoHighRise:true,index:i}
 })
 // Dense lower street wall so downtown reads as a city rather than isolated towers.
 for(let x=-96;x<=96;x+=16){for(const z of [-6,18,70]){if(Math.abs(x)<14&&z===18)continue;box(root,x,8,z,13,16,12,x%32===0?stone:darkGlass)}}
 // Rooftop water tanks/HVAC and a few skyline beacons.
 for(const [x,z,y] of [[-42,-20,154],[18,-24,188],[50,52,176],[-64,-82,158]] as [number,number,number][]){box(root,x,y,z,8,2.2,6,steel);const beacon=new THREE.PointLight(0xff3b30,2.4,18,2);beacon.position.set(x,y+4,z);root.add(beacon)}
 // Michigan Ave / river edge vertical corridor accents.
 for(let z=-66;z<=58;z+=16){box(root,102,7,z,14,14,12,z%32===0?glass:stone);box(root,-106,6.5,z,13,13,12,z%32===0?stone:darkGlass)}
 label(root,'DOWNTOWN CHICAGO • STREETVERSE',0,14,78)
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-skyline-ready',{detail:{highRises:defs.length,streetWallBuildings:Math.floor(193/16)*3,rooftopDetail:true,downtownDensity:true}}))
 return {group:root,dispose(){scene.remove(root);root.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const mm=(m as any).material;if(Array.isArray(mm))mm.forEach(x=>x?.dispose?.());else mm?.dispose?.()})}}
}
