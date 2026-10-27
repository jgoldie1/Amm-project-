import assert from 'node:assert/strict'
import fs from 'node:fs'
import {test} from 'node:test'

const source=fs.readFileSync(new URL('../src/game/runtime/StreetVerseBuildingReconstructionCompiler.ts',import.meta.url),'utf8')
test('Level declares the heightM property that runtime validates',()=>{
 assert.match(source,/export type Level=\{[^}]*heightM:number;/)
 assert.match(source,/Number\.isFinite\(l\.heightM\)/)
 assert.match(source,/l\.heightM<2\|\|l\.heightM>25/)
})
