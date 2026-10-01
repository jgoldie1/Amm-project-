import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const r=fs.readFileSync(new URL('../src/runtime/StreetVerseReelCaptureRuntime.ts',import.meta.url),'utf8')
const u=fs.readFileSync(new URL('../src/components/StreetVerseReelCaptureOverlay.tsx',import.meta.url),'utf8')
for(const x of ['StreetVerseReelCaptureOverlay','installStreetVerseReelCapture(renderer.domElement)','reelCapture.dispose()','reelCanvasCapture:true','reelMomentMarkers:true'])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['captureStream(24)','MediaRecorder','tryamm:reel-marker-recorded','30_000','video/mp4'])if(!r.includes(x))throw new Error('missing '+x)
for(const x of ['● REEL CAPTURE','■ STOP REEL','REEL READY','SHARE / SAVE','playsInline'])if(!u.includes(x))throw new Error('missing '+x)
console.log('StreetVerse Reel capture contract: PASS')
