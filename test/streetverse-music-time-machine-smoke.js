'use strict';
const assert=require('node:assert/strict');
const c=require('../lib/streetverse-music-time-machine-catalog');
assert(c.genres.includes('Chicago house'));
assert(c.genres.includes('drill'));
assert(c.artistReferences.includes('Sun Ra'));
assert(c.artistReferences.includes('Twista'));
assert.equal(c.missionCircuit.length,5);
assert.equal(c.missionCircuit.reduce((n,m)=>n+m.xp,0),2900);
for(const era of c.eras){const scene=c.buildMusicTimeMachineEra(era.id);assert.equal(scene.chronoverse.returnPortalRequired,true);assert.equal(scene.realArtistVoicesEnabled,false);assert.equal(scene.avatarGenerationEnabled,false);}
assert.throws(()=>c.buildMusicTimeMachineEra('unknown'));
console.log('Music history and Time Machine catalog checks passed');
