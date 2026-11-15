import * as THREE from 'three'

export type LaTeasiaChainId='whos-your-daddy'|'lateasia-monroe'
const labels:Record<LaTeasiaChainId,string>={
 'whos-your-daddy':"WHO'S YOUR DADDY",
 'lateasia-monroe':'LaTeasia Monroe'
}
const isChain=(value:unknown):value is LaTeasiaChainId=>value==='whos-your-daddy'||value==='lateasia-monroe'

/** Creates cosmetic geometry only. Text is rendered onto the pendant texture, not baked into the source GLB. */
export function attachLaTeasiaNecklaces(root:THREE.Group){
 root.updateWorldMatrix(true,true)
 const bounds=new THREE.Box3().setFromObject(root)
 const height=Math.max(.1,bounds.max.y-bounds.min.y)
 const width=Math.max(.1,bounds.max.x-bounds.min.x)
 const size=Math.min(height*.17,width*.44)
 const gold=new THREE.MeshStandardMaterial({color:0xe5bb5e,metalness:.82,roughness:.19})
 const anchor=new THREE.Group()
 anchor.name='lateasia-necklace-anchor'
 // This model-relative placement is a fallback, not a verified neck-bone skin attachment.
 anchor.position.set((bounds.min.x+bounds.max.x)/2,bounds.min.y+height*.81,bounds.max.z+size*.14)
 root.add(anchor)
 const chain=new THREE.Mesh(new THREE.TorusGeometry(size*.64,size*.045,8,40,Math.PI*1.15),gold)
 chain.rotation.z=Math.PI*.925
 chain.position.y=size*.04
 anchor.add(chain)
 const pendants=new Map<LaTeasiaChainId,THREE.Group>()
 for(const id of ['whos-your-daddy','lateasia-monroe'] as const){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256
  const ctx=canvas.getContext('2d')
  if(ctx){
   ctx.fillStyle='#d5a64d';ctx.fillRect(0,0,1024,256)
   ctx.strokeStyle='#fff0a0';ctx.lineWidth=14;ctx.strokeRect(10,10,1004,236)
   ctx.fillStyle='#21180a';ctx.font=id==='lateasia-monroe'?'bold 88px sans-serif':'bold 75px sans-serif'
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(labels[id],512,132,960)
  }
  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace
  const material=new THREE.MeshStandardMaterial({map:texture,metalness:.25,roughness:.32,side:THREE.DoubleSide})
  const pendant=new THREE.Group()
  pendant.name='lateasia-pendant-'+id
  const plate=new THREE.Mesh(new THREE.PlaneGeometry(size*1.55,size*.4),material)
  pendant.add(plate);pendant.position.set(0,-size*.65,size*.08)
  anchor.add(pendant);pendants.set(id,pendant)
 }
 const select=(id:unknown)=>{
  if(!isChain(id))return false
  for(const [key,pendant] of pendants)pendant.visible=key===id
  return true
 }
 select('lateasia-monroe')
 return {select,dispose:()=>{
  anchor.removeFromParent()
  chain.geometry.dispose()
  gold.dispose()
  for(const pendant of pendants.values())pendant.traverse(obj=>{
   if(obj instanceof THREE.Mesh){
    obj.geometry.dispose()
    const material=obj.material as THREE.MeshStandardMaterial
    material.map?.dispose();material.dispose()
   }
  })
 }}
}
