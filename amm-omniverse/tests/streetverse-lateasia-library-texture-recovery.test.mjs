import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const file=p=>readFileSync(new URL(p,import.meta.url),'utf8')
const local=file('../src/runtime/StreetVerseCharacterLocalRecovery.ts')
const player=file('../src/runtime/StreetVerseRecoveredPlayableRuntime.ts')
const switcher=file('../src/components/StreetVerseCharacterSwitchHUD.tsx')
const world=file('../src/components/StreetVerseMobileWorld.tsx')
test('real photographic textured LaTeasia GLB import is explicit and cryptographically checked',()=>{
 assert.match(local,/LaTeasia_Monroe_Textured_Seven_Motion_Recovery\.glb/)
 assert.match(local,/e5799b3daf6ebb26cd12c6f7a7f5ba9c4a3c6711d4a6e00eeb9a2263d27762fa/)
 assert.match(local,/verifyTexturedRecovery\(item\.filename,item\.bytes\)/)
 assert.match(local,/crypto\.subtle\.digest\('SHA-256',bytes\)/)
 assert.match(switcher,/importStreetVerseCharacterFiles\(files\)/)
 assert.match(switcher,/window\.location\.reload\(\)/)
})
test('untextured diagnostic is not mistaken for real texture and original material is preserved',()=>{
 assert.match(player,/textureVerified:hasPhotoTextures/)
 assert.match(player,/diagnosticAppearance:id==='lateasia-monroe'&&!hasPhotoTextures/)
 assert.doesNotMatch(player,/styleLaTeasiaDiagnostic/)
 assert.doesNotMatch(player,/vertexColors:true/)
})
test('Jacobie does not download unrelated Chicago scenery during Greenville boot',()=>{
 assert.match(world,/nativePlacementsForWorld\(greenvilleBirthdayMode,entranceProps\('greenville'\),mobileNativePlacements\)/)
 assert.match(player,/node\.frustumCulled=!\(node instanceof THREE\.SkinnedMesh\)/)
})
