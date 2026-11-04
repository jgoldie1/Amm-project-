import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../public/chromebook-streetverse-pilot.html',import.meta.url),'utf8');
for(const name of ['id="map"','function interact()','Taylor Street','Demo Store','Cost Guardian','localStorage','streetverse-circle-park-layout.json','No real payments']){
  assert.ok(html.includes(name),'Missing starter feature: '+name);
}
assert.ok(!html.includes('<script src='),'Prototype must remain zero-install and self-contained');
console.log('StreetVerse Chromebook prototype source contract: PASS');
