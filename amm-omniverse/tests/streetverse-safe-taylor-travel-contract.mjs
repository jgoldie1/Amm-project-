import assert from 'node:assert/strict'
import fs from 'node:fs'
import {test} from 'node:test'
const source=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
test('both safe and normal StreetVerse expose the Taylor travel button',()=>{
 const split=source.indexOf('if(safe)return <>')
 const normal=source.indexOf(' return <>',split+12)
 assert.ok(split>=0&&normal>split)
 const safeSection=source.slice(split,normal)
 const regularSection=source.slice(normal)
 for(const section of [safeSection,regularSection]){
  assert.match(section,/aria-label="Travel to Taylor Street UIC Medical District"/)
  assert.match(section,/tryamm:west-side-route-request/)
 }
})
