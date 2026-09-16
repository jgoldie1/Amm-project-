import fs from 'node:fs';
import assert from 'node:assert/strict';

const engine = fs.readFileSync(new URL('../src/foundation/streetVerseMasteryEngine.ts', import.meta.url), 'utf8');
const missions = fs.readFileSync(new URL('../src/foundation/streetVerseTradeMissionFactory.ts', import.meta.url), 'utf8');

for (const term of [
  "'TEACH'", "'MISSION'", "'DIAGNOSE'", "'RETEACH'", "'RETRY'", "'GRADUATION_EVIDENCE'",
  'targetOnlySkillGaps: true', 'explainUsingAnotherMethod: true', 'requireDifferentRetryMission: true',
  'punishmentForLearningFailure: false', 'clientMayInventGrade: false', 'aiMayInventCredential: false',
  'courseGraduationIsNotAccreditedDegree: true', 'realJobRequiresRealEmployer: true',
]) assert.ok(engine.includes(term), `mastery engine missing ${term}`);

for (const term of [
  'creator-media', 'telecom-support', 'defensive-cybersecurity', 'music-production', 'fashion-commerce',
  'STREETVERSE CHICAGO MISSION', 'TARGETED RETEACH', 'DIFFERENT RETRY MISSION',
  'SKILLS / TALENT PASSPORT', 'APPRENTICESHIP / JOB / CREATE BUSINESS',
  'LOCALIZE LANGUAGE + ACCESSIBILITY', 'localRulesRequiredBeforeGlobalActivation: true',
]) assert.ok(missions.includes(term), `trade mission factory missing ${term}`);

console.log('StreetVerse mastery + trade mission contract: ok');
