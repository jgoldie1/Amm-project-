import fs from 'node:fs'
import assert from 'node:assert/strict'
const source=fs.readFileSync(new URL('../src/runtime/StreetVerseMyceliumTimelineRuntime.ts',import.meta.url),'utf8')
for(const token of ['createMyceliumTimeline','fork:','travel:','record:','history:','parentId','originAt','pocket-dimension','chronoverse','multiverse'])assert.ok(source.includes(token),'Missing timeline contract '+token)
assert.match(source,/if\(!id\|\|branches\.has\(id\)\)/,'Timeline IDs must not be reused')
assert.match(source,/branch\.events\.some\(e=>e\.id===event\.id\)/,'Events must be idempotent')
assert.match(source,/filter\(e=>e\.at<=branch\.originAt\)/,'Fork must not inherit future events')
console.log('StreetVerse mycelium timeline source contract PASS')
