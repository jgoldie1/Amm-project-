import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const hero=read('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts')
const cast=read('../src/components/StreetVerseNearWestCinematicCast.tsx')

// A gesture event is optional and does not change idle/walk/run for old GLBs.
assert.match(hero,/export type BJGesture='nod'\|'look-around'\|'converse'\|'greet'/)
assert.match(hero,/playGesture:\(gesture:BJGesture\)=>boolean/)
assert.match(hero,/if\(!mixer\|\|!clip\)return false/,'old assets must ignore unavailable gestures safely')
assert.match(hero,/BJ_V15_Listening_Nod/)
assert.match(hero,/BJ_V15_Observe_Left_Right/)
assert.match(hero,/BJ_V15_Conversational_Gesture/)
assert.match(hero,/BJ_Greeting_Wave/)
assert.match(hero,/window\.addEventListener\('tryamm:bj-gesture',onGesture\)/)
assert.match(hero,/window\.removeEventListener\('tryamm:bj-gesture',onGesture\)/)
assert.match(hero,/if\(!gestureAction\)setMotion\(state\.running\?'run':state\.moving\?'walk':'idle'\)/)
assert.match(hero,/BJ_MESHY_V6_ASSET\.productionUrl/,'keep proven shipped hero fallback')
assert.match(cast,/installBJPhotoMatchedHead\(loaded\.object\)/,'legacy photo-preview migration remains optional')
console.log('BJ V15 live gesture events, old-GLB fallback and cleanup source contract PASS')
