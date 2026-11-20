import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=p=>readFileSync(new URL(p,import.meta.url),'utf8')
const cast=source('../src/runtime/StreetVerseRecoveredPlayableRuntime.ts')
const campus=source('../src/runtime/StreetVerseGreenvilleCampusBirthdayRuntime.ts')
const world=source('../src/components/StreetVerseMobileWorld.tsx')
test('LaTeasia remains faithful to the original Library model; no fabricated likeness paint',()=>{
 assert.doesNotMatch(cast,/function styleLaTeasiaDiagnostic/,'do not repaint the archived model')
 assert.doesNotMatch(cast,/temporaryDiagnosticPalette:true/,'no false styled-likeness flags')
 assert.match(cast,/diagnosticAppearance:id==='lateasia-monroe'/,'identify unfinished asset accurately')
})
test('Jacobie original GLB has bounded network and decode checks',()=>{
 assert.match(cast,/controller\.abort\(\),20000/)
 assert.match(cast,/GLB HTTP/)
 assert.match(cast,/GLB decode timeout after 20 seconds/)
 assert.match(cast,/window\.clearTimeout\(decodeTimer\)/,'successful model decodes must not report false timeouts')
 assert.match(world,/if\(eagerRecoveredId\)void loadRecoveredPlayable\(eagerRecoveredId\)/)
 assert.match(world,/scene\.add\(handle\.object\)/)
})
test('Greenville gets additional architectural and birthday graphics',()=>{
 for(const token of ['greenville-academic-bell-tower','greenville-student-union-plaza','greenville-football-upright','greenville-basketball-practice-pad','greenville-birthday-photo-wall','greenville-holoreel-light-tower'])assert.ok(campus.includes(token),token)
 assert.match(campus,/GREENVILLE_CAMPUS_ZONES\.forEach/)
})
