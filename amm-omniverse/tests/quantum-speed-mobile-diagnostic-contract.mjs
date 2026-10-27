import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const runtime=readFileSync(new URL('../src/runtime/StreetVerseQuantumSpeedDiagnostics.ts',import.meta.url),'utf8')
const scene=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('Quantum Speed samples only bounded local animation frames',()=>{
 for(const token of ['summarizeFrameTimes','sampleLocalFrameRate','Math.min(30','requestAnimationFrame','noCloudRequests:true','noAutomaticProfiling:true'])assert.ok(runtime.includes(token),token)
 assert.doesNotMatch(runtime,/\bfetch\s*\(|sendBeacon\s*\(/)
})
test('diagnose button presents sampled FPS without upload',()=>{
 for(const token of ['await sampleLocalFrameRate()','Quantum Speed frame sample','frame?:{status:string;fps:number|null;sampleCount:number}','LOCAL DIAGNOSTIC • NOT UPLOADED'])assert.ok(scene.includes(token),token)
})
