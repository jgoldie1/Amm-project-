import test from 'node:test'
import assert from 'node:assert/strict'
import {once} from 'node:events'
import {readFileSync} from 'node:fs'
import {build} from 'esbuild'
import {Group, PerspectiveCamera} from 'three'

const bundle=await build({entryPoints:['src/runtime/StreetVerseMapPin.ts'],bundle:true,platform:'node',format:'esm',write:false})
const {pinOrigin,pinTransform,installStreetVerseMapPin,PIN_REQUEST,PIN_RESULT}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))
const anchor=pinOrigin('')
const pin={area:'',lat:anchor.lat,lon:anchor.lon,scale:1,yaw:90,assetId:'approved-building'}

test('all community references map to their scene anchors and reject distant points',()=>{
 for(let n=1;n<=77;n++){
  const area=String(n),ref=pinOrigin(area)
  assert.deepEqual(pinTransform({...pin,area,lat:ref.lat,lon:ref.lon}).position,[ref.x,0,ref.z])
 }
 assert.throws(()=>pinTransform({...pin,lat:42}))
 assert.ok(pinTransform({...pin,lat:pin.lat+.0001}).position[2]<31)
})

test('loads a manifest model, keeps its pin during camera motion and restores it on remount',async t=>{
 const coords=Buffer.from(new Float32Array([0,0,0,1,0,0,0,1,0]).buffer)
 const gltf={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],buffers:[{byteLength:36,uri:'data:application/octet-stream;base64,'+coords.toString('base64')}],bufferViews:[{buffer:0,byteLength:36}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[0,0,0],max:[1,1,0]}]}
 const w=Object.assign(new EventTarget(),{location:new URL('https://game.test/')})
 const stored=new Map()
 globalThis.window=w
 globalThis.localStorage={getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)}
 globalThis.ProgressEvent??=class extends Event{constructor(type,init){super(type);Object.assign(this,init)}}
 const realFetch=globalThis.fetch
 t.after(()=>{globalThis.fetch=realFetch})
 globalThis.fetch=async req=>{
  const url=typeof req==='string'?req:req.url
  if(url.startsWith('/api/meshy/'))return Response.json({assets:[{assetId:pin.assetId,cityScope:'chicago',url:'/building.glb',ready:true}]})
  if(url.endsWith('/building.glb'))return process.env.TEST_BUILDING_GLB?new Response(readFileSync(process.env.TEST_BUILDING_GLB)):Response.json(gltf)
  return realFetch(req)
 }
 let parent=new Group(),off=installStreetVerseMapPin(parent)
 const send=async p=>{const done=once(w,PIN_RESULT);w.dispatchEvent(new CustomEvent(PIN_REQUEST,{detail:p,cancelable:true}));return (await done)[0].detail}
 assert.match(await send(pin),/placed/)
 const model=parent.getObjectByName('mapped-building')
 const camera=new PerspectiveCamera();parent.add(camera);camera.position.set(25,4,7);parent.updateMatrixWorld()
 assert.deepEqual(model.position.toArray(),[-38,0,31]);assert.equal(model.rotation.y,-Math.PI/2)
 assert.match(await send({...pin,assetId:'absent'}),/missing/);assert.equal(parent.getObjectByName('mapped-building'),model)
 off();assert.equal(parent.getObjectByName('mapped-building'),undefined)
 parent=new Group();const restored=once(w,PIN_RESULT);off=installStreetVerseMapPin(parent);await restored
 assert.deepEqual(parent.getObjectByName('mapped-building').position.toArray(),[-38,0,31]);off()
})
