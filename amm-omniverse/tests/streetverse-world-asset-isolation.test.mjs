import test from 'node:test'
import assert from 'node:assert/strict'
import {nativePlacementsForWorld} from '../src/runtime/StreetVerseWorldAssetIsolation.js'

test('Greenville accepts only scoped lightweight entrance assets',()=>{
 const chicago=[{asset:'building',label:'chicago-building',position:[0,0,0]}]
 const requested=[
  {asset:'bench',label:'greenville-entrance-bench',position:[1,0,1]},
  {asset:'streetLamp',label:'greenville-entrance-lamp',position:[2,0,1]},
  {asset:'building',label:'greenville-building',position:[3,0,1]},
  {asset:'tree',label:'chicago-tree',position:[4,0,1]},
 ]
 assert.deepEqual(nativePlacementsForWorld(true,requested,chicago).map(x=>x.label),[
  'greenville-entrance-bench','greenville-entrance-lamp',
 ])
 assert.equal(nativePlacementsForWorld(false,requested,chicago),chicago)
})
