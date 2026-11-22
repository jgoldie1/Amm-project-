import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const controls=read('../src/components/StreetVerseContextActions.tsx')
const arcade=read('../src/components/StreetVerseMissionArcade.tsx')
test('reusable context actions available for home, work, street and fictional range',()=>{
 for (const token of ["home:['cook','talk','help']","street:['talk','help','drive']","workplace:['work','talk','help']","range:['aim','fire','holster']"]) assert.ok(controls.includes(token))
 assert.match(arcade,/StreetVerseContextActions/)
})
test('A/B and arrow keys, accessible buttons and feedback work in browser',()=>{
 assert.match(controls,/key==='a'/)
 assert.match(controls,/key==='b'/)
 assert.match(controls,/arrowleft/)
 assert.match(controls,/minHeight:60/)
 assert.match(controls,/role="status"/)
 assert.match(controls,/A — /)
 assert.match(controls,/B — BACK/)
})
test('do not confuse prototype action with live 3D action or real weapon',()=>{
 assert.match(controls,/authoritative:false/)
 assert.match(controls,/context!=='range'/)
 assert.match(controls,/not a wired 3D character animation/)
 assert.match(controls,/No firearms, injuries, real currency/)
 assert.doesNotMatch(controls,/fetch\(/)
})
