import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHROMATIC_NOTES,frequencyToMidi,midiToFrequency,nearestScaleNote,estimateVocalPitch} from '../amm-omniverse/src/runtime/vocalPitchGuide.mjs';
test('A4 at 440Hz resolves to MIDI 69 and round trips',()=>{
 assert.ok(Math.abs(frequencyToMidi(440)-69)<.0001);
 assert.ok(Math.abs(midiToFrequency(69)-440)<.0001);
 assert.equal(frequencyToMidi(0),null);
});
test('C major correction chooses a scale tone and preserves original at zero strength',()=>{
 const freq=450;
 const tuned=nearestScaleNote(freq,'C','major',1);
 const bypass=nearestScaleNote(freq,'C','major',0);
 assert.ok(tuned?.targetHz>0);
 assert.ok(Math.abs(bypass.ratio-1)<.0001);
 assert.ok(Math.abs(tuned.ratio-1)>.001);
 assert.equal(nearestScaleNote(freq,'not-a-note','major',1),null);
 assert.equal(nearestScaleNote(freq,'C','major',2),null);
});
test('all twelve keys and modes have valid finite pitch outputs',()=>{
 for(const key of CHROMATIC_NOTES)for(const mode of ['major','minor','chromatic']){
  const out=nearestScaleNote(440,key,mode,.8);assert.ok(Number.isFinite(out.ratio));
 }
});
test('stable solo vocal yields plausible pitch, silence does not',()=>{
 const sr=22050,f=220,n=8192;
 const wave=Float32Array.from({length:n},(_,i)=>.6*Math.sin(2*Math.PI*i*f/sr));
 const detected=estimateVocalPitch(wave,sr);
 assert.ok(detected&&Math.abs(detected.frequency-f)<6,JSON.stringify(detected));
 assert.equal(estimateVocalPitch(new Float32Array(n),sr),null);
});
test('real AutoTune is not falsely claimed: no pitch-preserving export or automatic release',()=>{
 const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
 const booth=read('amm-omniverse/src/components/VocalAutoTunePreview.tsx');
 const studio=read('amm-omniverse/src/components/RecordingStudio.tsx');
 assert.match(studio,/VocalAutoTunePreview/);
 for(const word of ['ORIGINAL','AUDITION TUNED','STOP','Pitch effect strength','Tuning key','Tuning scale'])assert.ok(booth.includes(word));
 assert.match(booth,/pitch-preserving DSP/);
 assert.match(booth,/playbackRate/);
 assert.doesNotMatch(booth,/fetch\(|getUserMedia|MediaRecorder|checkout|publishTrack/);
});

test('StreetVerse gameplay dock opens the Aniyah vocal studio',()=>{
 const dock=fs.readFileSync(new URL('../amm-omniverse/src/components/StreetVerseCoreGameplayDock.tsx',import.meta.url),'utf8');
 assert.match(dock,/aria-label="Open Aniyah vocal recording and AutoTune studio"/);
 assert.match(dock,/window\.location\.href='\/aniyah-studio'/);
});
