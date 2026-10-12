import * as THREE from 'three'

// Inspect the character itself; presentation shadows must never certify a body.
export function inspectCharacterGeometry(root:THREE.Object3D){
  let meshes=0,triangles=0
  root.traverseVisible(node=>{
    if(!(node instanceof THREE.Mesh)||node.name==='bj-contact-shadow-v8')return
    const geometry:THREE.BufferGeometry=node.geometry
    const position=geometry?.getAttribute('position')
    if(!position||position.itemSize<3||position.count<3)return
    const materials=Array.isArray(node.material)?node.material:[node.material]
    const drawable=(material:THREE.Material|undefined)=>Boolean(material?.visible&&(!material.transparent||material.opacity>0))
    const total=geometry.index?.count??position.count
    const start=Math.max(0,geometry.drawRange.start)
    const end=Math.min(total,start+geometry.drawRange.count)
    const ranges=Array.isArray(node.material)
      ?geometry.groups.filter(group=>drawable(materials[group.materialIndex??0]))
      :drawable(materials[0])?[{start:0,count:total}]:[]
    const count=ranges.reduce((sum,range)=>sum+Math.floor(Math.max(0,Math.min(end,range.start+range.count)-Math.max(start,range.start))/3),0)
    if(count===0)return
    geometry.computeBoundingBox()
    const bounds=geometry.boundingBox
    if(!bounds||bounds.isEmpty()||![...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite))return
    // A point or a flat ground plane is not a standing character body.
    if(bounds.max.y-bounds.min.y<=.00001)return
    meshes++
    triangles+=count
  })
  return {meshes,triangles}
}
