import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {transformSync} from 'esbuild'
import {runInNewContext} from 'node:vm'

const world=readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const init=world.slice(world.indexOf('  const positionKey='),world.indexOf('scene.add(avatar);',world.indexOf('  const positionKey=')))
assert.ok(init.includes('function savePosition'))
const code=transformSync(init,{loader:'ts'}).code
test('save and resume at Student Union without moving the Chicago save',()=>{
 const data=new Map(),localStorage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}
 function boot(campus,search){
  const position={set(x,y,z){Object.assign(this,{x,y,z})}}
  const context={avatar:{position},localStorage,greenvilleBirthdayMode:campus,window:{location:{search}},URLSearchParams,
   SAVE_KEY:'chicago',CIRCLE_PARK_SPAWN:{x:1,z:2},GREENVILLE_CAMPUS_ZONES:[{x:0,z:58}],
   entrances:{greenville:{x:18,z:2.8}},canTraverse:()=>true,
   CIRCLE_PARK_RESIDENT_ENTRANCE:{anchors:{publicApproach:{position:[-38,0,31]}}}}
  runInNewContext(code,context)
  return {position,save:context.savePosition}
 }
 const chicago=boot(false,'?visit=laflin');assert.equal(chicago.position.x,-38);assert.equal(chicago.save(false),true)
 const campus=boot(true,'');assert.equal(campus.position.z,58)
 campus.position.set(18,0,2.8);assert.equal(campus.save(false),true)
 const resumed=boot(true,'?resume=1');assert.equal(resumed.position.x,18);assert.equal(resumed.position.z,2.8)
 assert.equal(boot(false,'').position.z,31)
})
