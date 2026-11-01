import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src/game/rpg/StreetVerseLivingMission.ts',import.meta.url),'utf8');
for(const name of ['enterBuilding','rideElevator','meetResident','reactToResident','acceptPlumbingJob','completePlumbingJob','createMissionStory','runAndSave','proposedStoryOutputs'])assert.ok(src.includes('function '+name),'Missing mission stage: '+name);
assert.ok(src.includes('MissionSavePort'),'Save port required');
assert.ok(src.includes('consentToRecord:false'),'Story recording must default off');
assert.ok(src.includes('applyRPGEvent'),'Mission must grant RPG progression');
console.log('StreetVerse Living Mission integration source contract: PASS');
