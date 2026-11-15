import assert from 'node:assert/strict'
import fs from 'node:fs'
const hud=fs.readFileSync(new URL('../src/components/StreetVerseHoloDeliveryMissionHUD.tsx',import.meta.url),'utf8')
const ledger=fs.readFileSync(new URL('../src/runtime/StreetVerseShoppingLedger.ts',import.meta.url),'utf8')
assert.match(hud,/REPLAY CHICAGO DELIVERY/)
assert.match(hud,/mission\.stage==='complete'&&<button/)
assert.match(hud,/const replay=\(\)=>\{const \w+=initialHoloMission\(\)/)
assert.match(hud,/No second reward for this mission ID/)
assert.match(hud,/tryamm:streetverse-package-stage/)
assert.doesNotMatch(hud,/localStorage\.removeItem\(SHOPPING_SAVE_KEY\)/)
assert.match(ledger,/ledger\.completedMissionIds\.includes\(id\)/)
assert.match(ledger,/completedMissionIds:\[\.\.\.ledger\.completedMissionIds,id\]/)
console.log('Chicago delivery replay preserves ledger and duplicate mission reward guard PASS')
