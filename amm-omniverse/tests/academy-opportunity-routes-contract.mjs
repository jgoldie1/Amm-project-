import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyOpportunityRoutes.ts', import.meta.url), 'utf8');
for (const term of [
  '/academy/streamers', '/academy/all-american-university', '/academy/youth-media',
  '/academy/jacobie-vision-cyber', '/academy/holostyle-fashion', '/studio/64-track',
  '/passport/skills-talent', '/opportunities', '/middleverse/jobs', '/business/create', '/jobs/hire',
  'routeContractDoesNotMeanUiMounted: true',
]) assert.ok(source.includes(term), `academy route contract missing ${term}`);
console.log('academy opportunity routes contract: ok');
