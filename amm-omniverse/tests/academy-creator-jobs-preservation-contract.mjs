import fs from 'node:fs';
import assert from 'node:assert/strict';

const academy = fs.readFileSync(new URL('../src/foundation/academyCreatorJobsFoundation.ts', import.meta.url), 'utf8');
const registry = fs.readFileSync(new URL('../src/foundation/convergencePreservationRegistry.ts', import.meta.url), 'utf8');

for (const term of [
  'streamers-academy',
  'all-american-university',
  'youth-media-academy',
  'jacobie-vision-cyber-academy',
  'holostyle-fashion-academy',
  'music-record-label-academy',
  '64-track-studio',
  'createMyBusiness',
  'hireFromStreetVerse',
  'middleVerseJobs',
  'chicago77Territories',
  'externalCredentialVerificationRequired',
  'clientMaySettleRealMoney: false',
]) assert.ok(academy.includes(term), `academy/jobs contract missing ${term}`);

for (const term of [
  'Streamers Academy', 'Creator Media', 'MiddleVerse Jobs', 'Holo FON', 'YAHAVAH Food',
  'Storehouse', 'Holo Fridge', 'Holo Music', 'Aniyah Pay', 'Holo Delivery', 'StreetVerse',
  'Chicago 77', 'HoloGPT', 'Command Nexus', 'Founder Command Center',
  'protectedSystemsMayNotSilentlyDisappear: true',
]) assert.ok(registry.includes(term), `preservation registry missing ${term}`);

console.log('academy/creator/jobs preservation contract: ok');
