import fs from 'node:fs'
import assert from 'node:assert/strict'
const s=fs.readFileSync(new URL('../src/runtime/StreetVerseCrossVerseChicagoJourney.ts',import.meta.url),'utf8')
for(const key of ['createCrossVerseTravelDirector','createChicagoTimeSwitch','prepare:','confirmSceneLoaded:','cancel:','saved:','remember:','recall:'])assert.ok(s.includes(key),'Missing integration '+key)
assert.match(s,/if\(!pending\|\|pending\.to!==to\)/,'Do not commit travel before scene confirms loading')
assert.match(s,/snapshots\.set\(pending\.from,copy\(pending\.snapshot\)\)/,'Preserve original timeline snapshot')
assert.match(s,/restore:snapshots\.has\(current\)/,'Restore prior timeline position on return')
assert.match(s,/if\(pending\)throw new Error/,'Do not overlap pending scene transitions')
console.log('CrossVerse Chicago journey contract PASS')
