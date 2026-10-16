import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=relative=>fs.readFileSync(new URL(relative,import.meta.url),'utf8')
const hero=read('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts')
const chicago=read('../src/components/StreetVerseNearWest3D.tsx')
const cast=read('../src/components/StreetVerseNearWestCinematicCast.tsx')

for(const motion of ['BJ_V15_ListenAndNod','BJ_V15_LookAround','BJ_V15_AcknowledgeAndSmile']){
  assert.ok(hero.includes(motion),'Missing real V15 clip mapping: '+motion)
}
assert.match(hero,/BJ_V14_Speaking_Visemes/)
assert.match(hero,/window\.addEventListener\('tryamm:bj-gesture',onGesture\)/)
assert.match(hero,/window\.removeEventListener\('tryamm:bj-gesture',onGesture\)/)
assert.match(hero,/if\(!mixer\|\|!clip\)return false/,'older deployed BJ models should not break')
assert.match(chicago,/BJ STUBBS • ACTIONS/)
assert.match(chicago,/aria-label="Open BJ Stubbs character gesture controls"/)
assert.match(chicago,/disabled=\{!bjAvailableClips\.some/,'disable unsupported gestures instead of fake success')
assert.match(chicago,/minHeight:48/,'large one-hand target')
assert.match(chicago,/tryamm:bj-meshy-v6-ready/,'buttons need confirmed model clip names')
assert.match(cast,/installBJPhotoMatchedHead/,'old character remains functional')
console.log('BJ V15 one-hand gesture controls: static source contracts PASS; no runtime or deployment claim')
