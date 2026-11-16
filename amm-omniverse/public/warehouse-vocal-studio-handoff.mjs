// Recording cue sheets link existing Aniyah 64-Track Studio to StreetVerse and MusicVerse.
// This only describes lines: it does not upload recordings, grant rights, or register songs.
import {DIALOGUES} from './warehouse-dialogue-director.mjs';
export const STUDIO_HANDOFFS=Object.freeze({
 voiceRecording:'/aniyah-studio',
 studioHub:'/music-hub.html',
 musicShowcase:'/music-hub.html',
 broadcast:'/network'
});
export function createNpcRecordingCueSheet(branch){
 if(!Object.hasOwn(DIALOGUES,branch))throw new Error('Unknown actor role');
 const dialogue=DIALOGUES[branch],rows=[];
 for(const [nodeId,node] of Object.entries(dialogue.nodes)){
  if(!node.speaker||!node.line)throw new Error('Invalid dialogue node');
  rows.push({branch,nodeId,speaker:node.speaker,text:node.line,assetName:`${branch}_${nodeId}.wav`,status:'unrecorded',actorConsentVerified:false,licenseReviewed:false});
 }
 return {version:1,branch,source:'StreetVerse Mycelium / Aniyah 64-Track Studio',purpose:'Human-actor recording cue sheet only',rightsNotGranted:true,records:rows};
}
export function exportCueSheetText(branch){
 const sheet=createNpcRecordingCueSheet(branch);
 return [
 'STREETVERSE HUMAN VOICE RECORDING CUE SHEET',
 `Role: ${branch}`,
 'Record original human-performed dialogue in Aniyah 64-Track Studio.',
 'Record every listed line. Keep raw takes and clean exports in private storage.',
 'Artist/actor consent and licensing review are required before publishing audio.',
 'This document does not grant licensing or distribution rights.',
 '',
 ...sheet.records.flatMap((item,i)=>[`${i+1}. ${item.speaker} — ${item.nodeId}`,`   SCRIPT: ${item.text}`,`   SUGGESTED FILE: ${item.assetName}`,''])
 ].join('\n');
}
