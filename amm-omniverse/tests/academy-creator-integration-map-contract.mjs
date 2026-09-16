import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyCreatorIntegrationMap.ts', import.meta.url), 'utf8');
for (const term of [
  'creatorPortal', 'omniRadio', 'holoMusic', 'holoAds', 'distribution', 'middleVerseJobs',
  'businessFactory', 'streetVerse', 'Create My Business', 'Chicago 77 demand',
  'sandboxProjectIsNotRealEmployment: true', 'earningsRequireAuthoritativeLedger: true',
]) assert.ok(source.includes(term), `academy integration missing ${term}`);
console.log('academy creator integration map contract: ok');
