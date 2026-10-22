'use strict';
const assert=require('node:assert/strict');
const {buildPrototypeDistrict}=require('../lib/san-diego-prototype-geometry');
for(const id of ['downtown','serra-mesa']){
 const a=buildPrototypeDistrict(id),b=buildPrototypeDistrict(id);
 assert.deepEqual(a,b,'Prototype generation must be deterministic');
 assert(a.roads.length>0&&a.buildings.length>0&&a.trees.length>0);
 assert.equal(a.live,false);assert.equal(a.certified,false);
 assert(a.buildings.every(x=>x.licensedFootprint===false));
}
assert.throws(()=>buildPrototypeDistrict('gaslamp'));
console.log('Downtown and Serra Mesa placeholder geometry checks passed');
