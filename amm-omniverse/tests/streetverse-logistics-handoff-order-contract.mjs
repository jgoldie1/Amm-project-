import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const s=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('StreetVerse announces logistics handoff before navigating away',()=>{
 const start=s.indexOf('const openLogistics=()=>')
 const end=s.indexOf('\n\n return <div',start)
 assert.ok(start>=0&&end>start)
 const body=s.slice(start,end)
 assert.ok(body.includes("tryamm:streetverse-logistics-open"))
 assert.ok(body.indexOf("tryamm:streetverse-logistics-open")<body.indexOf("window.location.assign('/logistics-freight')"))
 assert.ok(body.includes("typeof show==='function'"))
})
