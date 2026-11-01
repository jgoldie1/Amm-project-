// StreetVerse personal-avatar presets: user-directed identity, no biometric inference.
export type AvatarPresentation='masculine'|'feminine'|'androgynous';
export type AvatarHair='short'|'natural-curls'|'braids'|'locs'|'long'|'bald';
export type AvatarOutfit='streetwear'|'business'|'athletic'|'formal';
export type AvatarProfile={
 id:string;displayName:string;presentation:AvatarPresentation;
 skinTone:string;hair:AvatarHair;hairColor:string;eyeColor:string;
 heightCm:number;bodyBuild:'slim'|'average'|'athletic'|'broad';
 outfit:AvatarOutfit;outfitPrimary:string;outfitAccent:string;
 accessibility:{oneHandControls:boolean;captions:boolean;reducedMotion:boolean};
 approvedModelPath?:string;
};
const hex=(value:string)=>/^#[0-9a-fA-F]{6}$/.test(value)?value:'#444444';
export function createPersonalAvatar(id:string,displayName:string,presentation:AvatarPresentation='androgynous'):AvatarProfile{
 return {id:id.slice(0,80),displayName:displayName.trim().slice(0,60)||'StreetVerse Player',
 presentation,skinTone:'#8d5a40',hair:'short',hairColor:'#211b1a',eyeColor:'#49352c',
 heightCm:175,bodyBuild:'average',outfit:'streetwear',outfitPrimary:'#171827',outfitAccent:'#7654bd',
 accessibility:{oneHandControls:true,captions:true,reducedMotion:true}};
}
export function validatePersonalAvatar(input:AvatarProfile):AvatarProfile{
 return {...input,id:String(input.id).slice(0,80),displayName:String(input.displayName).trim().slice(0,60)||'StreetVerse Player',
 heightCm:Math.max(120,Math.min(215,Number(input.heightCm)||175)),
 skinTone:hex(input.skinTone),hairColor:hex(input.hairColor),eyeColor:hex(input.eyeColor),
 outfitPrimary:hex(input.outfitPrimary),outfitAccent:hex(input.outfitAccent),
 approvedModelPath:input.approvedModelPath?.startsWith('/assets/avatars/')&&input.approvedModelPath.endsWith('.glb')?input.approvedModelPath:undefined};
}
export function avatarDescription(p:AvatarProfile):string{
 return `${p.displayName}: ${p.presentation} presentation, ${p.hair} hair, ${p.bodyBuild} build, ${p.outfit} outfit. A custom rigged GLB is required for photorealistic appearance.`;
}
