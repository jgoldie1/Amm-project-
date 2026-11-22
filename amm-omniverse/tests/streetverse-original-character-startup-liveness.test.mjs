import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const file=p=>readFileSync(new URL(p,import.meta.url),'utf8')
const native=file('../src/runtime/TryammNativeAssetRuntime.ts')
const game=file('../src/components/StreetVerseMobileWorld.tsx')
test('optional scenery cannot hang the original-character startup',()=>{
 assert.match(native,/timeoutMs\?:number/,'optional deadline configurable')
 assert.match(native,/Promise\.race\(\[/,'native assets have bounded load')
 assert.match(native,/expired=true;reject\(Error\('Native scenery timed out'\)\)/,'failed scenery releases wait')
 assert.match(game,/if\(nativeLayer\)\{\s*const activateBJHero/,'cast startup not gated on procedural BJ')
 assert.match(game,/if\(recoveredParam\)void activateRecoveredPlayable\(recoveredParam\)/,'recover requested hero')
})
