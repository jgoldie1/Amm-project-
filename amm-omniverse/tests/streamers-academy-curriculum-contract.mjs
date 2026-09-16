import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/foundation/streamersAcademyCurriculum.ts', import.meta.url), 'utf8');
for (const term of [
  'Camera, Lighting & Audio', 'LIVE Hosting', 'PK & Panels', 'Reels & Editing',
  'Podcast & Omni Radio', 'Holo Music & 64-Track Studio', 'Safety, Moderation & Consent',
  'Copyright & Rights Basics', 'LIVE Commerce', 'Sponsors & Product Placement', 'Holo Ads',
  'CTV / OTT / FAST Distribution', 'Long-Form Holo Drama', 'Creator Business',
  'MiddleVerse Media Job', 'Create My Business', 'courseCompletionIsAccreditedDegree: false',
  'realEarningsRequireAuthoritativeLedger: true',
]) assert.ok(source.includes(term), `streamers curriculum missing ${term}`);
console.log('streamers academy curriculum contract: ok');
