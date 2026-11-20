import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const source=readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const loader=readFileSync(new URL('../src/runtime/StreetVerseRecoveredPlayableRuntime.ts',import.meta.url),'utf8')
test('recovered GLBs do not depend on a legacy procedural BJ hero',()=>{
 assert.match(source,/if\(nativeLayer\)\{\s*const activateBJHero/,'character loader exists whenever native asset layer exists')
 assert.doesNotMatch(source,/if\(nativeHeroFallback\)\{\s*const activateBJHero/,'legacy hero must not gate the character loader')
 assert.match(source,/if\(!requestedRecoveredParam&&nativeHeroFallback\)activateBJHero\(\)/,'BJ fallback still guarded')
 assert.match(source,/if\(recoveredParam&&!eagerRecoveredId\)void activateRecoveredPlayable\(recoveredParam\)/,'Jacobie/LaTeasia auto-load')
 assert.match(source,/if\(!requestedRecoveredParam&&savedPlayable\?\.assetId/,'saved family stand-in cannot override explicit original GLB')
})
test('original GLB failures are visible',()=>{
 assert.match(loader,/streetverse-recovered-playable-error/,'emits decoder/network failures')
 assert.match(loader,/response\.status/,'reports response errors')
 assert.match(loader,/GLB missing, invalid/,'reports rig validation failure')
})
