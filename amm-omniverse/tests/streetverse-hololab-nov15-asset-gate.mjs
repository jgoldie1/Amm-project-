import fs from 'node:fs'
import assert from 'node:assert/strict'
const root=new URL('../',import.meta.url)
const collision=fs.readFileSync(new URL('src/runtime/StreetVerseHoloLabCollision.ts',root),'utf8')
const preview=fs.readFileSync(new URL('src/components/StreetVerseHoloLab3DPreview.tsx',root),'utf8')
const audit=JSON.parse(fs.readFileSync(new URL('assets/hololab-nov15-asset-audit.json',root),'utf8'))
assert.match(collision,/canOccupyHoloLab/,'Collision check missing')
assert.match(collision,/advanceHoloLabCharacter/,'Collision-aware movement missing')
assert.match(preview,/advanceHoloLabCharacter/,'3D preview must use collision-aware movement')
assert.equal(audit.assets[0].joints,17)
assert.equal(audit.assets[0].clips,8)
assert.ok(audit.requiredAcceptance.includes('Chromebook browser acceptance'))
assert.match(audit.releasePolicy,/No commercial gameplay release/,'Missing release safety gate')
console.log('HoloLab November 15 asset and collision integration contract PASS')
