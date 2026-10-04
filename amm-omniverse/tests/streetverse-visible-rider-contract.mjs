import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
for(const s of ['passengerSeatOffsets','vehicle-rider-front-passenger','vehicle-rider-rear-left','vehicle-rider-rear-center','vehicle-rider-rear-right','syncVisibleRiders'])assert.ok(src.includes(s),`missing visible rider feature: ${s}`);
assert.ok(src.includes("circle-park-guide-rider"),'First Ride visible guide rider missing');
assert.ok(src.includes("circle-park-neighbor-rider"),'First Ride visible neighbor rider missing');
assert.ok(src.includes("tryamm:streetverse-board-companion"),'runtime boarding event missing');
assert.ok(src.includes("tryamm:streetverse-leave-companion"),'runtime leave event missing');
console.log('StreetVerse visible five-seat rider contract: PASS');
