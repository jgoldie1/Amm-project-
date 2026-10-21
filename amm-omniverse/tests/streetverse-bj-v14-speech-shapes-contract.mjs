import assert from 'node:assert/strict'
import fs from 'node:fs'

const hero=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const photoReference=fs.readFileSync(new URL('../src/data/StreetVerseBJApprovedPhotoReference20261012.ts',import.meta.url),'utf8')
const cast=fs.readFileSync(new URL('../src/components/StreetVerseNearWestCinematicCast.tsx',import.meta.url),'utf8')

// The V14 facial target names are optional: old GLBs and a MetaHuman export with
// different shape names must still load and use their existing body animation.
for(const prop of ['visemeAA','visemeEE','visemeOH','visemeMBP','visemeFV','visemeL','visemeWQ','eyeSquintLeft','eyeSquintRight']){
  assert.match(hero,new RegExp('\\b'+prop+'\\?:number\\b'.replace('\\b$','')),`missing optional type for ${prop}`)
  assert.match(hero,new RegExp("\\['"+prop+"',\\["),`missing morph mapping for ${prop}`)
}
assert.match(hero,/tryamm:character-face-pose/,'existing expression events should remain available')
assert.match(hero,/materializeAnimationMap\(clips\)/,'body idle and walk should continue independently')
assert.match(cast,/metahumanWebPreview/,'future MetaHuman must never get a second photo face laid on top')
assert.match(photoReference,/publicPhotoCommitAuthorized:false/,'real photographs must remain private')
assert.match(photoReference,/certifiedFaceLikeness:false/,'V14 is not certified photo-likeness')
console.log('BJ V14 morph mappings, old GLB fallback, identity provenance checks PASS (static contract only)')
