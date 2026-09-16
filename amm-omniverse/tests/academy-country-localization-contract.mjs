import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyCountryLocalization.ts', import.meta.url), 'utf8');
for (const term of [
  'usTemplateMayNotBeAssumedGlobally: true', 'localEmploymentRulesRequired: true',
  'localTelecomRulesRequired: true', 'localCredentialRulesRequired: true', 'localTaxRulesRequired: true',
  'languageAndAccessibilityLocalizationRequired: true', 'activationRequiresVerifiedConfig: true',
]) assert.ok(source.includes(term), `academy localization contract missing ${term}`);
console.log('academy country localization contract: ok');
