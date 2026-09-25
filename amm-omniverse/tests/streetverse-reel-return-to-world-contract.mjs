import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const bridge=read('../src/components/StreetVerseReelEventBridge.tsx')
const recorder=read('../src/components/StreetVerseReelRecorder.tsx')

assert.match(bridge,/const closeAndReturn=\(\)=>/,'Reel bridge must own a return-to-world close path')
assert.match(bridge,/tryamm:streetverse-reel-closed/,'closing Reel must emit Reel-close evidence')
assert.match(bridge,/tryamm:streetverse-returned-to-world/,'closing Reel must emit explicit returned-to-world evidence')
assert.match(bridge,/returnedToWorld:true/,'return evidence must state that the world was re-entered')
assert.match(bridge,/continuityPreserved:true/,'return evidence must state that continuity was preserved')
assert.match(bridge,/setContext\(\{\}\)/,'completed creator context must be cleared after the return event')
assert.match(bridge,/StreetVerseReelRecorder open=\{open\} context=\{context\} onClose=\{closeAndReturn\}/,'all recorder close actions must use the world-return bridge')

assert.match(recorder,/const returnToWorld=\(\)=>\{if\(recording\)stopRecording\(\);stopStream\(\);onClose\(\)\}/,'return control must safely stop recording and camera before restoring world')
assert.match(recorder,/← RETURN TO STREETVERSE/,'creator must expose an explicit Return to StreetVerse action')
assert.match(recorder,/aria-label="Return to StreetVerse"/,'close control must be accessible as a world-return action')
assert.doesNotMatch(recorder,/location\.(href|assign|replace)/,'creator return must reveal the existing world instead of navigating away and losing continuity')

console.log('StreetVerse Reel return-to-world contract: PASS')
