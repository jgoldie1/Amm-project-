import fs from'node:fs';import assert from'node:assert/strict';
const passport=fs.readFileSync(new URL('../src/runtime/ConnectedVersePassportRuntime.ts',import.meta.url),'utf8');
const experience=fs.readFileSync(new URL('../src/runtime/ConnectedVerseExperienceRuntime.ts',import.meta.url),'utf8');
for(const t of ['VersePassport','VersePortal','party','inventory','achievements','reputation','accessibility','travelVerse','vrArReady:true','neuralFullDiveClaimed:false'])assert.ok(passport.includes(t),`missing Connected Verse passport: ${t}`);
for(const t of ['PersonalWorld','CreatorWorld','CrossVerseQuest','SpatialSocialRoom','ReplayDirectorPlan','front-passenger','rear-left','dashboard','cinematic','presenceCapabilities'])assert.ok(experience.includes(t),`missing Connected Verse experience: ${t}`);
console.log('Connected Verse Passport/experience contract: PASS');
