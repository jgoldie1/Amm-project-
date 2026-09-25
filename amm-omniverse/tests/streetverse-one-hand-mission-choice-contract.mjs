import assert from 'node:assert/strict'
import fs from 'node:fs'

const shell=fs.readFileSync(new URL('../src/components/StreetVerseMobileGameShell.tsx',import.meta.url),'utf8')

assert.match(shell,/HAND_KEY='tryamm:streetverse-one-hand-side'/,'one-hand side must persist')
assert.match(shell,/data-one-hand-side=\{hand\}/,'mobile shell must expose its active hand side')
assert.match(shell,/LEFT|left/,'left-hand controls must be supported')
assert.match(shell,/RIGHT|right/,'right-hand controls must be supported')
assert.match(shell,/StreetVerse mission choices/,'one-hand shell must expose a mission-choice control')
for(const choice of ['A','B','C']) assert.ok(shell.includes(`${choice}:{label:`),`mission choice ${choice} must exist`)
assert.match(shell,/tryamm:streetverse-mission-start/,'shell must bind choices to the active StreetVerse mission')
assert.match(shell,/tryamm:chicago-activity-start/,'shell must bind choices to Chicago activity missions')
assert.match(shell,/tryamm:streetverse-mission-route-selected/,'selected routes must emit a gameplay event')
assert.match(shell,/tryamm:rp-choice-selected/,'legacy RP choice consumers must remain compatible')
assert.doesNotMatch(shell,/awardCash|payableBalance|realMoney/i,'client mission choices must not award real money')

console.log('StreetVerse one-hand mission-choice contract: PASS')
