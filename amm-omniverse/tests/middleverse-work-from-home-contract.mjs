import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/middleVerseWorkFromHome.ts', import.meta.url), 'utf8');
for (const term of [
  'Holo FON support', 'All American Store support', 'YAHAVAH Food support', 'creator support',
  'LIVE / PK moderation', 'translation / localization', 'remoteFirstSupported: true',
  'keyboardOnlySupported: true', 'voiceInputSupported: true', 'screenReaderSupportRequired: true',
  'realEmployerControlsHiring: true', 'authorizedPayrollProviderControlsPayment: true',
]) assert.ok(source.includes(term), `MiddleVerse work-from-home contract missing ${term}`);
console.log('MiddleVerse work-from-home contract: ok');
