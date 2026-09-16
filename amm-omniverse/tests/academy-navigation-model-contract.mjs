import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyNavigationModel.ts', import.meta.url), 'utf8');
for (const term of [
  'Streamers Academy', 'All American University', 'Youth Media Academy', 'Jacobie Vision Cyber Academy',
  'HoloStyle Fashion Academy', '64-Track Studio', 'Skills / Talent Passport', 'Opportunity Center',
  'MiddleVerse Jobs', 'Create My Business', 'Hire From StreetVerse',
]) assert.ok(source.includes(term), `academy navigation missing ${term}`);
console.log('academy navigation model contract: ok');
