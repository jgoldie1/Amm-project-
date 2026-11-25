import assert from 'node:assert/strict'
import {test} from 'node:test'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {AnimationMixer, Vector3} from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

const directory=new URL('../public/tryamm-assets/meshy/characters/',import.meta.url)
function readModel(name){
  const bytes=readFileSync(new URL(name,directory))
  const size=bytes.readUInt32LE(12)
  const json=JSON.parse(bytes.subarray(20,20+size))
  return {bytes,json,bin:bytes.subarray(28+size)}
}
function imageHashes({json,bin}){
  return json.images.map(image=>{
    const {byteOffset=0,byteLength}=json.bufferViews[image.bufferView]
    return createHash('sha256').update(bin.subarray(byteOffset,byteOffset+byteLength)).digest('hex')
  })
}
async function loadGeometry({json,bin}){
  // Keep the original skin, indices, vertices, and clips. CPU skinning does not need a GPU texture decoder.
  const scene=structuredClone(json)
  scene.materials=scene.materials.map(()=>({}))
  const data=Buffer.from(JSON.stringify(scene))
  const padded=Math.ceil(data.length/4)*4
  const glb=Buffer.alloc(28+padded+bin.length,0x20)
  glb.write('glTF');glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8)
  glb.writeUInt32LE(padded,12);glb.write('JSON',16);data.copy(glb,20)
  glb.writeUInt32LE(bin.length,20+padded);glb.write('BIN\0',24+padded);bin.copy(glb,28+padded)
  return new GLTFLoader().parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'')
}
for(const [name,filename,joints,clips] of [
  ['BJ','BJ_Stubbs_V15_Black_Suit_Purple_Shirt_Restore.glb',17,8],
  ['Jacobie','Jacobie_Stubbs_12_Motions_Restore.glb',24,12],
  ['LaTeasia','LaTeasia_Monroe_Full_Body.glb',21,10],
]){
  test(name+' walking moves actual weighted vertices',async()=>{
    const source=readModel(filename)
    if(name==='BJ')assert.equal(createHash('sha256').update(source.bytes).digest('hex'),'d9ae4b87f9bef870139dde13f5143ac471b37c53723f34bb7c1a2e1bef79a15b')
    if(name==='LaTeasia')assert.deepEqual(imageHashes(source),imageHashes(readModel('LaTeasia_Monroe_Textured_Seven_Motion_Recovery.glb')))
    const model=await loadGeometry(source)
    const visibleSkins=model.scene.getObjectsByProperty('type','SkinnedMesh').filter(mesh=>mesh.scale.lengthSq()>=1e-12)
    const skin=visibleSkins[0]
    assert.equal(skin.skeleton.bones.length,joints)
    assert.equal(model.animations.length,clips)
    const mixer=new AnimationMixer(model.scene)
    const walk=model.animations.find(clip=>/walk/i.test(clip.name))
    mixer.clipAction(walk).play()
    function sample(time){
      mixer.setTime(time)
      model.scene.updateMatrixWorld(true)
      const result=[]
      for(const mesh of visibleSkins){
        for(let i=0;i<mesh.geometry.attributes.position.count;i+=13)result.push(mesh.getVertexPosition(i,new Vector3()))
      }
      assert.ok(result.every(v=>v.toArray().every(Number.isFinite)))
      return result
    }
    const start=sample(0),end=sample(walk.duration*.25)
    assert.ok(end.some((v,i)=>v.distanceTo(start[i])>.0001))
    if(name==='LaTeasia'){
      mixer.stopAllAction()
      for(const joint of ['Hips','Spine','Chest','Head','LeftArm','RightArm','LeftForeArm','RightForeArm','LeftUpLeg','RightUpLeg','LeftLeg','RightLeg']){
        const bone=skin.skeleton.getBoneByName(joint)
        const before=sample(0),rotation=bone.quaternion.clone()
        bone.rotateX(.25)
        const after=sample(0)
        assert.ok(after.filter((v,i)=>v.distanceTo(before[i])>.002).length>4,joint+' deforms the mesh')
        bone.quaternion.copy(rotation)
      }
    }
  })
}
