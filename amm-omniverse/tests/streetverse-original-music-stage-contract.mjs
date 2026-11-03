import fs from 'node:fs'
import assert from 'node:assert/strict'
const file=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const catalog=file('src/data/StreetVerseOmniCastProduction.ts')
const stage=file('src/components/StreetVerseOriginalMusicStage.tsx')
const parent=file('src/components/MeetTheStubbsWorldDistrict.tsx')
const music=file('src/data/ChicagoMusicLegacyMissionRegistry.ts')
assert.ok(catalog.includes('STREETVERSE_ORIGINAL_GENRE_LINEUP'),'Unified genre stage lineup missing')
const faith=file('src/data/StreetVerseSetApartMusicNetwork.ts')
const missions=file('src/components/StreetVerseCelebrityRapperMissions.tsx')
const genreMatch=catalog.match(/export const STREETVERSE_MUSIC_GENRES=\[(.*?)\] as const/)
assert.ok(genreMatch,'MusicVerse genre registry not found')
const genres=JSON.parse('['+genreMatch[1]+']')
assert.equal(genres.length,106,'Preserve 85 music genres + 21 Set Apart additions')
assert.equal(new Set(genres).size,genres.length,'No duplicate genre lanes')
for(const genre of ['House','Chicago House','Trap','Christian Rap','Gospel Rap','Kingdom Trap','Worship House','Hebrew Worship','Messianic Worship']){
 assert.ok(genres.includes(genre),genre+' must have original mission and stage slot')
}
assert.ok(catalog.includes('...STREETVERSE_FEATURED_ORIGINAL_PERFORMERS'),'26 named original music creators missing')
assert.ok(catalog.includes('...STREETVERSE_SET_APART_STAGE_PERFORMERS'),'Set Apart music character lane missing')
assert.ok(faith.includes('MYTHOS_SIGNATURE_BLENDS'),'Preserve earlier Mythos Blender presets')
assert.ok(faith.includes('YAHUEAH_HA_MASCHIAH_ALBUM_BRIEF'),'Preserve original album project')
assert.ok(stage.includes('SET_APART_MUSIC_GENRES.length'),'Show Set Apart music filter')
assert.ok(stage.includes('MYTHOS_SIGNATURE_BLENDS.map'),'Show signature music production blends')
assert.ok(missions.includes('setApartMissionSteps(artist.genre,artist.name)'),'Set Apart mission route must be active')
assert.ok(missions.includes("(['original','set-apart','history','all'] as const)"),'Dedicated Set Apart filter missing')

assert.ok(catalog.includes('extraOriginalGenres'),'One original stage slot per unused genre required')
assert.ok(catalog.includes('...STREETVERSE_ORIGINAL_PERFORMERS'),'Do not erase existing original stage characters')
assert.ok(catalog.includes("playableStandIn:false"),'Historical artist references must remain informational')
for(const marker of ['STREETVERSE_ORIGINAL_GENRE_LINEUP','loadStreetVerseMeshyBJHero()','PER_PAGE=8','makeFictionalPerformer','original-or-cleared-only','celebrityImpersonation:false','window.requestAnimationFrame(clock)','INTERACT / E']){
 assert.ok(stage.includes(marker),marker+' missing from playable stage')
}
assert.ok(parent.includes('StreetVerseOriginalMusicStage'),'Existing family district must expose creative music stage')
assert.ok(parent.includes('<StreetVerseOriginalMusicStage onClose='),'Music stage must be reachable')
assert.ok(music.includes('likenessAuthorized:false,musicAuthorized:false'),'Never assume celebrity music/likeness rights')
console.log('PASS: 106 genre lanes (21 Set Apart), Mythos Blender, dedicated faith music missions, eight avatars per scene, rights guards and family route preserved')
