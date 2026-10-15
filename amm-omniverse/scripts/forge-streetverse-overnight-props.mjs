/**
 * Free, deterministic StreetVerse West Side / Circle Park geometry pass.
 * Original game-design interpretations, NOT exact surveyed replicas or GTA assets.
 * Output is a visual-only GLB kit (existing gameplay collision stays authoritative).
 * No provider tokens, no Vercel deployment, no paid Meshy/Higgsfield calls.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import * as THREE from 'three'
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js'

if (!globalThis.FileReader) globalThis.FileReader=class {
  result=null;onloadend=null;onerror=null;
  async readAsArrayBuffer(blob){try{this.result=await blob.arrayBuffer();this.onloadend?.({target:this})}catch(e){this.onerror?.(e)}}
  async readAsDataURL(blob){try{this.result='data:'+blob.type+';base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onloadend?.({target:this})}catch(e){this.onerror?.(e)}}
}
const out=path.resolve(process.argv[2]||'public/generated-assets/overnight-kit')
await fs.mkdir(out,{recursive:true})
const material=(color,metalness=0,roughness=.7)=>new THREE.MeshStandardMaterial({color,metalness,roughness})
const dark=material('#1d252b',.6,.38),steel=material('#737e86',.65,.4),gold=material('#d5a637',.4,.46)
const brick=material('#85493a'),green=material('#34634a'),cream=material('#e7dcc9')
const glass=material('#81c6d0',.03,.18),concrete=material('#a6a39b'),wood=material('#76523d')
const blue=material('#274d65'),white=material('#f4f1e6'),red=material('#ab4b35')
function box(parent,n,[sx,sy,sz],[x,y,z],mat){
 const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);o.name=n;o.position.set(x,y,z);parent.add(o);return o
}
function cyl(parent,n,r,h,[x,y,z],mat,segments=12){
 const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);o.name=n;o.position.set(x,y,z);parent.add(o);return o
}
function curve(parent,n,points,mat,r=.035){
 const p=new THREE.CatmullRomCurve3(points.map(q=>new THREE.Vector3(...q)))
 const o=new THREE.Mesh(new THREE.TubeGeometry(p,Math.max(12,points.length*5),r,6,false),mat);o.name=n;parent.add(o);return o
}
const builds={
 'sv-circle-park-hoop':g=>{
  box(g,'backboard-glass',[1.8,1.15,.08],[0,3.12,0],glass)
  box(g,'backboard-marking',[.67,.055,.09],[0,3.05,.05],white)
  cyl(g,'basketball-post',.12,3.2,[0,1.6,-.82],steel)
  box(g,'post-extension',[.12,.12,.85],[0,3.05,-.43],steel)
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.235,.027,7,24),red)
  rim.name='orange-rim';rim.rotation.x=Math.PI/2;rim.position.set(0,2.85,.32);g.add(rim)
  for(let i=0;i<10;i++){const a=i*Math.PI/5;curve(g,'mesh-net-'+i,[[Math.sin(a)*.235,2.85,.32+Math.cos(a)*.235],[Math.sin(a)*.17,2.51,.32+Math.cos(a)*.17]],white,.008)}
  box(g,'court-footing',[.6,.12,.66],[0,.06,-.82],concrete)
 },
 'sv-circle-park-entry':g=>{
  for(const x of [-1.75,1.75])box(g,'stone-sign-post',[.35,2.15,.38],[x,1.075,0],brick)
  box(g,'park-entry-sign',[3.45,.7,.24],[0,1.75,0],blue)
  box(g,'sign-header-trim',[3.5,.11,.27],[0,2.15,0],gold)
  box(g,'park-sign-center',[2.12,.28,.265],[0,1.75,.015],cream)
  for(const x of [-1.25,1.25])cyl(g,'solar-light',.11,.18,[x,2.24,0],gold)
 },
 'sv-westside-guard-gate':g=>{
  box(g,'guardhouse-body',[2.7,2.45,2.35],[-2,1.225,0],brick)
  box(g,'guardhouse-roof',[3.06,.22,2.73],[-2,2.53,0],dark)
  for(const x of [-2.75,-1.65])box(g,'security-window',[.65,.83,.08],[x,1.5,1.2],glass)
  box(g,'guard-window-front-trim',[2.06,.07,.09],[-2.1,1.95,1.25],steel)
  cyl(g,'boom-base',.18,1.1,[1.0,.55,-.4],dark)
  const arm=box(g,'barrier-arm',[4.6,.14,.17],[3.35,1.2,-.4],white)
  for(const x of [1.9,3.3,4.6])box(g,'red-arm-reflector',[.42,.145,.18],[x,1.2,-.4],red)
  box(g,'raised-curb',[7,.12,.38],[1.2,.06,-2.2],concrete)
 },
 'sv-taylor-bike-rack':g=>{
  for(let i=0;i<4;i++){
   const x=-1.3+i*.85
   curve(g,'steel-bike-loop-'+i,[[x-.3,.04,-.3],[x-.31,.45,-.3],[x-.22,.85,-.3],[x+.22,.85,-.3],[x+.3,.45,-.3],[x+.3,.04,-.3]],steel,.055)
  }
  box(g,'sidewalk-slab',[4.4,.13,1.2],[0,.065,0],concrete)
 },
 'sv-taylor-planter':g=>{
  box(g,'brick-planter-base',[2.25,.75,.85],[0,.375,0],brick)
  box(g,'soil-bed',[2.0,.04,.7],[0,.77,0],dark)
  for(let i=0;i<7;i++){
   const x=-.8+i*.27
   cyl(g,'plant-stem-'+i,.032,.54,[x,.95,.0],green,7)
   const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.19,1),i%2?green:material('#467b58'))
   crown.name='planter-shrub-'+i;crown.position.set(x,1.25,0);g.add(crown)
  }
 },
 'sv-westside-bus-shelter':g=>{
  for(const x of [-1.6,1.6])for(const z of [-.63,.63])cyl(g,'shelter-post',.065,2.45,[x,1.225,z],steel)
  box(g,'shelter-roof',[3.72,.17,1.75],[0,2.55,0],dark)
  box(g,'shelter-rear-panel',[3.34,1.98,.08],[0,1.25,-.65],glass)
  box(g,'shelter-bench',[2.05,.11,.44],[0,.56,-.18],wood)
  for(const x of [-.8,.8])box(g,'shelter-seat-support',[.11,.5,.3],[x,.30,-.18],steel)
  box(g,'shelter-sign-frame',[.45,.6,.065],[1.45,1.65,-.58],blue)
 },
 'sv-westside-bench':g=>{
  for(let i=0;i<5;i++){box(g,'timber-seat-slat',[2.0,.08,.085],[0,.62,-.33+i*.16],wood);box(g,'timber-back-slat',[2,.08,.1],[0,1.08+i*.15,.34],wood)}
  for(const x of [-.81,.81]){box(g,'bench-leg',[.09,.64,.08],[x,.32,-.02],steel);box(g,'bench-back-leg',[.09,1.12,.08],[x,.56,.38],steel)}
 },
 'sv-westside-food-kiosk':g=>{
  box(g,'kiosk-base',[3.2,2.25,2.2],[0,1.125,0],blue)
  box(g,'kiosk-hatch',[1.95,1,.085],[0,1.47,1.14],dark)
  box(g,'kiosk-counter',[2.4,.13,.4],[0,.95,1.27],wood)
  box(g,'kiosk-awning',[3.5,.14,1.05],[0,2.37,.65],red)
  for(const x of [-1.45,1.45])box(g,'kiosk-awn-stripe',[.3,.145,1.05],[x,2.4,.65],cream)
 },
 'sv-circle-park-water-fountain':g=>{
  box(g,'fountain-pedestal',[.8,1.05,.6],[0,.525,0],concrete)
  box(g,'fountain-tray',[.85,.16,.62],[0,1.09,0],steel)
  cyl(g,'fountain-spout',.08,.13,[.21,1.22,.09],steel)
  box(g,'fountain-button',[.065,.065,.025],[.37,.85,.31],gold)
 },
}
const results=[]
for(const [id,build] of Object.entries(builds)){
 const g=new THREE.Group();g.name=id;g.userData={generator:'streetverse-original-nightly',collisionAuthority:'visual-only',rights:'original-geometry'}
 build(g)
 const glb=await new Promise((resolve,reject)=>new GLTFExporter().parse(g,resolve,reject,{binary:true,onlyVisible:true,trs:true}))
 const buf=Buffer.from(glb)
 if(buf.length<512||buf.length>1_500_000)throw Error(id+' generated GLB outside budget: '+buf.length)
 if(buf.toString('ascii',0,4)!=='glTF')throw Error('Invalid binary glTF: '+id)
 const filename=id+'.glb';await fs.writeFile(path.join(out,filename),buf)
 results.push({id,filename,url:'/generated-assets/overnight-kit/'+filename,bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex'),state:'PREVIEW',source:'original-procedural-geometry',rights:'TRYAMM-owned-preview',gameplayCollisionAuthority:'existing-runtime',certifiedPhotoRealism:false})
 console.log('FORGED',filename,buf.length,'bytes')
}
const inventory={schema:'streetverse-night-asset-forge.v1',createdAt:new Date().toISOString(),world:'Chicago Circle Park / Taylor / West Side',assets:results,notes:['Models are original preview GLBs, not photorealistic scanned Chicago objects','No real-person face is generated or claimed here','No payments, provider API calls or deployment performed']}
await fs.writeFile(path.join(out,'inventory.json'),JSON.stringify(inventory,null,2)+'\n')
console.log('FORGE COMPLETE:',results.length,'individual mobile GLBs')
