import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./character-lab.html',import.meta.url),'utf8');
const code=readFileSync(new URL('./character-lab.mjs',import.meta.url),'utf8');
for(const id of ['pad-left','pad-right','pad-forward','pad-back','camera-toggle','character','load','view','status'])assert.match(html,new RegExp('id="'+id+'"'));
for(const phrase of ['pointerdown','pointercancel','lostpointercapture','followCamera','camera.position.lerp','loadRecoveredCharacter'])assert.ok(code.includes(phrase),phrase);
console.log('Character Lab static accessibility and controller contract passed; browser interaction and GLB rendering not established');
