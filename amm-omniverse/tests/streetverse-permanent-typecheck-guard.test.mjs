import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=path=>fs.readFileSync(new URL('../src/'+path,import.meta.url),'utf8');
test('Chicago certification records game events without an undeclared player object',()=>{
 const code=source('components/StreetVerseChicagoCertificationHUD.tsx');
 assert.doesNotMatch(code,/\bplayer\s*=(?!=)/);
 assert.match(code,/CustomEvent<\{storeId\?:string;demo\?:boolean\}>/);
 assert.match(code,/enteredStore/);
});
test('Fictional delivery has a single replay function and button',()=>{
 const code=source('components/StreetVerseHoloDeliveryMissionHUD.tsx');
 assert.equal((code.match(/const replay=/g)||[]).length,1);
 assert.equal((code.match(/onClick=\{replay\}/g)||[]).length,1);
 assert.match(code,/no duplicate reward/i);
});
test('Building geometry declares and validates the optional heightM field',()=>{
 const code=source('game/runtime/StreetVerseBuildingReconstructionCompiler.ts');
 assert.match(code,/export type Level=\{[^\n]*heightM\?:number/);
 assert.match(code,/typeof height!=='number'/);
 assert.match(code,/!Number\.isFinite\(height\)/);
 assert.match(code,/height<2\|\|height>25/);
});
