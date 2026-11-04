import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
const motion=get('src/runtime/StreetVerseTransitMotionAndMedia.ts')
const preview=get('src/components/StreetVerseTransitMotionPreview.tsx')
const lab=get('src/components/StreetVerseTransportScreenLab.tsx')
const world=get('src/components/StreetVerseMobileWorld.tsx')
const broadcast=get('src/runtime/TryammBroadcastOSRuntime.ts')
const radio=get('src/runtime/VerseRadioRuntime.ts')
const checks=[
 ['motion finite guards',motion.includes('Number.isFinite(elapsedSeconds)')&&motion.includes('Number.isFinite(speedMps)')],
 ['travel transforms computed',motion.includes('travelM:t*speed')],
 ['channel sources reuse Broadcast OS',motion.includes('TRYAMM_NETWORK_CHANNELS')],
 ['sponsor approval required',motion.includes('!ad?.approved||!ad.rightsCleared')],
 ['visible advertisement disclosure',motion.includes("label:'ADVERTISEMENT'")],
 ['motion preview frame loop',preview.includes('requestAnimationFrame(render)')],
 ['motion preview unmount cancels loop',preview.includes('cancelAnimationFrame(raf)')],
 ['animated passenger objects',preview.includes('for(let n=0;n<count;n++)')],
 ['transport studio mounts motion preview',lab.includes('<StreetVerseTransitMotionPreview')],
 ['existing radio open event',lab.includes('tryamm:verse-radio-open')&&radio.includes('tryamm:verse-radio-open')],
 ['existing broadcast query event',lab.includes('tryamm:broadcast-os-request')&&broadcast.includes('tryamm:broadcast-os-request')],
 ['no auto media play',!lab.includes('audio.play()')&&!lab.includes('video.play()')],
 ['in-game seated riders sway',world.includes('const inMotion=activeCar===car')&&world.includes('rider.rotation.z=(inMotion?')],
 ['existing head conversation retained',world.includes('head.rotation.y=Math.sin(now*.0011+phase)*.16')]
]
for(const [name,ok] of checks)assert.ok(ok,name)
console.log('StreetVerse motion, broadcast and approved advertising source contract: '+checks.length+' PASS; real media streaming/3D certification pending')
