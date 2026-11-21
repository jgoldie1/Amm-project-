import assert from 'node:assert/strict'
import fs from 'node:fs'
const source=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoMotionAcceptance.ts',import.meta.url),'utf8')
for(const token of ['walk:','enter:','drive:','exit:','talk:','complete:','save:','reload:','record:'])assert.ok(source.includes(token),'Missing acceptance action '+token)
assert.match(source,/Out-of-order Chicago mission action/,'Missing action order guard')
assert.match(source,/Checkpoint restored without duplicate reward/,'Missing reload protection')
assert.match(source,/requiresDeviceVerification:true/,'Do not mislabel simulation as physical device test')
console.log('Chicago motion/vehicle/NPC/mission/save-reload recorder source contract PASS')
