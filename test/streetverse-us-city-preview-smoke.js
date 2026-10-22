'use strict';
const assert=require('node:assert/strict');
const {getExpansionDestinations,planFlight}=require('../lib/streetverse-global-expansion');
const {compileCityPreview}=require('../lib/streetverse-us-city-preview-compiler');
const cities=getExpansionDestinations();
assert.equal(cities.length,5);
for(const city of cities){
 assert.equal(city.registered,true,city.name+' must be in Earth registry');
 for(const district of city.starter){
  const a=compileCityPreview(city.id,district),b=compileCityPreview(city.id,district);
  assert.deepEqual(a,b,'Generation must be deterministic');
  assert(a.roads.length>0&&a.buildings.length>0&&a.trees.length>0);
  assert.equal(a.playable,false);
  assert.equal(a.live,false);
  assert.equal(a.certified,false);
 }
}
const flight=planFlight('us-il-chicago','us-ny-new-york-city');
assert.equal(flight.travelEnabled,false);
assert.throws(()=>planFlight('us-il-chicago','us-il-chicago'));
assert.throws(()=>compileCityPreview('us-ny-new-york-city','Unlisted district'));
console.log('US city preview registry, geometry and travel safety checks passed');
