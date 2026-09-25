import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const runtime=read('../src/runtime/StreetVerseMissionDiscoveryRuntime.ts')
const shell=read('../src/components/StreetVerseMobileGameShell.tsx')\nconst fame=read('../src/runtime/StreetVerseFameRuntime.ts')\nconst entry=read('../src/components/StreetVerseGeoSpawnBridge.tsx')

assert.match(runtime,/MissionRouteChoice = 'A' \| 'B' \| 'C'/,'runtime must own A/B/C route choices')
assert.match(runtime,/A:\['story','racing','drift','motorcycle','exploration'\]/,'A must prefer action-oriented follow-up missions')
assert.match(runtime,/B:\['business','delivery','crew','relationship','story'\]/,'B must prefer build/business follow-up missions')
assert.match(runtime,/C:\['puzzle','exploration','reality-quest','cross-verse','story'\]/,'C must prefer learning/investigation follow-up missions')
assert.match(runtime,/tryamm\.streetverse\.mission-routes\.v1/,'route selections must persist locally')
assert.match(runtime,/type:'mission-route-choice'/,'route selection must be written to world memory')
assert.match(runtime,/tryamm:mission:route-active/,'runtime must publish active route state')
assert.match(runtime,/reason:'player-route-choice'/,'route selection must immediately influence mission recommendation')
assert.match(runtime,/missionRoute=route\?/,'mission completion must resolve the selected player route')
assert.match(runtime,/outcome:resolvedOutcome/,'mission consequences must include route-aware outcome data')
assert.match(runtime,/reason:route\?'completed-player-route':'mission-complete'/,'completed route must affect next-candidate reasoning')
assert.match(runtime,/tryamm:streetverse-mission-route-selected/,'runtime must consume the mobile shell route event')
assert.match(runtime,/__streetVerseMissionDiscoveryRuntimeInstalled/,'runtime installer must avoid duplicate global listeners')\nassert.match(shell,/MissionChoice='A'\\|'B'\\|'C'\\|'D'/,'mobile shell must understand the D route')\nassert.match(shell,/choice!=='D'\\|\\|Boolean\\(choicePrompt\\.specialRoute\\|\\|choicePrompt\\.routes\\?\\.D\\)/,'D must stay hidden until the mission context unlocks it')\nassert.match(shell,/EARNED • CONTEXTUAL/,'mobile shell must identify D as earned/contextual rather than permanent')

for(const eventName of [
 'tryamm:streetverse-checkpoint',
 'tryamm:streetverse-mobile-mission-zone',
 'tryamm:mission:discovered',
 'tryamm:justice-mission-start',
 'tryamm:time-machine-enter',
]){
 assert.ok(shell.includes(eventName),`mobile shell must learn active mission context from ${eventName}`)
}

assert.match(fame,/Unknown'\\|'Local Buzz'\\|'Rising Talent'\\|'City Star'\\|'National Star'\\|'Global Star'\\|'Icon'\\|'Legend'/,'fame must preserve the full Unknown-to-Legend progression')
assert.match(fame,/fanbase:number/,'fame must persist fanbase progression')
assert.match(fame,/viralScore:number/,'fame must persist viral score')
assert.match(fame,/momentum:number/,'fame must persist career momentum')
assert.match(fame,/relationships:number/,'fame must persist relationship progression')
assert.match(fame,/tryamm:streetverse-fame-world-reaction/,'fame must publish visible world-reaction effects')
assert.match(fame,/tryamm:streetverse-reel-published/,'published Reels must feed fame progression')
assert.match(fame,/CALL YOUR PRODUCER CONNECTION/,'star relationships must be able to unlock the contextual D producer route')
assert.match(fame,/USE YOUR BUZZ/,'creator fame must be able to unlock a contextual D fame route')
assert.match(entry,/installStreetVerseFameRuntime/,'canonical StreetVerse entry must install the fame runtime')
assert.match(shell,/FAME • \{fame\.rank\.toUpperCase\(\)\}/,'mobile alpha must visibly show the current fame rank')
assert.doesNotMatch(fame,/awardCash|withdrawable|payableBalance|stripe/i,'fame progression must not create client-side financial authority')

assert.doesNotMatch(runtime,/awardCash|withdrawable|payableBalance|stripe/i,'mission route choice must not create client-side financial authority')
console.log('StreetVerse mission route consequences contract: PASS')
