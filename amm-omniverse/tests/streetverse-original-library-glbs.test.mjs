import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const rel=(p)=>new URL('../'+p,import.meta.url)
const manifest=JSON.parse(readFileSync(rel('config/streetverse-original-three-cast-manifest.json'),'utf8'))
const player=readFileSync(rel('src/runtime/StreetVerseRecoveredPlayableRuntime.ts'),'utf8')
const world=readFileSync(rel('src/components/StreetVerseMobileWorld.tsx'),'utf8')
const imported=readFileSync(rel('src/components/StreetVerseThreeCastAssetAuditHUD.tsx'),'utf8')
function loadOriginal(entry){
 const bytes=readFileSync(rel('public/tryamm-assets/meshy/characters/'+entry.filename))
 assert.equal(bytes.subarray(0,4).toString('utf8'),'glTF',entry.id+' is a binary GLB')
 assert.equal(bytes.readUInt32LE(4),2,entry.id+' version 2 GLB')
 assert.equal(bytes.readUInt32LE(8),bytes.length,entry.id+' complete GLB length')
 assert.equal(bytes.length,entry.sizeBytes,entry.id+' original file size')
 assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.id+' SHA256 preserves the Library original')
 const jsonLength=bytes.readUInt32LE(12)
 assert.equal(bytes.subarray(16,20).toString('utf8'),'JSON')
 const asset=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8'))
 const skins=asset.skins||[],meshes=asset.meshes||[],animations=asset.animations||[]
 assert.ok(skins.length>0&&meshes.length>0&&animations.length>0,entry.id+' has skinned animated 3D mesh')
 return asset
}
test('Jacobie textured Library original is present and has twelve real animation clips',()=>{
 const entry=manifest.models.find(x=>x.id==='jacobie-stubbs')
 assert.ok(entry)
 const glb=loadOriginal(entry)
 assert.equal(glb.animations.length,12)
 assert.ok((glb.images||[]).length>=3,'Jacobie texture images must be embedded')
 assert.ok(glb.animations.some(a=>/walk/i.test(a.name)))
 assert.ok(glb.animations.some(a=>/run/i.test(a.name)))
})
test('LaTeasia Library asset is correctly recognized as an UNTEXTURED diagnostic, not final likeness',()=>{
 const entry=manifest.models.find(x=>x.id==='lateasia-monroe')
 assert.ok(entry)
 const glb=loadOriginal(entry)
 assert.equal(glb.animations.length,7)
 assert.equal((glb.images||[]).length,0,'do not claim final photo textures in the diagnostic model')
 assert.match(glb.materials[0].name,/DIAGNOSTIC/)
 assert.doesNotMatch(player,/function styleLaTeasiaDiagnostic/,'no inaccurate generated repainting')
 assert.match(player,/diagnosticAppearance:id==='lateasia-monroe'/)
})
test('game uses original model in Greenville and keeps the animated player visible',()=>{
 assert.match(player,/getItem\('tryamm:streetverse:cast-source:'\+id\)==='device-local'/,'device import requires explicit choice')
 assert.match(imported,/RESTORE ORIGINAL LIBRARY MODELS/,'restore control exists')
 assert.match(world,/placements:greenvilleBirthdayMode\?\[\]:mobileNativePlacements/,'Greenville skips unrelated Chicago asset downloads')
 assert.match(player,/node\.frustumCulled=!\(node instanceof THREE\.SkinnedMesh\)/,'animated model must not disappear from stale bounds')
 assert.match(player,/object\.add\(model\)/,'model rig is grouped under a movable root')
 assert.match(world,/characterId:recoveredPlayableHandle\?\.id\|\|'bj-stubbs'/,'movement evidence follows actual actor')
})
