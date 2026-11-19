import assert from 'node:assert/strict'
import fs from 'node:fs'

const reel=fs.readFileSync(new URL('../src/components/StreetVerseReelRecorder.tsx',import.meta.url),'utf8')
const store=fs.readFileSync(new URL('../src/lib/reels/reelChunkRecovery.ts',import.meta.url),'utf8')
for(const term of ['indexedDB.open(DATABASE,2)','recording_chunks','recording_meta','appendRecordingChunk','recoverPartialReel','beginChunkRecording','clearPartialReel','blob.size'])assert.ok(store.includes(term),'missing crash-safe chunk storage '+term)
for(const term of ['recorder.start(1000)','recorder.ondataavailable','appendRecordingChunk(sequence,segment)','chunkQueueRef.current.then','recoverPartialReel()','Offline recovery','CLEAR OFFLINE BACKUP'])assert.ok(reel.includes(term),'missing incremental recording implementation '+term)
assert.ok(store.includes("if(await recoverPartialReel())throw"),'Cannot silently overwrite unsaved partial recording')
assert.ok(reel.includes('setDraftStatus'), 'User-visible storage failures required')
assert.ok(reel.includes('stopStream();setError'), 'Camera must be stopped on initialization failure')
console.log('TRYAMM Reel incremental crash recovery static contract: PASS')
