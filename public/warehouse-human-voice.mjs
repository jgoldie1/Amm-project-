// Human-performer NPC audio policy. No synthetic speech or voice cloning.
// Production entries MUST be reviewed and licensed; unapproved audio never plays.
export const NPC_VOICE_ROLES=Object.freeze({
 'storefront-community':'Chicago shopkeeper',
 'musicverse-showcase':'All American Records promoter',
 'warehouse-training':'Virtual warehouse supervisor'
});
export const NPC_VOICE_ASSETS=Object.freeze([]); // Add approved actor recordings when supplied.
export function resolveHumanVoiceAsset(branch,nodeId,assets=NPC_VOICE_ASSETS){
 if(!Object.hasOwn(NPC_VOICE_ROLES,branch)||typeof nodeId!=='string')return null;
 const match=assets.find(x=>x.branch===branch&&x.nodeId===nodeId);
 if(!match||match.actorConsentVerified!==true||match.licenseReviewed!==true||match.useAuthorized!==true||match.humanRecorded!==true)return null;
 if(typeof match.url!=='string'||!/^\/media\/npc-human-voices\/[a-z0-9_-]+\.(mp3|ogg|wav)$/i.test(match.url))return null;
 return match.url;
}
export function validateLocalVoicePreview(file,consent){
 if(consent!==true)return {ok:false,reason:'Human performer permission is required'};
 if(!file||!['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/ogg','audio/mp4','audio/aac','audio/webm'].includes(file.type))return {ok:false,reason:'Select an MP3, WAV, OGG, M4A or WebM audio recording'};
 if(!Number.isSafeInteger(file.size)||file.size<1||file.size>12*1024*1024)return {ok:false,reason:'Voice recording must be 12 MiB or smaller'};
 return {ok:true,reason:'Local preview only; not uploaded or saved'};
}
