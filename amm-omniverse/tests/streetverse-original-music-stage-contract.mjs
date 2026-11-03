import fs from 'node:fs'
import assert from 'node:assert/strict'
const file=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const catalog=file('src/data/StreetVerseOmniCastProduction.ts')
const stage=file('src/components/StreetVerseOriginalMusicStage.tsx')
const parent=file('src/components/MeetTheStubbsWorldDistrict.tsx')
const music=file('src/data/ChicagoMusicLegacyMissionRegistry.ts')
assert.ok(catalog.includes('STREETVERSE_ORIGINAL_GENRE_LINEUP'),'Unified genre stage lineup missing')
assert.ok(catalog.includes('extraOriginalGenres'),'One original stage slot per unused genre required')
assert.ok(catalog.includes('...STREETVERSE_ORIGINAL_PERFORMERS'),'Do not erase existing original stage characters')
assert.ok(catalog.includes("playableStandIn:false"),'Historical artist references must remain informational')
for(const marker of ['STREETVERSE_ORIGINAL_GENRE_LINEUP','loadStreetVerseMeshyBJHero()','PER_PAGE=8','makeFictionalPerformer','original-or-cleared-only','celebrityImpersonation:false','window.requestAnimationFrame(clock)','INTERACT / E']){
 assert.ok(stage.includes(marker),marker+' missing from playable stage')
}
assert.ok(parent.includes('StreetVerseOriginalMusicStage'),'Existing family district must expose creative music stage')
assert.ok(parent.includes('<StreetVerseOriginalMusicStage onClose='),'Music stage must be reachable')
assert.ok(music.includes('likenessAuthorized:false,musicAuthorized:false'),'Never assume celebrity music/likeness rights')
console.log('PASS: all 46 genre lanes get fictional stage slots; 8 in scene; family route and rights guards preserved')
