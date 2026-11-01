import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/game/assets/StreetVerseRecoveredNpcRegistry.ts',import.meta.url),'utf8');
test('all 12 recovered NPC assets have unique Drive pointers and SHA-256 hashes',()=>{
 const entries=[...source.matchAll(/\['(adult-man|adult-woman|youngadult-man|youngadult-woman)','(base|walk|run)','([^']+)',(\d+),'([a-f0-9]{64})','([^']+)'\]/g)];
 assert.equal(entries.length,12);
 assert.equal(new Set(entries.map(e=>e[3])).size,12);
 assert.equal(new Set(entries.map(e=>e[6])).size,12);
 assert.equal(entries.reduce((sum,e)=>sum+Number(e[4]),0),150635616);
 for(const variant of ['adult-man','adult-woman','youngadult-man','youngadult-woman'])
  assert.deepEqual(entries.filter(e=>e[1]===variant).map(e=>e[2]).sort(),['base','run','walk']);
});
