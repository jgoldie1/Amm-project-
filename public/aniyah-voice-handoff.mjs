// Local project handoff from StreetVerse Mycelium NPC dialogue to Aniyah 64-Track Studio.
// No recording, voice cloning, consent inference, release approval or network submission.
export const ANIYAH_VOICE_HANDOFF_KEY='tryamm.aniyah.voice-session-handoff.v1';
const BRANCHES=Object.freeze({
 'storefront-community':{project:'StreetVerse • Chicago Shopkeeper',mode:'npc-dialogue'},
 'musicverse-showcase':{project:'All American Records • Who Wants to Be a Star',mode:'music-show'},
 'warehouse-training':{project:'StreetVerse • Warehouse Supervisor',mode:'npc-dialogue'}
});
const clean=(x,n)=>typeof x==='string'?x.trim().slice(0,n):'';
export function buildAniyahStudioBrief({branch,nodeId,speaker,line}={}){
 if(!Object.hasOwn(BRANCHES,branch)||!/^([a-z]+|[a-z]+-[a-z]+)$/.test(nodeId||''))return null;
 const script=clean(line,1200),character=clean(speaker,120);
 if(!script||!character)return null;
 return {version:1,source:'streetverse-mycelium',branch,nodeId,project:BRANCHES[branch].project,mode:BRANCHES[branch].mode,character,script,recordingStatus:'not-recorded',performanceRightsStatus:'not-reviewed',publishAuthorized:false,distributionAuthorized:false};
}
export function saveAniyahStudioBrief(storage,brief){
 if(!brief||brief.source!=='streetverse-mycelium'||brief.publishAuthorized!==false||brief.distributionAuthorized!==false||brief.recordingStatus!=='not-recorded'||brief.performanceRightsStatus!=='not-reviewed')throw new Error('Unsafe studio handoff');
 storage.setItem(ANIYAH_VOICE_HANDOFF_KEY,JSON.stringify(brief));return brief;
}
export function readAniyahStudioBrief(storage){
 try{
  const b=JSON.parse(storage.getItem(ANIYAH_VOICE_HANDOFF_KEY)||'null');
  const verified=buildAniyahStudioBrief(b);
  if(!verified||b.version!==1)return null;
  return JSON.stringify(verified)===JSON.stringify(b)?verified:null;
 }catch{return null}
}
