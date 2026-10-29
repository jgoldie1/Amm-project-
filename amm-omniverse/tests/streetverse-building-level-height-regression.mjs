import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const source=readFileSync(new URL('../src/game/runtime/StreetVerseBuildingReconstructionCompiler.ts',import.meta.url),'utf8')
assert.match(source,/export type Level\s*=\s*\{[^}]*heightM\s*:\s*number/, 'Level must declare required heightM to match runtime geometry validation')
assert.match(source,/Number\.isFinite\(l\.heightM\)/, 'Reject missing or nonfinite level height')
assert.match(source,/l\.heightM\s*<\s*2/, 'Preserve minimum floor height check')
assert.match(source,/l\.heightM\s*>\s*25/, 'Preserve maximum floor height check')
assert.match(source,/playable:false/, 'Do not silently activate unreleased building reconstruction gameplay')
console.log('StreetVerse building level height regression contract: PASS')
