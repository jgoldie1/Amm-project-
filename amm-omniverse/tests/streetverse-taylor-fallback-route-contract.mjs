import assert from 'node:assert/strict'
import fs from 'node:fs'
import {test} from 'node:test'

const source=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
test('safe recovery and normal world both offer Taylor/UIC travel',()=>{
 const safe=source.slice(source.indexOf('if(safe)return <>'),source.indexOf('if(safe)return <>')+3000)
 const normal=source.slice(source.indexOf('return <>',source.indexOf('if(safe)return <>')+20))
 for(const section of [safe,normal]){
  assert.match(section,/aria-label="Travel to Taylor Street UIC Medical District"/)
  assert.match(section,/tryamm:west-side-route-request/)
  assert.match(section,/missionId:'taylor-single-canvas'/)
 }
 assert.match(safe,/streetverse-safe-travel-shortcut/)
})
