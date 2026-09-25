import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const bridge=read('../src/components/StreetVerseReelEventBridge.tsx')
const recorder=read('../src/components/StreetVerseReelRecorder.tsx')

assert.match(bridge,/setContext\(detail\)/,'Reel bridge must retain mission context from the open event')
assert.match(bridge,/tryamm:streetverse-reel-reward-update/,'Reel bridge must listen for later reward verification')
assert.match(bridge,/rewardStatus:'verified'/,'verified reward updates must update creator context without reopening it')
assert.match(bridge,/context=\{context\}/,'Reel context must be passed to the recorder')

assert.match(recorder,/export type StreetVerseReelContext/,'Reel recorder must expose a typed mission context')
assert.match(recorder,/missionId:context\.missionId/,'Reel composition must retain mission id')
assert.match(recorder,/missionRunId:context\.missionRunId/,'Reel composition must retain authoritative mission-run id when available')
assert.match(recorder,/rewardStatus:context\.verified\?'verified'/,'Reel context must distinguish pending from verified rewards')
assert.match(recorder,/composition:\{\.\.\.missionContext,creatorSurface:'streetverse-reel-recorder'\}/,'upload intent must persist mission context')
assert.match(recorder,/navigator\.share\(\{files:\[file\],title:missionLabel\|\|'StreetVerse Reel',text:caption\}\)/,'native share sheet must carry mission-aware title and caption')
assert.match(recorder,/tryamm:streetverse-reel-published/,'publish evidence must still be emitted')
assert.match(recorder,/REWARD VERIFIED.*REWARD PENDING/,'visible creator UI must show reward verification state')
assert.doesNotMatch(recorder,/holoCredits\s*\+=|payableBalance\s*\+=|withdrawable\s*\+=/i,'Reel metadata must never mint economic value')

console.log('StreetVerse Reel mission-context contract: PASS')
