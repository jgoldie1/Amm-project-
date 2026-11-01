import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

// Regression guard for the TS2339 heightM build failure in the
// StreetVerse building reconstruction compiler.
const source=readFileSync(new URL('../src/game/runtime/StreetVerseBuildingReconstructionCompiler.ts',import.meta.url),'utf8')
assert.match(source,/export type Level=\{[^\n]*heightM:number;/,'Every level must declare its required heightM field')
assert.match(source,/Number\.isFinite\(l\.heightM\)/,'Level height must be validated before geometry generation')
assert.match(source,/l\.heightM<2\|\|l\.heightM>25/,'Level height bounds must remain enforced')
console.log('Building level height TS2339 regression guard: PASS')
