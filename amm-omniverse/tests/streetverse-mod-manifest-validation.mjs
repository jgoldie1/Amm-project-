import assert from 'node:assert/strict';
import {validateStreetVerseMod} from '../src/streetverse/modManifestValidation.js';
const base={id:'chicago-west-side',version:'1.0.0',sha256:'a'.repeat(64),assets:['assets/chicago/block.glb'],compatibleVersions:['1.1.0'],dependencies:[]};
const opts={gameVersion:'1.1.0',approvedIds:new Set([base.id])};
assert.equal(validateStreetVerseMod(base,opts).ok,true);
for(const mutation of [
 {assets:['../../secrets.js']},
 {assets:['assets/../secret.glb']},
 {assets:['https://evil.example/mod.glb']},
 {entrypoint:'eval.js'},
 {sha256:'nope'},
 {dependencies:[base.id]},
 {compatibleVersions:['0.1.0']}
])assert.equal(validateStreetVerseMod({...base,...mutation},opts).ok,false,JSON.stringify(mutation));
assert.equal(validateStreetVerseMod(base,{...opts,approvedIds:new Set()}).ok,false);
console.log('StreetVerse mod manifest validation passed');
