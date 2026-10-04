import fs from 'node:fs';
import assert from 'node:assert/strict';

const consent=fs.readFileSync(new URL('../src/runtime/CrossVerseConsentRuntime.ts',import.meta.url),'utf8');
const earnings=fs.readFileSync(new URL('../src/runtime/CrossVerseCommercialEarningsRuntime.ts',import.meta.url),'utf8');
const music=fs.readFileSync(new URL('../src/runtime/CrossVerseMusicSyncRuntime.ts',import.meta.url),'utf8');

for(const platform of ['streetverse','faithverse','musicverse','starverse','tryamm-live','tryamm-reels','tryamm-ctv','tryamm-fast','tryamm-ott','all-american-network','hologpt']){
  assert.ok(consent.includes(`'${platform}'`),`missing CrossVerse platform: ${platform}`);
}
for(const use of ['sponsorship','product-placement','paid-endorsement']){
  assert.ok(consent.includes(`'${use}'`),`missing commercial consent use: ${use}`);
}
assert.ok(consent.includes('videoSha256'),'consent evidence must retain video hash');
assert.ok(consent.includes('buildHoloGPTConsentMemoryPointer'),'HoloGPT consent pointer missing');
assert.ok(consent.includes("status:'revoked'"),'revocation path missing');

assert.ok(earnings.includes('SPONSORSHIP_DISCLOSURE_REQUIRED=true'),'sponsorship disclosure gate missing');
assert.ok(earnings.includes('CLIENT_REPORTED_EVENTS_ARE_PAYABLE=false'),'client events must not become directly payable');
assert.ok(earnings.includes("status:'pending-verification'"),'commercial earnings verification state missing');
assert.ok(earnings.includes('makeCommercialEarningPayable'),'commercial payable transition missing');

assert.ok(music.includes('masterCleared'),'master-rights clearance missing');
assert.ok(music.includes('publishingCleared'),'publishing clearance missing');
assert.ok(music.includes('validateMusicRightsShares'),'music rights split validation missing');
assert.ok(music.includes('total===10000'),'music rights shares must total 100%');
assert.ok(music.includes('calculateAuthorizedMusicSyncPayables'),'authorized music payable path missing');
assert.ok(music.includes('musicSyncAllowed(license,cue,territory,event.occurredAtIso)'),'music payable must pass sync license gate');
assert.ok(music.includes('MUSIC_SYNC_SERVER_VERIFICATION_REQUIRED=true'),'music server verification gate missing');

console.log('CrossVerse consent, sponsorship, earnings and music-sync contract: PASS');
