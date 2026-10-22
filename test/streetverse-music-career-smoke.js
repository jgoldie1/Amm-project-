'use strict';
const assert=require('node:assert/strict');
const {getMusicMissions,createMusicCareer}=require('../lib/streetverse-music-career-missions');
const missions=getMusicMissions();assert.equal(missions.length,7);
assert.equal(new Set(missions.map(m=>m.id)).size,7);
for(let i=0;i<missions.length;i++){assert.deepEqual(Object.keys(missions[i].options),['A','B','C','D']);assert.equal(missions[i].next,missions[i+1]?.id||null);}
const career=createMusicCareer('artist-1');
assert.throws(()=>career.choose('E'));
for(const m of missions){assert.equal(career.view().mission.id,m.id);career.choose('A');}
assert.equal(career.view().completed,true);assert.equal(career.view().history.length,7);
assert.throws(()=>career.choose('A'));
console.log('StreetVerse music artist career missions passed');
