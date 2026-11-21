// Ableton project metadata preview. ALS is compressed Ableton Live XML, NOT playable audio.
// We do not execute devices, load plugins or infer a copyrighted recording.
export const ABLETON_IMPORT_MAX_BYTES=24*1024*1024;
export const ABLETON_REFERENCE_AUDIO_MAX_BYTES=40*1024*1024;
export const ORIGINAL_RNB_BLUEPRINT=Object.freeze({
 name:'All American Records · Midnight Motion (original R&B demo)',
 tempoBpm:94,timeSignature:'4/4',key:'F# minor',durationBars:64,
 sound:'Soft intimate lead vocals, dry close-mic doubles, muted guitar, airy keys, round sub bass and intricate syncopated drums.',
 tracks:['Kick','Snare / clap','Swung hats','Percussion','Sub bass','Rhodes / soft keys','Muted guitar','Ambient pad','Lead vocal','Vocal doubles','Harmonies','Ad-libs','Master / reference'],
 structure:['Intro · 8 bars','Verse · 16 bars','Hook · 8 bars','Verse · 16 bars','Hook · 8 bars','Outro · 8 bars'],
 originality:'Compose new melodies, lyrics and rhythms; do not sample or reproduce Aaliyah recordings or another artist’s vocal identity.'
});
export function getAbletonMetadata(xml){
 if(typeof xml!=='string'||!xml.trim().startsWith('<')||xml.length>12*1024*1024)throw Error('Expected a modest uncompressed Ableton XML document');
 if(!/<Ableton\b/.test(xml))throw Error('Not recognized as an Ableton Live set');
 const bpmMatch=xml.match(/<Tempo>\s*<Manual\s+Value="([0-9.]+)"/i)||xml.match(/<Tempo\b[^>]*Value="([0-9.]+)"/i);
 const bpm=bpmMatch?Number(bpmMatch[1]):null;
 const count=(pattern)=>[...xml.matchAll(pattern)].length;
 return {
  format:'Ableton Live Set XML (metadata preview only)',
  tempoBpm:Number.isFinite(bpm)&&bpm>20&&bpm<400?bpm:null,
  midiTracks:count(/<MidiTrack\b/g),
  audioTracks:count(/<AudioTrack\b/g),
  groupTracks:count(/<GroupTrack\b/g),
  arrangementAvailable:/<Arrangement\b|<ArrangerAutomation\b/.test(xml),
  playbackAvailable:false,embeddedAudioRendered:false,
  notice:'The .als project does not reproduce audio here. Open in compatible Ableton Live with the authorized samples, instruments and plugins, or upload your own exported WAV/MP3 reference.'
 };
}
export function validateAbletonFile(file){
 if(!file||typeof file.name!=='string'||!file.name.toLowerCase().endsWith('.als'))return 'Choose an Ableton Live .als project';
 if(!Number.isFinite(file.size)||file.size<12||file.size>ABLETON_IMPORT_MAX_BYTES)return 'The .als file exceeds the 24 MB import preview limit or is empty';
 return null;
}
export function validateReferenceAudio(file){
 if(!file||!['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/ogg','audio/mp4','audio/webm'].includes(file.type))return 'Choose a supported audio file (WAV, MP3, OGG, M4A, WebM)';
 if(!Number.isFinite(file.size)||file.size<1||file.size>ABLETON_REFERENCE_AUDIO_MAX_BYTES)return 'Reference clip is empty or exceeds 40 MB';
 return null;
}
