import * as THREE from 'three'

export const BJ_PHOTOMATCH_ASSET={
  id:'streetverse-bj-stubbs-photomatched',
  characterId:'bj-stubbs',
  version:'bj-approved-reference-shell-v1',
  source:'user-approved-current-era-reference',
  textureAuthority:'approved-reference-pixels',
  geometryAuthority:'runtime-curved-head-shell',
  certifiedLikeness:false,
  proceduralFallback:'streetverse-hero-player',
} as const

const BJ_PHOTOMATCH_TEXTURE_DATA_URI='data:image/webp;base64,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'

const PROCEDURAL_FACE_PARTS=new Set([
  'hero-head','jaw','chin','cheek-left','cheek-right','nose','upper-lip','lower-lip',
  'eye-white-left','eye-white-right','iris-left','iris-right','eyelid-left','eyelid-right',
  'brow-left','brow-right','bj-nose-bridge','bj-nose-tip','bj-beard-chin','bj-jaw-shadow',
  'bj-full-beard','bj-moustache','bj-gray-chin-panel','bj-beard-gray-fleck'
])

export type BJPhotoMatchedHeadHandle={
  mesh:THREE.Mesh
  ready:Promise<boolean>
  dispose:()=>void
}

export function installBJPhotoMatchedHead(hero:THREE.Object3D):BJPhotoMatchedHeadHandle|null{
  const headPivot=hero.getObjectByName('rig-head')
  if(!headPivot)return null

  const geometry=new THREE.PlaneGeometry(.68,.78,18,22)
  const positions=geometry.attributes.position
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i)
    const y=positions.getY(i)
    const rx=x/.34
    const ry=(y+.015)/.39
    const ell=Math.max(0,1-rx*rx-.78*ry*ry)
    const nose=Math.exp(-Math.pow((x+.07)/.075,2)-Math.pow(y/.10,2))
    positions.setZ(i,.315+.075*Math.sqrt(ell)+.018*nose)
  }
  positions.needsUpdate=true
  geometry.computeVertexNormals()

  const material=new THREE.MeshStandardMaterial({
    transparent:true,
    opacity:0,
    alphaTest:.04,
    side:THREE.DoubleSide,
    roughness:.62,
    metalness:0,
  })
  const mesh=new THREE.Mesh(geometry,material)
  mesh.name=BJ_PHOTOMATCH_ASSET.id
  mesh.renderOrder=24
  mesh.frustumCulled=false
  mesh.userData={...BJ_PHOTOMATCH_ASSET,photoReferenceTexture:true,active3DMesh:true}
  headPivot.add(mesh)

  const hidden:Array<{object:THREE.Object3D;visible:boolean}>=[]
  let disposed=false
  const ready=new Promise<boolean>(resolve=>{
    new THREE.TextureLoader().load(
      BJ_PHOTOMATCH_TEXTURE_DATA_URI,
      texture=>{
        if(disposed){texture.dispose();resolve(false);return}
        texture.colorSpace=THREE.SRGBColorSpace
        texture.anisotropy=4
        material.map=texture
        material.opacity=1
        material.needsUpdate=true
        hero.traverse(object=>{
          if(object===mesh||!PROCEDURAL_FACE_PARTS.has(object.name))return
          hidden.push({object,visible:object.visible})
          object.visible=false
        })
        hero.userData={...hero.userData,photoMatchedHeadActive:true,photoMatchedAssetId:BJ_PHOTOMATCH_ASSET.id,photoReferenceTextureAuthority:true}
        window.dispatchEvent(new CustomEvent('tryamm:bj-photomatched-head-ready',{detail:{characterId:'bj-stubbs',assetId:BJ_PHOTOMATCH_ASSET.id,active3DMesh:true,approvedReferencePixels:true,proceduralFaceHidden:true,certifiedLikeness:false}}))
        resolve(true)
      },
      undefined,
      ()=>{
        mesh.removeFromParent()
        geometry.dispose()
        material.dispose()
        window.dispatchEvent(new CustomEvent('tryamm:bj-photomatched-head-fallback',{detail:{characterId:'bj-stubbs',assetId:BJ_PHOTOMATCH_ASSET.id,proceduralFallback:true}}))
        resolve(false)
      }
    )
  })

  return {
    mesh,
    ready,
    dispose:()=>{
      disposed=true
      hidden.forEach(entry=>{entry.object.visible=entry.visible})
      mesh.removeFromParent()
      material.map?.dispose()
      material.dispose()
      geometry.dispose()
    },
  }
}
