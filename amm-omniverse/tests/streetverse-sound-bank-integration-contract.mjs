import fs from 'node:fs';import assert from 'node:assert/strict';
const bank=fs.readFileSync(new URL('../src/runtime/StreetVerseSoundBankRuntime.ts',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../src/game/audio/SoundEngine.ts',import.meta.url),'utf8');
for(const e of ['tryamm:streetverse-radio-state','tryamm:streetverse-in-car-conversation','tryamm:streetverse-vehicle-controlled','tryamm:streetverse-vehicle-horn','tryamm:streetverse-mission-start','tryamm:streetverse-mission-complete','tryamm:music-sync-payable'])assert.ok(bank.includes(e),`missing audio event ${e}`);
for(const s of ['engine_start','engine_idle','engine_rev','tire_screech','metal_crunch','glass_break','city_ambient','rain','wind','police_siren','ambulance_siren','firetruck_siren','mission_start','mission_complete','royalty_earned'])assert.ok(engine.includes(s),`missing sound ${s}`);
assert.ok(bank.includes('radioVolume*.35'),'radio conversation ducking missing');
assert.ok(bank.includes('quantumBeatClock'),'Quantum Beat integration missing');
console.log('StreetVerse sound-bank integration contract: PASS');
