import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
assert.ok(src.includes('nativeHero.visible=!(suitSelected&&nativeHero===nativeHeroFallback)'),'Mounted drivers stay visible and the legacy placeholder stays hidden during suit selection');
assert.ok(src.includes('driverOffset'),'BJ V6 driver seat offset missing');
assert.ok(src.includes('nativeHero.position.copy(activeCar.position).add(driverOffset)'),'BJ V6 must follow the active vehicle');
assert.ok(src.includes('boardCompanion(car,STREETVERSE_HERO_CHARACTER_ID,\'front-driver\')'),'driver manifest assignment missing');
assert.ok(src.includes('leaveCompanion(car,STREETVERSE_HERO_CHARACTER_ID)'),'driver manifest exit missing');
console.log('BJ V6 visible driver contract: PASS');
