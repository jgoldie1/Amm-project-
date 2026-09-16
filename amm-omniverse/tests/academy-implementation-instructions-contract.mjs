import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyImplementationInstructions.ts', import.meta.url), 'utf8');
for (const term of [
  'WIRE STREAMERS ACADEMY UI', 'WIRE SKILLS/TALENT PASSPORT PERSISTENCE', 'WIRE MIDDLEVERSE JOB MATCHING',
  'WIRE CREATE MY BUSINESS', 'WIRE HIRE FROM STREETVERSE', 'CONNECT CHICAGO 77 DEMAND',
  'exact-head CI + release preservation', 'physical iPhone/Android Save-to-Phone evidence',
]) assert.ok(source.toLowerCase().includes(term.toLowerCase()), `implementation instructions missing ${term}`);
console.log('academy implementation instructions contract: ok');
