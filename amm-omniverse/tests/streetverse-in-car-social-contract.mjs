import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../src/runtime/StreetVerseInCarSocialRuntime.ts',import.meta.url),'utf8');
for(const term of ['talking','listening','lookAtActorId','voiceLevel','RiderMood'])assert.ok(src.includes(term),`missing rider social state: ${term}`);
for(const term of ['VehicleRadioState','stationName','trackId','artist','MusicSyncCue','MusicSyncLicense'])assert.ok(src.includes(term),`missing radio/music sync field: ${term}`);
assert.ok(src.includes('radioDuckForConversation'),'radio must duck during conversation');
assert.ok(src.includes('startConversation'),'in-car conversation start missing');
assert.ok(src.includes('syncManifest'),'social riders must follow transport occupancy');
console.log('StreetVerse in-car social/radio contract: PASS');
