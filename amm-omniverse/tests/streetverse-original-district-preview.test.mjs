import test from 'node:test'
import assert from 'node:assert/strict'
import {build} from 'esbuild'

const load=async entry=>{
 const file=new URL(entry,import.meta.url).pathname
 const result=await build({entryPoints:[file],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
 return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))
}
const preview=await load('../src/runtime/StreetVerseOriginalDistrictPreview.ts')
const generator=await load('../src/data/StreetVerseLivingCityGenerator.ts')
const THREE=await import('three')

test('original city preview produces bounded original geometry for Chicago',()=>{
 const district=generator.generateStarterDistrict('chicago')
 assert.deepEqual(preview.validateStreetVersePreview(district),[])
 const {group,count,dispose}=preview.buildStreetVerseDistrictPreview(district,new THREE.Vector3(0,0,0))
 assert.ok(count>=10 && count<=preview.STREETVERSE_PREVIEW_MAX_FEATURES)
 assert.equal(group.children.length,count)
 assert.equal(group.userData.visualOnly,true)
 assert.equal(group.userData.collisionAuthority,'none')
 assert.ok(group.children.every(mesh=>mesh.userData.previewOnly && mesh.geometry))
 dispose()
 assert.equal(group.parent,null)
})

test('malformed and excessive districts are denied without meshes',()=>{
 const district=generator.generateStarterDistrict('chicago')
 assert.ok(preview.validateStreetVersePreview({...district,features:Array(151).fill(district.features[0])}).length)
 const invalid={...district,features:[{...district.features[0],x:Number.POSITIVE_INFINITY}]}
 assert.ok(preview.validateStreetVersePreview(invalid).length)
 assert.throws(()=>preview.buildStreetVerseDistrictPreview(invalid,new THREE.Vector3()))
})

test('renderer bridge consumes simulation event and supports explicit cleanup',async()=>{
 const fs=await import('node:fs')
 const bridge=fs.readFileSync(new URL('../src/runtime/StreetVerseVisibleForgeBridge.ts',import.meta.url),'utf8')
 const panel=fs.readFileSync(new URL('../src/components/StreetVerseMyceliumSubmissionPanel.tsx',import.meta.url),'utf8')
 assert.match(bridge,/tryamm:streetverse-district-preview',preview/)
 assert.match(bridge,/tryamm:streetverse-district-preview-clear',clearPreview/)
 assert.match(bridge,/districtPreview\?\.dispose\(\)/)
 assert.match(panel,/CLEAR GENERATED 3D DISTRICT PREVIEW/)
 assert.match(panel,/tryamm:streetverse-district-preview-result/)
})

test('all four community mission anchors fit the mobile mesh budget in each of the 77 areas',async()=>{
 const {CHICAGO_77_SLICES}=await load('../src/config/streetverseCommunitySlices.ts')
 for(const area of CHICAGO_77_SLICES){
  const district=generator.generateStarterDistrict('chicago',4,area)
  const scene=preview.buildStreetVerseDistrictPreview(district,new THREE.Vector3())
  try{
   const anchors=scene.group.children.filter(mesh=>mesh.userData.featureId.includes(':anchor:'))
   assert.deepEqual(anchors.map(mesh=>mesh.userData.label),area.missions.map(m=>m.label))
   assert.ok(scene.count<=preview.STREETVERSE_PREVIEW_MAX_FEATURES)
  }finally{scene.dispose()}
 }
})
