import {newVitals,applyFictionalInjury,applyFictionalFirstAid,restAtSafeZone,injuryPresentation,type BodyZone,type InjuryType,type InjuryIntensity,type CharacterVitals} from './StreetVerseFictionalInjurySystem'
const state=new Map<string,CharacterVitals>();
const allowedZones=new Set<BodyZone>(['head','torso','left-arm','right-arm','left-leg','right-leg']);
const allowedKinds=new Set<InjuryType>(['impact','cut','burn','strain']);
const allowedIntensities=new Set<InjuryIntensity>(['minor','moderate','major']);
let installed=false;
function publish(characterId:string,record:CharacterVitals){
 state.set(characterId,record);
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-vitals',{detail:{characterId,...injuryPresentation(record),fictional:true,nonGraphic:true,source:'streetverse-injury-simulation'}}));
}
export function getStreetVerseCharacterVitals(characterId:string){return state.get(characterId)||newVitals(characterId)}
export function installStreetVerseFictionalInjuryRuntime(){
 if(installed||typeof window==='undefined')return()=>{};
 installed=true;
 const injury=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;zone?:BodyZone;type?:InjuryType;intensity?:InjuryIntensity;bleeding?:boolean}>).detail||{};
  // Never trust medical or game state from unvalidated event payloads.
  if(!d.characterId||!/^[-a-z0-9]{2,80}$/.test(d.characterId)||!allowedZones.has(d.zone as BodyZone)||!allowedKinds.has(d.type as InjuryType)||!allowedIntensities.has(d.intensity as InjuryIntensity))return;
  const next=applyFictionalInjury(getStreetVerseCharacterVitals(d.characterId),{zone:d.zone!,type:d.type!,intensity:d.intensity!,bleeding:d.bleeding});
  publish(d.characterId,next);
 }
 const aid=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;safeZone?:boolean}>).detail||{};
  if(!d.characterId||!/^[-a-z0-9]{2,80}$/.test(d.characterId)||d.safeZone!==true)return;
  publish(d.characterId,applyFictionalFirstAid(getStreetVerseCharacterVitals(d.characterId)));
 }
 const rest=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;safeZone?:boolean}>).detail||{};
  if(!d.characterId||!/^[-a-z0-9]{2,80}$/.test(d.characterId)||d.safeZone!==true)return;
  publish(d.characterId,restAtSafeZone(getStreetVerseCharacterVitals(d.characterId)));
 }
 window.addEventListener('tryamm:streetverse-fictional-injury',injury);
 window.addEventListener('tryamm:streetverse-first-aid-at-safe-zone',aid);
 window.addEventListener('tryamm:streetverse-rest-at-safe-zone',rest);
 publish('bj-stubbs',getStreetVerseCharacterVitals('bj-stubbs'));
 return()=>{window.removeEventListener('tryamm:streetverse-fictional-injury',injury);window.removeEventListener('tryamm:streetverse-first-aid-at-safe-zone',aid);window.removeEventListener('tryamm:streetverse-rest-at-safe-zone',rest);installed=false};
}
