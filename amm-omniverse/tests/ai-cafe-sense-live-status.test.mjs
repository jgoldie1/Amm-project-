import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
const out=await build({entryPoints:[new URL('../src/runtime/AICafeSenseLiveStatusRuntime.ts',import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
const m=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))
const cafe=fs.readFileSync(new URL('../src/components/AICafeRestaurant.tsx',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/AICafeSenseLivePanel.tsx',import.meta.url),'utf8')
test('AI Café mounts truthful sensory and livestream panel',()=>{
 assert.match(cafe,/AICafeSenseLivePanel/)
 assert.match(ui,/\/api\/live\/status/)
 assert.match(ui,/NOT VERIFIED/)
 assert.match(ui,/CHECK LIVE CONNECTIONS/)
})
test('all five channels exist, while scent and flavor stay software-only',()=>{
 const r=m.evaluateCafeSenseLiveStatus({hasCanvas:true,hasAudio:true,hasVibration:false})
 assert.equal(r.fiveSenses.visual,'device-supported')
 assert.equal(r.fiveSenses.audio,'device-supported')
 assert.equal(r.fiveSenses.haptic,'not-supported')
 assert.equal(r.fiveSenses.smell,'software-simulated')
 assert.equal(r.fiveSenses.taste,'software-simulated')
 assert.equal(r.fiveSenses.physicalSmellTaste,false)
 assert.equal(m.cafeFoodSenseExample().physicalOutput,false)
})
test('LiveKit and TikTok/BIGO do not misstate connected sessions',()=>{
 const missing=m.evaluateCafeSenseLiveStatus({hasCanvas:true,hasAudio:true,hasVibration:true,liveStatus:{configured:false}})
 assert.equal(missing.livekit.status,'unconfigured')
 assert.equal(missing.destinations.find(d=>d.platform==='tiktok').verifiedBroadcast,false)
 assert.equal(missing.destinations.find(d=>d.platform==='bigo').connected,false)
 const configured=m.evaluateCafeSenseLiveStatus({hasCanvas:true,hasAudio:true,hasVibration:true,liveStatus:{configured:true}})
 assert.equal(configured.livekit.status,'configured')
 assert.equal(configured.livekit.twoDeviceVerified,false)
 assert.equal(configured.destinations.find(d=>d.platform==='tryamm').verifiedBroadcast,false)
 assert.equal(m.AI_CAFE_SENSE_LIVE_POLICY.realBroadcastClaimWithoutProof,false)
})
