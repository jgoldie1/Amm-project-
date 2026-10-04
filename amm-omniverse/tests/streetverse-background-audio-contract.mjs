import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../src/runtime/StreetVerseSoundBankRuntime.ts',import.meta.url),'utf8');
assert.ok(src.includes("startAmbient('city_ambient',900)"),'persistent city ambience missing');
assert.ok(src.includes("startAmbient('crowd_ambient',1700)"),'persistent crowd ambience missing');
assert.ok(src.includes('tryamm:streetverse-audio-unlocked'),'iPhone/user-gesture audio unlock signal missing');
assert.ok(src.includes('stopAllAmbient()'),'ambient cleanup missing');
assert.ok(src.includes("addEventListener('pointerdown',onFirstGesture"),'touch audio unlock missing');
console.log('StreetVerse persistent background audio contract: PASS');
