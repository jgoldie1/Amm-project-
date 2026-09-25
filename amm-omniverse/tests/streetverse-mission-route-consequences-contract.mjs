import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const runtime=read('../src/runtime/StreetVerseMissionDiscoveryRuntime.ts')
const shell=read('../src/components/StreetVerseMobileGameShell.tsx')
const fame=read('../src/runtime/StreetVerseFameRuntime.ts')
const entry=read('../src/components/StreetVerseGeoSpawnBridge.tsx')

assert.match(runtime,/MissionRouteChoice = 'A' \| 'B' \| 'C' \| 'D'/,'runtime must own A/B/C plus contextual D route choices')
assert.match(runtime,/A:\['story','racing','drift','motorcycle','exploration'\]/,'A must prefer action-oriented follow-up missions')
assert.match(runtime,/B:\['business','delivery','crew','relationship','story'\]/,'B must prefer build/business follow-up missions')
assert.match(runtime,/C:\['puzzle','exploration','reality-quest','cross-verse','story'\]/,'C must prefer learning/investigation follow-up missions')
assert.match(runtime,/D:\['relationship','business','cross-verse','reality-quest','story'\]/,'D must support earned contextual follow-up routes')
assert.match(runtime,/MissionSpecialUnlockKind='skill'\|'relationship'\|'item'\|'business'\|'education'\|'reputation'\|'faith'\|'information'\|'fame'/,'D unlock sources must preserve the expanded earned-context model')
assert.match(runtime,/special-route-not-unlocked/,'D must fail closed until it has been earned')
assert.match(runtime,/tryamm:mission:special-route-unlocked/,'runtime must publish contextual D unlocks')
assert.match(runtime,/tryamm\.streetverse\.mission-routes\.v1/,'route selections must persist locally')
assert.match(runtime,/type:'mission-route-choice'/,'route selection must be written to world memory')
assert.match(runtime,/tryamm:mission:route-active/,'runtime must publish active route state')
assert.match(runtime,/reason:'player-route-choice'/,'route selection must immediately influence mission recommendation')
assert.match(runtime,/missionRoute=route\?/,'mission completion must resolve the selected player route')
assert.match(runtime,/outcome:resolvedOutcome/,'mission consequences must include route-aware outcome data')
assert.match(runtime,/reason:route\?'completed-player-route':'mission-complete'/,'completed route must affect next-candidate reasoning')
assert.match(runtime,/tryamm:streetverse-mission-route-selected/,'runtime must consume the mobile shell route event')
assert.match(runtime,/tryamm:streetverse-special-route-unlock/,'runtime must consume contextual D unlock events')
assert.match(runtime,/__streetVerseMissionDiscoveryRuntimeInstalled/,'runtime installer must avoid duplicate global listeners')

assert.ok(shell.includes("MissionChoice='A'|'B'|'C'|'D'"),'mobile shell must understand the D route')
assert.ok(shell.includes("choice!=='D'||Boolean(choicePrompt.specialRoute||choicePrompt.routes?.D)"),'D must stay hidden until mission context unlocks it')
assert.ok(shell.includes('EARNED • CONTEXTUAL'),'mobile shell must identify D as earned/contextual rather than permanent')
assert.ok(shell.includes('FAME • {fame.rank.toUpperCase()}'),'mobile alpha must visibly show the current Fame rank')
assert.ok(shell.includes('tryamm:streetverse-fame-state'),'mobile alpha must consume Fame state changes')

for(const eventName of [
 'tryamm:streetverse-checkpoint',
 'tryamm:streetverse-mobile-mission-zone',
 'tryamm:mission:discovered',
 'tryamm:justice-mission-start',
 'tryamm:time-machine-enter',
]){
 assert.ok(shell.includes(eventName),`mobile shell must learn active mission context from ${eventName}`)
}

assert.match(fame,/Unknown'\|'Local Buzz'\|'Rising Talent'\|'City Star'\|'National Star'\|'Global Star'\|'Icon'\|'Legend'/,'fame must preserve the full Unknown-to-Legend progression')
assert.match(fame,/fanbase:number/,'fame must persist fanbase progression')
assert.match(fame,/viralScore:number/,'fame must persist viral score')
assert.match(fame,/momentum:number/,'fame must persist career momentum')
assert.match(fame,/relationships:number/,'fame must persist relationship progression')
assert.match(fame,/tryamm:streetverse-fame-world-reaction/,'fame must publish visible world-reaction effects')
assert.match(fame,/tryamm:streetverse-reel-published/,'published Reels must feed fame progression')
assert.match(fame,/CALL YOUR PRODUCER CONNECTION/,'star relationships must be able to unlock the contextual D producer route')
assert.match(fame,/USE YOUR BUZZ/,'creator fame must be able to unlock a contextual D fame route')
assert.match(entry,/installStreetVerseMissionDiscoveryRuntime/,'canonical StreetVerse entry must install the mission-choice runtime')
assert.match(entry,/installStreetVerseFameRuntime/,'canonical StreetVerse entry must install the fame runtime')

assert.doesNotMatch(fame,/awardCash|withdrawable|payableBalance|stripe/i,'fame progression must not create client-side financial authority')
assert.doesNotMatch(runtime,/awardCash|withdrawable|payableBalance|stripe/i,'mission route choice must not create client-side financial authority')

console.log('StreetVerse A/B/C/D + Fame progression contract: PASS')
