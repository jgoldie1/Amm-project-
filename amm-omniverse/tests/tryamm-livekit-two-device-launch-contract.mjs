import assert from 'node:assert/strict'
import fs from 'node:fs'
const get=x=>fs.readFileSync(new URL('../'+x,import.meta.url),'utf8')
const panel=get('api/live/panel.js'),token=get('api/live/token.js'),api=get('src/services/live.ts'),app=get('src/components/LiveCenter.tsx')
const pkg=JSON.parse(get('package.json'))
for(const s of ["status:'planned',max_panelists:maxPanel","action==='start_room'||action==='end_room'","status:'live',started_at:now","status:'ended',ended_at:now","if(current.host_user_id!==user.id)","current.max_panelists"])assert(panel.includes(s),s)
assert(!panel.includes("stage_mode:'talk'"),'unrecognized column must not break room creation')
assert(!panel.includes("body:{stage_mode:mode,stage_payload:media"),'unrecognized stage columns must not cause an invalid write')
assert(panel.includes('res.status(501)'), 'missing stage schema needs clear error')
assert(token.includes("if(role==='viewer'&&ownedRoom.status!=='live')"))
assert(token.includes("if(role==='host'&&ownedRoom.host_user_id!==user.id"))
assert(api.includes('setLiveHostRoomState'))
assert(pkg.scripts.build.includes('tryamm-livekit-two-device-launch-contract.mjs'))
console.log('TRYAMM LIVE two-device lifecycle contract PASS: planned->live->ended, host ownership, schema-safe room creation')
