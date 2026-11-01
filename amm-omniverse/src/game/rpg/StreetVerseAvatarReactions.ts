export type EmoteId='laugh'|'angry'|'sad'|'celebrate'|'surprised'|'confused'|'wave'|'nod';
export type AvatarReaction={id:EmoteId;face:Record<string,number>;bodyClip:string;durationMs:number;caption:string};
const reactions:Record<EmoteId,AvatarReaction>={
 laugh:{id:'laugh',face:{mouthSmileLeft:0.8,mouthSmileRight:0.8,eyeSquintLeft:0.4,eyeSquintRight:0.4},bodyClip:'laugh',durationMs:2500,caption:'Laughs'},
 angry:{id:'angry',face:{browDownLeft:0.8,browDownRight:0.8,mouthPressLeft:0.5,mouthPressRight:0.5},bodyClip:'angry',durationMs:2200,caption:'Looks angry'},
 sad:{id:'sad',face:{mouthFrownLeft:0.7,mouthFrownRight:0.7,browInnerUp:0.6},bodyClip:'sad',durationMs:2500,caption:'Looks sad'},
 celebrate:{id:'celebrate',face:{mouthSmileLeft:0.9,mouthSmileRight:0.9},bodyClip:'celebrate',durationMs:3200,caption:'Celebrates'},
 surprised:{id:'surprised',face:{eyeWideLeft:0.9,eyeWideRight:0.9,jawOpen:0.5},bodyClip:'surprised',durationMs:1800,caption:'Looks surprised'},
 confused:{id:'confused',face:{browInnerUp:0.6,mouthPucker:0.3},bodyClip:'confused',durationMs:2200,caption:'Looks confused'},
 wave:{id:'wave',face:{mouthSmileLeft:0.4,mouthSmileRight:0.4},bodyClip:'wave',durationMs:2000,caption:'Waves'},
 nod:{id:'nod',face:{},bodyClip:'nod',durationMs:1200,caption:'Nods'}
};
const emojiMap:Record<string,EmoteId>={'😂':'laugh','🤣':'laugh','😄':'laugh','😡':'angry','😠':'angry','😢':'sad','😭':'sad','🎉':'celebrate','🥳':'celebrate','😮':'surprised','😲':'surprised','🤔':'confused','😕':'confused','👋':'wave','👍':'nod'};
const gifTags:Record<string,EmoteId>={laugh:'laugh',lol:'laugh',angry:'angry',sad:'sad',celebrate:'celebrate',surprised:'surprised',confused:'confused',wave:'wave',nod:'nod'};
export function reactionFromEmoji(emoji:string):AvatarReaction|null{const id=emojiMap[emoji];return id?reactions[id]:null}
export function reactionFromApprovedGifTag(tag:string):AvatarReaction|null{const id=gifTags[tag.trim().toLowerCase()];return id?reactions[id]:null}
export interface MorphTargetMesh{morphTargetDictionary?:Record<string,number>;morphTargetInfluences?:number[]}
export function applyReactionFace(meshes:MorphTargetMesh[],reaction:AvatarReaction):number{
 let applied=0;
 for(const mesh of meshes){if(!mesh.morphTargetDictionary||!mesh.morphTargetInfluences)continue;
 for(const [name,value] of Object.entries(reaction.face)){const index=mesh.morphTargetDictionary[name];if(Number.isInteger(index)&&index>=0&&index<mesh.morphTargetInfluences.length){mesh.morphTargetInfluences[index]=value;applied++}}
 }
 return applied;
}
// Caller owns animation mixer, cooldowns, blending and reset. Missing morphs safely no-op.
// GIF URLs are not executed, fetched or interpreted; only moderated semantic tags map to presets.
