import assert from 'node:assert/strict'
import fs from 'node:fs'
const root=new URL('../src/',import.meta.url)
const runtime=fs.readFileSync(new URL('runtime/StreetVerseHoloFonRuntime.ts',root),'utf8')
const hud=fs.readFileSync(new URL('components/StreetVerseHoloFonHUD.tsx',root),'utf8')
const world=fs.readFileSync(new URL('components/StreetVerseMobileWorld.tsx',root),'utf8')
for(const id of ['marcus','isaiah','kevon','teaasia','dispatch'])assert.match(runtime,new RegExp(id+':\\{name:'))
for(const action of ['dial','answer','reject','end','toggle-mute'])assert.ok(runtime.includes("'"+action+"'"))
assert.match(runtime,/state\.status==='idle'/)
assert.match(hud,/new AudioContext\(\)/)
assert.match(hud,/tryamm:streetverse-holofon-dialogue/)
assert.match(hud,/NPC script demo only/)
assert.match(world,/<StreetVerseHoloFonHUD\/>/)
console.log('Holo FON NPC call contract PASS')
