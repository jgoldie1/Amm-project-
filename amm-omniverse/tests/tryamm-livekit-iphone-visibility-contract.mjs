import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const ui=read('src/components/LiveCenter.tsx'),pkg=JSON.parse(read('package.json'))
for(const fragment of ['tryamm-live-grid','tryamm-live-stage','@media(max-width:700px)','safe-area-inset-top','min-height:44px','playsInline=true','RoomEvent.Disconnected','room.startAudio()','TAP TO ENABLE LIVE AUDIO','setAudioNeedsTap(false)','LIVE credentials detected'])assert(ui.includes(fragment),fragment)
assert(ui.includes('if(roomRef.current!==room)return'),'ignore explicit leave/stale disconnect events')
assert(ui.includes('role===\\'viewer\\''),'audio unlock applies to viewers only')
assert(pkg.scripts.build.includes('tryamm-livekit-iphone-visibility-contract.mjs'))
console.log('TRYAMM LIVE IPHONE PASS: responsive stage, 44px controls, Safari sound permission and mobile disconnect cleanup')
