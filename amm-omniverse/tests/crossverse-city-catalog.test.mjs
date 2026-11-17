import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CROSSVERSE_CITIES,resolveCrossVerseDestination,validateCrossVerseCatalog} from '../src/data/crossverseCityCatalog.mjs';
test('Catalog has unique names and honest deployment readiness',()=>{
  assert.deepEqual(validateCrossVerseCatalog(),[]);
  assert.ok(CROSSVERSE_CITIES.length>=10);
  assert.equal(new Set(CROSSVERSE_CITIES.map(x=>x.id)).size,CROSSVERSE_CITIES.length);
  assert.deepEqual(CROSSVERSE_CITIES.filter(x=>x.state==='playable-code').map(x=>x.id),['chicago']);
});
test('Preview cities never trigger a fake landing',()=>{
  for(const city of CROSSVERSE_CITIES.filter(x=>x.state==='preview')){
    const resolved=resolveCrossVerseDestination(city.id);
    assert.equal(resolved.ok,false);
    assert.equal(resolved.reason,'preview-only');
  }
  assert.equal(resolveCrossVerseDestination('chicago').city.landingId,'circle-park-abla');
  assert.equal(resolveCrossVerseDestination('unknown').ok,false);
});
test('Catalog refuses duplicate IDs and unverified playable entries',()=>{
  assert.ok(validateCrossVerseCatalog([...CROSSVERSE_CITIES,CROSSVERSE_CITIES[0]]).length>0);
  assert.ok(validateCrossVerseCatalog([{id:'new-york',state:'playable-code',landingId:'fake'}]).length>0);
});
