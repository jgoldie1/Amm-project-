import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=p=>readFileSync(resolve(root,p),'utf8')
const building=read('src/game/runtime/StreetVerseBuildingReconstructionCompiler.ts')
const dock=read('src/components/StreetVerseCoreGameplayDock.tsx')
const world=read('src/components/StreetVerseMobileWorld.tsx')

assert.match(building,/export type Level=\{[^}]*heightM:number/, 'Level must declare validated heightM')
assert.match(building,/Number\.isFinite\(l\.heightM\)/, 'reject non-finite floor height')
assert.match(building,/l\.heightM<2\|\|l\.heightM>25/, 'reject invalid floor heights')
assert.match(dock,/const missionAction=\(\)=>\{[\s\S]*?tryamm:streetverse-first-journey-start/, 'MISSION button must dispatch first ride start')
assert.match(dock,/onClick=\{missionAction\}/, 'MISSION button must call first-ride-aware action')
assert.match(world,/addEventListener\('tryamm:streetverse-first-journey-start',onFirstJourneyStart\)/, 'world must listen to first-ride start')
assert.match(world,/firstJourneyActive=true/, 'first-ride listener must activate playable mission')
assert.match(world,/6-seat mission car/, 'repair prompt must match six-seat manifest')
console.log('Building height and first-journey regression contract PASS (source-level; TypeScript and gameplay still require CI)')
