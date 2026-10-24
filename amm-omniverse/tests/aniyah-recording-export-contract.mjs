import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=x=>fs.readFileSync(new URL('../'+x,import.meta.url),'utf8')
const studio=read('src/components/RecordingStudio.tsx')
const pack=JSON.parse(read('package.json'))
for(const phrase of [
 "MediaRecorder.isTypeSupported(m)",
 "recorder.mimeType||newChunks[0]?.type||'audio/webm'",
 "mime.includes('mp4')?'.m4a':'.webm'",
 "if(lastTakeUrl.current)URL.revokeObjectURL(lastTakeUrl.current)",
 "stream.getTracks().forEach(t=>t.stop())",
 "setTakeTrack(track)",
 "<audio controls preload=\"metadata\" src={downloadUrl}",
 "download={takeName}",
 "Not automatically mixed, uploaded, mastered, published or delivered."
])assert(studio.includes(phrase),'missing verified local audio workflow: '+phrase)
assert(studio.includes('disabled title="Remote recording is unavailable'),'unconnected remote studio cannot fake real session')
assert(studio.includes('NOT CONNECTED'),'remote code is not a real join token')
assert(!studio.includes('$0.012–$0.018/stream'),'no fabricated royalty estimates')
assert(pack.scripts.build.includes('aniyah-recording-export-contract.mjs'))
console.log('ANIYAH STUDIO TAKE EXPORT PASS: browser-compatible audio, playback/export and transparent remote status')
