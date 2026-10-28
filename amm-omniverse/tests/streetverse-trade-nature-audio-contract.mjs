import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8')
const nature=read('../src/runtime/StreetVerseWalkingWildlifeAudio.ts')
const trade=read('../src/runtime/StreetVerseOriginalTradeSounds.ts')
const entry=read('../src/components/StreetVerseGeoSpawnBridge.tsx')
for(const [name,src] of [['nature',nature],['trade',trade]]){
 assert.match(src,/new CustomEvent\('tryamm:audio-caption'/,name+' must caption sound')
 assert.match(src,/return \(\)=>\{|return \(\) => \{/,name+' must clean up')
 assert.match(src,/\.close\(\)/,name+' must release audio context')
}
for(const cue of ['step-concrete','step-grass','step-stairs','bird-chirp','insect-cricket','dog-bark','cat-meow'])assert.ok(nature.includes(cue),'missing cue '+cue)
for(const cue of ['water-drip','switch-click','valve-turn','job-complete','toolbox'])assert.ok(trade.includes(cue),'missing trade cue '+cue)
assert.ok(nature.includes("tryamm:streetverse-player-position"),'footsteps must listen to player telemetry')
assert.ok(nature.includes("detail.inVehicle===true"),'no footsteps inside vehicle')
assert.ok(nature.includes("performance.now()-lastFootstep<420"),'throttle walking steps')
assert.ok(entry.includes('installStreetVerseWalkingWildlifeAudio(),[]'),'nature audio must mount')
assert.ok(entry.includes('installStreetVerseOriginalTradeSounds(),[]'),'trade audio must mount')
console.log('PASS: trade + wildlife sound registry, lifecycle, caption and player-motion integration source contracts')
