import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('gameplay shortcuts do not capture text inputs or modified shortcuts',()=>{
 assert.ok(source.includes("target?.closest('input,textarea,select,[contenteditable=\"true\"],[role=\"textbox\"]')"))
 for(const s of ['e.altKey','e.ctrlKey','e.metaKey'])assert.ok(source.includes(s),s)
 assert.ok(source.indexOf('target?.closest(')<source.indexOf('const raw=e.key.toLowerCase()'))
})
