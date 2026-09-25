import assert from 'node:assert/strict'
import fs from 'node:fs'

const bridge=fs.readFileSync(new URL('../src/runtime/StreetVerseMissionLedgerBridge.ts',import.meta.url),'utf8')

assert.match(bridge,/function openMissionReel\(detail:MissionCompleteDetail\)/,'mission bridge must have an explicit Reel handoff')
assert.match(bridge,/tryamm:streetverse-reel-handoff/,'mission completion must emit Reel handoff evidence')
assert.match(bridge,/tryamm:open-reel-creator/,'mission completion must open the Reel creator')
assert.match(bridge,/verified:false,rewardStatus:'pending'/,'Reel creation must not pretend the reward is verified')
assert.match(bridge,/openMissionReel\(detail\)\s*\n\s*void settleMission\(detail\)/,'Reel must open before asynchronous reward settlement begins')
assert.match(bridge,/tryamm:streetverse-reel-reward-update/,'verified reward must update Reel context without reopening it')
assert.equal((bridge.match(/tryamm:open-reel-creator/g)||[]).length,1,'mission bridge must open the Reel creator exactly once per completion path')
assert.match(bridge,/\/api\/get-paid-to-play\/streetverse\/complete/,'server mission verification must remain intact')
assert.match(bridge,/\/api\/get-paid-to-play\/claim/,'server-authoritative reward claim must remain intact')
assert.match(bridge,/SIGN_IN_REQUIRED/,'reward verification must still report sign-in requirements independently')
assert.doesNotMatch(bridge,/awardCash|payableBalance\s*\+=|withdrawable\s*\+=|holoCredits\s*\+=/i,'Reel handoff must not mint money locally')

console.log('StreetVerse mission-to-Reel handoff contract: PASS')
