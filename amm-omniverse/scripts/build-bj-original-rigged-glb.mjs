/**
 * TRYAMM-owned, original rigged BJ stand-in GLB built offline.
 * This is an intentionally stylized fallback and NOT BJ V15, likeness-certified,
 * a scan, or a replacement for the recovered owner's facial asset.
 * Real skin attributes, 17 joints and walk/run/idle/wave animation channels.
 */
import fs from 'node:fs'
import path from 'node:path'

const pad4=n=>(n+3)&~3
export function createBJOriginalRiggedGLB(){
 const chunks=[],views=[],accessors=[]
 let size=0
 function add(data,type,components,componentType,extras={}){
  const b=Buffer.from(data.buffer,data.byteOffset,data.byteLength)
  const aligned=pad4(size)
  if(aligned>size){chunks.push(Buffer.alloc(aligned-size));size=aligned}
  const view=views.push({buffer:0,byteOffset:size,byteLength:b.length})-1
  chunks.push(b);size+=b.length
  const acc=accessors.push({bufferView:view,componentType,count:data.length/components,type,...extras})-1
  return acc
 }
 const nodes=[]
 const joint=(name,translation,children=[])=>nodes.push({name,translation,children})-1
 // Hips=0, Spine=1, Chest=2, Neck=3, Head=4,
 // left arm=5..7, right arm=8..10, left leg=11..13, right leg=14..16.
 joint('Hips',[0,1.1,0],[1,11,14])
 joint('Spine',[0,.20,0],[2])
 joint('Chest',[0,.32,0],[3,5,8])
 joint('Neck',[0,.27,0],[4])
 joint('Head',[0,.18,0])
 joint('UpperArm.L',[-.33,.12,0],[6])
 joint('Forearm.L',[-.32,-.32,0],[7])
 joint('Hand.L',[-.03,-.32,0])
 joint('UpperArm.R',[.33,.12,0],[9])
 joint('Forearm.R',[.32,-.32,0],[10])
 joint('Hand.R',[.03,-.32,0])
 joint('Thigh.L',[-.16,-.14,0],[12])
 joint('Shin.L',[0,-.52,0],[13])
 joint('Foot.L',[0,-.46,.08])
 joint('Thigh.R',[.16,-.14,0],[15])
 joint('Shin.R',[0,-.52,0],[16])
 joint('Foot.R',[0,-.46,.08])
 const world=new Array(17)
 const walk=(n,p)=>{const node=nodes[n],pos=[p[0]+node.translation[0],p[1]+node.translation[1],p[2]+node.translation[2]];world[n]=pos;for(const child of node.children)walk(child,pos)}
 walk(0,[0,0,0])
 const matrix=[]
 for(const p of world){matrix.push(1,0,0,0,0,1,0,0,0,0,1,0,-p[0],-p[1],-p[2],1)}
 const inv=add(new Float32Array(matrix),'MAT4',16,5126)
 const mats=[
  {name:'BJ standby skin (stylized)',pbrMetallicRoughness:{baseColorFactor:[.37,.22,.16,1],metallicFactor:0,roughnessFactor:.82}},
  {name:'TRYAMM jacket',pbrMetallicRoughness:{baseColorFactor:[.07,.10,.20,1],metallicFactor:.05,roughnessFactor:.75}},
  {name:'BJ pants',pbrMetallicRoughness:{baseColorFactor:[.07,.075,.09,1],metallicFactor:0,roughnessFactor:.87}},
  {name:'BJ hair and beard',pbrMetallicRoughness:{baseColorFactor:[.025,.023,.024,1],metallicFactor:0,roughnessFactor:.95}},
  {name:'BJ shoes',pbrMetallicRoughness:{baseColorFactor:[.015,.02,.035,1],metallicFactor:.05,roughnessFactor:.67}},
 ]
 const meshes=[]
 // Each rigidly weighted body part is still an actual skinned primitive;
 // animation bends its associated bones and attached geometry.
 function box(name,center,half,bone,material){
  const verts=[],normals=[],joints=[],weights=[],indices=[]
  const [cx,cy,cz]=center,[sx,sy,sz]=half
  const faces=[
   [[1,0,0],[[sx,-sy,-sz],[sx,-sy,sz],[sx,sy,sz],[sx,sy,-sz]]],
   [[-1,0,0],[[-sx,-sy,sz],[-sx,-sy,-sz],[-sx,sy,-sz],[-sx,sy,sz]]],
   [[0,1,0],[[-sx,sy,-sz],[sx,sy,-sz],[sx,sy,sz],[-sx,sy,sz]]],
   [[0,-1,0],[[-sx,-sy,sz],[sx,-sy,sz],[sx,-sy,-sz],[-sx,-sy,-sz]]],
   [[0,0,1],[[sx,-sy,sz],[-sx,-sy,sz],[-sx,sy,sz],[sx,sy,sz]]],
   [[0,0,-1],[[-sx,-sy,-sz],[sx,-sy,-sz],[sx,sy,-sz],[-sx,sy,-sz]]]
  ]
  for(const [normal,points] of faces){
   const offset=verts.length/3
   for(const v of points){verts.push(cx+v[0],cy+v[1],cz+v[2]);normals.push(...normal);joints.push(bone,0,0,0);weights.push(1,0,0,0)}
   indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3)
  }
  const primitives=[{attributes:{
   POSITION:add(new Float32Array(verts),'VEC3',3,5126),
   NORMAL:add(new Float32Array(normals),'VEC3',3,5126),
   JOINTS_0:add(new Uint8Array(joints),'VEC4',4,5121),
   WEIGHTS_0:add(new Float32Array(weights),'VEC4',4,5126),
  },indices:add(new Uint16Array(indices),'SCALAR',1,5123),material}]
  const mesh=meshes.push({name,primitives})-1
  nodes.push({name:'BJ_'+name,mesh,skin:0})
 }
 box('torso',[0,1.48,0],[.33,.42,.17],2,1)
 box('hip',[0,1.06,0],[.28,.16,.16],0,2)
 box('neck',[0,1.94,0],[.11,.13,.11],3,0)
 box('head',[0,2.12,0],[.22,.26,.20],4,0)
 box('hair',[0,2.38,-.005],[.23,.08,.22],4,3)
 box('beard',[0,1.94,.19],[.17,.07,.065],4,3)
 box('left_upper_arm',[-.45,1.63,0],[.12,.26,.12],5,1)
 box('left_forearm',[-.65,1.29,0],[.105,.25,.105],6,0)
 box('left_hand',[-.70,1.02,0],[.11,.10,.09],7,0)
 box('right_upper_arm',[.45,1.63,0],[.12,.26,.12],8,1)
 box('right_forearm',[.65,1.29,0],[.105,.25,.105],9,0)
 box('right_hand',[.70,1.02,0],[.11,.10,.09],10,0)
 box('left_thigh',[-.18,.79,0],[.15,.30,.14],11,2)
 box('left_shin',[-.18,.32,0],[.12,.28,.12],12,2)
 box('left_shoe',[-.18,.08,.13],[.14,.085,.25],13,4)
 box('right_thigh',[.18,.79,0],[.15,.30,.14],14,2)
 box('right_shin',[.18,.32,0],[.12,.28,.12],15,2)
 box('right_shoe',[.18,.08,.13],[.14,.085,.25],16,4)
 const qx=r=>[Math.sin(r/2),0,0,Math.cos(r/2)]
 const qz=r=>[0,0,Math.sin(r/2),Math.cos(r/2)]
 function clip(name,times,channels){
  const input=add(new Float32Array(times),'SCALAR',1,5126,{min:[times[0]],max:[times[times.length-1]]})
  const samplers=[],targets=[]
  for(const [node,angles,axis] of channels){
   const quats=angles.flatMap(a=>axis==='z'?qz(a):qx(a))
   const output=add(new Float32Array(quats),'VEC4',4,5126)
   const sampler=samplers.push({input,output,interpolation:'LINEAR'})-1
   targets.push({sampler,target:{node,path:'rotation'}})
  }
  return {name,samplers,channels:targets}
 }
 const animations=[
  clip('BJ_Idle_Breathe',[0,.5,1],[[2,[0,.022,0],'x'],[4,[0,-.012,0],'x']]),
  clip('BJ_Walk_Cycle',[0,.3,.6, .9,1.2],[
   [11,[.45,0,-.45,0,.45],'x'],[14,[-.45,0,.45,0,-.45],'x'],
   [5,[-.30,0,.30,0,-.30],'x'],[8,[.30,0,-.30,0,.30],'x']]),
  clip('BJ_Run_Cycle',[0,.2,.4,.6,.8],[
   [11,[.7,0,-.7,0,.7],'x'],[14,[-.7,0,.7,0,-.7],'x'],
   [5,[-.6,0,.6,0,-.6],'x'],[8,[.6,0,-.6,0,.6],'x']]),
  clip('BJ_Greeting_Wave',[0,.4,.8,1.2,1.6],[
   [8,[0,-.6,-.6,-.6,0],'z'],[9,[0,-1.3,-.8,-1.3,0],'z']])
 ]
 const doc={asset:{version:'2.0',generator:'TRYAMM Original Offline BJ Skeletal Fallback'},
  scene:0,scenes:[{name:'BJ Rigged Stand-in',nodes:[0,...Array.from({length:meshes.length},(_,i)=>17+i)]}],
  nodes,meshes,skins:[{name:'BJ_ORIGINAL_RIG',joints:Array.from({length:17},(_,i)=>i),skeleton:0,inverseBindMatrices:inv}],
  materials:mats,animations,accessors,bufferViews:views,buffers:[{byteLength:pad4(size)}]}
 let binary=Buffer.concat(chunks)
 if(binary.length<pad4(size))binary=Buffer.concat([binary,Buffer.alloc(pad4(size)-binary.length)])
 const json=Buffer.from(JSON.stringify(doc))
 const jsonLen=pad4(json.length)
 const total=12+8+jsonLen+8+binary.length
 const output=Buffer.alloc(total)
 output.write('glTF',0,'ascii');output.writeUInt32LE(2,4);output.writeUInt32LE(total,8)
 output.writeUInt32LE(jsonLen,12);output.writeUInt32LE(0x4e4f534a,16);json.copy(output,20)
 output.fill(0x20,20+json.length,20+jsonLen)
 const binHeader=20+jsonLen;output.writeUInt32LE(binary.length,binHeader);output.writeUInt32LE(0x004e4942,binHeader+4);binary.copy(output,binHeader+8)
 return output
}
if(process.argv[1]&&path.basename(process.argv[1])==='build-bj-original-rigged-glb.mjs'){
 const out=process.argv[2]||'public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.glb'
 fs.mkdirSync(path.dirname(out),{recursive:true})
 const bytes=createBJOriginalRiggedGLB()
 fs.writeFileSync(out,bytes)
 console.log(JSON.stringify({file:out,bytes:bytes.length,original:true,rigged:true,likenessCertified:false}))
}
