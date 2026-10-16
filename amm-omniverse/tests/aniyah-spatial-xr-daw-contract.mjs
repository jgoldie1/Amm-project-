import fs from 'node:fs'
import assert from 'node:assert/strict'

const spatial=fs.readFileSync(new URL('../src/components/SpatialXRDAW.tsx',import.meta.url),'utf8')
const studio=fs.readFileSync(new URL('../src/components/Aniyah64TrackStudio.tsx',import.meta.url),'utf8')

for(const required of [
 'MAX_TRACKS=64',
 'ctx.decodeAudioData',
 'createBufferSource()',
 'createPanner()',
 "panner.panningModel='HRTF'",
 'createMediaStreamDestination()',
 'new MediaRecorder(',
 "navigator.mediaDevices.getUserMedia",
 "source.connect(printRef.current)",
 "micRef.current?.getTracks().forEach(t=>t.stop())",
 "URL.revokeObjectURL",
 'stopPlayback()',
 'disabled={!xrSupport.vr}',
 'disabled={!xrSupport.ar}',
 "xr.isSessionSupported('immersive-vr')",
 "xr.isSessionSupported('immersive-ar')",
 'await renderer.xr.setSession',
 "mode==='immersive-ar'?null",
 "audio stays on this device",
]){
 assert.ok(spatial.includes(required),'Spatial studio missing required safe/runtime path: '+required)
}
assert.ok(!spatial.includes('fetch('),'Local-first recorder must not silently upload audio')
assert.ok(!spatial.includes('audioWorklet.addModule'),'Spatial desk must not fetch unreviewed third-party audio code')
assert.match(studio,/const SpatialXRDAW=lazy\(\(\)=>import\('\.\/SpatialXRDAW'\)\)/,'Spatial engine must be loaded only when opened')
assert.match(studio,/type Mode='create'\|'engineer'\|'spatial'\|'earn'/,'Existing creation, DAW engineering and business views must remain available')
assert.match(studio,/mode==='spatial'&&/,'Aniyah studio must expose spatial desk')
assert.match(spatial,/<button[^>]+onClick=\{stopRecord\}>■ Stop recording/,'Stop recording must be a real user interaction')
assert.match(spatial,/if\(includeMic\)\{/,'Microphone capture must be explicitly opted in')
assert.match(spatial,/recordRef\.current\?\.stop\(\)/,'Recorder must stop on unmount')
console.log('ANIYAH SPATIAL XR DAW CONTRACT: PASS (source safety and integration; device/WebXR and audio playback require browser verification)')
