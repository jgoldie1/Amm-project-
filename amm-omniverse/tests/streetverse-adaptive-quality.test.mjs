import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/game/graphics/StreetVerseAdaptiveQuality.ts',import.meta.url),'utf8');
test('adaptive graphics source includes downgrade, upgrade and hysteresis',()=>{
 for(const term of ['slowFrames>=45','fastFrames>=480','cooldown:240','cooldown:480',"'mobile','balanced','cinematic'"])assert.ok(source.includes(term),term);
});
test('Circle Park uses the shared graphics quality module',()=>{
 const scene=readFileSync(new URL('../src/components/CirclePark3DScene.tsx',import.meta.url),'utf8');
 assert.ok(scene.includes('configureStreetVerseRenderer'));
 assert.ok(scene.includes('upgradeStreetVerseMaterials'));
});
