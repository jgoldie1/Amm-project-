import assert from 'node:assert/strict'
import fs from 'node:fs'

const bj=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')

for(const channel of ['visemeAA','visemeEE','visemeOH','visemeOO','visemePP','visemeFF','visemeTH']){
  assert.match(bj,new RegExp('\\b'+channel+'\\?\\s*:\\s*number'),'BJ V14 pose channel '+channel+' absent')
}
for(const morph of ['viseme_aa','viseme_E','viseme_O','viseme_U','viseme_PP','viseme_FF','viseme_TH']){
  assert.ok(bj.includes(morph),'BJ V14 morph mapping '+morph+' absent')
}
assert.match(bj,/detail\.pose\)applyFacePose\(detail\.pose\)/,'BJ speech shape events must pass through the character face controller')
assert.match(bj,/canClaimPhotoMatched/,'do not auto-claim user photo likeness')
assert.match(bj,/BJ_MESHY_V6_ASSET\.productionUrl/,'production character fallback must remain')
console.log('BJ V14 viseme event mappings present; this is a static contract, not speech recognition')
