import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
test('Quantum Beat has start, stop and cleanup',()=>{
 const src=read('../src/game/audio/StreetVerseQuantumBeat.ts');
 for(const term of ['async start(', 'stop(){', 'async dispose()', 'clearInterval'])assert.ok(src.includes(term),term);
});
test('SFX supports mission sounds and user activation',()=>{
 const src=read('../src/game/audio/StreetVerseSpatialSfx.ts');
 for(const term of ['async unlock()', "'footstep'", "'door'", "'elevator'", "'repair'", "'mission'", 'setMuted('])assert.ok(src.includes(term),term);
});
test('Circle Park connects audio controls',()=>{
 const src=read('../src/components/StreetVerseCircleParkPrototype.tsx');
 assert.match(src,/Quantum Beat/);assert.match(src,/Sound effects/);
 assert.match(src,/sfx\.current\?\.play/);
});
