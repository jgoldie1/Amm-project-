import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const mobile3d=read('../src/components/StreetVerseMobileWorld.tsx')
const discovery=read('../src/runtime/StreetVerseMissionDiscoveryRuntime.ts')
const ledger=read('../src/runtime/StreetVerseMissionLedgerBridge.ts')

assert.match(mobile3d,/reachedMissionCheckpoints\.size===missionDefs\.length/,'mobile 3D must detect 4/4 checkpoint completion')
assert.match(mobile3d,/id:'district-01-mobile-safe'/,'mobile 3D must emit the logical first-drop mission id used by server verification')
assert.match(mobile3d,/source:'streetverse-mobile-3d'/,'mobile 3D completion must identify its renderer source')
assert.match(mobile3d,/tryamm:streetverse-mission-complete/,'mobile 3D must emit the shared mission-complete event')
assert.match(mobile3d,/visited:\[\.\.\.reachedMissionCheckpoints\]/,'mobile 3D must provide completion evidence identifiers')

assert.match(discovery,/bridgeStreetVerseWorldCompletion/,'mission discovery must bridge world completion events')
assert.match(discovery,/tryamm:streetverse-mission-complete/,'mission discovery must listen for world mission completion')
assert.match(discovery,/discoverStreetVerseMission\(/,'world bridge must register narrative mission state when missing')
assert.match(discovery,/completeStreetVerseMission\(missionId/,'world bridge must finalize through the existing consequence runtime')
assert.match(discovery,/sourceEvent:'tryamm:streetverse-mission-complete'/,'narrative outcome must identify the world completion source event')
assert.match(discovery,/filter\(\(\[,route\]\)=>!route\.consumedAt\)/,'completion must be able to consume the latest unconsumed player route')
assert.match(discovery,/consumedAt:new Date\(\)\.toISOString\(\)/,'selected mission routes must be consumed by completion instead of leaking forever')

assert.match(ledger,/CLIENT_MISSION_ID='district-01-mobile-safe'/,'server reward bridge must recognize the same logical first-drop mission')
assert.match(ledger,/\/api\/get-paid-to-play\/streetverse\/complete/,'mission reward must still be verified by the server completion endpoint')
assert.match(ledger,/\/api\/get-paid-to-play\/claim/,'reward claim must remain server-authoritative')
assert.doesNotMatch(mobile3d,/awardCash|payableBalance|withdrawable|holoCredits\s*\+=/i,'mobile 3D completion must not mint money or credits locally')
assert.doesNotMatch(discovery,/awardCash|payableBalance|withdrawable|holoCredits\s*\+=/i,'narrative completion must not mint money or credits locally')

console.log('StreetVerse mobile mission completion bridge contract: PASS')
