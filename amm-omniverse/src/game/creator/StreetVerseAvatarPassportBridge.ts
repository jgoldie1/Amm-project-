import {validatePersonalAvatar,type AvatarProfile} from './StreetVersePersonalAvatar';
const KEY='streetverse:personal-avatar:demo-v1';
export type PassportAvatar={version:1;playerId:string;profile:AvatarProfile;modelPath?:string;updatedAt:string};
export function createPassportAvatar(playerId:string,profile:AvatarProfile):PassportAvatar{
 if(!playerId||playerId.length>80)throw new Error('Player ID required');
 const checked=validatePersonalAvatar(profile);
 return {version:1,playerId,profile:checked,modelPath:checked.approvedModelPath,updatedAt:new Date().toISOString()};
}
export function saveLocalPassportAvatar(passport:PassportAvatar){
 if(typeof localStorage==='undefined')throw new Error('Browser storage unavailable');
 localStorage.setItem(KEY,JSON.stringify(passport.profile));
 localStorage.setItem('streetverse:passport-avatar:v1',JSON.stringify(passport));
 window.dispatchEvent(new CustomEvent('streetverse:passport-avatar-updated',{detail:{playerId:passport.playerId,modelPath:passport.modelPath??null}}));
}
export function readLocalPassportAvatar():PassportAvatar|null{
 try{const raw=localStorage.getItem('streetverse:passport-avatar:v1');if(!raw)return null;
 const parsed=JSON.parse(raw);if(parsed.version!==1||typeof parsed.playerId!=='string')return null;
 return createPassportAvatar(parsed.playerId,parsed.profile);
 }catch{return null}
}
export function deleteLocalPassportAvatar(){
 localStorage.removeItem(KEY);localStorage.removeItem('streetverse:passport-avatar:v1');
 window.dispatchEvent(new Event('streetverse:passport-avatar-deleted'));
}
// Local passport only. Account-backed synchronization requires a separately authenticated API.
