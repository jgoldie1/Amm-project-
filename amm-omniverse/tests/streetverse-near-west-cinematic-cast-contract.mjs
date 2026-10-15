import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=relative=>fs.readFileSync(new URL(relative,import.meta.url),'utf8')
const cast=read('../src/components/StreetVerseNearWestCinematicCast.tsx')
const chicago=read('../src/components/StreetVerseNearWest3D.tsx')

assert.match(cast,/export function StreetVerseNearWestHeroGLB/)
assert.match(cast,/loadStreetVerseMeshyBJHero\(\)/,'BJ must load the published 3D model, not only a procedural body')
assert.match(cast,/installBJPhotoMatchedHead\(loaded\.object\)/,'optional approved BJ head overlay must attach to the loaded hero')
assert.match(cast,/certifiedLikeness:false/,'likeness remains a reference-driven preview')
assert.match(cast,/loaded\.dispose\(\)/,'late loads must be disposed if a scene is unmounted')
assert.match(cast,/export function StreetVerseNearWestDetailedNpcLayer/)
assert.match(cast,/loadStreetVerseMeshyCharacter\(/)
assert.match(cast,/deferCompanionAnimations:true/,'walking clips must not be downloaded at initial NPC spawn')
assert.match(cast,/const maxCharacters=mobile\?2:4/,'the mobile NPC budget must remain bounded')
assert.match(cast,/const radius=mobile\?65:90/,'distance-based GLB loading must remain bounded')
assert.match(chicago,/<StreetVerseNearWestHeroGLB movement=\{move\} onReady=\{setHeroGlbReady\}/)
assert.match(chicago,/<group visible=\{!heroGlbReady\}/,'procedural BJ must disappear only after the real GLB loads')
assert.match(chicago,/<StreetVerseNearWestDetailedNpcLayer playerPosition=\{playerLocation\}/)
assert.match(chicago,/visible=\{!detailedIds\.has\(n\.id\)\}/,'detailed NPC must not overlap the original placeholder')
assert.match(chicago,/drivenPosition\.current=\{x,z\};playerLocation\.current=\{x,z\}/,'NPC streaming must follow vehicle travel')

console.log('StreetVerse cinematic cast integration checks PASS (static only; render and GLB delivery still require playtesting)')
