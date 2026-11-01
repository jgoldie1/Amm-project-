import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/components/StreetVerseRecoveredNpcPreview.tsx',import.meta.url),'utf8');
test('recovered NPC viewer is local-file only and does not upload',()=>{
 for(const required of ['type="file"','URL.createObjectURL(file)','GLTFLoader','AnimationMixer','URL.revokeObjectURL(url)','renderer.dispose()','role="status"'])assert.ok(source.includes(required),required);
 assert.equal(/fetch\(|XMLHttpRequest|axios\.|uploadFile\(/.test(source),false);
});
