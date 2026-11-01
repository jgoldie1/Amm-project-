import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../src/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
test('BJ loader uses approved same-origin GLB and exposes skeleton warnings',()=>{
 const code=read('components/StreetVerseBJAvatarLoader.ts');
 assert.match(code,/parsed\.origin!==window\.location\.origin/);
 assert.match(code,/inspectLoadedAvatar\(root,gltf\.animations\)/);
 assert.match(code,/No recognized walk clip/);
});
test('Circle Park uses zone-aware movement and mission interactions',()=>{
 const scene=read('components/CirclePark3DScene.tsx');
 const mission=read('components/StreetVerseCircleParkPrototype.tsx');
 assert.match(scene,/moveWithWalls\(position\.current/);
 assert.match(scene,/interactionAllowed\(zone,'enter'/);
 assert.match(scene,/interactionAllowed\(zone,'elevator'/);
 assert.match(scene,/interactionAllowed\(zone,'repair'/);
 assert.match(mission,/zone=\{zone\}/);
});
test('Googolplex client events are unverified until confirmed server-side',()=>{
 const memory=read('game/memory/StreetVerseGoogolplexMemory.ts');
 assert.match(memory,/confirmed:false/);
 assert.match(read('components/StreetVerseCircleParkPrototype.tsx'),/rememberedGreeting/);
});
