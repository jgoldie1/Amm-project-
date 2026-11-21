import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHORD_CARD_TYPES,MUSIC_NOTE_NAMES,DRUM_BANKS,makeChordNotes,getBeatPattern,beatEventsForStep,clampBeatBpm} from '../amm-omniverse/src/lib/music/musicSoundBank.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('chord cards are valid playable original notes in every key',()=>{
 assert.equal(MUSIC_NOTE_NAMES.length,12);
 assert.equal(CHORD_CARD_TYPES.length,8);
 for(const root of MUSIC_NOTE_NAMES)for(const chord of CHORD_CARD_TYPES){
  const notes=makeChordNotes(root,chord.id);
  assert.equal(notes.length,chord.intervals.length);
  assert.ok(notes.every(n=>n.freq>50&&Number.isFinite(n.freq)&&/^[A-G]#?\d$/.test(n.name)));
 }
 assert.equal(makeChordNotes('Z','major'),null);
 assert.equal(makeChordNotes('C','fake'),null);
});
test('five deterministic 16 step beat banks use existing 16-pad mapping',()=>{
 assert.equal(DRUM_BANKS.length,5);
 for(const bank of DRUM_BANKS){
  assert.equal(getBeatPattern(bank.id),bank);
  assert.ok(bank.bpm>=50&&bank.bpm<=220);
  for(const [id,steps] of Object.entries(bank.steps)){
   assert.ok(Number(id)>=1&&Number(id)<=16);
   assert.ok(steps.every(step=>Number.isInteger(step)&&step>=0&&step<16));
  }
  for(let i=0;i<16;i++)assert.ok(beatEventsForStep(bank,i).every(id=>id>=1&&id<=16));
 }
 assert.equal(getBeatPattern('missing'),null);
 assert.deepEqual(beatEventsForStep(DRUM_BANKS[0],-1),[]);
});
test('tempo field cannot create invalid or extreme playback intervals',()=>{
 assert.equal(clampBeatBpm('junk'),94);
 assert.equal(clampBeatBpm(0),50);
 assert.equal(clampBeatBpm(1000),220);
 assert.equal(clampBeatBpm('94'),94);
});
test('existing MPC pad bank remains and chord/beat UI is reachable via Aniyah Studio',()=>{
 const suite=read('amm-omniverse/src/components/ProAudioSuite.tsx');
 const aniyah=read('amm-omniverse/src/components/Aniyah64TrackStudio.tsx');
 assert.match(suite,/const MPC_PADS: MPCPad\[\] = \[/);
 assert.match(suite,/type ProMode = 'mpc' \| 'chords'/);
 assert.match(suite,/CHORD KEYBOARD/);
 assert.match(suite,/ORIGINAL BEAT PATTERN CARDS/);
 assert.match(suite,/beatEventsForStep/);
 assert.match(aniyah,/const ProAudioSuite=lazy/);
 assert.match(aniyah,/mode==='beats'/);
 assert.match(aniyah,/\['create','engineer','beats',/);
});
