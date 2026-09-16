import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/allAmericanUniversityProgression.ts', import.meta.url), 'utf8');
for (const term of [
  'EXPLAIN BACK', 'STREETVERSE LAB', 'SKILLS / EMPLOYMENT PASSPORT', 'CREATE BUSINESS',
  'Explorer', 'Mentor', 'Winter Level-Up League', 'Boss Missions', 'First-Customer Challenge',
  'completionIsNotAccreditedDegreeUnlessAuthorized: true', 'realEmployerControlsHiringDecision: true',
]) assert.ok(source.includes(term), `All American University contract missing ${term}`);
console.log('All American University progression contract: ok');
