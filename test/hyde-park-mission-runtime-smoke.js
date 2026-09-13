'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'amm-omniverse/src/runtime/StreetVerseHydeParkMissionRuntime.ts'), 'utf8');
const bridge = fs.readFileSync(path.join(root, 'amm-omniverse/src/components/StreetVerseGeoSpawnBridge.tsx'), 'utf8');

function expect(value, message) {
  if (!value) throw new Error(message);
}

expect(runtime.includes("HYDE_PARK_AREA_NUMBER='41'"), 'Hyde Park must remain Chicago community area 41');
expect(runtime.includes("['studio','market','river','stage']"), 'Hyde Park mission must preserve the four validated StreetVerse checkpoints');
expect(runtime.includes("window.addEventListener('tryamm:streetverse-checkpoint',onCheckpoint)"), 'StreetVerse gameplay checkpoints must feed the Hyde Park mission runtime');
expect(runtime.includes("detail.checkpoint||detail.id"), 'Hyde Park runtime must accept the production checkpoint event shape');
expect(runtime.includes("programId:'streetverse_first_drop'"), 'Hyde Park reward must use the authoritative first-drop program');
expect(runtime.includes('cashCents:0'), 'Hyde Park alpha mission must not award browser-controlled cash');
expect(runtime.includes("tryamm:streetverse-reel-handoff"), 'Successful server reward claim must hand off to Reel creation');
expect(bridge.includes('installStreetVerseHydeParkMissionRuntime'), 'Geo spawn bridge must install the Hyde Park mission runtime');
expect(bridge.includes("'41':{x:26,z:62,label:'Hyde Park',certification:'BUILDING'}"), 'Hyde Park spawn must remain BUILDING until browser/mobile certification');

console.log('Hyde Park mission runtime smoke passed');
