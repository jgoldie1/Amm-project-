import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const src=p=>readFileSync(new URL(p,import.meta.url),'utf8')
const world=src('../src/components/StreetVerseMobileWorld.tsx')
const checker=src('../public/streetverse-character-asset-check.html')
const switcher=src('../src/components/StreetVerseCharacterSwitchHUD.tsx')
test('late scenery may never overwrite early real Jacobie or LaTeasia character',()=>{
 assert.match(world,/const legacySceneHero=result\.group\.getObjectByName\('mobile-native-hero'\)\|\|null/)
 assert.match(world,/if\(recoveredPlayableHandle\?\.object\.parent\)\{\s*nativeHero=recoveredPlayableHandle\.object/)
 assert.match(world,/nativeHeroFallback=legacySceneHero/)
 assert.match(world,/if\(legacySceneHero\)\{\s*normalizeStreetVerseHumanHeight\(legacySceneHero/)
 assert.match(world,/if\(eagerRecoveredId\)void loadRecoveredPlayable\(eagerRecoveredId\)/)
})
test('diagnostic directly checks actual deployed GLB responses',()=>{
 for(const file of ['Jacobie_Stubbs_12_Motions_Restore.glb','LaTeasia_Monroe_7_Motions_Diagnostic.glb'])assert.ok(checker.includes(file))
 assert.match(checker,/fetch\(url,\{cache:'no-store',signal:controller.signal\}\)/)
 assert.match(checker,/GLB header length mismatch/)
 assert.match(checker,/asset\.animations/)
 assert.match(checker,/StreetVerse_Original_Character_Asset_Diagnostic\.json/)
 assert.match(switcher,/streetverse-character-asset-check\.html/)
})
